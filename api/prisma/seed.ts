/**
 * Database Seeding Script
 * Creates sample data for development and testing
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.taskComment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.panel.deleteMany()
  await prisma.kanban.deleteMany()
  await prisma.project.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  // Create sample users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@krushr.dev',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a9cc4f?w=100&h=100&fit=crop&crop=face',
    }
  })

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@krushr.dev',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    }
  })

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie@krushr.dev',
      password: await bcrypt.hash('password123', 10),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    }
  })

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Krushr Development',
      description: 'Main development workspace for Krushr platform',
      ownerId: alice.id,
    }
  })

  // Create team
  const team = await prisma.team.create({
    data: {
      name: 'Development Team',
      description: 'Core development team working on Krushr features',
      workspaceId: workspace.id,
    }
  })

  // Add team members
  await prisma.teamMember.createMany({
    data: [
      { teamId: team.id, userId: alice.id, role: 'owner' },
      { teamId: team.id, userId: bob.id, role: 'admin' },
      { teamId: team.id, userId: charlie.id, role: 'member' },
    ]
  })

  // Create projects
  const frontendProject = await prisma.project.create({
    data: {
      name: 'Frontend Redesign',
      description: 'Modern React frontend with improved UX',
      status: 'ACTIVE',
      workspaceId: workspace.id,
      teamId: team.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-01'),
    }
  })

  const backendProject = await prisma.project.create({
    data: {
      name: 'API Enhancement',
      description: 'tRPC integration and performance improvements',
      status: 'ACTIVE',
      workspaceId: workspace.id,
      teamId: team.id,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-02-28'),
    }
  })

  // Create kanban boards
  const frontendBoard = await prisma.kanban.create({
    data: {
      title: 'Frontend Development',
      description: 'Track frontend development tasks',
      workspaceId: workspace.id,
      projectId: frontendProject.id,
    }
  })

  const backendBoard = await prisma.kanban.create({
    data: {
      title: 'Backend Development',
      description: 'Track backend API tasks',
      workspaceId: workspace.id,
      projectId: backendProject.id,
    }
  })

  // Create kanban columns for frontend board
  const frontendColumns = await Promise.all([
    prisma.kanbanColumn.create({
      data: { title: 'To Do', position: 0, color: '#6b7280', kanbanId: frontendBoard.id }
    }),
    prisma.kanbanColumn.create({
      data: { title: 'In Progress', position: 1, color: '#3b82f6', kanbanId: frontendBoard.id }
    }),
    prisma.kanbanColumn.create({
      data: { title: 'Review', position: 2, color: '#f59e0b', kanbanId: frontendBoard.id }
    }),
    prisma.kanbanColumn.create({
      data: { title: 'Done', position: 3, color: '#10b981', kanbanId: frontendBoard.id }
    }),
  ])

  // Create kanban columns for backend board
  const backendColumns = await Promise.all([
    prisma.kanbanColumn.create({
      data: { title: 'Backlog', position: 0, color: '#6b7280', kanbanId: backendBoard.id }
    }),
    prisma.kanbanColumn.create({
      data: { title: 'To Do', position: 1, color: '#8b5cf6', kanbanId: backendBoard.id }
    }),
    prisma.kanbanColumn.create({
      data: { title: 'In Progress', position: 2, color: '#3b82f6', kanbanId: backendBoard.id }
    }),
    prisma.kanbanColumn.create({
      data: { title: 'Done', position: 3, color: '#10b981', kanbanId: backendBoard.id }
    }),
  ])

  // Create sample tasks
  const tasks = [
    {
      title: 'Implement user authentication',
      description: 'Set up tRPC authentication with JWT tokens',
      status: 'DONE',
      priority: 'HIGH',
      projectId: backendProject.id,
      kanbanColumnId: backendColumns[3].id, // Done column
      createdById: alice.id,
      assigneeId: alice.id,
      dueDate: new Date('2025-01-20'),
    },
    {
      title: 'Design dashboard layout',
      description: 'Create responsive dashboard with modern UI components',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: frontendProject.id,
      kanbanColumnId: frontendColumns[1].id, // In Progress column
      createdById: alice.id,
      assigneeId: bob.id,
      dueDate: new Date('2025-01-25'),
    },
    {
      title: 'Setup WebSocket connection',
      description: 'Real-time updates for collaborative features',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: backendProject.id,
      kanbanColumnId: backendColumns[1].id, // To Do column
      createdById: alice.id,
      assigneeId: charlie.id,
      dueDate: new Date('2025-02-01'),
    },
    {
      title: 'Implement kanban board',
      description: 'Drag-and-drop task management interface',
      status: 'REVIEW',
      priority: 'HIGH',
      projectId: frontendProject.id,
      kanbanColumnId: frontendColumns[2].id, // Review column
      createdById: alice.id,
      assigneeId: bob.id,
      dueDate: new Date('2025-01-30'),
    },
    {
      title: 'Add file upload system',
      description: 'Allow users to attach files to tasks and projects',
      status: 'TODO',
      priority: 'LOW',
      projectId: backendProject.id,
      kanbanColumnId: backendColumns[0].id, // Backlog column
      createdById: alice.id,
      assigneeId: alice.id,
      dueDate: new Date('2025-02-15'),
    },
    {
      title: 'Mobile responsive design',
      description: 'Ensure all components work well on mobile devices',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: frontendProject.id,
      kanbanColumnId: frontendColumns[0].id, // To Do column
      createdById: alice.id,
      assigneeId: charlie.id,
      dueDate: new Date('2025-02-10'),
    },
  ]

  for (const taskData of tasks) {
    await prisma.task.create({ data: taskData })
  }

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: alice.id,
        title: 'Task assigned',
        message: 'You have been assigned to "Add file upload system"',
        type: 'TASK',
        isRead: false,
      },
      {
        userId: bob.id,
        title: 'Project deadline approaching',
        message: 'Frontend Redesign project is due in 5 days',
        type: 'PROJECT',
        isRead: false,
      },
      {
        userId: charlie.id,
        title: 'New team member',
        message: 'Alice Johnson joined the Development Team',
        type: 'TEAM',
        isRead: true,
      },
      {
        userId: alice.id,
        title: 'Task completed',
        message: 'Bob Smith completed "Implement kanban board"',
        type: 'TASK',
        isRead: true,
      },
    ]
  })

  // Create default workspace panels
  await prisma.panel.createMany({
    data: [
      {
        type: 'KANBAN',
        title: 'Frontend Board',
        position_x: 0,
        position_y: 0,
        width: 12,
        height: 8,
        workspaceId: workspace.id,
        data: JSON.stringify({ kanbanId: frontendBoard.id }),
      },
      {
        type: 'KANBAN',
        title: 'Backend Board',
        position_x: 12,
        position_y: 0,
        width: 12,
        height: 8,
        workspaceId: workspace.id,
        data: JSON.stringify({ kanbanId: backendBoard.id }),
      },
      {
        type: 'NOTES',
        title: 'Project Notes',
        position_x: 0,
        position_y: 8,
        width: 8,
        height: 6,
        workspaceId: workspace.id,
        data: JSON.stringify({}),
      },
      {
        type: 'CHAT',
        title: 'Team Chat',
        position_x: 8,
        position_y: 8,
        width: 8,
        height: 6,
        workspaceId: workspace.id,
        data: JSON.stringify({ threadId: team.id }),
      },
      {
        type: 'CALENDAR',
        title: 'Project Calendar',
        position_x: 16,
        position_y: 8,
        width: 8,
        height: 6,
        workspaceId: workspace.id,
        data: JSON.stringify({}),
      },
    ]
  })

  // Create development session for Alice
  await prisma.session.create({
    data: {
      userId: alice.id,
      token: 'dev-token-123',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  });

  console.log('✅ Development token created for Alice');

  console.log('✅ Database seeding completed!')
  console.log(`📊 Created:`)
  console.log(`   - 3 users (alice@krushr.dev, bob@krushr.dev, charlie@krushr.dev)`)
  console.log(`   - 1 workspace (Krushr Development)`)
  console.log(`   - 1 team (Development Team)`)
  console.log(`   - 2 projects (Frontend Redesign, API Enhancement)`)
  console.log(`   - 2 kanban boards`)
  console.log(`   - 6 tasks`)
  console.log(`   - 4 notifications`)
  console.log(`   - 5 workspace panels`)
  console.log(``)
  console.log(`🔑 Login credentials:`)
  console.log(`   Email: alice@krushr.dev | Password: password123`)
  console.log(`   Email: bob@krushr.dev   | Password: password123`)
  console.log(`   Email: charlie@krushr.dev | Password: password123`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })