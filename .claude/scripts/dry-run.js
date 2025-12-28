#!/usr/bin/env node

/**
 * Dry-run utility for Claude Code safety system
 * Previews commands without executing them
 * 
 * Usage:
 *   node dry-run.js "rm -rf node_modules"     # Preview single command
 *   node dry-run.js --file commands.txt       # Preview commands from file
 *   node dry-run.js --analyze "complex cmd"   # Analyze impact level
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state', 'dry-runs.json');

// Ensure state directory exists
if (!fs.existsSync(path.dirname(STATE_FILE))) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
}

// Command impact analysis patterns
const IMPACT_PATTERNS = {
  critical: [
    /rm\s+-rf\s+\//,           // Removing from root
    /rm\s+-rf\s+\*/,           // Removing with wildcards
    />\s*\/dev\//,             // Writing to system devices
    /format/i,                 // Formatting operations
    /fdisk/,                   // Disk partitioning
    /dd\s+if=/,                // Direct disk writes
  ],
  high: [
    /rm\s+-rf/,                // Force removing directories
    /rm\s+-f/,                 // Force removing files
    /git\s+push\s+--force/,   // Force pushing
    /git\s+reset\s+--hard/,   // Hard reset
    /DROP\s+TABLE/i,           // Database table drops
    /DELETE\s+FROM/i,          // Database deletions
    /npm\s+unpublish/,         // Unpublishing packages
  ],
  moderate: [
    /rm\s+/,                   // Regular file removal
    /mv\s+/,                   // Moving files
    /git\s+commit/,            // Committing changes
    /git\s+merge/,             // Merging branches
    /npm\s+install/,           // Installing packages
    /UPDATE\s+.*\s+SET/i,      // Database updates
  ],
  low: [
    /echo\s+/,                 // Echo commands
    /cat\s+/,                  // Reading files
    /ls\s+/,                   // Listing files
    /pwd/,                     // Print working directory
    /git\s+status/,            // Git status
    /git\s+diff/,              // Git diff
  ]
};

// Analyze command impact
function analyzeImpact(command) {
  for (const [level, patterns] of Object.entries(IMPACT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(command)) {
        return level;
      }
    }
  }
  return 'unknown';
}

// Parse command to understand what it does
function parseCommand(command) {
  const analysis = {
    command: command,
    impact: analyzeImpact(command),
    operations: [],
    warnings: [],
    affectedPaths: []
  };
  
  // Detect file operations
  if (/rm\s+/.test(command)) {
    analysis.operations.push('DELETE');
    const match = command.match(/rm\s+(?:-[rf]+\s+)?(.+)/);
    if (match) {
      analysis.affectedPaths.push(match[1]);
    }
  }
  
  if (/mv\s+/.test(command)) {
    analysis.operations.push('MOVE');
    const match = command.match(/mv\s+(\S+)\s+(\S+)/);
    if (match) {
      analysis.affectedPaths.push(match[1], match[2]);
    }
  }
  
  if (/cp\s+/.test(command)) {
    analysis.operations.push('COPY');
    const match = command.match(/cp\s+(?:-[r]+\s+)?(\S+)\s+(\S+)/);
    if (match) {
      analysis.affectedPaths.push(match[1], match[2]);
    }
  }
  
  // Git operations
  if (/git\s+/.test(command)) {
    if (/push/.test(command)) analysis.operations.push('GIT_PUSH');
    if (/commit/.test(command)) analysis.operations.push('GIT_COMMIT');
    if (/merge/.test(command)) analysis.operations.push('GIT_MERGE');
    if (/reset/.test(command)) analysis.operations.push('GIT_RESET');
  }
  
  // Add warnings for dangerous operations
  if (analysis.impact === 'critical') {
    analysis.warnings.push('⚠️  CRITICAL: This command could cause irreversible damage!');
  }
  if (analysis.impact === 'high') {
    analysis.warnings.push('⚠️  HIGH RISK: This command performs destructive operations');
  }
  if (/--force|-f/.test(command)) {
    analysis.warnings.push('⚠️  Force flag detected - bypasses safety checks');
  }
  if (/sudo/.test(command)) {
    analysis.warnings.push('⚠️  Sudo detected - requires elevated privileges');
  }
  
  return analysis;
}

