# Krushr Sub Agents Guide

## Available Specialized Sub Agents

### 1. **trpc-specialist**
Expert in tRPC architecture with deep knowledge of Krushr's 24 routers and patterns.
- **Specialties**: Zod schemas, cursor pagination, workspace authorization, error handling
- **Use for**: API endpoint creation, type mismatches, tRPC debugging, middleware issues
- **Example**: "Use the trpc-specialist to implement cursor-based pagination for tasks"

### 2. **ui-designer**
UI/UX specialist fluent in Krushr's complete design system and brandkits.
- **Specialties**: 200+ UI components, color tokens, Satoshi/Manrope typography, CS-Interface icons
- **Use for**: Component creation, brandkit compliance, responsive layouts, accessibility
- **Example**: "Have the ui-designer create a task card using proper elevation shadows and color tokens"

### 3. **test-engineer**
Puppeteer E2E testing expert with knowledge of Krushr's test patterns.
- **Specialties**: Browser automation, screenshot debugging, selector strategies, async handling
- **Use for**: Running tests, debugging failures, creating new E2E tests
- **Example**: "Use the test-engineer to create a test for the calendar persistence issue"

### 4. **database-expert**
Prisma ORM specialist with deep understanding of Krushr's schema.
- **Specialties**: 2025 task enhancements, workspace access patterns, query optimization
- **Use for**: Schema design, migrations, performance indexes, complex queries
- **Example**: "Ask the database-expert to optimize the task query with proper includes"

### 5. **performance-optimizer**
Full-stack performance expert familiar with Krushr's 421KB CSS issue.
- **Specialties**: Bundle optimization, React rendering, tRPC caching, lazy loading
- **Use for**: Bundle size reduction, API response optimization, memory leaks
- **Example**: "Have the performance-optimizer implement code splitting for the brandkit"

### 6. **auth-security**
Security expert specializing in Krushr's dual auth system.
- **Specialties**: Session management, bcrypt hashing, JWT tokens, dev-token-123 issue
- **Use for**: Auth debugging, security audits, session handling, CORS issues
- **Example**: "Use auth-security to fix the hashedPassword schema mismatch"

### 7. **realtime-specialist**
WebSocket expert for Krushr's collaborative features.
- **Specialties**: Room management, presence tracking, message batching, reconnection
- **Use for**: Real-time features, WebSocket debugging, collaborative editing
- **Example**: "Have realtime-specialist implement typing indicators for task comments"

### 8. **file-upload-specialist**
Media handling expert for Krushr's dual upload systems.
- **Specialties**: Thumbnail generation (Sharp/Canvas/SVG), deduplication, 15MB limit
- **Use for**: File uploads, thumbnail issues, storage optimization, MIME validation
- **Example**: "Use file-upload-specialist to debug thumbnail generation failures"

## How to Use Sub Agents

### Method 1: Direct Invocation
```
> Use the [agent-name] sub agent to [task]
> Have the [agent-name] look at [specific issue]
```

### Method 2: Automatic Delegation
Claude will automatically use the appropriate sub agent based on your request.

### Method 3: Multiple Agents
```
> Use the database-expert to design the schema, then have the trpc-specialist create the endpoints
```

## Managing Sub Agents

### View All Agents:
```
/agents
```

### Create New Agent:
1. Run `/agents`
2. Select "Create New Agent"
3. Choose project-level (recommended)
4. Define the agent's purpose and tools

### Edit Existing Agents:
- Direct edit: Modify files in `.claude/agents/`
- Via command: Use `/agents` and select the agent to edit

## Best Practices

1. **Use specific agents for specific tasks** - Don't use ui-designer for database work
2. **Chain agents for complex workflows** - Database → tRPC → UI → Test
3. **Let agents access only necessary tools** - Improves focus and security
4. **Update agents as project evolves** - Add new patterns and guidelines

## Quick Task Examples

### Fix Authentication:
```
> Use the auth-security sub agent to fix the authentication schema mismatch issue
```

### Optimize Performance:
```
> Have the performance-optimizer analyze and reduce the frontend bundle size
```

### Create New Feature:
```
> Use orchestrator mode to implement a new calendar feature with database-expert, trpc-specialist, ui-designer, and test-engineer working in parallel
```

### Run Tests:
```
> Use the test-engineer to run all E2E tests and fix any failures
```

## Orchestrator Mode

For complex tasks requiring multiple specialists:
```
> [Any complex request]
> Choose "1" for orchestrator mode
```

This activates parallel execution with multiple personas working simultaneously.