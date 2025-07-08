#!/usr/bin/env node
/**
 * Krushr Development Workflow Automation
 * Daily productivity improvements for Claude Code + Krushr development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class KrushrWorkflowAutomation {
    constructor() {
        this.projectRoot = '/Users/justindoff/Cursor Projects/krushr-clean';
        this.workflows = {
            'format': this.autoFormat.bind(this),
            'imports': this.organizeImports.bind(this),
            'tests': this.runTests.bind(this),
            'build': this.validateBuild.bind(this),
            'trpc': this.generateTypes.bind(this),
            'lint': this.lintAndFix.bind(this),
            'all': this.runAll.bind(this)
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const emoji = {
            'info': '🔧',
            'success': '✅', 
            'error': '❌',
            'warning': '⚠️'
        }[type] || 'ℹ️';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async autoFormat() {
        this.log('Running auto-formatting...');
        
        try {
            // Format TypeScript/React files
            process.chdir(path.join(this.projectRoot, 'frontend'));
            execSync('npx prettier --write "src/**/*.{ts,tsx,js,jsx}" --config .prettierrc', { stdio: 'inherit' });
            
            // Format API files
            process.chdir(path.join(this.projectRoot, 'api'));
            execSync('npx prettier --write "src/**/*.{ts,js}" --config .prettierrc', { stdio: 'inherit' });
            
            this.log('Auto-formatting completed', 'success');
            return true;
        } catch (error) {
            this.log(`Auto-formatting failed: ${error.message}`, 'error');
            return false;
        }
    }

    async organizeImports() {
        this.log('Organizing imports...');
        
        try {
            // Organize imports in frontend
            process.chdir(path.join(this.projectRoot, 'frontend'));
            execSync('npx organize-imports-cli "src/**/*.{ts,tsx}"', { stdio: 'inherit' });
            
            // Organize imports in API
            process.chdir(path.join(this.projectRoot, 'api'));
            execSync('npx organize-imports-cli "src/**/*.ts"', { stdio: 'inherit' });
            
            this.log('Import organization completed', 'success');
            return true;
        } catch (error) {
            this.log(`Import organization failed: ${error.message}`, 'error');
            return false;
        }
    }

    async runTests() {
        this.log('Running test suite...');
        
        try {
            // Run Puppeteer tests
            process.chdir(path.join(this.projectRoot, 'frontend'));
            
            const testFiles = [
                'test-registration-flow.js',
                'test-real-user-flow.js', 
                'test-kanban-simple.js',
                'test-settings-functionality.js'
            ];

            for (const testFile of testFiles) {
                if (fs.existsSync(testFile)) {
                    this.log(`Running ${testFile}...`);
                    execSync(`node ${testFile}`, { stdio: 'inherit' });
                }
            }
            
            this.log('Test suite completed', 'success');
            return true;
        } catch (error) {
            this.log(`Tests failed: ${error.message}`, 'error');
            return false;
        }
    }

    async validateBuild() {
        this.log('Validating build process...');
        
        try {
            // Build frontend
            process.chdir(path.join(this.projectRoot, 'frontend'));
            execSync('npm run build', { stdio: 'inherit' });
            
            // Build API
            process.chdir(path.join(this.projectRoot, 'api'));
            execSync('npx tsc --noEmit', { stdio: 'inherit' });
            
            this.log('Build validation completed', 'success');
            return true;
        } catch (error) {
            this.log(`Build validation failed: ${error.message}`, 'error');
            return false;
        }
    }

    async generateTypes() {
        this.log('Generating tRPC and Prisma types...');
        
        try {
            process.chdir(path.join(this.projectRoot, 'api'));
            
            // Generate Prisma client
            execSync('npx prisma generate', { stdio: 'inherit' });
            
            // Push schema changes
            execSync('npx prisma db push', { stdio: 'inherit' });
            
            this.log('Type generation completed', 'success');
            return true;
        } catch (error) {
            this.log(`Type generation failed: ${error.message}`, 'error');
            return false;
        }
    }

    async lintAndFix() {
        this.log('Running linting and auto-fixes...');
        
        try {
            // Lint frontend
            process.chdir(path.join(this.projectRoot, 'frontend'));
            execSync('npx eslint "src/**/*.{ts,tsx}" --fix', { stdio: 'inherit' });
            
            // Lint API
            process.chdir(path.join(this.projectRoot, 'api'));
            execSync('npx eslint "src/**/*.ts" --fix', { stdio: 'inherit' });
            
            this.log('Linting completed', 'success');
            return true;
        } catch (error) {
            this.log(`Linting failed: ${error.message}`, 'error');
            return false;
        }
    }

    async runAll() {
        this.log('Running complete workflow automation...');
        
        const workflows = [
            'lint',
            'format', 
            'imports',
            'trpc',
            'build',
            'tests'
        ];

        let allSuccessful = true;
        
        for (const workflow of workflows) {
            const success = await this.workflows[workflow]();
            if (!success) {
                allSuccessful = false;
                this.log(`Workflow ${workflow} failed, continuing...`, 'warning');
            }
        }

        if (allSuccessful) {
            this.log('All workflows completed successfully! 🎉', 'success');
        } else {
            this.log('Some workflows failed - check output above', 'warning');
        }

        return allSuccessful;
    }

    async run(workflowName = 'all') {
        this.log(`Starting Krushr workflow automation: ${workflowName}`);
        
        if (!this.workflows[workflowName]) {
            this.log(`Unknown workflow: ${workflowName}`, 'error');
            this.log(`Available workflows: ${Object.keys(this.workflows).join(', ')}`);
            return false;
        }

        const startTime = Date.now();
        const success = await this.workflows[workflowName]();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        this.log(`Workflow ${workflowName} completed in ${duration}s`, success ? 'success' : 'error');
        return success;
    }
}

// CLI interface
if (require.main === module) {
    const workflow = process.argv[2] || 'all';
    const automation = new KrushrWorkflowAutomation();
    
    automation.run(workflow).then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Automation failed:', error);
        process.exit(1);
    });
}

module.exports = KrushrWorkflowAutomation;