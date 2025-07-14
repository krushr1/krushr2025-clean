#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Intelligent comment cleanup script
 * Removes obvious/redundant comments while preserving valuable ones
 */

const PRESERVE_PATTERNS = [
  /TODO|FIXME|HACK|NOTE/i,
  /API|endpoint|authentication|security/i,
  /performance|optimization|cache/i,
  /business logic|complex|algorithm/i,
  /workaround|temporary|legacy/i,
  /@param|@returns|@throws/i,
  /eslint|prettier|ts-ignore/i,
  /Copyright|License|Author/i
];

const REMOVE_PATTERNS = [
  /^\s*\/\/\s*(Component|Function|Interface|Type|Class|Export)/i,
  /^\s*\/\*\*?\s*(Component|Function|Interface|Type|Class|Export).*\*\//i,
  /^\s*\/\/\s*(Header|Footer|Navigation|Sidebar|Main|Content)/i,
  /^\s*\/\*\s*(Header|Footer|Navigation|Sidebar|Main|Content)/i,
  /^\s*\/\/\s*JSX|HTML|CSS|Styles/i,
  /^\s*\/\/\s*State|Props|Event handlers/i,
  /^\s*\/\/\s*Render|Return|Display/i
];

function shouldPreserveComment(comment) {
  return PRESERVE_PATTERNS.some(pattern => pattern.test(comment));
}

function shouldRemoveComment(comment) {
  if (shouldPreserveComment(comment)) return false;
  return REMOVE_PATTERNS.some(pattern => pattern.test(comment));
}

function cleanupFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let removedCount = 0;
  
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    
    // Single line comments
    if (trimmed.startsWith('//')) {
      if (shouldRemoveComment(line)) {
        removedCount++;
        return false;
      }
    }
    
    // Block comments (simple single-line)
    if (trimmed.startsWith('/*') && trimmed.endsWith('*/')) {
      if (shouldRemoveComment(line)) {
        removedCount++;
        return false;
      }
    }
    
    return true;
  });
  
  if (removedCount > 0) {
    fs.writeFileSync(filePath, cleanedLines.join('\n'));
    console.log(`${filePath}: removed ${removedCount} comment lines`);
  }
  
  return removedCount;
}

function processDirectory(dir) {
  let totalRemoved = 0;
  
  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        totalRemoved += cleanupFile(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return totalRemoved;
}

// Run cleanup
const frontendSrc = path.join(process.cwd(), 'frontend/src');
const totalRemoved = processDirectory(frontendSrc);

console.log(`\n✅ Cleanup complete: removed ${totalRemoved} redundant comment lines`);
console.log(`📁 Processed directory: ${frontendSrc}`);