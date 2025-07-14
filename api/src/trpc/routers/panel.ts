import { z } from 'zod'
import { router, protectedProcedure } from '../base'

/**
 * Panel Router - Manages workspace panels for drag-and-drop interface
 * Supports unlimited instances of different panel types
 */

const PANEL_TYPES = ['KANBAN', 'CHAT', 'CALENDAR', 'NOTES', 'EMAIL', 'CONTACTS'] as const

const panelInputSchema = z.object({
  type: z.enum(PANEL_TYPES),
  title: z.string().min(1).max(100),
  workspaceId: z.string(),
  position: z.object({
    x: z.number().int().min(0),
    y: z.number().int().min(0)
  }).optional(),
  size: z.object({
    width: z.number().int().min(2).max(24),
    height: z.number().int().min(2).max(50)
  }).optional(),
  data: z.record(z.any()).optional()
})

const panelUpdateSchema = z.object({
  id: z.string(),
  position_x: z.number().int().min(0).optional(),
  position_y: z.number().int().min(0).optional(),
  width: z.number().int().min(2).max(24).optional(),
  height: z.number().int().min(2).max(50).optional(),
  title: z.string().min(1).max(100).optional(),
  is_minimized: z.boolean().optional(),
  is_locked: z.boolean().optional(),
  data: z.record(z.any()).optional()
})