// Preview single command
function previewCommand(command) {
  const analysis = parseCommand(command);
  
  console.log('DRY-RUN PREVIEW');
  console.log('===============');
  console.log(`Command: ${command}`);
  console.log(`Impact Level: ${analysis.impact.toUpperCase()}`);
  
  if (analysis.operations.length > 0) {
    console.log(`\nOperations:`);
    analysis.operations.forEach(op => console.log(`  - ${op}`));
  }
  
  if (analysis.affectedPaths.length > 0) {
    console.log(`\nAffected Paths:`);
    analysis.affectedPaths.forEach(path => console.log(`  - ${path}`));
  }
  
  if (analysis.warnings.length > 0) {
    console.log(`\nWarnings:`);
    analysis.warnings.forEach(warning => console.log(warning));
  }
  
  console.log('\nWhat would happen:');
  
  // Simulate what would happen
  if (/rm\s+/.test(command)) {
    console.log('  Files/directories would be deleted');
  }
  if (/mv\s+/.test(command)) {
    console.log('  Files/directories would be moved/renamed');
  }
  if (/git\s+commit/.test(command)) {
    console.log('  Changes would be committed to git history');
  }
  if (/git\s+push/.test(command)) {
    console.log('  Changes would be pushed to remote repository');
  }
  if (/npm\s+install/.test(command)) {
    console.log('  Node packages would be installed/updated');
  }
  
  // Save to state for audit trail
  saveToState(analysis);
  
  // Output for Claude to capture
  console.log(`\nDRY_RUN_IMPACT=${analysis.impact}`);
  
  return analysis;
}

// Preview commands from file
function previewFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  const commands = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'));
  
  console.log(`DRY-RUN PREVIEW FOR ${commands.length} COMMANDS`);
  console.log('=' .repeat(50));
  
  const results = [];
  commands.forEach((command, index) => {
    console.log(`\n[${index + 1}/${commands.length}] ${command}`);
    const analysis = parseCommand(command);
    results.push(analysis);
    console.log(`  Impact: ${analysis.impact.toUpperCase()}`);
    if (analysis.warnings.length > 0) {
      analysis.warnings.forEach(w => console.log(`  ${w}`));
    }
  });
  
  // Summary
  const impactCounts = results.reduce((acc, r) => {
    acc[r.impact] = (acc[r.impact] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n\nSUMMARY');
  console.log('=======');
  Object.entries(impactCounts).forEach(([level, count]) => {
    console.log(`${level.toUpperCase()}: ${count} command(s)`);
  });
  
  return results;
}

// Save dry-run to state
function saveToState(analysis) {
  let state = { dryRuns: [] };
  
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  
  state.dryRuns.push({
    timestamp: new Date().toISOString(),
    ...analysis
  });
  
  // Keep only last 100 dry-runs
  if (state.dryRuns.length > 100) {
    state.dryRuns = state.dryRuns.slice(-100);
  }
  
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node dry-run.js "command"         # Preview single command');
    console.log('  node dry-run.js --file file.txt   # Preview commands from file');
    console.log('  node dry-run.js --analyze "cmd"   # Detailed impact analysis');
    process.exit(0);
  }
  
  if (args[0] === '--file' && args[1]) {
    previewFile(args[1]);
  } else if (args[0] === '--analyze' && args[1]) {
    const analysis = previewCommand(args[1]);
    console.log('\n\nDetailed Analysis:');
    console.log(JSON.stringify(analysis, null, 2));
  } else {
    // Treat entire arguments as command
    const command = args.join(' ');
    previewCommand(command);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  analyzeImpact,
  parseCommand,
  previewCommand,
  previewFile
};