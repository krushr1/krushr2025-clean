/**
 * Workspace Router
 * Workspace management, members, and settings
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { MemberRole } from '../../types/enums'

export const workspaceRouter = router({
  /**
   * Get all workspaces for the current user
   */
  list: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const workspaces = await ctx.prisma.workspace.findMany({
        where: {
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: {
              projects: true,
              teams: true,
              kanbans: true,
              members: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Add memberCount for frontend compatibility
      return workspaces.map(workspace => ({
        ...workspace,
        memberCount: workspace._count.members + 1, // +1 for owner
      }))
    }),

  /**
   * Get all workspaces (alias for list - for frontend compatibility)
   */
  getAll: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const workspaces = await ctx.prisma.workspace.findMany({
        where: {
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: {
              projects: true,
              teams: true,
              kanbans: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return workspaces
    }),

  /**
   * Get workspace by ID
   */
  get: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.id,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          teams: {
            include: {
              _count: { select: { members: true } },
            },
          },
          projects: {
            include: {
              _count: { select: { tasks: true } },
            },
          },
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      }

      return workspace
    }),

  /**
   * Get workspace by ID (alias for get - frontend compatibility)
   */
  findById: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.id,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true },
              },
            },
          },
          _count: {
            select: {
              projects: true,
              teams: true,
              kanbans: true,
              members: true,
            },
          },
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      }

      // Add memberCount for frontend compatibility
      return {
        ...workspace,
        memberCount: workspace._count.members + 1, // +1 for owner
      }
    }),

  /**
   * Create new workspace
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        name: z.string().min(1, 'Workspace name is required'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.name,
          description: input.description,
          ownerId: ctx.user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return {
        workspace,
        message: 'Workspace created successfully',
      }
    }),

  /**
   * Update workspace
   */
  update: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Workspace name is required').optional(),
        description: z.string().optional(),
        settings: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input

      // Check if user is owner or admin
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id,
          OR: [
            { ownerId: ctx.user.id },
            {
              members: {
                some: {
                  userId: ctx.user.id,
                  role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
                },
              },
            },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this workspace',
        })
      }

      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id },
        data,
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return {
        workspace: updatedWorkspace,
        message: 'Workspace updated successfully',
      }
    }),

  /**
   * Delete workspace
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user is owner
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id, ownerId: ctx.user.id },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only workspace owner can delete the workspace',
        })
      }

      await ctx.prisma.workspace.delete({
        where: { id: input.id },
      })

      return {
        message: 'Workspace deleted successfully',
      }
    }),

  /**
   * Invite user to workspace
   */
  inviteUser: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        email: z.string().email(),
        role: z.nativeEnum(MemberRole).default(MemberRole.MEMBER),
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
                  role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
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
          role: input.role,
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
   * Remove user from workspace
   */
  removeUser: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check permissions
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            {
              members: {
                some: {
                  userId: ctx.user.id,
                  role: { in: [MemberRole.OWNER, MemberRole.ADMIN] },
                },
              },
            },
          ],
        },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to remove users from this workspace',
        })
      }

      // Cannot remove workspace owner
      if (workspace.ownerId === input.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove workspace owner',
        })
      }

      await ctx.prisma.workspaceMember.delete({
        where: {
          userId_workspaceId: {
            userId: input.userId,
            workspaceId: input.workspaceId,
          },
        },
      })

      return {
        message: 'User removed from workspace',
      }
    }),

  /**
   * Update member role
   */
  updateMemberRole: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        workspaceId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(MemberRole),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only owner can update roles
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.workspaceId, ownerId: ctx.user.id },
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only workspace owner can update member roles',
        })
      }

      const updatedMember = await ctx.prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            userId: input.userId,
            workspaceId: input.workspaceId,
          },
        },
        data: { role: input.role },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      return {
        member: updatedMember,
        message: 'Member role updated successfully',
      }
    }),
})