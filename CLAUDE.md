# KRUSHR Development Guidelines - CLEAN REPOSITORY

**CRITICAL: NO EMOJIS ANYWHERE**
Never use emojis in code, documentation, UI, commit messages, or any project files. This is a strict requirement.

**CRITICAL: UI/UX COMPONENT REQUIREMENTS**
When creating new pages or UI components, you MUST:
1. ONLY use established components from the existing component library
2. NEVER create new UI components from scratch
3. NEVER create "sloppy interpretations" or loose sketches of UI
4. ALWAYS use pixel-perfect, thematically identical UI/UX
5. Reference existing components in `/src/components/` directory structure
6. Use established design tokens from `/frontend/tailwind.config.js`
7. Follow brandkit specifications from `/frontend/public/brandkit.html`
8. Maintain consistent spacing, typography, and color schemes
9. Copy existing component patterns and adapt them appropriately

**VIOLATION CONSEQUENCES**: Any UI created that deviates from established patterns will be rejected. Always examine existing components first, then adapt them to new requirements while maintaining visual consistency.

Deploy multiple concurrent agents where beneficial for thoroughness and/or processing efficiency

## CURRENT DEVELOPMENT STATUS (Updated: 2025-07-15)

### **Session Context Preserved** 
- **Memory Sync**: Complete project context stored in knowledge graph with 7 entities and 8 relations
- **Claude Config**: Auto-compact disabled, enhanced MCP configuration active
- **Architecture Analysis**: Comprehensive analysis of 22 tRPC routers and 25+ Prisma models
- **Component Inventory**: 50+ shadcn/ui components and 8 feature-based directories mapped
- **Configuration**: Claude Code v1.0.43 with auto-approval system active

### **Recent Progress**
- COMPLETE **Gemini 2.5 Flash AI Integration**: Full AI chat system with conversation management and workspace context
- COMPLETE **Calendar Accuracy Fix**: Real calendar date alignment corrected for proper day-of-week positioning  
- COMPLETE **Custom Claude Commands**: New /push command for automated git workflow management
- COMPLETE **Enhanced Build System**: Public directory file watching and automatic asset optimization
- COMPLETE **AI Backend Architecture**: New ai.ts router with usage tracking, billing, and actionable item parsing
- COMPLETE **UI Consistency Fixes**: Button standardization, font unification (Manrope), layout improvements
- COMPLETE **Build System**: Enhanced asset pipeline with reduced console verbosity
- COMPLETE **Design System**: Comprehensive brandkit integration and token system
- COMPLETE **File Management**: Dual upload strategies with thumbnail generation and deduplication
- COMPLETE **Database Schema**: Complete with 2025 enterprise features (25+ models)
- COMPLETE **MCP Enhancement**: Optimized memory and filesystem servers for larger context
- COMPLETE **Workflow Automation**: Advanced productivity tools installed and operational
- COMPLETE **Memory System**: Project architecture and component system documented in knowledge graph

### **Current System Status**
- **Frontend**: Running on port 8001 OPERATIONAL
- **API**: Running on port 3002 OPERATIONAL (Authentication issues resolved)
- **Database**: SQLite development database operational OPERATIONAL
- **AI System**: Gemini 2.5 Flash integration active OPERATIONAL
- **Testing**: E2E framework working, unit tests needed NEEDS_WORK
- **Memory System**: Enhanced knowledge graph active with 7 entities and 8 relations OPERATIONAL
- **Automation Tools**: Cache system (40x speedup), orchestrator, multi-agent systems active OPERATIONAL

### **Comprehensive System Analysis Complete**
- **18+ tRPC Routers**: Full API architecture mapped with authentication, AI integration, task management, workspace multi-tenancy
- **25+ Prisma Models**: Complete database schema with enterprise features and relationships
- **50+ UI Components**: shadcn/ui component library with 8 feature-based directories
- **Design System**: Krushr brand tokens (#143197 primary, #EB5857 secondary) and Manrope typography
- **Enterprise Features**: Time tracking, AI analysis, task dependencies, file deduplication, real-time collaboration

### **Remaining Development Tasks**
- **Missing Test Infrastructure**: No unit/integration tests, only E2E via Puppeteer
- **Performance**: CSS bundle optimization needed
- **Production Deployment**: Docker and CI/CD pipeline setup required

### **Next Priority Actions**
1. **Enhanced AI Features**: Expand Gemini integration capabilities and workspace context
2. **Unit Testing**: Implement comprehensive test infrastructure (Jest/Vitest) 
3. **Performance Optimization**: CSS bundle and build optimization
4. **Production Deployment**: Docker and CI/CD pipeline setup

## Quick Start

```bash
# Setup
git clone https://github.com/krushr1/krushr2025-clean.git && cd krushr2025-clean
npm run install:all

# Development
npm run dev                    # Start both frontend + backend
# OR
docker-compose up -d          # Full containerized environment

# Access
# Frontend: http://127.0.0.1:8001
# API: http://localhost:3002
# Database: npm run db:studio
```

**🎉 This is the CLEAN repository with only essential operational files!**
**📦 No development bloat, backups, or test artifacts - just the core application.**

**Essential Workflow:** Setup → Develop → Test → Backup → Deploy

## Project Architecture

**Krushr** is an enterprise-grade project management platform with Node.js/tRPC backend and React frontend, featuring advanced collaboration tools and AI-ready infrastructure.

```
Root/
├── api/                    # Node.js + tRPC + Prisma (PRIMARY)
│   ├── src/lib/             # Core libraries
│   │   ├── ai.ts            # Gemini 2.5 Flash AI integration
│   │   ├── thumbnail.ts     # Multi-strategy image processing
│   │   ├── upload.ts        # Legacy upload system
│   │   └── auth.ts          # JWT + session authentication
│   ├── src/trpc/routers/    # 18+ specialized API routes
│   │   ├── ai.ts            # AI conversation management
│   │   ├── task.ts          # Enhanced task management (2025)
│   │   ├── upload-new.ts    # Enterprise file upload
│   │   ├── notes.ts         # Rich text note system
│   │   └── workspace.ts     # Multi-tenant workspaces
│   ├── src/websocket/       # Real-time collaboration
│   └── uploads/             # File storage (15MB limit)
├── frontend/                # React + TypeScript
│   ├── src/components/      # 8 feature-based directories
│   │   ├── forms/           # Universal form system (6 variants)
│   │   ├── kanban/          # Professional Kanban with drag & drop
│   │   ├── notes/           # TipTap rich text editor
│   │   ├── ui/              # 50+ shadcn/ui components
│   │   └── chat/            # Real-time messaging
│   ├── src/hooks/           # Custom React hooks
│   ├── src/stores/          # Zustand + WebSocket state
│   └── src/types/           # Frontend types
├── shared/                  # Shared TypeScript types
├── .claude/commands/        # 25+ Custom Claude commands
├── backup-system.js         # Intelligent backup system
├── Dockerfile               # Production container
└── docker-compose.yml       # Development environment
```

### Technology Stack

**Backend (api/):**
- Node.js + Fastify + tRPC + Prisma ORM
- SQLite (dev) / PostgreSQL (prod)
- JWT auth with sessions + CSRF protection
- WebSocket for real-time collaboration
- Sharp/Canvas for image processing (15MB upload limit)
- Gemini 2.5 Flash AI integration with @google/generative-ai

**Frontend (frontend/):**
- React 18.3.1 + TypeScript 5.6.3
- Custom esbuild with hot reloading
- shadcn/ui + TailwindCSS + Figma design system
- Zustand + tRPC React Query
- React Router v7 + PWA features
- @dnd-kit for Kanban + Framer Motion animations

**Enterprise Features:**
- **Advanced Task Management**: Story points, business value, AI-powered scheduling
- **Multi-Strategy File Uploads**: Dual upload systems with deduplication
- **Real-time Collaboration**: WebSocket rooms with user presence
- **Universal Forms**: 6 specialized variants for different workflows
- **Rich Text Editing**: TipTap-based notes with full formatting
- **Professional Kanban**: Drag & drop with bulk operations
- **Enterprise Authentication**: JWT + sessions with workspace access control
- **AI-Ready Infrastructure**: Task analysis, priority suggestions, risk assessment
- **PWA Ready**: Service Worker + offline functionality
- **Comprehensive Testing**: Puppeteer-based E2E testing
- **Intelligent Backups**: Automated backup/restore system

## 🔍 Large Codebase Analysis with Gemini CLI

### **When to Use Gemini CLI**

**Always use Gemini CLI when:**
- Analyzing entire codebases or large directories (>100KB total)
- Comparing multiple large files simultaneously
- Understanding project-wide patterns or architecture
- Context window is insufficient for complete analysis
- Verifying if specific features/patterns are implemented across the codebase
- Need to examine 10+ files simultaneously

**Specific Use Cases:**
- **Feature Implementation Verification**: Check if authentication, rate limiting, caching, etc. are implemented
- **Security Audits**: Scan for vulnerabilities, input validation, SQL injection protections
- **Architecture Analysis**: Understand data flow, API patterns, component relationships
- **Code Pattern Detection**: Find specific coding patterns, hooks, middleware usage
- **Dependency Analysis**: Understand how libraries are used across the project
- **Test Coverage Assessment**: Verify test patterns and coverage across modules

### **Setup & Configuration**

**Prerequisites:**
```bash
# Install Gemini CLI
npm install -g @google/gemini-cli

# Configure API key (already set for Krushr project)
export GEMINI_API_KEY="AIzaSyDULGUk9ib6aOle0f9sYssL0eKtuGBQVXc"

# Test installation
gemini -p "Hello world"
```

**For Krushr Project:** API key is pre-configured in ~/.gemini/settings.json

### **File Inclusion Syntax**

Use `@` syntax to include files/directories (paths relative to command execution directory):

```bash
# Single file analysis
gemini -p "@src/main.py Explain this file's purpose"

# Multiple files
gemini -p "@package.json @src/index.js Analyze dependencies"

# Entire directory
gemini -p "@src/ Summarize the architecture"

# Multiple directories
gemini -p "@src/ @tests/ Analyze test coverage"

# Current directory and subdirectories
gemini -p "@./ Give project overview"

# All files flag
gemini --all_files -p "Analyze project structure"
```

### **Krushr-Specific Analysis Commands**

**Authentication System Analysis:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean/api"
gemini -p "@src/trpc/routers/auth.ts @src/lib/auth.ts @src/trpc/middleware.ts @src/trpc/context.ts Analyze the complete authentication system. What endpoints exist? How are JWT tokens handled? What security measures are implemented?"
```

**Backend Architecture Overview:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean/api"
gemini -p "@src/ Provide a comprehensive analysis of this Node.js/tRPC backend. What are the main features? How is the code organized? What are the key routers and their responsibilities?"
```

**Frontend Component Analysis:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean/frontend"
gemini -p "@src/components/ @src/pages/ Analyze the React frontend architecture. What are the main components? How is state management handled? What UI patterns are used?"
```

**Security Assessment:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean/api"
gemini -p "@src/ Are there security vulnerabilities? Is input validation implemented? Are there SQL injection protections? Is rate limiting in place? What authentication mechanisms exist?"
```

**Full Project Analysis:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean"
gemini -p "@api/src/ @frontend/src/ @shared/ Analyze this full-stack project. How do frontend and backend communicate? What are the main features? What is the overall architecture?"
```

### **Feature Implementation Verification**

**Check Authentication Implementation:**
```bash
gemini -p "@api/src/ Is JWT authentication fully implemented? List all auth endpoints, middleware, and security measures with file paths."
```

**Verify Real-time Features:**
```bash
gemini -p "@api/src/websocket/ @frontend/src/ Are WebSocket connections implemented? How is real-time collaboration handled?"
```

**Test Coverage Analysis:**
```bash
gemini -p "@frontend/ @api/ What testing frameworks are used? Is there comprehensive test coverage? List all test files and their purposes."
```

**File Upload System:**
```bash
gemini -p "@api/src/lib/upload.ts @api/src/lib/thumbnail.ts @api/src/trpc/routers/upload*.ts How is file uploading implemented? What are the size limits? Is thumbnail generation working?"
```

**Database Schema Review:**
```bash
gemini -p "@api/prisma/schema.prisma @api/src/lib/database.ts Analyze the database schema. What are the main models? How are relationships defined?"
```

### **Project Health & Context Analysis**

**Current System Analysis:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean"
gemini -p "@api/src/trpc/context.ts @frontend/src/stores/auth-store.ts @test-results.json Analyze current authentication integration and test failures. What's causing 401 errors?"
```

**Recent Changes Impact:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean"
gemini -p "@frontend/public/css/ @frontend/src/components/project/ What UI changes were made? Are there any integration issues with recent updates?"
```

**Development Workflow Status:**
```bash
cd "/Users/justindoff/Cursor Projects/krushr-clean"
gemini -p "@package.json @docker-compose.yml @frontend/scripts/ What's the current development setup? Are there any configuration conflicts?"
```

### **Integration with Claude Code**

**In Claude Code, always export API key before Gemini commands:**
```bash
export GEMINI_API_KEY="AIzaSyDULGUk9ib6aOle0f9sYssL0eKtuGBQVXc"
```

**Common Workflow:**
1. Use Gemini CLI for large-scale analysis and feature verification
2. Use Claude Code tools for specific file operations and implementations
3. Combine results for comprehensive understanding and targeted development

**Best Practices:**
- Use specific, targeted questions for better Gemini results
- Leverage Gemini's massive context window for whole-project analysis
- Always include relevant file paths in your prompts
- Follow up Gemini analysis with Claude Code implementation tasks

## Krushr Design System & Brand Standards

### **EVOLVING DESIGN STANDARDS - ALWAYS USE LATEST**

#### **Primary Design Resources** (Live & Interactive)
- **🌐 COMPREHENSIVE BRANDKIT**: http://127.0.0.1:8001/brandkit.html
  - **200+ UI Components** - Advanced forms, Kanban elements, data visualization
  - **Extended Color System** - Project management specific colors, semantic tokens
  - **Advanced Typography** - Complete hierarchy with line heights, letter spacing
  - **Accessibility Guidelines** - Focus states, contrast ratios, touch targets
  - **Micro-interactions** - Loading states, hover effects, animations
  - **Responsive Patterns** - Mobile-first breakpoints and grid systems

- ** LANDING PAGE BRANDKIT**: http://127.0.0.1:8001/krushr-landing-brandkit.html
  - **Hero Section Components** - CTAs, gradient backgrounds, typography
  - **Marketing Elements** - Feature blocks, pricing badges, navigation patterns
  - **Animation System** - Fade-ins, slide effects, float animations, hover lifts
  - **Landing Typography** - Dual font system (Manrope + Montserrat)
  - **Interactive Elements** - Button states, dropdown menus, checkmark lists

#### **Implementation Standards**
- **Colors**: Use semantic tokens (krushr-primary, krushr-task-progress, etc.)
- **Typography**: Manrope (primary), Montserrat (headings on landing pages)
- **Animations**: CSS classes (.hover-lift, .animate-fade-in, .animate-slide-up)
- **Components**: Modular design with consistent spacing (24px system)
- **Responsiveness**: Mobile-first with defined breakpoints (sm:640px, md:768px, lg:1024px)
- **Responsiveness**: Never use emojis in your responses, or in the output you create unless deliberately asked; if necessary, use cs line thin icons already in project

#### **Key Design Tokens & Implementation**
```css
/* Core Brand Colors */
--krushr-primary: #143197;        /* Main brand blue */
--krushr-secondary: #EB5857;      /* Accent red */
--krushr-success: #1FBB65;        /* Success green */
--krushr-warning: #FFB366;        /* Warning orange */
--krushr-info: #57C7EB;          /* Info blue */

/* Project Management Colors */
--task-todo: #6b7280;            /* Gray for todo tasks */
--task-progress: #3b82f6;        /* Blue for in-progress */
--task-review: #8b5cf6;          /* Purple for review */
--task-done: #10b981;            /* Green for completed */

/* Typography Classes */
.brand-font { font-family: 'Manrope', sans-serif; }
.heading-font { font-family: 'Montserrat', sans-serif; }
.typography-hero { @apply brand-font text-6xl font-bold leading-none; }
.typography-h1 { @apply text-3xl font-semibold leading-tight; }

/* Interactive Elements */
.landing-button { padding: 12px 24px; border-radius: 8px; font-weight: 600; }
.btn-primary { background: #143197; color: white; border: 2px solid #143197; }
.hover-lift:hover { transform: translateY(-2px); transition: transform 0.2s ease; }
.checkmark-bullet { display: flex; align-items: flex-start; gap: 16px; }
```

#### **Usage Guidelines**
- **Backend UI/UX**: Always reference comprehensive brandkit for admin interfaces
- **Frontend Landing**: Use landing page brandkit for marketing and onboarding flows  
- **Component Library**: Both brandkits provide copy-paste component implementations
- **Color System**: Use semantic color tokens, never hardcoded hex values
- **Animation Standards**: Apply consistent micro-interactions across all interfaces
- **Accessibility**: Follow WCAG 2.1 AA standards with proper focus indicators and contrast ratios

#### **Accessing Design System Files**
- **Live Brandkit**: Use WebFetch tool with `http://127.0.0.1:8001/brandkit.html` when dev server is running
- **Local Brandkit**: Use Read tool with `frontend/public/brandkit.html` when needed for design reference
- **Landing Brandkit**: Use Read tool with `frontend/public/krushr-landing-brandkit.html` for marketing components
- **Tailwind Config**: Located at `frontend/tailwind.config.js` for brand tokens and configuration

**Note**: Brandkit files are large (260k+ chars) and should only be accessed when specific design guidance is needed. Use WebFetch or Read tools instead of loading full contents into context.

## Core Development Principles

* **Type Safety First**: Maintain end-to-end TypeScript safety via tRPC
* **Component Library First**: Always use existing components from `/src/components/` - never create new UI from scratch
* **Design System Compliance**: Reference brandkit specifications for all UI work
* **Read Before Edit**: Always understand existing code before changes
* **Test-Driven**: Write tests, implement features, refactor
* **Atomic Commits**: Commit logical milestones frequently
* **Plan Then Code**: Get architectural approval before implementation
* **No Placeholders**: Build real solutions, never skip implementations
* **Pixel-Perfect UI**: All UI must match existing patterns exactly - no loose interpretations

## Essential Commands

### Development
```bash
# Root level
npm run dev                    # Start frontend + backend
npm run install:all           # Install all dependencies
./launch.sh                   # Production launch

# Frontend (cd frontend/)
npm run dev                   # Development server (port 8001)
npm run build                 # Production build

# Backend (cd api/)
npm run dev                   # API server (port 3002)
npm run db:studio             # Database GUI
npm run db:generate           # Generate Prisma client
npm run db:push               # Push schema changes
```

### Testing
```bash
# In frontend/ directory
node test-registration-flow.js      # User onboarding
node test-real-user-flow.js         # Real user simulation
node test-kanban-simple.js          # Kanban functionality
node test-settings-functionality.js # Settings validation
node debug-*.js                     # Targeted debugging
```

### Backup & Production
```bash
npm run backup                # Create timestamped backup
npm run backup:restore        # Restore latest backup
docker-compose up -d          # Production deployment
```

## tRPC Architecture & Type Safety

### Router Structure
- **Main Router**: `api/src/trpc/router.ts`
- **17 Specialized Sub-routers**: `api/src/trpc/routers/`
  - `task.ts` - Enhanced task management with 2025 enterprise features
  - `upload.ts` / `upload-new.ts` - Dual file upload systems
  - `notes.ts` - Rich text notes with folder organization
  - `user.ts` - Authentication + user profiles
  - `workspace.ts` - Multi-tenant workspace management
  - `kanban.ts` - Professional Kanban board operations
  - `chat.ts` - Real-time messaging system
  - `auth.ts` - Session-based authentication
  - `project.ts` - Project organization
  - `team.ts` - Team collaboration
  - `notification.ts` - User notifications
  - `search.ts` - Cross-platform search
  - `activity.ts` - Activity tracking
  - `comment.ts` - Comment system
  - `checklist.ts` - Task checklists
  - `panel.ts` - Workspace panels
  - `layout.ts` - Layout management
  - `template.ts` - Template system
  - `attachment.ts` - File attachment handling
  - `file.ts` - File management

### Type Safety Workflow
1. **Update Prisma Schema** (`api/prisma/schema.prisma`)
2. **Run Database Commands**: `npm run db:generate && npm run db:push`
3. **Update tRPC Routers** with proper input/output schemas
4. **Import Types in Frontend** via `../../../api/src/trpc/router`
5. **Use tRPC Hooks** instead of fetch/axios

### Debugging Protocol
- Check tRPC router definitions match frontend calls
- Verify Prisma schema aligns with tRPC types
- Use browser Network tab to inspect tRPC calls
- Validate React state management patterns

## Environment & Deployment

### Environment Variables
```bash
# API (.env in api/)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="15728640"      # 15MB

# Frontend (.env in frontend/)
VITE_API_URL="http://localhost:3002"
VITE_WS_URL="ws://localhost:3002/ws"
```

### Deployment Environments
- **Development**: SQLite + hot reloading + debug logging
- **Production**: PostgreSQL + Docker + monitoring
- **Testing**: Isolated database + mock services

### Docker Production
```bash
docker-compose up -d          # Full production stack
docker-compose logs -f        # Monitor logs
```

## Testing Framework

### Puppeteer Testing Suite
- **Real User Flows**: Complete user journey simulation
- **Visual Debugging**: Screenshot capture for UI issues
- **Automated Validation**: Registration, auth, core features
- **Performance Testing**: Load simulation + response times

### Test Guidelines
- **Login**: Pre-filled with alice@krushr.dev - just click submit
- **Main Interface**: http://127.0.0.1:8001/#/workspace
- **Error Capture**: All tests include comprehensive error reporting
- **Screenshot Debug**: Use `quick-screenshot.js` for visual issues

## Advanced Systems

### Advanced File Upload System
- **Dual Upload Architecture**: Legacy + enterprise systems for gradual migration
- **15MB limit** with smart compression + comprehensive validation
- **Multi-strategy thumbnails**: Sharp → Canvas → Placeholder fallbacks
- **File deduplication**: SHA256-based storage optimization
- **Real-time previews** in Kanban cards and task attachments
- **Enterprise features**: Bulk operations, metadata extraction, progress tracking
- **Security**: File type validation, virus scanning preparation
- **Browser compatibility** with tRPC buffer serialization

### Backup System
- **Intelligent backups** via `backup-system.js`
- **Git integration** with commit tracking
- **Metadata management** + restoration history
- **Emergency restore** via `backup.sh`

### PWA Features
- **Service Worker** for offline functionality
- **Web App Manifest** for installation
- **Offline-first caching** for core features
- **Background sync** when reconnected

## Custom Claude Commands

```bash
/push                        # Stage, commit, and push all changes
/push "Custom message"       # Push with custom commit message
/prime                        # Advanced session initialization
/backup "description"         # Create intelligent backup
/trpc-debug "issue"          # Debug tRPC/type issues
/test-workspace feature      # Test workspace functionality
/prisma-debug "model"        # Database debugging
/think "problem"             # Structured analysis

# Long Context & Memory Tools
/krushr-status               # Complete project state overview
/trpc-map                   # tRPC router architecture mapping
/brand-check                # Design system compliance validation
/memory-sync                # Synchronize all project context and memory
/context                    # Run 5 concurrent agents for full context analysis
```

## MCP Integration (Krushr-Specific)

### **Context7 MCP Server (Enhanced AI Development)**

**Context7** provides real-time codebase context and documentation to AI models, significantly improving development workflow efficiency.

**Installation:**
```bash
# Install Context7 MCP server globally
npm install -g c7-mcp-server

# Test the server (optional)
npx @modelcontextprotocol/inspector c7-mcp-server
```

**Configuration:** Already configured in `~/Library/Application Support/Claude/claude_desktop_config.json`

**Benefits for Krushr Development:**
- **Real-time Context**: AI automatically understands current codebase state
- **Enhanced Code Analysis**: Better understanding of project architecture
- **Improved Suggestions**: More accurate code recommendations
- **Faster Development**: Reduced context-gathering time

### **Standard MCP Servers**

```bash
# Database access
claude mcp add krushr-db npx @modelcontextprotocol/server-sqlite ./api/prisma/dev.db

# Git integration  
claude mcp add krushr-git npx @modelcontextprotocol/server-git

# File system
claude mcp add krushr-fs npx @modelcontextprotocol/server-filesystem /Users/justindoff/Cursor\ Projects/Krushr
```

### **Puppeteer MCP Server (UI Screenshot Analysis)**

**Puppeteer MCP** enables automated browser interactions, screenshot capture, and visual UI analysis for enhanced development workflows.

**Installation:** Pre-installed via npx - no manual installation required

**Configuration:** Project-specific configuration in `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    }
  }
}
```

**Benefits for Krushr UI Development:**
- **Automated Screenshots**: Capture running application UI states
- **Visual Design Verification**: Compare implementation to brandkit designs
- **Iterative UI Development**: Visual feedback loops for rapid iteration
- **Cross-browser Testing**: Automated browser testing and validation
- **Debug Visual Issues**: Screenshot-based troubleshooting

**Usage Commands in Claude Code:**
```bash
# Basic screenshot capture
Take a screenshot of http://127.0.0.1:8001

# Named screenshots for tracking
Open http://127.0.0.1:8001/#/workspace and take a screenshot named 'workspace-current'

# UI analysis workflows
Take a screenshot and compare it to the brandkit design system

# Check MCP status
/mcp
```

### **Current MCP Configuration**

The following MCP servers are configured for Krushr:

1. **Context7** - Real-time codebase documentation (Global)
2. **Puppeteer** - Browser automation and screenshot analysis (Project-specific)
3. **Memory** - Persistent context and session memory (Project-specific)
4. **SQLite** - Direct database access and analysis (Project-specific)
5. **Filesystem** - Direct file system access for the Krushr project
6. **Git** - Git repository integration for version control

**Global Configuration:** `~/.cursor/mcp.json`
```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

**Project Configuration:** `.cursor/mcp.json`
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    },
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "./api/prisma/dev.db"
      ]
    }
  }
}
```

**Usage:**
- Restart Cursor IDE after configuration changes
- Context7 works automatically across all projects
- Puppeteer, Memory, SQLite available specifically in Krushr project
- Use `/mcp` command to verify server connections

### **Memory Management & Long Context Tools**

**Custom Krushr Commands** for context preservation:
```bash
/krushr-status    # Complete project state overview
/trpc-map        # tRPC router architecture mapping
/brand-check     # Design system compliance validation
/memory-sync     # Synchronize all project context and memory
```

**Memory Persistence Strategy:**
- **CLAUDE.md** - Shared team knowledge and architectural decisions
- **CLAUDE.local.md** - Personal workspace notes and temporary context
- **Memory MCP** - Session-to-session context preservation
- **SQLite MCP** - Direct database schema and data analysis

**Context Management Best Practices:**
- Use `/memory-sync` before major architectural changes
- Update decision logs in CLAUDE.md after significant modifications
- Leverage `/krushr-status` to quickly restore project context
- Run `/trpc-map` when working with API changes to maintain router understanding

## 🚀 Advanced Workflow Automation Tools (2025)

### **Installed Productivity Systems**

**Location**: `Github-CC-Research/` directory contains 3 major automation frameworks discovered and installed for enhanced Claude Code productivity.

#### **1. Claude Code Orchestrator v5.0.0** 🎭
- **Purpose**: Parallel team execution with evidence-based validation
- **Features**: 84 specialized files, milestone-based development, service delivery
- **Activation**: Any complex request → Choose "1" for orchestrator mode
- **Location**: `Github-CC-Research/claudecode-orchestrator/`

#### **2. ClaudeFlow Multi-Agent System** 🤖
- **Purpose**: Up to 5 AI agents working in parallel on complex tasks
- **Features**: SPARC framework, swarm intelligence, cloud dev integration
- **Activation**: `cf-swarm "complex task"` or `claude-flow swarm --parallel`
- **Location**: `Github-CC-Research/claudeflow-coder-starter/`

#### **3. Claude Code Auto Action (YOLO Mode)** ⚡
- **Purpose**: Auto-approve permissions, eliminate click-fatigue
- **Features**: Hierarchical agents, auto-commit, cost tracking ($0/$8 daily)
- **Activation**: `./scripts/claude-yolo-mode.sh` in auto-action directory
- **Location**: `Github-CC-Research/claude-code-auto-action/`

### **Essential Session Startup Sequence**

#### **🟢 Every Session (2 commands):**
```bash
/workflow        # Auto-format, imports, tests, build validation
/watch           # File monitoring with smart workflow triggering
```

#### **🟡 Complex Tasks (when needed):**
```bash
# Ask Claude any complex request
"Build a complete user authentication system"
# → Choose "1" for orchestrator mode → Parallel team execution
```

#### **🔴 Heavy Development (optional):**
```bash
# Terminal 1: Auto-approve permissions
cd Github-CC-Research/claude-code-auto-action
./scripts/claude-yolo-mode.sh

# Terminal 2: Multi-agent swarms
source ~/.bashrc
cf-swarm "optimize entire codebase performance"
```

### **Cache System Performance**
- **Status**: Auto-running (2 daemons active)
- **Performance**: 40x+ speedup for Claude operations
- **Storage**: 22,558 files cached (183MB)
- **Files**: `claude_cache_daemon.py`, `claude_cache.py`

### **Integration Status**
- **COMPLETE Native Krushr Commands**: 38+ custom slash commands in `.claude/commands/` including /push
- **COMPLETE MCP Servers**: Memory, filesystem, puppeteer auto-active
- **COMPLETE Cache System**: Background performance optimization
- **NEEDS_WORK External Tools**: Require manual activation (not yet integrated as slash commands)

### **Power User Workflow**
```bash
# Ultimate productivity setup:
# 1. Start session automation
/workflow && /watch

# 2. Activate auto-approvals (terminal)
cd Github-CC-Research/claude-code-auto-action && ./scripts/claude-yolo-mode.sh

# 3. Use orchestrator for complex work
"Implement real-time notifications system" → Choose "1"

# 4. Multi-agent optimization (parallel terminal)
cf-swarm "performance audit and optimization across entire stack"
```

**Result**: Parallel execution, auto-approvals, 40x cache speedup, comprehensive automation.

## AI Integration Architecture (Gemini 2.5 Flash)

### **Core AI System**
Krushr integrates Google's Gemini 2.5 Flash model for intelligent project management assistance, conversation management, and actionable item parsing.

**Key Components:**
- **AI Service**: `api/src/lib/ai.ts` - Main AI integration with conversation management
- **AI Router**: `api/src/trpc/routers/ai.ts` - tRPC endpoints for AI functionality
- **Frontend Components**: `frontend/src/components/ai/` - Chat interface and AI interactions
- **Database Models**: AiConversation, AiMessage - Persistent conversation storage

### **Intelligent Thinking Budget System**
The AI automatically calculates optimal thinking budgets (0-24,576 tokens) based on query complexity:

**Complexity Scoring:**
- **High Complexity (16K-24K tokens)**: Analysis, architecture, problem-solving, debugging
- **Medium Complexity (8K-16K tokens)**: Code generation, workflows, implementation
- **Low Complexity (2K-8K tokens)**: Definitions, tutorials, simple tasks
- **Minimal Complexity (0-2K tokens)**: Greetings, confirmations, basic responses

**Auto-Optimization Features:**
- **Query Analysis**: Regex patterns identify complexity indicators
- **Technical Term Detection**: Adjusts budget based on technical vocabulary
- **Context Awareness**: Considers conversation history and length
- **Actionable Detection**: Increases budget for task/note/event creation

### **Actionable Item Parsing**
The AI automatically detects and can create database items from natural language:

**Supported Item Types:**
```typescript
// Task Detection Patterns
"need to fix the login bug by Friday" → Task with deadline
"create a new user dashboard" → Task with description
"review the API documentation" → Task with assignment hints

// Note Detection Patterns  
"remember to update the deployment guide" → Note with content
"document the new authentication flow" → Note with technical content

// Project Detection Patterns
"launch the mobile app initiative" → Project with scope
"complete overhaul of the user system" → Project with complexity

// Event Detection Patterns
"schedule a standup meeting tomorrow" → Calendar event with date
"book a demo presentation next week" → Calendar event with type
```

### **Conversation Management**
**Database Schema:**
```typescript
model AiConversation {
  id: String
  title: String
  userId: String
  workspaceId: String
  totalTokens: Int
  totalCost: Float
  messages: AiMessage[]
  createdAt: DateTime
  updatedAt: DateTime
}

model AiMessage {
  id: String
  conversationId: String
  role: String // 'user' | 'assistant'
  content: String
  tokenCount: Int
  cost: Float
  thinkingBudget: Int
  responseTime: Int
  createdAt: DateTime
}
```

### **API Endpoints**
```typescript
// Start new conversation
trpc.ai.createConversation.mutate({
  workspaceId: "workspace-id",
  title: "Project Planning Discussion"
})

// Send message with auto thinking budget
trpc.ai.sendMessage.mutate({
  conversationId: "conv-id",
  message: "Create a task to implement user authentication",
  thinkingBudget: 16000 // Optional override
})

// Parse actions without creating items
trpc.ai.parseAndCreateActions.mutate({
  workspaceId: "workspace-id",
  message: "Schedule team meeting and create progress report task",
  autoCreate: false // Preview only
})

// Create items automatically
trpc.ai.parseAndCreateActions.mutate({
  workspaceId: "workspace-id", 
  message: "Add task for API testing due tomorrow",
  autoCreate: true // Creates database items
})
```

### **Environment Configuration**
**Required Environment Variables:**
```bash
# API Configuration (.env in api/)
GEMINI_API_KEY="your-gemini-api-key-here"
AI_ENABLED="true"
AI_MODEL="gemini-2.5-flash"
AI_MAX_TOKENS="4096"
AI_TEMPERATURE="0.7"
AI_MAX_THINKING_BUDGET="24576"
```

**API Key Setup:**
1. **Get Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/)
2. **Configure Environment**: Add to `api/.env` file
3. **Verify Setup**: Check `api/src/config/index.ts` for key validation
4. **Test Integration**: Use `/ai/test` endpoint or run AI chat in frontend

### **Workspace Context System**
The AI maintains full awareness of workspace context:

**System Prompt Features:**
- **Database Schema Awareness**: Understands all Prisma models and relationships
- **Workspace Isolation**: Only accesses data from current workspace
- **User Permission Respect**: Follows role-based access control
- **Security**: Never exposes data from other workspaces

**Context Information:**
- Current workspace ID and settings
- User roles and permissions
- Existing projects, tasks, and team members
- Recent activity and conversation history

### **Performance & Cost Optimization**
**Cost Management:**
- **Token Estimation**: Accurate token counting for cost calculation
- **Budget Optimization**: Automatic thinking budget adjustment
- **Response Caching**: Prevents duplicate expensive operations
- **Usage Tracking**: Per-conversation cost monitoring

**Performance Features:**
- **Response Time Tracking**: Monitors AI response latency
- **Error Handling**: Graceful degradation on API failures
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limiting**: Prevents API quota exhaustion

### **Security & Privacy**
**Data Protection:**
- **Workspace Isolation**: AI cannot access other workspace data
- **User Authentication**: All AI endpoints require valid JWT tokens
- **Input Validation**: All user inputs validated before AI processing
- **Conversation Privacy**: Messages only visible to conversation participants

**AI Safety:**
- **Content Filtering**: Prevents harmful or inappropriate responses
- **Context Boundaries**: AI cannot perform unauthorized actions
- **Audit Logging**: All AI interactions logged for security review
- **Error Isolation**: AI failures don't affect core application functionality

### **Usage Examples**
**Basic AI Chat:**
```typescript
// Frontend usage
const { mutate: sendMessage } = trpc.ai.sendMessage.useMutation()

const handleSendMessage = (message: string) => {
  sendMessage({
    conversationId: currentConversation.id,
    message,
    // thinkingBudget automatically calculated
  })
}
```

**Actionable Item Creation:**
```typescript
// Preview actions before creating
const { mutate: previewActions } = trpc.ai.previewActions.useMutation()

previewActions({
  workspaceId: currentWorkspace.id,
  message: "Create tasks for API testing and documentation"
})

// Auto-create items
const { mutate: createActions } = trpc.ai.parseAndCreateActions.useMutation()

createActions({
  workspaceId: currentWorkspace.id,
  message: "Add meeting with client next Tuesday at 2pm",
  autoCreate: true
})
```

### **Troubleshooting**
**Common Issues:**
- **API Key Missing**: Check GEMINI_API_KEY in environment variables
- **Rate Limiting**: Implement exponential backoff for high-volume usage
- **Token Limits**: Monitor usage and adjust maxTokens configuration
- **Response Quality**: Tune temperature and thinking budget for better results

**Debug Commands:**
```bash
# Check AI configuration
curl http://localhost:3002/ai/config

# Test AI connection
curl -X POST http://localhost:3002/trpc/ai.test \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test message"}'

# Monitor AI usage
tail -f api/logs/ai-usage.log
```

## Enhanced System Architecture (2025)

### **Backend Enhancements**
- **18+ Specialized tRPC Routers**: Modular API with enterprise-grade features including AI integration
- **Gemini 2.5 Flash AI System**: Complete AI conversation management with workspace context awareness
- **Enhanced Task System**: Story points, business value, AI scheduling, time tracking
- **Dual Upload Systems**: Legacy + enterprise for seamless migration
- **Session Authentication**: JWT + database sessions with automatic cleanup
- **Real-time Collaboration**: WebSocket rooms with user presence tracking
- **AI Integration Points**: Task analysis, priority suggestions, risk assessment, actionable item parsing

### **Frontend Architecture**
- **AI Chat Integration**: Workspace-aware AI chat components with conversation management
- **Universal Form System**: 6 specialized variants for different creation workflows
- **Professional Kanban**: @dnd-kit integration with bulk operations
- **Rich Text Editing**: TipTap-based notes with comprehensive formatting
- **50+ UI Components**: Complete shadcn/ui design system
- **Mobile-First PWA**: Responsive design with offline capabilities
- **Zustand + WebSocket**: Real-time state management with optimistic updates

### **Enterprise Features**
- **AI-Powered Productivity**: Gemini 2.5 Flash integration with actionable item parsing
- **Multi-tenant Workspaces**: Role-based access control
- **Advanced Project Management**: Dependencies, time tracking, custom fields
- **File Management**: Deduplication, thumbnails, metadata extraction
- **Real-time Collaboration**: Live updates, user presence, typing indicators
- **Comprehensive Testing**: Puppeteer E2E with visual debugging

## Key Files for New Developers

| File | Purpose |
|------|---------|
| `api/src/lib/ai.ts` | Gemini 2.5 Flash AI integration |
| `api/src/trpc/routers/ai.ts` | AI conversation management router |
| `api/src/trpc/router.ts` | Main API router |
| `api/prisma/schema.prisma` | Database schema |
| `frontend/src/App.tsx` | Main React app |
| `frontend/src/lib/trpc.ts` | Frontend API client |
| `frontend/public/brandkit.html` | **Complete design system documentation** |
| `frontend/public/krushr-landing-brandkit.html` | **Landing page component library** |
| `frontend/tailwind.config.js` | **Brand tokens & Tailwind config** |
| `docker-compose.yml` | Complete dev environment |
| `backup-system.js` | Backup management |

## Development Workflow

1. **Architecture Review**: Understand tRPC + Prisma structure
2. **Design System Review**: Check brandkit for UI/UX patterns and components
3. **Schema Planning**: Design database changes first
4. **Type-Safe Implementation**: Update schema → routers → frontend
5. **UI Implementation**: Use brandkit components and tokens
6. **Testing**: Run comprehensive test suite
7. **Backup**: Create backup before major changes
8. **Deployment**: Use Docker for production

## Important Reminders

- **Legacy Backend**: `backend/` (Laravel) is DEPRECATED - use `api/` only
- **Design System First**: Always reference brandkits before implementing UI
- **Type Safety**: Never bypass tRPC type system
- **Mobile First**: All UI must be responsive
- **Testing Required**: No commits without running tests
- **File Creation**: Only create new files when absolutely necessary
- **Backup First**: Always backup before architectural changes

---

**Ports**: Frontend: 8001 | API: 3002 | WebSocket: 3002/ws | Prisma Studio: 5555