#!/usr/bin/env node

/**
 * Backup utility for Claude Code safety system
 * Creates tar.gz backups of specified files before destructive operations
 * 
 * Usage:
 *   node backup.js file1 file2 file3
 *   node backup.js --restore <backup-id>
 *   node backup.js --list
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const STATE_FILE = path.join(__dirname, '..', 'state', 'backups.json');

// Ensure directories exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(STATE_FILE))) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
}

// Load or initialize backup state
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { backups: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Create backup
function createBackup(files) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  const backupPath = path.join(BACKUP_DIR, `${backupId}.tar.gz`);
  
  // Filter out non-existent files
  const existingFiles = files.filter(file => {
    if (!fs.existsSync(file)) {
      console.error(`Warning: File not found: ${file}`);
      return false;
    }
    return true;
  });
  
  if (existingFiles.length === 0) {
    console.error('Error: No valid files to backup');
    process.exit(1);
  }
  
  try {
    // Create tar.gz backup
    const fileList = existingFiles.map(f => `"${f}"`).join(' ');
    execSync(`tar -czf "${backupPath}" ${fileList}`, { stdio: 'pipe' });
    
    // Update state
    const state = loadState();
    state.backups.push({
      id: backupId,
      timestamp: new Date().toISOString(),
      files: existingFiles,
      path: backupPath,
      size: fs.statSync(backupPath).size
    });
    
    // Keep only last 50 backups (cleanup old ones)
    if (state.backups.length > 50) {
      const toRemove = state.backups.shift();
      if (fs.existsSync(toRemove.path)) {
        fs.unlinkSync(toRemove.path);
      }
    }
    
    saveState(state);
    
    console.log(`✅ Backup created: ${backupId}`);
    console.log(`   Files backed up: ${existingFiles.length}`);
    console.log(`   Size: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
    
    // Output backup ID for Claude to capture
    console.log(`BACKUP_ID=${backupId}`);
    
    return backupId;
  } catch (error) {
    console.error(`Error creating backup: ${error.message}`);
    process.exit(1);
  }
}

// Restore backup
function restoreBackup(backupId) {
  const state = loadState();
  const backup = state.backups.find(b => b.id === backupId);
  
  if (!backup) {
    console.error(`Error: Backup not found: ${backupId}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(backup.path)) {
    console.error(`Error: Backup file missing: ${backup.path}`);
    process.exit(1);
  }
  
  try {
    // Extract backup to current directory
    execSync(`tar -xzf "${backup.path}"`, { stdio: 'inherit' });
    
    console.log(`✅ Restored backup: ${backupId}`);
    console.log(`   Files restored: ${backup.files.join(', ')}`);
    
    return true;
  } catch (error) {
    console.error(`Error restoring backup: ${error.message}`);
    process.exit(1);
  }
}

// List backups
function listBackups() {
  const state = loadState();
  
  if (state.backups.length === 0) {
    console.log('No backups found');
    return;
  }
  
  console.log('Available backups:');
  console.log('==================');
  
  state.backups.forEach(backup => {
    const age = Math.floor((Date.now() - new Date(backup.timestamp)) / (1000 * 60 * 60));
    console.log(`\n${backup.id}`);
    console.log(`  Created: ${backup.timestamp} (${age} hours ago)`);
    console.log(`  Files: ${backup.files.join(', ')}`);
    console.log(`  Size: ${(backup.size / 1024).toFixed(2)} KB`);
  });
}

// Main CLI handler
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node backup.js file1 file2 file3  # Create backup');
    console.log('  node backup.js --restore <id>     # Restore backup');
    console.log('  node backup.js --list              # List backups');
    process.exit(0);
  }
  
  if (args[0] === '--restore' && args[1]) {
    restoreBackup(args[1]);
  } else if (args[0] === '--list') {
    listBackups();
  } else {
    // Assume all arguments are files to backup
    createBackup(args);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  createBackup,
  restoreBackup,
  listBackups
};