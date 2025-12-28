#!/usr/bin/env node

/**
 * Git Worktree Manager for Claude Code parallel sessions
 * Manages isolated git worktrees to prevent conflicts between Claude sessions
 * 
 * Usage:
 *   node worktree.js create [feature-name]  # Create new worktree
 *   node worktree.js list                   # List all worktrees
 *   node worktree.js remove <worktree-id>   # Remove worktree
 *   node worktree.js cleanup                # Remove completed worktrees
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE_FILE = path.join(__dirname, '..', 'state', 'worktrees.json');
const WORKTREE_BASE = path.join(__dirname, '..', '..', '..', 'claude-worktrees');
const PROJECT_ROOT = path.join(__dirname, '..', '..');

// Ensure state directory exists
if (!fs.existsSync(path.dirname(STATE_FILE))) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
}

// Load or initialize worktree state
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { worktrees: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Execute git command and return output
function gitExec(command, options = {}) {
  try {
    return execSync(`git ${command}`, { 
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      ...options 
    }).trim();
  } catch (error) {
    if (!options.silent) {
      console.error(`Git error: ${error.message}`);
    }
    return null;
  }
}

// Create new worktree
function createWorktree(featureName) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const randomId = Math.random().toString(36).substr(2, 6);
  const worktreeId = `${featureName || 'session'}-${timestamp}-${randomId}`;
  const branchName = `claude/${worktreeId}`;
  const worktreePath = path.join(WORKTREE_BASE, worktreeId);
  
  try {
    // Ensure worktree base directory exists
    if (!fs.existsSync(WORKTREE_BASE)) {
      fs.mkdirSync(WORKTREE_BASE, { recursive: true });
    }
    
    // Check if we're in a git repository
    const isGitRepo = gitExec('rev-parse --is-inside-work-tree', { silent: true });
    if (!isGitRepo) {
      console.error('Error: Not in a git repository');
      process.exit(1);
    }
    
    // Get current branch as base
    const currentBranch = gitExec('branch --show-current') || 'main';
    
    // Create worktree with new branch
    console.log(`Creating worktree: ${worktreeId}`);
    gitExec(`worktree add -b ${branchName} "${worktreePath}" HEAD`);
    
    // Update state
    const state = loadState();
    state.worktrees.push({
      id: worktreeId,
      branch: branchName,
      path: worktreePath,
      baseBranch: currentBranch,
      created: new Date().toISOString(),
      status: 'active',
      feature: featureName || 'general'
    });
    saveState(state);
    
    console.log(`✅ Worktree created successfully`);
    console.log(`   ID: ${worktreeId}`);
    console.log(`   Branch: ${branchName}`);
    console.log(`   Path: ${worktreePath}`);
    console.log('\nTo use this worktree:');
    console.log(`   cd "${worktreePath}"`);
    
    // Output for Claude to capture
    console.log(`WORKTREE_ID=${worktreeId}`);
    console.log(`WORKTREE_PATH=${worktreePath}`);
    
    return { id: worktreeId, path: worktreePath, branch: branchName };
  } catch (error) {
    console.error(`Error creating worktree: ${error.message}`);
    process.exit(1);
  }
}

// List all worktrees
function listWorktrees() {
  const state = loadState();
  
  // Get actual git worktrees
  const gitWorktrees = gitExec('worktree list --porcelain');
  
  if (state.worktrees.length === 0 && !gitWorktrees) {
    console.log('No worktrees found');
    return;
  }
  
  console.log('Active Worktrees:');
  console.log('=================');
  
  state.worktrees.forEach(worktree => {
    const exists = fs.existsSync(worktree.path);
    const age = Math.floor((Date.now() - new Date(worktree.created)) / (1000 * 60 * 60));
    
    console.log(`\n${worktree.id}`);
    console.log(`  Feature: ${worktree.feature}`);
    console.log(`  Branch: ${worktree.branch}`);
    console.log(`  Status: ${worktree.status} ${exists ? '✓' : '(missing)'}`);
    console.log(`  Created: ${worktree.created} (${age} hours ago)`);
    console.log(`  Path: ${worktree.path}`);
  });
  
  // Show git's view of worktrees
  console.log('\n\nGit Worktree Status:');
  console.log('====================');
  const gitList = gitExec('worktree list');
  console.log(gitList);
}

// Remove worktree
function removeWorktree(worktreeId) {
  const state = loadState();
  const worktree = state.worktrees.find(w => w.id === worktreeId);
  
  if (!worktree) {
    console.error(`Error: Worktree not found: ${worktreeId}`);
    process.exit(1);
  }
  
  try {
    // Remove git worktree
    console.log(`Removing worktree: ${worktreeId}`);
    gitExec(`worktree remove "${worktree.path}" --force`);
    
    // Delete branch if it exists
    gitExec(`branch -D ${worktree.branch}`, { silent: true });
    
    // Update state
    state.worktrees = state.worktrees.filter(w => w.id !== worktreeId);
    saveState(state);
    
    console.log(`✅ Worktree removed: ${worktreeId}`);
    
    return true;
  } catch (error) {
    console.error(`Error removing worktree: ${error.message}`);
    process.exit(1);
  }
}

// Cleanup completed/old worktrees
function cleanupWorktrees() {
  const state = loadState();
  const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
  let cleaned = 0;
  
  state.worktrees.forEach(worktree => {
    const age = new Date(worktree.created).getTime();
    
    // Remove if older than 7 days or marked as completed
    if (age < cutoffTime || worktree.status === 'completed') {
      try {
        console.log(`Cleaning up: ${worktree.id}`);
        gitExec(`worktree remove "${worktree.path}" --force`, { silent: true });
        gitExec(`branch -D ${worktree.branch}`, { silent: true });
        cleaned++;
      } catch (error) {
        console.warn(`Could not clean ${worktree.id}: ${error.message}`);
      }
    }
  });
  
  // Update state to remove cleaned worktrees
  if (cleaned > 0) {
    state.worktrees = state.worktrees.filter(w => {
      const age = new Date(w.created).getTime();
      return age >= cutoffTime && w.status !== 'completed';
    });
    saveState(state);
  }
  
  console.log(`✅ Cleaned up ${cleaned} worktree(s)`);
  
  // Also prune any git worktrees not in our state
  console.log('\nPruning git worktrees...');
  gitExec('worktree prune');
  console.log('✅ Git worktree prune complete');
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Usage:');
    console.log('  node worktree.js create [feature]  # Create new worktree');
    console.log('  node worktree.js list               # List all worktrees');
    console.log('  node worktree.js remove <id>        # Remove worktree');
    console.log('  node worktree.js cleanup            # Remove old worktrees');
    process.exit(0);
  }
  
  switch (command) {
    case 'create':
      createWorktree(args[1]);
      break;
    case 'list':
      listWorktrees();
      break;
    case 'remove':
      if (!args[1]) {
        console.error('Error: Worktree ID required');
        process.exit(1);
      }
      removeWorktree(args[1]);
      break;
    case 'cleanup':
      cleanupWorktrees();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  createWorktree,
  listWorktrees,
  removeWorktree,
  cleanupWorktrees
};