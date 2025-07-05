/**
 * Authentication Router
 * User registration, login, logout, and profile management
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure, protectedProcedure } from '../base'
import { isAuthenticated } from '../middleware'
import { hashPassword, verifyPassword, createSession, invalidateSession } from '../../lib/auth'

export const authRouter = router({
  /**
   * Register new user
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, password } = input

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        })
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password)
      
      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      })

      // Create default workspace for new user
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          description: 'Your personal workspace for managing projects and tasks',
          ownerId: user.id,
        },
      })

      // Create default project
      const project = await ctx.prisma.project.create({
        data: {
          name: 'Getting Started',
          description: 'Your first project to explore Krushr features',
          workspaceId: workspace.id,
        },
      })

      // Create default kanban board
      const kanban = await ctx.prisma.kanban.create({
        data: {
          title: 'Project Board',
          description: 'Main project kanban board for task management',
          workspaceId: workspace.id,
          projectId: project.id,
          position: 0,
        },
      })

      // Create default kanban columns
      const columns = [
        { title: 'To Do', position: 0 },
        { title: 'In Progress', position: 1 },
        { title: 'Review', position: 2 },
        { title: 'Done', position: 3 },
      ]

      for (const column of columns) {
        await ctx.prisma.kanbanColumn.create({
          data: {
            title: column.title,
            position: column.position,
            kanbanId: kanban.id,
          },
        })
      }

      // Create sample welcome task
      const todoColumn = await ctx.prisma.kanbanColumn.findFirst({
        where: { kanbanId: kanban.id, position: 0 },
      })

      if (todoColumn) {
        await ctx.prisma.task.create({
          data: {
            title: 'Welcome to Krushr!',
            description: 'This is your first task. Click on it to edit details, assign it to yourself, or move it to different columns. You can also create new tasks using the "Add Task" button.',
            priority: 'MEDIUM',
            status: 'TODO',
            position: 0,
            projectId: project.id,
            kanbanColumnId: todoColumn.id,
            createdById: user.id,
          },
        })
      }

      // Create session
      const sessionToken = await createSession(user.id)

      return {
        user,
        token: sessionToken,
        message: 'Registration successful',
      }
    }),

  /**
   * Login user
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input

      // Find user
      const user = await ctx.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      }

      // Create session
      const sessionToken = await createSession(user.id)

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        token: sessionToken,
        message: 'Login successful',
      }
    }),

  /**
   * Logout user
   */
  logout: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await invalidateSession(input.token)
      
      return {
        message: 'Logout successful',
      }
    }),

  /**
   * Get current user profile
   */
  me: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        return null
      }

      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        avatar: ctx.user.avatar,
        createdAt: ctx.user.createdAt,
      }
    }),

  /**
   * Update user profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        avatar: z.string().url('Invalid avatar URL').optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          updatedAt: true,
        },
      })

      return {
        user: updatedUser,
        message: 'Profile updated successfully',
      }
    }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { currentPassword, newPassword } = input

      // Verify current password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const isValidPassword = await verifyPassword(currentPassword, user.password)
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        })
      }

      // Hash new password and update
      const hashedNewPassword = await hashPassword(newPassword)
      
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { password: hashedNewPassword },
      })

      return {
        message: 'Password changed successfully',
      }
    }),
})