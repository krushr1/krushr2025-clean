/**
 * Database Seeding
 * Create sample data for development and testing
 */

import { PrismaClient } from '@prisma/client'
import { MemberRole, TaskStatus, Priority, NotificationType } from '../types/enums'
import { hashPassword } from '../lib/auth'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

async function main() {
  logger.info('🌱 Starting database seeding...')

  // Create demo users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@krushr.dev' },
      update: {},
      create: {
        email: 'alice@krushr.dev',
        name: 'Alice Johnson',
        password: await hashPassword('password123'),
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b300?w=150',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@krushr.dev' },
      update: {},
      create: {
        email: 'bob@krushr.dev',
        name: 'Bob Smith',
        password: await hashPassword('password123'),
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@krushr.dev' },
      update: {},
      create: {
        email: 'charlie@krushr.dev',
        name: 'Charlie Davis',
        password: await hashPassword('password123'),
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    }),
    prisma.user.upsert({
      where: { email: 'diana@krushr.dev' },
      update: {},
      create: {
        email: 'diana@krushr.dev',
        name: 'Diana Wilson',
        password: await hashPassword('password123'),
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
    }),
  ])

  logger.success(`✅ Created ${users.length} demo users`)

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: {},
    create: {
      id: 'demo-workspace',
      name: 'My Workspace',
      description: 'Your primary workspace for project management',
      ownerId: users[0].id,
      settings: JSON.stringify({
        theme: 'light',
        notifications: true,
        publicInvites: false,
      }),
    },
  })

  // Add members to workspace
  await Promise.all([
    prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: users[1].id,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId: users[1].id,
        workspaceId: workspace.id,
        role: MemberRole.ADMIN,
      },
    }),
    prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: users[2].id,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        workspaceId: workspace.id,
        role: MemberRole.MEMBER,
      },
    }),
    prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: users[3].id,
          workspaceId: workspace.id,
        },
      },
      update: {},
      create: {
        userId: users[3].id,
        workspaceId: workspace.id,
        role: MemberRole.MEMBER,
      },
    }),
  ])

  logger.success(`✅ Created workspace with ${users.length} members`)

  // Create demo team
  const team = await prisma.team.upsert({
    where: { id: 'demo-team' },
    update: {},
    create: {
      id: 'demo-team',
      name: 'Product Development',
      description: 'Core product development team',
      color: '#3B82F6',
      workspaceId: workspace.id,
    },
  })

  // Add team members
  await Promise.all([
    prisma.teamMember.upsert({
      where: {
        userId_teamId: {
          userId: users[0].id,
          teamId: team.id,
        },
      },
      update: {},
      create: {
        userId: users[0].id,
        teamId: team.id,
        role: MemberRole.ADMIN,
      },
    }),
    prisma.teamMember.upsert({
      where: {
        userId_teamId: {
          userId: users[1].id,
          teamId: team.id,
        },
      },
      update: {},
      create: {
        userId: users[1].id,
        teamId: team.id,
        role: MemberRole.MEMBER,
      },
    }),
    prisma.teamMember.upsert({
      where: {
        userId_teamId: {
          userId: users[2].id,
          teamId: team.id,
        },
      },
      update: {},
      create: {
        userId: users[2].id,
        teamId: team.id,
        role: MemberRole.MEMBER,
      },
    }),
  ])

  logger.success(`✅ Created team with 3 members`)

  // Create demo project
  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      name: 'Krushr Platform V2',
      description: 'Next generation project management platform',
      workspaceId: workspace.id,
      teamId: team.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
    },
  })

  logger.success(`✅ Created demo project`)

  // Create demo kanban board
  const kanban = await prisma.kanban.upsert({
    where: { id: 'demo-kanban' },
    update: {},
    create: {
      id: 'demo-kanban',
      title: 'Platform Development Board',
      description: 'Main development board for tracking features and bugs',
      workspaceId: workspace.id,
      projectId: project.id,
      position: 0,
    },
  })

  // Create kanban columns
  const columns = await Promise.all([
    prisma.kanbanColumn.upsert({
      where: { id: 'col-backlog' },
      update: {},
      create: {
        id: 'col-backlog',
        title: 'Backlog',
        position: 0,
        color: '#6B7280',
        kanbanId: kanban.id,
      },
    }),
    prisma.kanbanColumn.upsert({
      where: { id: 'col-todo' },
      update: {},
      create: {
        id: 'col-todo',
        title: 'To Do',
        position: 1,
        color: '#EF4444',
        kanbanId: kanban.id,
      },
    }),
    prisma.kanbanColumn.upsert({
      where: { id: 'col-progress' },
      update: {},
      create: {
        id: 'col-progress',
        title: 'In Progress',
        position: 2,
        color: '#3B82F6',
        kanbanId: kanban.id,
      },
    }),
    prisma.kanbanColumn.upsert({
      where: { id: 'col-review' },
      update: {},
      create: {
        id: 'col-review',
        title: 'Review',
        position: 3,
        color: '#F59E0B',
        kanbanId: kanban.id,
      },
    }),
    prisma.kanbanColumn.upsert({
      where: { id: 'col-done' },
      update: {},
      create: {
        id: 'col-done',
        title: 'Done',
        position: 4,
        color: '#10B981',
        kanbanId: kanban.id,
      },
    }),
  ])

  logger.success(`✅ Created kanban board with ${columns.length} columns`)

  // Create demo tasks
  const tasks = [
    {
      id: 'task-1',
      title: 'Implement real-time WebSocket system',
      description: 'Build WebSocket server for live collaboration features including task updates, user presence, and chat.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      columnId: columns[4].id, // Done
      assigneeId: users[1].id,
      dueDate: new Date('2025-01-15'),
    },
    {
      id: 'task-2',
      title: 'Design modern UI components',
      description: 'Create a comprehensive design system using shadcn/ui and Radix primitives.',
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      columnId: columns[4].id, // Done
      assigneeId: users[3].id,
      dueDate: new Date('2025-01-20'),
    },
    {
      id: 'task-3',
      title: 'Setup tRPC API endpoints',
      description: 'Implement type-safe API routes for all major features including auth, workspaces, and tasks.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      columnId: columns[2].id, // In Progress
      assigneeId: users[0].id,
      dueDate: new Date('2025-01-25'),
    },
    {
      id: 'task-4',
      title: 'Mobile responsive design',
      description: 'Ensure all components work perfectly on mobile devices with touch-friendly interactions.',
      status: TaskStatus.IN_REVIEW,
      priority: Priority.MEDIUM,
      columnId: columns[3].id, // Review
      assigneeId: users[2].id,
      dueDate: new Date('2025-02-01'),
    },
    {
      id: 'task-5',
      title: 'Implement drag-drop kanban boards',
      description: 'Add smooth drag-and-drop functionality for kanban cards with real-time updates.',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      columnId: columns[1].id, // To Do
      assigneeId: users[1].id,
      dueDate: new Date('2025-02-05'),
    },
    {
      id: 'task-6',
      title: 'Add notification system',
      description: 'Create comprehensive notification system with real-time delivery and preferences.',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      columnId: columns[1].id, // To Do
      assigneeId: users[3].id,
      dueDate: new Date('2025-02-10'),
    },
    {
      id: 'task-7',
      title: 'Database optimization',
      description: 'Optimize PostgreSQL queries and add proper indexing for better performance.',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      columnId: columns[0].id, // Backlog
      assigneeId: users[2].id,
      dueDate: new Date('2025-02-15'),
    },
    {
      id: 'task-8',
      title: 'Email integration',
      description: 'Integrate email notifications and AI-powered email composition features.',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      columnId: columns[0].id, // Backlog
      assigneeId: users[0].id,
      dueDate: new Date('2025-02-20'),
    },
  ]

  await Promise.all(
    tasks.map((task, index) =>
      prisma.task.upsert({
        where: { id: task.id },
        update: {},
        create: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          position: index,
          dueDate: task.dueDate,
          projectId: project.id,
          kanbanColumnId: task.columnId,
          createdById: users[0].id,
          assigneeId: task.assigneeId,
        },
      })
    )
  )

  logger.success(`✅ Created ${tasks.length} demo tasks`)

  // Create sample comments
  await Promise.all([
    prisma.taskComment.upsert({
      where: { id: 'comment-1' },
      update: {},
      create: {
        id: 'comment-1',
        content: 'Great work on the WebSocket implementation! The real-time updates are working perfectly.',
        taskId: 'task-1',
        authorId: users[0].id,
      },
    }),
    prisma.taskComment.upsert({
      where: { id: 'comment-2' },
      update: {},
      create: {
        id: 'comment-2',
        content: 'The UI components look amazing! Really professional design.',
        taskId: 'task-2',
        authorId: users[1].id,
      },
    }),
    prisma.taskComment.upsert({
      where: { id: 'comment-3' },
      update: {},
      create: {
        id: 'comment-3',
        content: 'Making good progress on the API. Should be done by tomorrow.',
        taskId: 'task-3',
        authorId: users[0].id,
      },
    }),
  ])

  // Create sample notifications
  await Promise.all([
    prisma.notification.upsert({
      where: { id: 'notif-1' },
      update: {},
      create: {
        id: 'notif-1',
        title: 'Task Assigned',
        message: 'You have been assigned to "Setup tRPC API endpoints"',
        type: NotificationType.TASK_ASSIGNED,
        userId: users[0].id,
        data: JSON.stringify({ taskId: 'task-3' }),
      },
    }),
    prisma.notification.upsert({
      where: { id: 'notif-2' },
      update: {},
      create: {
        id: 'notif-2',
        title: 'Task Completed',
        message: 'Bob Smith completed "Implement real-time WebSocket system"',
        type: NotificationType.TASK_COMPLETED,
        userId: users[0].id,
        data: JSON.stringify({ taskId: 'task-1', completedBy: users[1].id }),
      },
    }),
    prisma.notification.upsert({
      where: { id: 'notif-3' },
      update: {},
      create: {
        id: 'notif-3',
        title: 'New Comment',
        message: 'Alice Johnson commented on your task',
        type: NotificationType.COMMENT_ADDED,
        userId: users[1].id,
        data: JSON.stringify({ taskId: 'task-1', commentId: 'comment-1' }),
      },
    }),
  ])

  logger.success(`✅ Created sample notifications`)

  // Create workspace panels
  const panels = [
    {
      id: 'panel-kanban-main',
      type: 'KANBAN',
      title: 'Main Development Board',
      position_x: 0,
      position_y: 0,
      width: 12,
      height: 8,
      workspaceId: workspace.id,
      data: JSON.stringify({ kanbanId: kanban.id }),
    },
    {
      id: 'panel-notes',
      type: 'NOTES',
      title: 'Project Notes',
      position_x: 12,
      position_y: 0,
      width: 6,
      height: 6,
      workspaceId: workspace.id,
      data: JSON.stringify({}),
    },
    {
      id: 'panel-chat',
      type: 'CHAT',
      title: 'Team Chat',
      position_x: 18,
      position_y: 0,
      width: 6,
      height: 6,
      workspaceId: workspace.id,
      data: JSON.stringify({ teamId: team.id }),
    },
    {
      id: 'panel-calendar',
      type: 'CALENDAR',
      title: 'Project Calendar',
      position_x: 12,
      position_y: 6,
      width: 12,
      height: 6,
      workspaceId: workspace.id,
      data: JSON.stringify({}),
    },
  ]

  await Promise.all(
    panels.map(panel =>
      prisma.panel.upsert({
        where: { id: panel.id },
        update: {},
        create: panel,
      })
    )
  )

  logger.success(`✅ Created ${panels.length} workspace panels`)

  logger.success('🎉 Database seeding completed successfully!')
  logger.info('📧 Demo users created:')
  users.forEach(user => {
    logger.info(`   - ${user.email} (password: password123)`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    logger.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })