# KRUSHR Development Guidelines - CLEAN REPOSITORY

## Table of Contents
1. [Critical Development Rules](#critical-development-rules)
2. [Current System Status](#current-system-status)  
3. [Quick Start](#quick-start)
4. [Project Architecture](#project-architecture)
5. [Gemini CLI Analysis](#-large-codebase-analysis-with-gemini-cli)
6. [Design System](#design-system)
7. [Development Workflow](#development-workflow)
8. [AI Integration](#ai-integration)
9. [Testing & Quality](#testing--quality)
10. [Environment & Deployment](#environment--deployment)
11. [Advanced Tools](#advanced-tools)
12. [MCP Integration & Advanced Tools](#mcp-integration--advanced-tools)
13. [Reference Documentation](#reference-documentation)

## Critical Development Rules

### **NO EMOJIS ANYWHERE**
Never use emojis in code, documentation, UI, commit messages, or any project files. This is a strict requirement.

### **UI/UX Component Requirements**
When creating new pages or UI components, you MUST:
1. ONLY use established components from the existing component library
2. NEVER create new UI components from scratch
3. NEVER create "sloppy interpretations" or loose sketches of UI
4. ALWAYS use pixel-perfect, thematically identical UI/UX
5. Reference existing components in `/src/components/` directory structure
6. Use established design tokens from `/frontend/tailwind.config.js`
7. Follow brandkit specifications from `/frontend/public/brandkit.html`
8. **ONLY use elements from brandkit, brandkit-2, and the design system library**
9. **REUSE existing forms and modals** - never create new ones when existing patterns exist
10. Maintain consistent spacing, typography, and color schemes
11. Copy existing component patterns and adapt them appropriately

**VIOLATION CONSEQUENCES**: Any UI created that deviates from established patterns will be rejected. Always examine existing components first, then adapt them to new requirements while maintaining visual consistency.

### **Core Development Principles**
- **Type Safety First**: Maintain end-to-end TypeScript safety via tRPC
- **Component Library First**: Always use existing components from `/src/components/` 
- **Design System Compliance**: Reference brandkit specifications for all UI work
- **Read Before Edit**: Always understand existing code before changes
- **Test-Driven**: Write tests, implement features, refactor
- **Atomic Commits**: Commit logical milestones frequently
- **Plan Then Code**: Get architectural approval before implementation
- **No Placeholders**: Build real solutions, never skip implementations
- **Pixel-Perfect UI**: All UI must match existing patterns exactly

**Use Multiple Concurrent Agents**: Deploy multiple concurrent agents where beneficial for thoroughness and/or processing efficiency

## Current System Status

### **System Health** (Updated: 2025-07-15)
- **Frontend**: Port 8001 - OPERATIONAL
- **API**: Port 3002 - OPERATIONAL (Authentication issues resolved)
- **Database**: SQLite development database - OPERATIONAL
- **AI System**: Gemini 2.5 Flash integration - OPERATIONAL
- **Testing**: E2E framework working - NEEDS_WORK (unit tests needed)
- **Memory System**: Enhanced knowledge graph with 7 entities and 8 relations - OPERATIONAL
- **Automation Tools**: Cache system (40x speedup), orchestrator, multi-agent systems - OPERATIONAL

### **Architecture Overview**
- **18+ tRPC Routers**: Full API architecture with authentication, AI integration, task management, workspace multi-tenancy
- **25+ Prisma Models**: Complete database schema with enterprise features and relationships
- **50+ UI Components**: shadcn/ui component library with 8 feature-based directories
- **Design System**: Krushr brand tokens (#143197 primary, #EB5857 secondary) and Manrope typography
- **Enterprise Features**: Time tracking, AI analysis, task dependencies, file deduplication, real-time collaboration

### **Session Context** 
- **Memory Sync**: Complete project context stored in knowledge graph
- **Claude Config**: Auto-compact disabled, enhanced MCP configuration active
- **Component Inventory**: 50+ shadcn/ui components and 8 feature-based directories mapped
- **Configuration**: Claude Code v1.0.43 with auto-approval system active

### **Priority Tasks**
1. **Unit Testing**: Implement comprehensive test infrastructure (Jest/Vitest) 
2. **Performance Optimization**: CSS bundle and build optimization
3. **Production Deployment**: Docker and CI/CD pipeline setup
4. **Enhanced AI Features**: Expand Gemini integration capabilities and workspace context

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

## Design System

### **Primary Design Resources**
- **COMPREHENSIVE BRANDKIT**: http://127.0.0.1:8001/brandkit.html
  - 200+ UI Components - Advanced forms, Kanban elements, data visualization
  - Extended Color System - Project management specific colors, semantic tokens
  - Advanced Typography - Complete hierarchy with line heights, letter spacing
  - Accessibility Guidelines - Focus states, contrast ratios, touch targets
  - Micro-interactions - Loading states, hover effects, animations
  - Responsive Patterns - Mobile-first breakpoints and grid systems

- **LANDING PAGE BRANDKIT**: http://127.0.0.1:8001/krushr-landing-brandkit.html
  - Hero Section Components - CTAs, gradient backgrounds, typography
  - Marketing Elements - Feature blocks, pricing badges, navigation patterns
  - Animation System - Fade-ins, slide effects, float animations, hover lifts
  - Landing Typography - Dual font system (Manrope + Montserrat)
  - Interactive Elements - Button states, dropdown menus, checkmark lists

### **Design Tokens**
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

### **Implementation Standards**
- **Colors**: Use semantic tokens (krushr-primary, krushr-task-progress, etc.)
- **Typography**: Manrope (primary), Montserrat (headings on landing pages)
- **Animations**: CSS classes (.hover-lift, .animate-fade-in, .animate-slide-up)
- **Components**: Modular design with consistent spacing (24px system)
- **Responsiveness**: Mobile-first with defined breakpoints (sm:640px, md:768px, lg:1024px)
- **Accessibility**: Follow WCAG 2.1 AA standards with proper focus indicators and contrast ratios

### **Accessing Design System Files**
- **Live Brandkit**: Use WebFetch tool with `http://127.0.0.1:8001/brandkit.html` when dev server is running
- **Local Brandkit**: Use Read tool with `frontend/public/brandkit.html` when needed for design reference
- **Landing Brandkit**: Use Read tool with `frontend/public/krushr-landing-brandkit.html` for marketing components
- **Tailwind Config**: Located at `frontend/tailwind.config.js` for brand tokens and configuration

**Note**: Brandkit files are large (260k+ chars) and should only be accessed when specific design guidance is needed.

## Development Workflow

### **Essential Commands**

#### Development
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

#### Testing
```bash
# In frontend/ directory
node test-registration-flow.js      # User onboarding
node test-real-user-flow.js         # Real user simulation
node test-kanban-simple.js          # Kanban functionality
node test-settings-functionality.js # Settings validation
node debug-*.js                     # Targeted debugging
```

#### Backup & Production
```bash
npm run backup                # Create timestamped backup
npm run backup:restore        # Restore latest backup
docker-compose up -d          # Production deployment
```

### **Development Process**
1. **Architecture Review**: Understand tRPC + Prisma structure
2. **Design System Review**: Check brandkit for UI/UX patterns and components
3. **Schema Planning**: Design database changes first
4. **Type-Safe Implementation**: Update schema → routers → frontend
5. **UI Implementation**: Use brandkit components and tokens
6. **Testing**: Run comprehensive test suite
7. **Backup**: Create backup before major changes
8. **Deployment**: Use Docker for production

## AI Integration

### **Gemini 2.5 Flash Integration**
Krushr integrates Google's Gemini 2.5 Flash model for intelligent project management assistance, conversation management, and actionable item parsing.

**Key Components:**
- **AI Service**: `api/src/lib/ai.ts` - Main AI integration with conversation management
- **AI Router**: `api/src/trpc/routers/ai.ts` - tRPC endpoints for AI functionality
- **Frontend Components**: `frontend/src/components/ai/` - Chat interface and AI interactions
- **Database Models**: AiConversation, AiMessage - Persistent conversation storage

### **Intelligent Thinking Budget System**
The AI automatically calculates optimal thinking budgets (0-24,576 tokens) based on query complexity.

**Budget Configuration:**
- **0**: Disable thinking (fastest, cheapest - $0.60/M tokens)
- **-1**: Dynamic thinking (model decides optimal budget automatically)
- **1-24,576**: Specific token budget for thinking (higher cost - $3.50/M tokens)

**Automatic Complexity Scoring:**
- **High Complexity (16K-24K tokens)**: Analysis, architecture, problem-solving, debugging
- **Medium Complexity (8K-16K tokens)**: Code generation, workflows, implementation
- **Low Complexity (2K-8K tokens)**: Definitions, tutorials, simple tasks
- **Minimal Complexity (0 tokens)**: Greetings, confirmations, basic responses

### **Environment Configuration**
```bash
# API Configuration (.env in api/)
GEMINI_API_KEY="your-gemini-api-key-here"
AI_ENABLED="true"
AI_MODEL="gemini-2.5-flash"
AI_MAX_TOKENS="4096"
AI_TEMPERATURE="0.7"
AI_MAX_THINKING_BUDGET="24576"
```

## Testing & Quality

### **Testing Framework**
- **Real User Flows**: Complete user journey simulation
- **Visual Debugging**: Screenshot capture for UI issues
- **Automated Validation**: Registration, auth, core features
- **Performance Testing**: Load simulation + response times

### **Test Guidelines**
- **Login**: Pre-filled with alice@krushr.dev - just click submit
- **Main Interface**: http://127.0.0.1:8001/#/workspace
- **Error Capture**: All tests include comprehensive error reporting
- **Screenshot Debug**: Use `quick-screenshot.js` for visual issues

### **tRPC Type Safety**
**Router Structure:**
- **Main Router**: `api/src/trpc/router.ts`
- **18+ Specialized Sub-routers**: `api/src/trpc/routers/`
  - `ai.ts` - AI conversation management
  - `task.ts` - Enhanced task management with 2025 enterprise features
  - `upload.ts` / `upload-new.ts` - Dual file upload systems
  - `notes.ts` - Rich text notes with folder organization
  - `user.ts` - Authentication + user profiles
  - `workspace.ts` - Multi-tenant workspace management
  - `kanban.ts` - Professional Kanban board operations
  - `chat.ts` - Real-time messaging system
  - `auth.ts` - Session-based authentication
  - Plus 9 more specialized routers

**Type Safety Workflow:**
1. Update Prisma Schema (`api/prisma/schema.prisma`)
2. Run Database Commands: `npm run db:generate && npm run db:push`
3. Update tRPC Routers with proper input/output schemas
4. Import Types in Frontend via `../../../api/src/trpc/router`
5. Use tRPC Hooks instead of fetch/axios

## Environment & Deployment

### **Environment Variables**
```bash
# API (.env in api/)
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE="15728640"      # 15MB
GEMINI_API_KEY="your-gemini-api-key-here"

# Frontend (.env in frontend/)
VITE_API_URL="http://localhost:3002"
VITE_WS_URL="ws://localhost:3002/ws"
```

### **Deployment Environments**
- **Development**: SQLite + hot reloading + debug logging
- **Production**: PostgreSQL + Docker + monitoring
- **Testing**: Isolated database + mock services

### **Docker Production**
```bash
docker-compose up -d          # Full production stack
docker-compose logs -f        # Monitor logs
```

## Advanced Tools

### **Productivity Systems**
**Location**: `Github-CC-Research/` directory contains 3 major automation frameworks:

1. **Claude Code Orchestrator v5.0.0** - Parallel team execution with evidence-based validation
2. **ClaudeFlow Multi-Agent System** - Up to 5 AI agents working in parallel on complex tasks  
3. **Claude Code Auto Action (YOLO Mode)** - Auto-approve permissions, eliminate click-fatigue

### **Advanced File Upload System**
- **Dual Upload Architecture**: Legacy + enterprise systems for gradual migration
- **15MB limit** with smart compression + comprehensive validation
- **Multi-strategy thumbnails**: Sharp → Canvas → Placeholder fallbacks
- **File deduplication**: SHA256-based storage optimization
- **Real-time previews** in Kanban cards and task attachments

### **Backup System**
- **Intelligent backups** via `backup-system.js`
- **Git integration** with commit tracking
- **Metadata management** + restoration history
- **Emergency restore** via `backup.sh`

### **PWA Features**
- **Service Worker** for offline functionality
- **Web App Manifest** for installation
- **Offline-first caching** for core features
- **Background sync** when reconnected

### **Cache System Performance**
- **Status**: Auto-running (2 daemons active)
- **Performance**: 40x+ speedup for Claude operations
- **Storage**: 22,558 files cached (183MB)

## Reference Documentation

### **Custom Claude Commands**
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

### **Key Files for New Developers**
| File | Purpose |
|------|---------|
| `api/src/lib/ai.ts` | Gemini 2.5 Flash AI integration |
| `api/src/trpc/routers/ai.ts` | AI conversation management router |
| `api/src/trpc/router.ts` | Main API router |
| `api/prisma/schema.prisma` | Database schema |
| `frontend/src/App.tsx` | Main React app |
| `frontend/src/lib/trpc.ts` | Frontend API client |
| `frontend/public/brandkit.html` | Complete design system documentation |
| `frontend/public/krushr-landing-brandkit.html` | Landing page component library |
| `frontend/tailwind.config.js` | Brand tokens & Tailwind config |
| `docker-compose.yml` | Complete dev environment |
| `backup-system.js` | Backup management |

### **Important Reminders**
- **Legacy Backend**: `backend/` (Laravel) is DEPRECATED - use `api/` only
- **Design System First**: Always reference brandkits before implementing UI
- **Type Safety**: Never bypass tRPC type system
- **Mobile First**: All UI must be responsive
- **Testing Required**: No commits without running tests
- **File Creation**: Only create new files when absolutely necessary
- **Backup First**: Always backup before architectural changes

### **Port References**
- **Frontend**: 8001
- **API**: 3002
- **WebSocket**: 3002/ws
- **Prisma Studio**: 5555

### **Technology Stack Summary**
**Backend**: Node.js + Fastify + tRPC + Prisma ORM + SQLite/PostgreSQL + Gemini 2.5 Flash AI
**Frontend**: React 18.3.1 + TypeScript 5.6.3 + shadcn/ui + TailwindCSS + Zustand + tRPC React Query
**Enterprise Features**: AI-powered productivity, multi-tenant workspaces, advanced project management, real-time collaboration

## MCP Integration & Advanced Tools

### **MCP Server Configuration**

The following MCP servers are configured for enhanced Krushr development:

**Active MCP Servers:**
1. **Context7** - Real-time codebase documentation (Global)
2. **Puppeteer** - Browser automation and screenshot analysis
3. **Memory** - Persistent context and session memory
4. **SQLite** - Direct database access and analysis
5. **Filesystem** - Direct file system access
6. **Git** - Git repository integration for version control

**Global Configuration** (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

**Project Configuration** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "./api/prisma/dev.db"]
    }
  }
}
```

**Setup Commands:**
```bash
# Standard MCP servers
claude mcp add krushr-db npx @modelcontextprotocol/server-sqlite ./api/prisma/dev.db
claude mcp add krushr-git npx @modelcontextprotocol/server-git
claude mcp add krushr-fs npx @modelcontextprotocol/server-filesystem /Users/justindoff/Cursor\ Projects/Krushr

# Context7 installation
npm install -g c7-mcp-server
npx @modelcontextprotocol/inspector c7-mcp-server  # Test installation
```

### **UI Analysis & Screenshot Tools**

**Puppeteer MCP Benefits:**
- **Automated Screenshots**: Capture running application UI states
- **Visual Design Verification**: Compare implementation to brandkit designs
- **Iterative UI Development**: Visual feedback loops for rapid iteration
- **Cross-browser Testing**: Automated browser testing and validation
- **Debug Visual Issues**: Screenshot-based troubleshooting

**Usage Commands:**
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

### **Advanced Workflow Automation**

**Installed Productivity Systems** (`Github-CC-Research/` directory):

1. **Claude Code Orchestrator v5.0.0** - Parallel team execution with evidence-based validation
2. **ClaudeFlow Multi-Agent System** - Up to 5 AI agents working in parallel on complex tasks
3. **Claude Code Auto Action (YOLO Mode)** - Auto-approve permissions, eliminate click-fatigue

**Essential Session Startup:**
```bash
# Every session (2 commands)
/workflow        # Auto-format, imports, tests, build validation
/watch           # File monitoring with smart workflow triggering

# Complex tasks (when needed)
"Build a complete user authentication system" → Choose "1" for orchestrator mode

# Heavy development (optional)
cd Github-CC-Research/claude-code-auto-action && ./scripts/claude-yolo-mode.sh
```

**Cache System Performance:**
- **Status**: Auto-running (2 daemons active)
- **Performance**: 40x+ speedup for Claude operations
- **Storage**: 22,558 files cached (183MB)

### **Memory Management & Context Tools**

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

**Integration Status:**
- **COMPLETE**: 38+ custom slash commands in `.claude/commands/`
- **COMPLETE**: MCP servers (Memory, filesystem, puppeteer) auto-active
- **COMPLETE**: Cache system background performance optimization
- **NEEDS_WORK**: External tools require manual activation

**Power User Workflow:**
```bash
# Ultimate productivity setup
/workflow && /watch  # Start session automation
cd Github-CC-Research/claude-code-auto-action && ./scripts/claude-yolo-mode.sh  # Auto-approvals
"Implement real-time notifications system" → Choose "1"  # Use orchestrator
cf-swarm "performance audit and optimization across entire stack"  # Multi-agent optimization
```

**Result**: Parallel execution, auto-approvals, 40x cache speedup, comprehensive automation.