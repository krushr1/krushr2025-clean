#!/usr/bin/env node

/**
 * Claude Code Agent Hunter
 * Specialized GitHub research agent for discovering advanced Claude Code setups,
 * agent configurations, and performance optimization methodologies in IDEs like Cursor
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class ClaudeCodeAgentHunter {
    constructor() {
        this.apiKey = process.env.GITHUB_TOKEN;
        this.results = [];
        this.categories = {
            'agent-setups': [],
            'cursor-configs': [],
            'ide-extensions': [],
            'performance-mods': [],
            'workflow-automations': [],
            'multi-agent-systems': []
        };
        
        // Advanced search terms focused on agent setups and performance
        this.searchTerms = [
            '"claude code" agent setup',
            '"claude code" cursor configuration',
            '"claude code" performance optimization',
            '"claude code" multi agent',
            '"claude code" workflow automation',
            'cursor claude agent config',
            'claude code ide enhancement',
            'claude code productivity setup',
            'claude code advanced configuration',
            'claude code agent methodology',
            'cursor claude optimization',
            'claude code ide integration advanced',
            'claude code automation framework',
            'claude code development workflow',
            'claude code agent orchestration'
        ];
        
        // File patterns that indicate advanced setups
        this.advancedFilePatterns = [
            '.claude/config.json',
            '.cursor/settings.json',
            'claude-config.js',
            'claude-agent-setup',
            'cursor-claude-config',
            'claude-workflow.yml',
            'claude-automation',
            'multi-agent-claude'
        ];
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async makeGitHubRequest(endpoint) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: endpoint,
                method: 'GET',
                headers: {
                    'User-Agent': 'Claude-Code-Agent-Hunter',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };

            if (this.apiKey) {
                options.headers['Authorization'] = `token ${this.apiKey}`;
            }

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    }

    async searchRepositories(query, dateFilter = 'pushed:>2024-12-10') {
        const encodedQuery = encodeURIComponent(`${query} ${dateFilter}`);
        const endpoint = `/search/repositories?q=${encodedQuery}&sort=updated&order=desc&per_page=100`;
        
        try {
            const response = await this.makeGitHubRequest(endpoint);
            return response.items || [];
        } catch (error) {
            console.error(`Search error for "${query}":`, error.message);
            return [];
        }
    }

    async searchCode(query, dateFilter = 'pushed:>2024-12-10') {
        const encodedQuery = encodeURIComponent(`${query} ${dateFilter}`);
        const endpoint = `/search/code?q=${encodedQuery}&sort=indexed&order=desc&per_page=100`;
        
        try {
            const response = await this.makeGitHubRequest(endpoint);
            return response.items || [];
        } catch (error) {
            console.error(`Code search error for "${query}":`, error.message);
            return [];
        }
    }

    async getRepositoryDetails(owner, repo) {
        try {
            const [repoData, readme, files] = await Promise.all([
                this.makeGitHubRequest(`/repos/${owner}/${repo}`),
                this.getReadmeContent(owner, repo),
                this.getRepositoryFiles(owner, repo)
            ]);
            
            return { ...repoData, readme, files };
        } catch (error) {
            console.error(`Error getting details for ${owner}/${repo}:`, error.message);
            return null;
        }
    }

    async getReadmeContent(owner, repo) {
        try {
            const response = await this.makeGitHubRequest(`/repos/${owner}/${repo}/readme`);
            if (response.content) {
                return Buffer.from(response.content, 'base64').toString('utf-8');
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    async getRepositoryFiles(owner, repo) {
        try {
            const response = await this.makeGitHubRequest(`/repos/${owner}/${repo}/contents`);
            return response.map(file => file.name);
        } catch (error) {
            return [];
        }
    }

    categorizeRepository(repo) {
        const text = `${repo.name} ${repo.description || ''} ${repo.readme || ''}`.toLowerCase();
        
        // Agent setups and methodologies
        if (text.includes('agent') && (text.includes('setup') || text.includes('config') || text.includes('methodology'))) {
            return 'agent-setups';
        }
        
        // Cursor-specific configurations
        if (text.includes('cursor') && (text.includes('config') || text.includes('setup') || text.includes('optimization'))) {
            return 'cursor-configs';
        }
        
        // Performance optimizations
        if (text.includes('performance') || text.includes('optimization') || text.includes('enhance')) {
            return 'performance-mods';
        }
        
        // Multi-agent systems
        if (text.includes('multi') && text.includes('agent')) {
            return 'multi-agent-systems';
        }
        
        // Workflow automations
        if (text.includes('workflow') || text.includes('automation') || text.includes('script')) {
            return 'workflow-automations';
        }
        
        // IDE extensions
        return 'ide-extensions';
    }

    scoreRepository(repo) {
        let score = 0;
        
        // Recency (last 4 weeks gets max points)
        const lastUpdate = new Date(repo.updated_at);
        const weeksAgo = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 7);
        if (weeksAgo <= 1) score += 20;
        else if (weeksAgo <= 2) score += 15;
        else if (weeksAgo <= 4) score += 10;
        
        // Stars and engagement
        score += Math.min(repo.stargazers_count * 2, 30);
        score += Math.min(repo.forks_count, 10);
        
        // Has documentation
        if (repo.readme && repo.readme.length > 500) score += 15;
        
        // Advanced keywords in description/readme
        const text = `${repo.description || ''} ${repo.readme || ''}`.toLowerCase();
        const advancedTerms = ['agent', 'optimization', 'performance', 'advanced', 'methodology', 'framework', 'automation'];
        advancedTerms.forEach(term => {
            if (text.includes(term)) score += 5;
        });
        
        return score;
    }

    async runSearch() {
        console.log('🔍 Starting Claude Code Agent Hunter...');
        console.log('Searching for advanced Claude Code setups, agent configurations, and performance optimizations\n');
        
        const allResults = new Set();
        
        // Search repositories
        for (const term of this.searchTerms) {
            console.log(`Searching repositories: "${term}"`);
            const repos = await this.searchRepositories(term);
            repos.forEach(repo => allResults.add(`${repo.owner.login}/${repo.name}`));
            await this.sleep(1000); // Rate limiting
        }
        
        // Search code for configuration files
        for (const pattern of this.advancedFilePatterns) {
            console.log(`Searching code for pattern: "${pattern}"`);
            const codeResults = await this.searchCode(`filename:${pattern}`);
            codeResults.forEach(result => allResults.add(`${result.repository.owner.login}/${result.repository.name}`));
            await this.sleep(1000);
        }
        
        console.log(`\n📊 Found ${allResults.size} unique repositories to analyze...\n`);
        
        // Analyze each repository
        for (const repoPath of allResults) {
            const [owner, repo] = repoPath.split('/');
            console.log(`Analyzing: ${owner}/${repo}`);
            
            const details = await this.getRepositoryDetails(owner, repo);
            if (details) {
                const category = this.categorizeRepository(details);
                const score = this.scoreRepository(details);
                
                const enrichedRepo = {
                    ...details,
                    category,
                    score,
                    analyzed_at: new Date().toISOString()
                };
                
                this.categories[category].push(enrichedRepo);
                this.results.push(enrichedRepo);
            }
            
            await this.sleep(500);
        }
        
        // Sort results by score
        this.results.sort((a, b) => b.score - a.score);
        Object.keys(this.categories).forEach(category => {
            this.categories[category].sort((a, b) => b.score - a.score);
        });
        
        console.log('\n✅ Search complete! Generating reports...\n');
        await this.generateReports();
    }

    async generateReports() {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        
        // Main inventory report
        const mainReport = {
            search_completed: new Date().toISOString(),
            total_repositories: this.results.length,
            categories: Object.keys(this.categories).map(cat => ({
                name: cat,
                count: this.categories[cat].length,
                top_repos: this.categories[cat].slice(0, 5).map(repo => ({
                    name: repo.full_name,
                    score: repo.score,
                    stars: repo.stargazers_count,
                    updated: repo.updated_at,
                    description: repo.description
                }))
            })),
            top_discoveries: this.results.slice(0, 20).map(repo => ({
                rank: this.results.indexOf(repo) + 1,
                name: repo.full_name,
                category: repo.category,
                score: repo.score,
                stars: repo.stargazers_count,
                updated: repo.updated_at,
                description: repo.description,
                url: repo.html_url
            }))
        };
        
        fs.writeFileSync(`Github-CC-Research/claude-agent-discovery-${timestamp}.json`, JSON.stringify(mainReport, null, 2));
        
        // Generate category-specific reports
        for (const [category, repos] of Object.entries(this.categories)) {
            if (repos.length > 0) {
                const categoryReport = {
                    category,
                    count: repos.length,
                    repositories: repos.map(repo => ({
                        name: repo.full_name,
                        score: repo.score,
                        stars: repo.stargazers_count,
                        updated: repo.updated_at,
                        description: repo.description,
                        url: repo.html_url,
                        readme_preview: repo.readme ? repo.readme.slice(0, 500) + '...' : null
                    }))
                };
                
                fs.writeFileSync(`Github-CC-Research/${category}-${timestamp}.json`, JSON.stringify(categoryReport, null, 2));
            }
        }
        
        // Generate markdown summary
        await this.generateMarkdownSummary(timestamp);
        
        console.log(`📄 Reports generated in Github-CC-Research/`);
        console.log(`📊 Total discoveries: ${this.results.length}`);
        console.log(`🏆 Top categories:`);
        Object.entries(this.categories).forEach(([cat, repos]) => {
            if (repos.length > 0) {
                console.log(`   ${cat}: ${repos.length} repositories`);
            }
        });
    }

    async generateMarkdownSummary(timestamp) {
        let markdown = `# Claude Code Agent Discovery Report\n\n`;
        markdown += `**Generated:** ${new Date().toISOString()}\n`;
        markdown += `**Total Repositories:** ${this.results.length}\n\n`;
        
        // Top discoveries
        markdown += `## 🏆 Top Discoveries (Last 4 Weeks)\n\n`;
        this.results.slice(0, 10).forEach((repo, index) => {
            markdown += `### ${index + 1}. [${repo.name}](${repo.html_url})\n`;
            markdown += `**Category:** ${repo.category} | **Score:** ${repo.score} | **Stars:** ${repo.stargazers_count}\n`;
            markdown += `**Updated:** ${repo.updated_at}\n`;
            markdown += `**Description:** ${repo.description || 'No description'}\n\n`;
        });
        
        // Category breakdown
        markdown += `## 📊 Category Breakdown\n\n`;
        Object.entries(this.categories).forEach(([category, repos]) => {
            if (repos.length > 0) {
                markdown += `### ${category.toUpperCase().replace('-', ' ')} (${repos.length})\n\n`;
                repos.slice(0, 5).forEach(repo => {
                    markdown += `- [${repo.name}](${repo.html_url}) (${repo.stargazers_count} ⭐) - ${repo.description || 'No description'}\n`;
                });
                markdown += `\n`;
            }
        });
        
        fs.writeFileSync(`Github-CC-Research/DISCOVERY-SUMMARY-${timestamp}.md`, markdown);
    }
}

// CLI execution
if (require.main === module) {
    const hunter = new ClaudeCodeAgentHunter();
    
    console.log('🤖 Claude Code Agent Hunter');
    console.log('Discovering advanced Claude Code setups and agent configurations...\n');
    
    if (!process.env.GITHUB_TOKEN) {
        console.log('💡 Tip: Set GITHUB_TOKEN environment variable for higher rate limits');
    }
    
    hunter.runSearch().catch(console.error);
}

module.exports = ClaudeCodeAgentHunter;