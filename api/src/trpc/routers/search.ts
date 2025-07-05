/**
 * Search Router
 * Global search functionality
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { isAuthenticated } from '../middleware'

export const searchRouter = router({
  /**
   * Global search across all entities
   */
  global: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        query: z.string().min(3),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query, limit } = input
      const searchTerm = `%${query}%`

      // Get user's accessible workspaces
      const workspaces = await ctx.prisma.workspace.findMany({
        where: {
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
        select: { id: true },
      })

      const workspaceIds = workspaces.map(w => w.id)

      // Search tasks
      const tasks = await ctx.prisma.task.findMany({
        where: {
          project: { workspaceId: { in: workspaceIds } },
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
          assignee: {
            select: { id: true, name: true, avatar: true },
          },
        },
        take: limit,
      })

      // Search projects
      const projects = await ctx.prisma.project.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        take: limit,
      })

      // Search teams
      const teams = await ctx.prisma.team.findMany({
        where: {
          workspaceId: { in: workspaceIds },
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          _count: {
            select: { members: true },
          },
        },
        take: limit,
      })

      // Search workspaces
      const searchWorkspaces = await ctx.prisma.workspace.findMany({
        where: {
          id: { in: workspaceIds },
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        take: limit,
      })

      return {
        tasks,
        projects,
        teams,
        workspaces: searchWorkspaces,
      }
    }),

  /**
   * Search tasks within a workspace
   */
  tasks: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        query: z.string(),
        workspaceId: z.string(),
        projectId: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        assigneeId: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query, workspaceId, projectId, status, priority, assigneeId, limit } = input

      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new Error('Workspace not found or access denied')
      }

      const tasks = await ctx.prisma.task.findMany({
        where: {
          project: { workspaceId },
          ...(projectId && { projectId }),
          ...(status && { status }),
          ...(priority && { priority }),
          ...(assigneeId && { assigneeId }),
          ...(query && {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          }),
        },
        include: {
          project: true,
          assignee: true,
          kanbanColumn: true,
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      })

      return tasks
    }),

  /**
   * Search users within a workspace
   */
  users: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        query: z.string(),
        workspaceId: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query, workspaceId, limit } = input

      // Verify workspace access
      const workspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          OR: [
            { ownerId: ctx.user.id },
            { members: { some: { userId: ctx.user.id } } },
          ],
        },
      })

      if (!workspace) {
        throw new Error('Workspace not found or access denied')
      }

      // Get workspace members
      const members = await ctx.prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          user: {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
            ],
          },
        },
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
        take: limit,
      })

      return members.map(m => ({
        id: m.userId,
        name: m.user?.name || 'Unknown',
        email: m.user?.email || '',
        avatar: m.user?.avatar || null
      }))
    }),
})