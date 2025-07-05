/**
 * Notes Router
 * Complete CRUD operations for notes with organization and search
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, protectedProcedure } from '../trpc'

export const notesRouter = router({
  /**
   * List notes with filtering and pagination
   */
  list: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        folderId: z.string().optional(),
        isPinned: z.boolean().optional(),
        isArchived: z.boolean().optional(),
        search: z.string().optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { workspaceId, folderId, isPinned, isArchived, search, tags, limit, cursor } = input

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
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      // Build where clause
      const where: any = {
        workspaceId,
        ...(folderId !== undefined && { folderId }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isArchived !== undefined && { isArchived }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        }),
        ...(tags && tags.length > 0 && {
          tags: {
            some: {
              name: { in: tags },
            },
          },
        }),
      }

      const notes = await ctx.prisma.note.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
      })

      let nextCursor: string | undefined = undefined
      if (notes.length > limit) {
        const nextItem = notes.pop()
        nextCursor = nextItem!.id
      }

      return {
        notes,
        nextCursor,
      }
    }),

  /**
   * Get single note by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const note = await ctx.prisma.note.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
      })

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found or access denied',
        })
      }

      return note
    }),

  /**
   * Create new note
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title is required'),
        content: z.string().default(''),
        folderId: z.string().optional(),
        workspaceId: z.string(),
        tags: z.array(z.string()).default([]),
        isPinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, content, folderId, workspaceId, tags, isPinned } = input

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
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      // Verify folder access if specified
      if (folderId) {
        const folder = await ctx.prisma.noteFolder.findFirst({
          where: {
            id: folderId,
            workspaceId,
          },
        })

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found in this workspace',
          })
        }
      }

      // Create note with tags
      const note = await ctx.prisma.note.create({
        data: {
          title,
          content,
          folderId,
          authorId: ctx.user.id,
          workspaceId,
          isPinned,
          tags: {
            create: tags.map((tag) => ({ name: tag })),
          },
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
      })

      return note
    }),

  /**
   * Update note
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Title is required').optional(),
        content: z.string().optional(),
        color: z.string().optional(),
        folderId: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
        isPinned: z.boolean().optional(),
        isArchived: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, title, content, color, folderId, tags, isPinned, isArchived } = input

      // Verify note access
      const existingNote = await ctx.prisma.note.findFirst({
        where: {
          id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
        include: { tags: true },
      })

      if (!existingNote) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found or access denied',
        })
      }

      // Verify folder access if specified
      if (folderId) {
        const folder = await ctx.prisma.noteFolder.findFirst({
          where: {
            id: folderId,
            workspaceId: existingNote.workspaceId,
          },
        })

        if (!folder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Folder not found in this workspace',
          })
        }
      }

      // Update tags if provided
      if (tags !== undefined) {
        // Delete existing tags
        await ctx.prisma.noteTag.deleteMany({
          where: { noteId: id },
        })

        // Create new tags
        if (tags.length > 0) {
          await ctx.prisma.noteTag.createMany({
            data: tags.map((tag) => ({ name: tag, noteId: id })),
          })
        }
      }

      // Update note
      const updatedNote = await ctx.prisma.note.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(content !== undefined && { content }),
          ...(color !== undefined && { color }),
          ...(folderId !== undefined && { folderId }),
          ...(isPinned !== undefined && { isPinned }),
          ...(isArchived !== undefined && { isArchived }),
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
      })

      return updatedNote
    }),

  /**
   * Delete note
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify note access
      const note = await ctx.prisma.note.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found or access denied',
        })
      }

      await ctx.prisma.note.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Toggle pin status
   */
  togglePin: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.prisma.note.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found or access denied',
        })
      }

      const updatedNote = await ctx.prisma.note.update({
        where: { id: input.id },
        data: { isPinned: !note.isPinned },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
      })

      return updatedNote
    }),

  /**
   * Toggle archive status
   */
  toggleArchive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.prisma.note.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!note) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Note not found or access denied',
        })
      }

      const updatedNote = await ctx.prisma.note.update({
        where: { id: input.id },
        data: { isArchived: !note.isArchived },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
      })

      return updatedNote
    }),

  /**
   * Get all available tags in workspace
   */
  getTags: protectedProcedure
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
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      const tags = await ctx.prisma.noteTag.findMany({
        where: {
          note: {
            workspaceId: input.workspaceId,
          },
        },
        select: {
          name: true,
        },
        distinct: ['name'],
        orderBy: {
          name: 'asc',
        },
      })

      return tags.map((tag) => tag.name)
    }),

  /**
   * Get folders hierarchy
   */
  getFolders: protectedProcedure
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
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      const folders = await ctx.prisma.noteFolder.findMany({
        where: {
          workspaceId: input.workspaceId,
        },
        include: {
          children: true,
          _count: {
            select: {
              notes: true,
            },
          },
        },
        orderBy: [
          { position: 'asc' },
          { name: 'asc' },
        ],
      })

      return folders
    }),

  /**
   * Create folder
   */
  createFolder: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Folder name is required'),
        description: z.string().optional(),
        color: z.string().default('#6B7280'),
        parentId: z.string().optional(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, description, color, parentId, workspaceId } = input

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
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      // Verify parent folder if specified
      if (parentId) {
        const parentFolder = await ctx.prisma.noteFolder.findFirst({
          where: {
            id: parentId,
            workspaceId,
          },
        })

        if (!parentFolder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent folder not found in this workspace',
          })
        }
      }

      const folder = await ctx.prisma.noteFolder.create({
        data: {
          name,
          description,
          color,
          parentId,
          workspaceId,
        },
        include: {
          children: true,
          _count: {
            select: {
              notes: true,
            },
          },
        },
      })

      return folder
    }),

  /**
   * Update folder
   */
  updateFolder: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Folder name is required').optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        parentId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, description, color, parentId } = input

      // Verify folder access
      const existingFolder = await ctx.prisma.noteFolder.findFirst({
        where: {
          id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (!existingFolder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or access denied',
        })
      }

      // Verify parent folder if specified
      if (parentId) {
        const parentFolder = await ctx.prisma.noteFolder.findFirst({
          where: {
            id: parentId,
            workspaceId: existingFolder.workspaceId,
          },
        })

        if (!parentFolder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent folder not found in this workspace',
          })
        }

        // Prevent circular references
        if (parentId === id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Folder cannot be its own parent',
          })
        }
      }

      const updatedFolder = await ctx.prisma.noteFolder.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(color !== undefined && { color }),
          ...(parentId !== undefined && { parentId }),
        },
        include: {
          children: true,
          _count: {
            select: {
              notes: true,
            },
          },
        },
      })

      return updatedFolder
    }),

  /**
   * Delete folder
   */
  deleteFolder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify folder access
      const folder = await ctx.prisma.noteFolder.findFirst({
        where: {
          id: input.id,
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
        include: {
          notes: true,
          children: true,
        },
      })

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or access denied',
        })
      }

      // Check if folder has notes or subfolders
      if (folder.notes.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete folder that contains notes',
        })
      }

      if (folder.children.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete folder that contains subfolders',
        })
      }

      await ctx.prisma.noteFolder.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  /**
   * Search notes
   */
  search: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        query: z.string().min(1, 'Search query is required'),
        tags: z.array(z.string()).optional(),
        folderId: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { workspaceId, query, tags, folderId, dateFrom, dateTo, limit } = input

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
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this workspace',
        })
      }

      const where: any = {
        workspaceId,
        isArchived: false,
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
        ...(tags && tags.length > 0 && {
          tags: {
            some: {
              name: { in: tags },
            },
          },
        }),
        ...(folderId && { folderId }),
        ...(dateFrom && {
          createdAt: {
            gte: dateFrom,
          },
        }),
        ...(dateTo && {
          createdAt: {
            lte: dateTo,
          },
        }),
      }

      const notes = await ctx.prisma.note.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          folder: {
            select: { id: true, name: true, color: true },
          },
          tags: true,
          attachments: true,
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: limit,
      })

      return notes
    }),

  /**
   * Bulk archive/unarchive notes
   */
  bulkArchive: protectedProcedure
    .input(z.object({ 
      noteIds: z.array(z.string()),
      archive: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify all notes belong to user's workspaces
      const notes = await ctx.prisma.note.findMany({
        where: {
          id: { in: input.noteIds },
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (notes.length !== input.noteIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some notes not found or access denied',
        })
      }

      await ctx.prisma.note.updateMany({
        where: { id: { in: input.noteIds } },
        data: { isArchived: input.archive },
      })

      return notes.length
    }),

  /**
   * Bulk delete notes
   */
  bulkDelete: protectedProcedure
    .input(z.object({ noteIds: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      // Verify all notes belong to user's workspaces
      const notes = await ctx.prisma.note.findMany({
        where: {
          id: { in: input.noteIds },
          workspace: {
            OR: [
              { ownerId: ctx.user.id },
              { members: { some: { userId: ctx.user.id } } },
            ],
          },
        },
      })

      if (notes.length !== input.noteIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Some notes not found or access denied',
        })
      }

      await ctx.prisma.note.deleteMany({
        where: { id: { in: input.noteIds } },
      })

      return notes.length
    }),
})