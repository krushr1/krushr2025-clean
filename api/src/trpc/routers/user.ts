/**
 * User Router
 * User management endpoints
 */

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { TRPCError } from '@trpc/server'

export const userRouter = router({
  /**
   * List workspace members
   */
  listWorkspaceMembers: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new Error('Workspace not found or access denied')
      }

      // Get all members
      const members = await ctx.prisma.workspaceMember.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      })

      // Include owner if not already in members
      const owner = await ctx.prisma.user.findUnique({
        where: { id: workspace.ownerId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      })

      const allUsers = [
        owner,
        ...members.map(m => m.user),
      ].filter((user, index, self) => 
        user && index === self.findIndex(u => u?.id === user.id)
      )

      return allUsers
    }),

  /**
   * Update user profile
   */
  updateProfile: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        name: z.string().optional(),
        avatar: z.string().optional(),
        timezone: z.string().optional(),
        dateFormat: z.string().optional(),
        language: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          timezone: true,
          dateFormat: true,
          language: true,
        },
      })

      return user
    }),

  /**
   * Update password
   */
  updatePassword: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(input.currentPassword, user.password)

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current password is incorrect',
        })
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      // Update password
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),

  /**
   * Get user by ID
   */
  get: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          timezone: true,
          dateFormat: true,
          language: true,
          createdAt: true,
        },
      })

      return user
    }),

  /**
   * Get current user profile
   */
  me: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          timezone: true,
          dateFormat: true,
          language: true,
          createdAt: true,
          preferences: true,
        },
      })

      return user
    }),

  /**
   * Get user preferences
   */
  getPreferences: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      let preferences = await ctx.prisma.userPreferences.findUnique({
        where: { userId: ctx.user.id },
      })

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await ctx.prisma.userPreferences.create({
          data: {
            userId: ctx.user.id,
          },
        })
      }

      return preferences
    }),

  /**
   * Update user preferences
   */
  updatePreferences: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        colorScheme: z.enum(['blue', 'green', 'purple', 'orange']).optional(),
        compactMode: z.boolean().optional(),
        fontSize: z.enum(['small', 'medium', 'large']).optional(),
        sidebarBehavior: z.enum(['always', 'auto', 'manual']).optional(),
        desktopNotifications: z.boolean().optional(),
        emailNotifications: z.boolean().optional(),
        emailDigestFrequency: z.enum(['immediate', 'daily', 'weekly', 'off']).optional(),
        notifyTaskAssignments: z.boolean().optional(),
        notifyCommentsMentions: z.boolean().optional(),
        notifyTeamInvitations: z.boolean().optional(),
        notifyProjectDeadlines: z.boolean().optional(),
        notifyFileUploads: z.boolean().optional(),
        notificationSound: z.boolean().optional(),
        quietHoursStart: z.string().optional(),
        quietHoursEnd: z.string().optional(),
        defaultTaskPriority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
        autoSaveFrequency: z.number().int().min(10).max(600).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const preferences = await ctx.prisma.userPreferences.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: {
          userId: ctx.user.id,
          ...input,
        },
      })

      return preferences
    }),

  /**
   * Export user data
   */
  exportData: publicProcedure
    .use(isAuthenticated)
    .mutation(async ({ ctx }) => {
      const userData = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          preferences: true,
          notes: true,
          tasks: true,
          notifications: true,
          workspaces: {
            include: {
              workspace: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      })

      // Remove sensitive data
      const exportData = {
        ...userData,
        password: undefined,
        sessions: undefined,
      }

      return {
        data: exportData,
        exportedAt: new Date().toISOString(),
        format: 'json',
      }
    }),

  /**
   * Invite user to workspace (alias for workspace.inviteUser)
   */
  inviteToWorkspace: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        email: z.string().email(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user has permission to invite
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            {
              members: {
                some: {
                  userId: ctx.user.id,
                  role: { in: ['OWNER', 'ADMIN'] },
                },
              },
            },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to invite users to this workspace',
        })
      }

      // Find user by email
      const invitedUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!invitedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User with this email not found',
        })
      }

      // Check if user is already a member
      const existingMember = await ctx.prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: invitedUser.id,
            workspaceId: input.workspaceId,
          },
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User is already a member of this workspace',
        })
      }

      // Add user to workspace
      const member = await ctx.prisma.workspaceMember.create({
        data: {
          userId: invitedUser.id,
          workspaceId: input.workspaceId,
          role: (input.role as any) || 'MEMBER',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return {
        member,
        message: 'User invited successfully',
      }
    }),

  /**
   * Get active sessions
   */
  getActiveSessions: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const sessions = await ctx.prisma.session.findMany({
        where: {
          userId: ctx.user.id,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isCurrent: session.token === ctx.session?.token,
      }))
    }),

  /**
   * Revoke session
   */
  revokeSession: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.session.findFirst({
        where: {
          id: input.sessionId,
          userId: ctx.user.id,
        },
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      await ctx.prisma.session.delete({
        where: { id: input.sessionId },
      })

      return { success: true }
    }),

  /**
   * Get workspace users for dropdowns and assignments
   */
  getWorkspaceUsers: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found or access denied',
        })
      }

      // Get all members
      const members = await ctx.prisma.workspaceMember.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      })

      // Include workspace owner if not already in members
      const owner = await ctx.prisma.user.findUnique({
        where: { id: workspace.ownerId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      })

      const users = [...members.map(m => m.user)]
      
      // Add owner if not already included
      if (owner && !users.find(u => u.id === owner.id)) {
        users.unshift(owner)
      }

      return users
    }),
})