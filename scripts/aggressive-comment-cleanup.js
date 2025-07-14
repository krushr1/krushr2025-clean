#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Aggressive comment cleanup - removes 80%+ of comment bloat
 */

const PRESERVE_PATTERNS = [
  /TODO|FIXME|HACK|BUG|NOTE:/i,
  /eslint-disable|@ts-ignore|@ts-expect-error/i,
  /Copyright|License|MIT|Apache/i,
  /\bAPI\b.*key|secret|token|auth/i,
  /performance|memory|cache|optimization/i,
  /workaround|temporary|legacy|deprecated/i,
  /security|vulnerability|xss|sql injection/i,
  /complex|algorithm|business logic/i
];

function shouldPreserveComment(line) {
  const trimmed = line.trim();
  
  // Keep JSDoc with actual content
  if (trimmed.match(/\/\*\*.*@\w+/)) return true;
  
  // Keep specific patterns
  return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
}

function cleanupFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let removedCount = 0;
  let inMultilineComment = false;
  let multilineBuffer = [];
  
  const cleanedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Handle multiline comments
    if (trimmed.startsWith('/*') && !trimmed.endsWith('*/')) {
      inMultilineComment = true;
      multilineBuffer = [line];
      continue;
    }
    
    if (inMultilineComment) {
      multilineBuffer.push(line);
      if (trimmed.endsWith('*/')) {
        inMultilineComment = false;
        const fullComment = multilineBuffer.join('\n');
        if (shouldPreserveComment(fullComment)) {
          cleanedLines.push(...multilineBuffer);
        } else {
          removedCount += multilineBuffer.length;
        }
        multilineBuffer = [];
      }
      continue;
    }
    
    // Single line comments
    if (trimmed.startsWith('//')) {
      if (shouldPreserveComment(line)) {
        cleanedLines.push(line);
      } else {
        removedCount++;
      }
      continue;
    }
    
    // Single line block comments
    if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
      if (shouldPreserveComment(line)) {
        cleanedLines.push(line);
      } else {
        removedCount++;
      }
      continue;
    }
    
    // Keep all non-comment lines
    cleanedLines.push(line);
  }
  
  if (removedCount > 0) {
    fs.writeFileSync(filePath, cleanedLines.join('\n'));
    console.log(`${filePath}: removed ${removedCount} lines`);
  }
  
  return removedCount;
}

function processDirectory(dir) {
  let totalRemoved = 0;
  let filesProcessed = 0;
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filesProcessed++;
        totalRemoved += cleanupFile(fullPath);
      }
    }
  }
  
  walkDir(dir);
  console.log(`\n✅ Processed ${filesProcessed} files, removed ${totalRemoved} comment lines`);
  return totalRemoved;
}

// Run cleanup
const frontendSrc = path.join(process.cwd(), 'frontend/src');
const totalRemoved = processDirectory(frontendSrc);