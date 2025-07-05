#!/usr/bin/env node
/**
 * Demo Data Seeding Script
 * Creates demo workspace, projects, and tasks for testing
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDemoData() {
  console.log('🌱 Seeding demo data...')

  try {
    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@krushr.dev' }
    })

    if (!demoUser) {
      console.error('❌ Demo user not found. Please run registration first.')
      return
    }

    console.log(`✅ Found demo user: ${demoUser.name}`)

    // Create demo workspace
    const workspace = await prisma.workspace.upsert({
      where: { id: 'demo-workspace-1' },
      update: {},
      create: {
        id: 'demo-workspace-1',
        name: 'Demo Workspace',
        description: 'A sample workspace for testing Krushr features',
        ownerId: demoUser.id,
        settings: JSON.stringify({
          theme: 'light',
          notifications: true
        })
      }
    })

    console.log(`✅ Created workspace: ${workspace.name}`)

    // Create demo project
    const project = await prisma.project.upsert({
      where: { id: 'demo-project-1' },
      update: {},
      create: {
        id: 'demo-project-1',
        name: 'Sample Project',
        description: 'A demo project to showcase Krushr functionality',
        workspaceId: workspace.id,
        status: 'ACTIVE'
      }
    })

    console.log(`✅ Created project: ${project.name}`)

    // Create kanban board
    const kanban = await prisma.kanban.upsert({
      where: { id: 'demo-kanban-1' },
      update: {},
      create: {
        id: 'demo-kanban-1',
        title: 'Project Board',
        description: 'Main project kanban board',
        workspaceId: workspace.id,
        projectId: project.id,
        position: 0
      }
    })

    console.log(`✅ Created kanban: ${kanban.title}`)

    // Create kanban columns
    const columns = [
      { id: 'col-todo', name: 'To Do', position: 0, color: '#94a3b8' },
      { id: 'col-progress', name: 'In Progress', position: 1, color: '#3b82f6' },
      { id: 'col-review', name: 'Review', position: 2, color: '#f59e0b' },
      { id: 'col-done', name: 'Done', position: 3, color: '#10b981' }
    ]

    for (const col of columns) {
      await prisma.kanbanColumn.upsert({
        where: { id: col.id },
        update: {},
        create: {
          id: col.id,
          title: col.name,
          position: col.position,
          color: col.color,
          kanbanId: kanban.id
        }
      })
    }

    console.log(`✅ Created ${columns.length} kanban columns`)

    // Create demo tasks
    const tasks = [
      {
        id: 'task-1',
        title: 'Set up project structure',
        description: 'Initialize the project with proper folder structure and configuration files',
        status: 'done',
        priority: 'high',
        columnId: 'col-done',
        position: 0
      },
      {
        id: 'task-2', 
        title: 'Design user interface mockups',
        description: 'Create wireframes and mockups for the main user interface components',
        status: 'done',
        priority: 'medium',
        columnId: 'col-done',
        position: 1
      },
      {
        id: 'task-3',
        title: 'Implement authentication system',
        description: 'Build login, registration, and user session management',
        status: 'in_progress',
        priority: 'high',
        columnId: 'col-progress',
        position: 0
      },
      {
        id: 'task-4',
        title: 'Create kanban board component',
        description: 'Build the main kanban board with drag-and-drop functionality',
        status: 'in_progress',
        priority: 'high',
        columnId: 'col-progress',
        position: 1
      },
      {
        id: 'task-5',
        title: 'Add file upload feature',
        description: 'Allow users to upload and attach files to tasks',
        status: 'todo',
        priority: 'medium',
        columnId: 'col-todo',
        position: 0
      },
      {
        id: 'task-6',
        title: 'Write unit tests',
        description: 'Add comprehensive test coverage for core functionality',
        status: 'todo',
        priority: 'low',
        columnId: 'col-todo',
        position: 1
      },
      {
        id: 'task-7',
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'todo',
        priority: 'medium',
        columnId: 'col-todo',
        position: 2
      }
    ]

    for (const task of tasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {},
        create: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status.toUpperCase(),
          priority: task.priority.toUpperCase(),
          position: task.position,
          projectId: project.id,
          kanbanColumnId: task.columnId,
          assigneeId: demoUser.id,
          createdById: demoUser.id,
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      })
    }

    console.log(`✅ Created ${tasks.length} demo tasks`)

    // Create a demo team
    const team = await prisma.team.upsert({
      where: { id: 'demo-team-1' },
      update: {},
      create: {
        id: 'demo-team-1',
        name: 'Development Team',
        description: 'Main development team for the project',
        workspaceId: workspace.id
      }
    })

    // Add demo user to team
    await prisma.teamMember.upsert({
      where: {
        userId_teamId: {
          teamId: team.id,
          userId: demoUser.id
        }
      },
      update: {},
      create: {
        teamId: team.id,
        userId: demoUser.id,
        role: 'OWNER'
      }
    })

    console.log(`✅ Created team: ${team.name}`)

    console.log('\n🎉 Demo data seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - 1 Workspace: ${workspace.name}`)
    console.log(`   - 1 Project: ${project.name}`)
    console.log(`   - 1 Kanban Board with 4 columns`)
    console.log(`   - ${tasks.length} Demo Tasks`)
    console.log(`   - 1 Team: ${team.name}`)

  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
if (require.main === module) {
  seedDemoData()
}

module.exports = { seedDemoData }