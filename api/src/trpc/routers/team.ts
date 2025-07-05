/**
 * Team Router
 * Handles team management operations
 */

import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { prisma } from '../../lib/database'

export const teamRouter = router({
  /**
   * Get all teams for current user's workspaces
   */
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const teams = await prisma.team.findMany({
        where: {
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        },
        include: {
          workspace: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          projects: true,
        },
        orderBy: { createdAt: 'desc' }
      })

      return teams
    }),

  /**
   * Get team by ID
   */
  getById: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const team = await prisma.team.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        },
        include: {
          workspace: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          },
          projects: true,
        }
      })

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found'
        })
      }

      return team
    }),

  /**
   * Create new team
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Team name is required'),
      description: z.string().optional(),
      color: z.string().default('#3B82F6'),
      workspaceId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id, role: { in: ['ADMIN', 'OWNER'] } } } }
          ]
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found or insufficient permissions'
        })
      }

      const team = await prisma.team.create({
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          workspaceId: input.workspaceId,
          members: {
            create: {
              userId: ctx.user.id,
              role: 'owner'
            }
          }
        },
        include: {
          workspace: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          }
        }
      })

      return team
    }),

  /**
   * Update team
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Team name is required').optional(),
      description: z.string().optional(),
      color: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Verify user has permission to update team
      const team = await prisma.team.findFirst({
        where: {
          id,
          OR: [
            { members: { some: { userId: ctx.user.id, role: { in: ['owner', 'admin'] } } } },
            { workspace: { ownerId: ctx.user.id } }
          ]
        }
      })

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found or insufficient permissions'
        })
      }

      const updatedTeam = await prisma.team.update({
        where: { id },
        data: updateData,
        include: {
          workspace: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true
                }
              }
            }
          }
        }
      })

      return updatedTeam
    }),

  /**
   * Delete team
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has permission to delete team
      const team = await prisma.team.findFirst({
        where: {
          id: input.id,
          OR: [
            { members: { some: { userId: ctx.user.id, role: 'owner' } } },
            { workspace: { ownerId: ctx.user.id } }
          ]
        }
      })

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found or insufficient permissions'
        })
      }

      await prisma.team.delete({
        where: { id: input.id }
      })

      return { success: true }
    }),

  /**
   * Add member to team
   */
  addMember: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      userId: z.string(),
      role: z.enum(['member', 'admin']).default('member')
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has permission to add members
      const team = await prisma.team.findFirst({
        where: {
          id: input.teamId,
          OR: [
            { members: { some: { userId: ctx.user.id, role: { in: ['owner', 'admin'] } } } },
            { workspace: { ownerId: ctx.user.id } }
          ]
        }
      })

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found or insufficient permissions'
        })
      }

      const member = await prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: input.userId,
          role: input.role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      })

      return member
    }),

  /**
   * Remove member from team
   */
  removeMember: protectedProcedure
    .input(z.object({
      teamId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has permission to remove members
      const team = await prisma.team.findFirst({
        where: {
          id: input.teamId,
          OR: [
            { members: { some: { userId: ctx.user.id, role: { in: ['owner', 'admin'] } } } },
            { workspace: { ownerId: ctx.user.id } }
          ]
        }
      })

      if (!team) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found or insufficient permissions'
        })
      }

      await prisma.teamMember.delete({
        where: {
          userId_teamId: {
            userId: input.userId,
            teamId: input.teamId
          }
        }
      })

      return { success: true }
    })
})