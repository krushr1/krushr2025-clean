import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { prisma } from '../../lib/prisma'
import { TRPCError } from '@trpc/server'

const layoutDataSchema = z.object({
  panels: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    is_minimized: z.boolean(),
    is_locked: z.boolean(),
    data: z.record(z.any())
  })),
  gridLayout: z.object({
    lg: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      minW: z.number().optional(),
      minH: z.number().optional(),
      maxW: z.number().optional(),
      maxH: z.number().optional(),
      isDraggable: z.boolean().optional(),
      isResizable: z.boolean().optional()
    })),
    md: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      minW: z.number().optional(),
      minH: z.number().optional(),
      maxW: z.number().optional(),
      maxH: z.number().optional(),
      isDraggable: z.boolean().optional(),
      isResizable: z.boolean().optional()
    })).optional(),
    sm: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      minW: z.number().optional(),
      minH: z.number().optional(),
      maxW: z.number().optional(),
      maxH: z.number().optional(),
      isDraggable: z.boolean().optional(),
      isResizable: z.boolean().optional()
    })).optional(),
    xs: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      minW: z.number().optional(),
      minH: z.number().optional(),
      maxW: z.number().optional(),
      maxH: z.number().optional(),
      isDraggable: z.boolean().optional(),
      isResizable: z.boolean().optional()
    })).optional(),
    xxs: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
      minW: z.number().optional(),
      minH: z.number().optional(),
      maxW: z.number().optional(),
      maxH: z.number().optional(),
      isDraggable: z.boolean().optional(),
      isResizable: z.boolean().optional()
    })).optional()
  })
})

export const layoutRouter = router({
  // Save current workspace layout as a preset
  savePreset: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      isDefault: z.boolean().default(false),
      layoutData: layoutDataSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      // If setting as default, unset other defaults first
      if (input.isDefault) {
        await prisma.workspaceLayoutPreset.updateMany({
          where: {
            workspaceId: input.workspaceId,
            isDefault: true
          },
          data: {
            isDefault: false
          }
        })
      }

      // Create the preset
      const preset = await prisma.workspaceLayoutPreset.create({
        data: {
          name: input.name,
          description: input.description,
          isDefault: input.isDefault,
          layoutData: JSON.stringify(input.layoutData),
          workspaceId: input.workspaceId
        }
      })

      return preset
    }),

  // Load a layout preset
  loadPreset: protectedProcedure
    .input(z.object({
      presetId: z.string(),
      workspaceId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      // Get the preset
      const preset = await prisma.workspaceLayoutPreset.findFirst({
        where: {
          id: input.presetId,
          workspaceId: input.workspaceId
        }
      })

      if (!preset) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Layout preset not found'
        })
      }

      const layoutData = JSON.parse(preset.layoutData)

      // Clear existing panels in workspace
      await prisma.panel.deleteMany({
        where: { workspaceId: input.workspaceId }
      })

      // Recreate panels from preset
      const panelsToCreate = layoutData.panels.map((panel: any) => ({
        id: panel.id,
        type: panel.type,
        title: panel.title,
        position_x: panel.position_x,
        position_y: panel.position_y,
        width: panel.width,
        height: panel.height,
        is_minimized: panel.is_minimized,
        is_locked: panel.is_locked,
        data: JSON.stringify(panel.data),
        workspaceId: input.workspaceId
      }))

      await prisma.panel.createMany({
        data: panelsToCreate
      })

      return {
        success: true,
        message: `Layout "${preset.name}" loaded successfully`
      }
    }),

  // Get current workspace layout
  getCurrentLayout: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      // Get all panels in workspace
      const panels = await prisma.panel.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: [
          { position_y: 'asc' },
          { position_x: 'asc' }
        ]
      })

      // Convert to layout format
      const panelsData = panels.map(panel => ({
        id: panel.id,
        type: panel.type,
        title: panel.title,
        position_x: panel.position_x,
        position_y: panel.position_y,
        width: panel.width,
        height: panel.height,
        is_minimized: panel.is_minimized,
        is_locked: panel.is_locked,
        data: typeof panel.data === 'string' ? JSON.parse(panel.data) : panel.data
      }))

      // Generate grid layout
      const gridLayout = {
        lg: panelsData.map(panel => ({
          i: panel.id,
          x: panel.position_x,
          y: panel.position_y,
          w: panel.width,
          h: panel.height,
          minW: 2,
          minH: 1,
          maxW: 12,
          maxH: 12,
          isDraggable: !panel.is_locked,
          isResizable: !panel.is_locked
        }))
      }

      return {
        panels: panelsData,
        gridLayout
      }
    }),

  // List all layout presets for workspace
  listPresets: protectedProcedure
    .input(z.object({
      workspaceId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      const presets = await prisma.workspaceLayoutPreset.findMany({
        where: { workspaceId: input.workspaceId },
        orderBy: [
          { isDefault: 'desc' },
          { updatedAt: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          description: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return presets
    }),

  // Delete a layout preset
  deletePreset: protectedProcedure
    .input(z.object({
      presetId: z.string(),
      workspaceId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      // Delete the preset
      const deletedPreset = await prisma.workspaceLayoutPreset.deleteMany({
        where: {
          id: input.presetId,
          workspaceId: input.workspaceId
        }
      })

      if (deletedPreset.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Layout preset not found'
        })
      }

      return {
        success: true,
        message: 'Layout preset deleted successfully'
      }
    }),

  // Set default preset
  setDefaultPreset: protectedProcedure
    .input(z.object({
      presetId: z.string(),
      workspaceId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      // Unset all current defaults
      await prisma.workspaceLayoutPreset.updateMany({
        where: {
          workspaceId: input.workspaceId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })

      // Set new default
      const updated = await prisma.workspaceLayoutPreset.updateMany({
        where: {
          id: input.presetId,
          workspaceId: input.workspaceId
        },
        data: {
          isDefault: true
        }
      })

      if (updated.count === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Layout preset not found'
        })
      }

      return {
        success: true,
        message: 'Default layout preset updated'
      }
    }),

  // Auto-save current layout (called periodically)
  autoSave: protectedProcedure
    .input(z.object({
      workspaceId: z.string(),
      layoutData: layoutDataSchema
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify workspace access
      const workspace = await prisma.workspace.findFirst({
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
          message: 'Workspace not found or access denied'
        })
      }

      // Find or create auto-save preset
      const autoSavePreset = await prisma.workspaceLayoutPreset.findFirst({
        where: {
          workspaceId: input.workspaceId,
          name: '__AUTO_SAVE__'
        }
      })

      if (autoSavePreset) {
        // Update existing auto-save
        await prisma.workspaceLayoutPreset.update({
          where: { id: autoSavePreset.id },
          data: {
            layoutData: JSON.stringify(input.layoutData),
            updatedAt: new Date()
          }
        })
      } else {
        // Create new auto-save
        await prisma.workspaceLayoutPreset.create({
          data: {
            name: '__AUTO_SAVE__',
            description: 'Automatically saved layout',
            isDefault: false,
            layoutData: JSON.stringify(input.layoutData),
            workspaceId: input.workspaceId
          }
        })
      }

      return {
        success: true,
        message: 'Layout auto-saved'
      }
    })
})