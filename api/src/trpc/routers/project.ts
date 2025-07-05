/**
 * Project Router
 * Handles project management operations
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'
import { TRPCError } from '@trpc/server'

export const projectRouter = router({
  /**
   * Get all projects for current user
   */
  getAll: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }) => {
      const projects = await ctx.prisma.project.findMany({
        where: {
          OR: [
            { workspace: { ownerId: ctx.user.id } },
            { workspace: { members: { some: { userId: ctx.user.id } } } },
            { team: { members: { some: { userId: ctx.user.id } } } }
          ]
        },
        include: {
          workspace: true,
          team: {
            include: {
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
          },
          kanbans: true,
          tasks: {
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return projects
    }),

  /**
   * List projects by workspace
   */
  list: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } }
          ]
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace'
        })
      }

      const projects = await ctx.prisma.project.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          team: {
            select: { id: true, name: true }
          },
          _count: {
            select: { tasks: true, kanbans: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return projects
    }),

  /**
   * Get project by ID
   */
  getById: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      id: z.string()
    }))
    .query(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          OR: [
            { workspace: { ownerId: ctx.user.id } },
            { workspace: { members: { some: { userId: ctx.user.id } } } },
            { team: { members: { some: { userId: ctx.user.id } } } }
          ]
        },
        include: {
          workspace: true,
          team: {
            include: {
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
          },
          kanbans: {
            include: {
              columns: {
                include: {
                  tasks: true
                }
              }
            }
          },
          tasks: true
        }
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        })
      }

      return project
    }),

  /**
   * Create new project
   */
  create: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      name: z.string().min(1, 'Project name is required'),
      description: z.string().optional(),
      status: z.string().default('ACTIVE'),
      workspaceId: z.string(),
      teamId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has access to workspace
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } }
          ]
        }
      })

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found or insufficient permissions'
        })
      }

      // If teamId provided, verify access
      if (input.teamId) {
        const team = await ctx.prisma.team.findFirst({
          where: {
            id: input.teamId,
            workspaceId: input.workspaceId,
            members: { some: { userId: ctx.user.id } }
          }
        })

        if (!team) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found or insufficient permissions'
          })
        }
      }

      const project = await ctx.prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          status: input.status,
          workspaceId: input.workspaceId,
          teamId: input.teamId,
          startDate: input.startDate,
          endDate: input.endDate
        },
        include: {
          workspace: true,
          team: {
            include: {
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
          }
        }
      })

      return project
    }),

  /**
   * Update project
   */
  update: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, 'Project name is required').optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      teamId: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Verify user has permission to update project
      const project = await ctx.prisma.project.findFirst({
        where: {
          id,
          OR: [
            { workspace: { ownerId: ctx.user.id } },
            { workspace: { members: { some: { userId: ctx.user.id, role: { in: ['ADMIN', 'OWNER'] } } } } },
            { team: { members: { some: { userId: ctx.user.id, role: { in: ['owner', 'admin'] } } } } }
          ]
        }
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or insufficient permissions'
        })
      }

      const updatedProject = await ctx.prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          workspace: true,
          team: {
            include: {
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
          }
        }
      })

      return updatedProject
    }),

  /**
   * Delete project
   */
  delete: publicProcedure
    .use(isAuthenticated)
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user has permission to delete project
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          OR: [
            { workspace: { ownerId: ctx.user.id } },
            { workspace: { members: { some: { userId: ctx.user.id, role: { in: ['ADMIN', 'OWNER'] } } } } },
            { team: { members: { some: { userId: ctx.user.id, role: 'owner' } } } }
          ]
        }
      })

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found or insufficient permissions'
        })
      }

      await ctx.prisma.project.delete({
        where: { id: input.id }
      })

      return { success: true }
    })
})