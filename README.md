# Krushr - Project Management Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/krushr1/krushr2025-clean)

**🎉 This is the CLEAN repository with only essential operational files!**

**A powerful, flexible, and responsive project management platform built with cutting-edge 2025 technologies. Perfect for teams seeking robust collaboration, real-time features, and seamless web-to-mobile experiences.**

## ⭐ **Key Features**

- 🎯 **Real-time Collaboration** - Live kanban boards, instant messaging, notifications
- 📱 **Mobile-First Design** - Responsive UI that works perfectly on all devices  
- ⚡ **Blazing Fast Performance** - Modern build tools and optimized architecture
- 🔒 **Enterprise Security** - JWT authentication, role-based permissions
- 🛠️ **Fully Customizable** - Webhooks, API integrations, extensible architecture
- 🌐 **Type-Safe Full-Stack** - End-to-end TypeScript with tRPC
- 🤖 **AI-Powered Development** - Claude Code integration with MCP servers

## 🚀 **Quick Start**

```bash
# Clone and setup
git clone https://github.com/krushr1/krushr2025-dev.git
cd krushr2025-dev
npm run install:all

# Development
npm run dev                    # Start both frontend + backend

# Access
# Frontend: http://127.0.0.1:8001
# API: http://localhost:3002
# Database: npm run db:studio

# Login: alice@krushr.dev / password123
```

## 🏗️ **Modern Architecture**

### **Enterprise Backend** - 17 Specialized tRPC Routers
- **Node.js + tRPC + Prisma** for type-safe API development
- **Enhanced task management** with story points and business value
- **Real-time collaboration** with WebSocket rooms
- **Advanced file upload** system (15MB limit with thumbnails)
- **Multi-tenant workspaces** with role-based access

### **React Frontend** - 50+ Professional UI Components
- **React 18 + TypeScript** with modern architecture
- **shadcn/ui + TailwindCSS** design system
- **Professional Kanban** with @dnd-kit drag & drop
- **Rich text editing** with TipTap editor
- **PWA-ready** with offline capabilities

### **AI-Enhanced Development**
- **Claude Code integration** with MCP servers
- **Automated testing** with Puppeteer
- **Design system compliance** checking
- **Memory management** for large codebase development

## 🔧 **Development Tools**

### **MCP Servers**
- **Puppeteer** - Automated screenshot analysis
- **Memory** - Context persistence across sessions
- **SQLite** - Direct database access and analysis

### **Custom Commands**
```bash
/krushr-status    # Complete project overview
/trpc-map        # Router architecture mapping
/brand-check     # Design system validation
/memory-sync     # Context preservation
```

## 📁 **Project Structure**

```
krushr2025-dev/
├── api/                    # Node.js + tRPC Backend
│   ├── src/trpc/routers/   # 17 specialized API routes
│   ├── prisma/             # Database schema & migrations
│   └── uploads/            # File storage (15MB limit)
├── frontend/               # React + TypeScript
│   ├── src/components/     # 50+ UI components
│   ├── public/            # Design system & brandkit
│   └── src/stores/        # Zustand state management
├── .claude/               # Claude Code commands
├── .cursor/               # MCP server configuration
└── shared/                # TypeScript types
```

## 🌟 **Enterprise Features**

### ✅ **Production Ready**
- **17 tRPC Routers** for modular API architecture
- **Advanced task system** with AI scheduling suggestions
- **Professional Kanban** with bulk operations
- **Real-time collaboration** with user presence
- **Rich text notes** with comprehensive formatting
- **Enterprise file management** with deduplication
- **Comprehensive testing** with Puppeteer E2E

### 🚧 **Active Development**
- Enhanced calendar integration
- Advanced project analytics
- AI-powered project insights
- Mobile app development

## 🔌 **API Architecture**

### **Core Routers**
- `task.ts` - Enhanced task management (2025)
- `notes.ts` - Rich text note system
- `workspace.ts` - Multi-tenant workspaces
- `kanban.ts` - Professional board operations
- `upload-new.ts` - Enterprise file system

### **Real-time Features**
- WebSocket rooms for collaboration
- Live task updates and notifications
- User presence tracking
- Instant messaging system

## 🚀 **Deployment**

### **Docker (Recommended)**
```bash
docker-compose up -d
```

### **Manual Deployment**
```bash
# Backend
cd api && npm run build && npm start

# Frontend
cd frontend && npm run build
```

## 📄 **License**

MIT License - Built with ❤️ for modern development teams

---

**🚀 Generated with [Claude Code](https://claude.ai/code)**
