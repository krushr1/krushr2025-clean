#!/usr/bin/env node
/**
 * Krushr File Watcher Automation
 * Automatically runs workflows when files change
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const KrushrWorkflowAutomation = require('./krushr-automation.js');

class KrushrFileWatcher {
    constructor() {
        this.projectRoot = '/Users/justindoff/Cursor Projects/krushr-clean';
        this.automation = new KrushrWorkflowAutomation();
        this.debounceTimeout = null;
        this.debounceDelay = 2000; // 2 second delay
        
        // File patterns to watch
        this.watchPatterns = {
            typescript: /\.(ts|tsx)$/,
            javascript: /\.(js|jsx)$/,
            prisma: /\.prisma$/,
            config: /\.(json|yml|yaml)$/
        };

        // Workflow triggers
        this.triggers = {
            'src/**/*.{ts,tsx}': ['format', 'imports', 'lint'],
            'api/prisma/schema.prisma': ['trpc'],
            'package.json': ['build'],
            'tsconfig.json': ['build'],
            '**/*.test.{ts,tsx,js}': ['tests']
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const emoji = {
            'info': '👀',
            'success': '✅', 
            'error': '❌',
            'change': '📝'
        }[type] || 'ℹ️';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    shouldWatch(filePath) {
        const ext = path.extname(filePath);
        return Object.values(this.watchPatterns).some(pattern => pattern.test(filePath));
    }

    getTriggeredWorkflows(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        const workflows = new Set();

        // Check if file matches any trigger patterns
        for (const [pattern, workflowList] of Object.entries(this.triggers)) {
            // Simple pattern matching (could be enhanced with glob)
            if (this.matchesPattern(relativePath, pattern)) {
                workflowList.forEach(workflow => workflows.add(workflow));
            }
        }

        // Default workflows based on file type
        if (this.watchPatterns.typescript.test(filePath) || this.watchPatterns.javascript.test(filePath)) {
            workflows.add('format');
            workflows.add('imports');
        }

        if (this.watchPatterns.prisma.test(filePath)) {
            workflows.add('trpc');
        }

        return Array.from(workflows);
    }

    matchesPattern(filePath, pattern) {
        // Simple pattern matching - could be enhanced with proper glob library
        const regex = pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\{([^}]+)\}/g, '($1)')
            .replace(/,/g, '|');
        
        return new RegExp(regex).test(filePath);
    }

    async runTriggeredWorkflows(workflows, filePath) {
        if (workflows.length === 0) return;

        this.log(`File changed: ${path.relative(this.projectRoot, filePath)}`, 'change');
        this.log(`Triggered workflows: ${workflows.join(', ')}`);

        for (const workflow of workflows) {
            try {
                await this.automation.run(workflow);
            } catch (error) {
                this.log(`Workflow ${workflow} failed: ${error.message}`, 'error');
            }
        }
    }

    debounceRun(workflows, filePath) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.runTriggeredWorkflows(workflows, filePath);
        }, this.debounceDelay);
    }

    watchDirectory(dirPath) {
        try {
            fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
                if (!filename) return;

                const fullPath = path.join(dirPath, filename);
                
                // Skip if file doesn't exist (deletion) or is not watchable
                if (!fs.existsSync(fullPath) || !this.shouldWatch(fullPath)) {
                    return;
                }

                const workflows = this.getTriggeredWorkflows(fullPath);
                if (workflows.length > 0) {
                    this.debounceRun(workflows, fullPath);
                }
            });

            this.log(`Watching directory: ${dirPath}`, 'success');
        } catch (error) {
            this.log(`Failed to watch directory ${dirPath}: ${error.message}`, 'error');
        }
    }

    start() {
        this.log('Starting Krushr file watcher automation...');
        
        // Watch key directories
        const watchDirs = [
            path.join(this.projectRoot, 'frontend/src'),
            path.join(this.projectRoot, 'api/src'),
            path.join(this.projectRoot, 'api/prisma'),
            path.join(this.projectRoot, 'shared')
        ];

        for (const dir of watchDirs) {
            if (fs.existsSync(dir)) {
                this.watchDirectory(dir);
            }
        }

        this.log('File watcher started. Monitoring for changes...', 'success');
        this.log('Press Ctrl+C to stop watching');

        // Keep process alive
        process.on('SIGINT', () => {
            this.log('File watcher stopped', 'info');
            process.exit(0);
        });
    }
}

// CLI interface
if (require.main === module) {
    const watcher = new KrushrFileWatcher();
    watcher.start();
}

module.exports = KrushrFileWatcher;