export const panelRouter = router({
  /**
   * Create a new panel in workspace
   */
  create: protectedProcedure
    .input(panelInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { position, size, data, ...panelData } = input
      
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
        throw new Error('Workspace not found or access denied')
      }

      let panelData_processed = { ...data }

      // Handle creating new resources for different panel types
      if (data?.createNew && panelData.type === 'KANBAN') {
        // Create a new empty Kanban board
        const newKanban = await ctx.prisma.kanban.create({
          data: {
            title: panelData.title,
            description: `Kanban board for ${panelData.title}`,
            workspaceId: input.workspaceId,
            position: 0,
            columns: {
              create: [
                { title: 'To Do', position: 0, color: '#6b7280' },
                { title: 'In Progress', position: 1, color: '#3b82f6' },
                { title: 'Review', position: 2, color: '#f59e0b' },
                { title: 'Done', position: 3, color: '#10b981' }
              ]
            }
          }
        })
        
        panelData_processed = {
          workspaceId: input.workspaceId,
          kanbanId: newKanban.id
        }
      } else if (data?.createNew && panelData.type === 'CHAT') {
        // For chat panels, we'll create empty chat data
        panelData_processed = {
          workspaceId: input.workspaceId,
          chatType: 'workspace',
          messages: []
        }
      } else if (data?.createNew && panelData.type === 'NOTES') {
        // For notes panels, start with empty content
        panelData_processed = {
          workspaceId: input.workspaceId,
          notes: [],
          currentNote: null
        }
      }

      return ctx.prisma.panel.create({
        data: {
          type: panelData.type,
          title: panelData.title,
          workspaceId: panelData.workspaceId,
          position_x: position?.x ?? 0,
          position_y: position?.y ?? 0,
          width: size?.width ?? 6,
          height: size?.height ?? 4,
          data: JSON.stringify(panelData_processed)
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }),

  /**
   * List all panels for a workspace
   */
  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ input, ctx }) => {
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
        throw new Error('Workspace not found or access denied')
      }

      const panels = await ctx.prisma.panel.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: [
          { position_y: 'asc' },
          { position_x: 'asc' },
          { createdAt: 'asc' }
        ]
      })

      // Parse JSON data for each panel
      return panels.map(panel => ({
        ...panel,
        data: JSON.parse(panel.data)
      }))
    }),

  /**
   * Update a single panel
   */
  update: protectedProcedure
    .input(panelUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, data, ...updateData } = input

      // Verify user owns this panel through workspace
      const panel = await ctx.prisma.panel.findFirst({
        where: {
          id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        }
      })

      if (!panel) {
        throw new Error('Panel not found or access denied')
      }

      return ctx.prisma.panel.update({
        where: { id },
        data: {
          ...updateData,
          ...(data && { data: JSON.stringify(data) })
        }
      })
    }),

  /**
   * Bulk update panel positions (for drag-and-drop)
   */
  updatePositions: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      updates: z.array(z.object({
        id: z.string(),
        position_x: z.number().int().min(0),
        position_y: z.number().int().min(0),
        width: z.number().int().min(2).max(24),
        height: z.number().int().min(2).max(50)
      }))
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
        throw new Error('Workspace not found or access denied')
      }

      // Verify all panels belong to this workspace
      const panelIds = input.updates.map(u => u.id)
      const panels = await ctx.prisma.panel.findMany({
        where: {
          id: { in: panelIds },
          workspaceId: input.workspaceId
        }
      })

      if (panels.length !== panelIds.length) {
        throw new Error('Some panels not found in workspace')
      }

      // Bulk update using transaction
      const updatePromises = input.updates.map(update =>
        ctx.prisma.panel.update({
          where: { id: update.id },
          data: {
            position_x: update.position_x,
            position_y: update.position_y,
            width: update.width,
            height: update.height
          }
        })
      )

      return ctx.prisma.$transaction(updatePromises)
    }),

  /**
   * Delete a panel
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this panel through workspace
      const panel = await ctx.prisma.panel.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        }
      })

      if (!panel) {
        throw new Error('Panel not found or access denied')
      }

      return ctx.prisma.panel.delete({
        where: { id: input.id }
      })
    }),

  /**
   * Toggle panel minimized state
   */
  toggleMinimize: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this panel through workspace
      const panel = await ctx.prisma.panel.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        }
      })

      if (!panel) {
        throw new Error('Panel not found or access denied')
      }

      return ctx.prisma.panel.update({
        where: { id: input.id },
        data: { is_minimized: !panel.is_minimized }
      })
    }),

  /**
   * Toggle panel locked state (prevents dragging/resizing)
   */
  toggleLock: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this panel through workspace
      const panel = await ctx.prisma.panel.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        }
      })

      if (!panel) {
        throw new Error('Panel not found or access denied')
      }

      return ctx.prisma.panel.update({
        where: { id: input.id },
        data: { is_locked: !panel.is_locked }
      })
    }),

  /**
   * Toggle panel fullscreen state
   */
  toggleFullscreen: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this panel through workspace
      const panel = await ctx.prisma.panel.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        }
      })

      if (!panel) {
        throw new Error('Panel not found or access denied')
      }

      // Parse current data to check fullscreen state
      const currentData = JSON.parse(panel.data)
      const isCurrentlyFullscreen = currentData.isFullscreen || false

      return ctx.prisma.panel.update({
        where: { id: input.id },
        data: { 
          data: JSON.stringify({
            ...currentData,
            isFullscreen: !isCurrentlyFullscreen,
            // Store original dimensions when entering fullscreen
            ...(isCurrentlyFullscreen ? {} : {
              originalPosition: {
                x: panel.position_x,
                y: panel.position_y,
                width: panel.width,
                height: panel.height
              }
            })
          })
        }
      })
    }),

  /**
   * Set panel focus/active state
   */
  setFocus: protectedProcedure
    .input(z.object({
      id: z.string(),
      focused: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify user owns this panel through workspace
      const panel = await ctx.prisma.panel.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } }
            ]
          }
        }
      })

      if (!panel) {
        throw new Error('Panel not found or access denied')
      }

      const currentData = JSON.parse(panel.data)

      return ctx.prisma.panel.update({
        where: { id: input.id },
        data: { 
          data: JSON.stringify({
            ...currentData,
            isFocused: input.focused,
            lastFocused: input.focused ? new Date().toISOString() : currentData.lastFocused
          })
        }
      })
    }),

  /**
   * Bulk minimize/restore all panels in workspace
   */
  toggleMinimizeAll: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      minimize: z.boolean()
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
        throw new Error('Workspace not found or access denied')
      }

      return ctx.prisma.panel.updateMany({
        where: { workspaceId: input.workspaceId },
        data: { is_minimized: input.minimize }
      })
    }),

  /**
   * Bulk lock/unlock all panels in workspace
   */
  toggleLockAll: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      lock: z.boolean()
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
        throw new Error('Workspace not found or access denied')
      }

      return ctx.prisma.panel.updateMany({
        where: { workspaceId: input.workspaceId },
        data: { is_locked: input.lock }
      })
    }),

  /**
   * Delete all panels in workspace
   */
  deleteAll: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
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
        throw new Error('Workspace not found or access denied')
      }

      return ctx.prisma.panel.deleteMany({
        where: { workspaceId: input.workspaceId }
      })
    }),

  /**
   * Reset all panels fullscreen state (exit all fullscreen)
   */
  exitAllFullscreen: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
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
        throw new Error('Workspace not found or access denied')
      }

      // Get all panels and update their data to remove fullscreen
      const panels = await ctx.prisma.panel.findMany({
        where: { workspaceId: input.workspaceId }
      })

      const updates = panels
        .filter(panel => {
          const currentData = JSON.parse(panel.data)
          return currentData.isFullscreen
        })
        .map(panel => {
          const currentData = JSON.parse(panel.data)
          return ctx.prisma.panel.update({
            where: { id: panel.id },
            data: {
              data: JSON.stringify({
                ...currentData,
                isFullscreen: false
              })
            }
          })
        })

      if (updates.length === 0) {
        return []
      }

      return ctx.prisma.$transaction(updates)
    })
})