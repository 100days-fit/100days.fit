#!/usr/bin/env node

/**
 * Undo stack for Claude Code safety system
 * Tracks operations and provides rollback capability
 * 
 * Usage:
 *   node undo.js --record "operation" "details"  # Record new operation
 *   node undo.js --last                          # Undo last operation
 *   node undo.js --list                          # List undo history
 *   node undo.js --id <operation-id>             # Undo specific operation
 *   node undo.js --clear                         # Clear undo history
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_FILE = path.join(__dirname, '..', 'state', 'undo-stack.json');
const BACKUP_SCRIPT = path.join(__dirname, 'backup.js');

// Ensure state directory exists
if (!fs.existsSync(path.dirname(STATE_FILE))) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
}

// Load or initialize undo stack
function loadStack() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { 
    operations: [],
    maxSize: 10
  };
}

function saveStack(stack) {
  // Keep only last N operations
  if (stack.operations.length > stack.maxSize) {
    stack.operations = stack.operations.slice(-stack.maxSize);
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(stack, null, 2));
}

// Record a new operation
function recordOperation(type, details, undoData = {}) {
  const stack = loadStack();
  
  const operation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    type: type,
    details: details,
    undoData: undoData,
    status: 'recorded'
  };
  
  // Special handling for different operation types
  if (type === 'file_write' && undoData.filePath) {
    // If file exists, backup its current content
    if (fs.existsSync(undoData.filePath)) {
      operation.undoData.previousContent = fs.readFileSync(undoData.filePath, 'utf8');
    }
  }
  
  if (type === 'file_delete' && undoData.filePath) {
    // Create backup before deletion
    if (fs.existsSync(undoData.filePath)) {
      try {
        const backupResult = execSync(`node "${BACKUP_SCRIPT}" "${undoData.filePath}"`, {
          encoding: 'utf8'
        });
        const backupId = backupResult.match(/BACKUP_ID=(.+)/)?.[1];
        if (backupId) {
          operation.undoData.backupId = backupId;
        }
      } catch (error) {
        console.warn(`Could not backup file: ${error.message}`);
      }
    }
  }
  
  stack.operations.push(operation);
  saveStack(stack);
  
  console.log(`✅ Operation recorded: ${operation.id}`);
  console.log(`   Type: ${type}`);
  console.log(`   Details: ${details}`);
  
  // Output for Claude to capture
  console.log(`OPERATION_ID=${operation.id}`);
  
  return operation.id;
}

// Undo last operation
function undoLast() {
  const stack = loadStack();
  
  if (stack.operations.length === 0) {
    console.log('No operations to undo');
    return false;
  }
  
  // Find last undoable operation
  const operation = stack.operations
    .slice()
    .reverse()
    .find(op => op.status === 'recorded');
  
  if (!operation) {
    console.log('No undoable operations found');
    return false;
  }
  
  return undoOperation(operation.id);
}

// Undo specific operation
function undoOperation(operationId) {
  const stack = loadStack();
  const operation = stack.operations.find(op => op.id === operationId);
  
  if (!operation) {
    console.error(`Error: Operation not found: ${operationId}`);
    return false;
  }
  
  if (operation.status === 'undone') {
    console.log(`Operation already undone: ${operationId}`);
    return false;
  }
  
  console.log(`Undoing operation: ${operationId}`);
  console.log(`  Type: ${operation.type}`);
  console.log(`  Details: ${operation.details}`);
  
  let success = false;
  
  try {
    switch (operation.type) {
      case 'file_write':
        if (operation.undoData.filePath) {
          if (operation.undoData.previousContent !== undefined) {
            // Restore previous content
            fs.writeFileSync(operation.undoData.filePath, operation.undoData.previousContent);
            console.log(`  ✅ Restored file: ${operation.undoData.filePath}`);
          } else {
            // File was new, delete it
            if (fs.existsSync(operation.undoData.filePath)) {
              fs.unlinkSync(operation.undoData.filePath);
              console.log(`  ✅ Removed file: ${operation.undoData.filePath}`);
            }
          }
          success = true;
        }
        break;
        
      case 'file_delete':
        if (operation.undoData.backupId) {
          // Restore from backup
          try {
            execSync(`node "${BACKUP_SCRIPT}" --restore ${operation.undoData.backupId}`, {
              stdio: 'inherit'
            });
            console.log(`  ✅ Restored from backup: ${operation.undoData.backupId}`);
            success = true;
          } catch (error) {
            console.error(`  ❌ Failed to restore: ${error.message}`);
          }
        }
        break;
        
      case 'file_move':
        if (operation.undoData.oldPath && operation.undoData.newPath) {
          // Move file back
          if (fs.existsSync(operation.undoData.newPath)) {
            fs.renameSync(operation.undoData.newPath, operation.undoData.oldPath);
            console.log(`  ✅ Moved back: ${operation.undoData.newPath} → ${operation.undoData.oldPath}`);
            success = true;
          }
        }
        break;
        
      case 'git_commit':
        if (operation.undoData.commitHash) {
          // Undo git commit
          try {
            execSync(`git reset --soft HEAD~1`, { stdio: 'inherit' });
            console.log(`  ✅ Undid git commit: ${operation.undoData.commitHash}`);
            success = true;
          } catch (error) {
            console.error(`  ❌ Failed to undo commit: ${error.message}`);
          }
        }
        break;
        
      default:
        console.log(`  ⚠️  No undo handler for operation type: ${operation.type}`);
        if (operation.undoData.customUndo) {
          console.log(`  Custom undo instructions: ${operation.undoData.customUndo}`);
        }
    }
    
    // Mark as undone
    if (success) {
      operation.status = 'undone';
      operation.undoneAt = new Date().toISOString();
      saveStack(stack);
      console.log(`✅ Successfully undone: ${operationId}`);
    } else {
      console.log(`❌ Failed to undo: ${operationId}`);
    }
    
  } catch (error) {
    console.error(`Error during undo: ${error.message}`);
    return false;
  }
  
  return success;
}

// List undo history
function listHistory() {
  const stack = loadStack();
  
  if (stack.operations.length === 0) {
    console.log('No operations in undo history');
    return;
  }
  
  console.log('Undo History:');
  console.log('=============');
  console.log(`(Showing last ${stack.operations.length} operations)`);
  
  stack.operations.forEach((op, index) => {
    const age = Math.floor((Date.now() - new Date(op.timestamp)) / (1000 * 60));
    const statusSymbol = op.status === 'undone' ? '↩' : '•';
    
    console.log(`\n${statusSymbol} [${index + 1}] ${op.id}`);
    console.log(`  Type: ${op.type}`);
    console.log(`  Details: ${op.details}`);
    console.log(`  Time: ${op.timestamp} (${age} min ago)`);
    console.log(`  Status: ${op.status}`);
    
    if (op.status === 'undone' && op.undoneAt) {
      const undoAge = Math.floor((Date.now() - new Date(op.undoneAt)) / (1000 * 60));
      console.log(`  Undone: ${op.undoneAt} (${undoAge} min ago)`);
    }
  });
  
  const undoable = stack.operations.filter(op => op.status === 'recorded').length;
  console.log(`\n${undoable} operation(s) can be undone`);
}

// Clear undo history
function clearHistory() {
  const stack = loadStack();
  const count = stack.operations.length;
  
  stack.operations = [];
  saveStack(stack);
  
  console.log(`✅ Cleared ${count} operation(s) from undo history`);
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node undo.js --record <type> <details>  # Record operation');
    console.log('  node undo.js --last                     # Undo last operation');
    console.log('  node undo.js --list                     # Show undo history');
    console.log('  node undo.js --id <operation-id>        # Undo specific operation');
    console.log('  node undo.js --clear                    # Clear undo history');
    console.log('\nOperation types:');
    console.log('  file_write, file_delete, file_move, git_commit, custom');
    process.exit(0);
  }
  
  switch (args[0]) {
    case '--record':
      if (args.length < 3) {
        console.error('Error: Type and details required');
        process.exit(1);
      }
      // Parse optional JSON undo data from args[3]
      let undoData = {};
      if (args[3]) {
        try {
          undoData = JSON.parse(args[3]);
        } catch (e) {
          // If not JSON, treat as simple string
          undoData = { data: args[3] };
        }
      }
      recordOperation(args[1], args[2], undoData);
      break;
      
    case '--last':
      undoLast();
      break;
      
    case '--list':
      listHistory();
      break;
      
    case '--id':
      if (!args[1]) {
        console.error('Error: Operation ID required');
        process.exit(1);
      }
      undoOperation(args[1]);
      break;
      
    case '--clear':
      clearHistory();
      break;
      
    default:
      console.error(`Unknown option: ${args[0]}`);
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  recordOperation,
  undoLast,
  undoOperation,
  listHistory,
  clearHistory
};