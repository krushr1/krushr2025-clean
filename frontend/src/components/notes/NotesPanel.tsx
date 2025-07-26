import React, { useState, useEffect, useRef } from 'react'
import { useOptimisticDelete } from '@/hooks/use-optimistic-delete'
import { Search, Plus, Trash2, Archive, Star, Palette, ArrowLeft, Edit3 } from 'lucide-react'
import { FloatingInput } from '../ui/floating-input'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'
import { useIsMobile } from '../../hooks/use-mobile'
import { useWorkspaceContextStore } from '../../stores/workspace-context-store'
import { useUIStore } from '../../stores/ui-store'

interface NotesPanelProps {
  workspaceId: string
  className?: string
}

interface Note {
  id: string
  title: string
  content: string
  color?: string | null
  isArchived: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
  folder?: {
    id: string
    name: string
    color: string
  } | null
}

// Note colors - standard pastel post-it colors
const NOTE_COLORS = [
  { name: 'Yellow', value: '#fef3c7', bgValue: '#fffbeb', border: '#f59e0b' },
  { name: 'Pink', value: '#fce7f3', bgValue: '#fdf2f8', border: '#ec4899' },
  { name: 'Blue', value: '#dbeafe', bgValue: '#eff6ff', border: '#3b82f6' },
  { name: 'Green', value: '#d1fae5', bgValue: '#f0fdf4', border: '#10b981' },
  { name: 'Purple', value: '#e9d5ff', bgValue: '#faf5ff', border: '#8b5cf6' },
  { name: 'Orange', value: '#fed7aa', bgValue: '#fff7ed', border: '#f97316' },
  { name: 'Red', value: '#fecaca', bgValue: '#fef2f2', border: '#ef4444' },
  { name: 'None', value: '#ffffff', bgValue: '#ffffff', border: '#e5e7eb' }
]


// Helper function to get note color
const getNoteColor = (note: Note) => {
  // Use individual note color first, then folder color, then default to white
  const noteColor = note.color || note.folder?.color || '#ffffff'
  const colorConfig = NOTE_COLORS.find(c => c.value.toLowerCase() === noteColor.toLowerCase()) || NOTE_COLORS[7]
  
  // Debug logging
  console.log('Note color debug:', {
    noteId: note.id,
    individualColor: note.color,
    folderColor: note.folder?.color,
    finalColor: noteColor,
    colorConfig: colorConfig
  })
  
  return colorConfig
}

// Note Card Component
function NoteCard({ note, isActive, onClick, isFirst, isLast, onArchiveToggle }: {
  note: Note
  isActive: boolean
  onClick: () => void
  isFirst?: boolean
  isLast?: boolean
  onArchiveToggle?: (noteId: string) => void
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const colorConfig = getNoteColor(note)

  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-md p-2 cursor-pointer transition-all duration-200 mb-1",
        isActive
          ? "border border-krushr-primary shadow-md"
          : "border border-krushr-gray-200 hover:border-krushr-primary/50 hover:shadow-sm"
      )}
      style={{
        backgroundColor: isActive ? 'rgba(20, 49, 151, 0.05)' : colorConfig.bgValue,
        borderLeftColor: colorConfig.border,
        borderLeftWidth: '3px',
        borderLeftStyle: 'solid'
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className={cn(
          "font-medium line-clamp-2 flex-1 font-brand",
          isActive ? "text-krushr-primary" : "text-gray-900"
        )}>
          {note.title || 'Untitled'}
        </h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          {note.isPinned && <Star className="w-3 h-3 text-amber-500 fill-current" />}
          {note.isArchived && <Archive className="w-3 h-3 text-krushr-gray-400" />}
        </div>
      </div>
      
      {note.content && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-manrope">
          {note.content}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 font-manrope">
        <span>{formatDate(note.updatedAt)}</span>
        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

// Search Bar Component
function SearchBar({ value, onChange, onCreateNote, isCreating }: {
  value: string
  onChange: (value: string) => void
  onCreateNote: () => void
  isCreating: boolean
}) {
  return (
    <div className="p-3 border-b border-krushr-gray-200 w-full">
      {/* Single row with search and create button */}
      <div className="flex items-center gap-2 w-full">
        <FloatingInput
          label="Search notes"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 h-8 text-sm font-manrope border border-krushr-gray-300 focus:border-krushr-primary focus:ring-2 focus:ring-krushr-primary/20 transition-all duration-200"
          type="search"
        />
        <button
          onClick={onCreateNote}
          disabled={isCreating}
          className="bg-krushr-primary text-white w-8 h-8 rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
          title="Create new note"
        >
          {isCreating ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

// Editor Header Component
function EditorHeader({ title, onTitleChange, onDelete, isSaving, isDeleting, note, onPin, onColorChange, onArchive, onExport, isSingleColumn, onBack }: {
  title: string
  onTitleChange: (title: string) => void
  onDelete: () => void
  isSaving: boolean
  isDeleting: boolean
  note?: Note
  onPin: (noteId: string) => void
  onColorChange: (noteId: string, color: string) => void
  onArchive?: (noteId: string) => void
  onExport?: () => void
  isSingleColumn?: boolean
  onBack?: () => void
}) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  return (
    <div className="p-3 border-b border-krushr-gray-200 bg-white">
      {/* Title input with compact toolbar */}
      <div className="flex items-center gap-2 mb-2">
        {/* Back button for mobile - integrated with title */}
        {isSingleColumn && onBack && (
          <button
            onClick={onBack}
            className="w-6 h-6 flex items-center justify-center text-krushr-gray-600 hover:text-krushr-primary transition-colors flex-shrink-0"
            type="button"
            title="Back to Notes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full h-7 font-medium text-gray-900 font-brand bg-transparent border-0 outline-none placeholder:text-gray-400 focus:bg-krushr-gray-50 rounded px-2 pr-16 transition-colors"
          />
          {/* Status indicator in title input */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs">
            {isSaving ? (
              <>
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-amber-600 font-medium font-manrope">Saving</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-green-600 font-medium font-manrope">Saved</span>
              </>
            )}
          </div>
        </div>
        
        {/* Compact action buttons */}
        <div className="flex items-center gap-1">
          {note && (
            <>
              <button
                onClick={() => onPin(note.id)}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                  note.isPinned ? 'text-amber-500' : 'text-krushr-gray-400 hover:text-amber-500'
                }`}
                title={note.isPinned ? 'Unpin' : 'Pin'}
              >
                <Star className={`w-3 h-3 ${note.isPinned ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => onArchive?.(note.id)}
                className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                  note.isArchived ? 'text-krushr-primary' : 'text-krushr-gray-400 hover:text-krushr-primary'
                }`}
                title={note.isArchived ? 'Unarchive' : 'Archive'}
              >
                <Archive className="w-3 h-3" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-6 h-6 flex items-center justify-center rounded transition-colors text-krushr-gray-400 hover:text-krushr-gray-600"
                  title="Color"
                >
                  <Palette className="w-3 h-3" />
                </button>
                {showColorPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowColorPicker(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 bg-white border border-krushr-gray-200 rounded-lg shadow-xl p-2 z-50">
                      <div 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '4px'
                        }}
                      >
                        {NOTE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => {
                              onColorChange(note.id, color.value)
                              setShowColorPicker(false)
                            }}
                            className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                              getNoteColor(note).value === color.value ? 'border-krushr-primary ring-2 ring-krushr-primary/30' : 'border-krushr-gray-300 hover:border-krushr-primary/50'
                            }`}
                            style={{ backgroundColor: color.bgValue }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-6 h-6 text-krushr-gray-400 hover:text-red-500 rounded flex items-center justify-center transition-colors disabled:opacity-50"
            title="Delete"
          >
            {isDeleting ? (
              <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
      
    </div>
  )
}

// Main Component
const NotesPanel = React.forwardRef<HTMLDivElement, NotesPanelProps>(
  ({ workspaceId, className }, ref) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [isSingleColumn, setIsSingleColumn] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [hiddenNoteIds, setHiddenNoteIds] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const { activeContextType, activeEntityId } = useWorkspaceContextStore()
  const { shouldCreateNote, clearNoteCreation } = useUIStore()

  // tRPC queries
  const notesQuery = trpc.notes.list.useQuery({
    workspaceId,
    search: searchQuery || undefined,
    taskId: activeContextType === 'task' ? activeEntityId : undefined,
  })

  const activeNoteQuery = trpc.notes.get.useQuery(
    { id: activeNoteId! },
    { enabled: !!activeNoteId }
  )

  // Mutations
  const createNote = trpc.notes.create.useMutation({
    onSuccess: (note) => {
      setActiveNoteId(note.id)
      setNoteTitle(note.title)
      setNoteContent(note.content || '')
      notesQuery.refetch()
      toast.success('Note created')
    }
  })

  const updateNote = trpc.notes.update.useMutation({
    onSuccess: () => {
      notesQuery.refetch()
      activeNoteQuery.refetch()
    }
  })

  const deleteNote = trpc.notes.delete.useMutation({
    onSuccess: () => {
      setActiveNoteId(null)
      setNoteTitle('')
      setNoteContent('')
      notesQuery.refetch()
      toast.success('Note deleted')
    }
  })

  const togglePin = trpc.notes.togglePin.useMutation({
    onSuccess: () => {
      notesQuery.refetch()
      activeNoteQuery.refetch()
      toast.success('Note pin status updated')
    },
    onError: (error) => {
      toast.error('Failed to update pin status')
    }
  })

  const toggleArchive = trpc.notes.toggleArchive.useMutation({
    onSuccess: () => {
      notesQuery.refetch()
      activeNoteQuery.refetch()
      toast.success('Note archive status updated')
    },
    onError: (error) => {
      toast.error('Failed to update archive status')
    }
  })

  // Simple client-side export since backend doesn't have export endpoint
  const handleExportNotes = () => {
    try {
      const notesToExport = filteredNotes.filter(note => !note.isArchived)
      let exportContent = '# Notes Export\\n\\n'
      
      notesToExport.forEach(note => {
        exportContent += `## ${note.title}\\n\\n`
        exportContent += `${note.content || 'No content'}\\n\\n`
        exportContent += `*Updated: ${new Date(note.updatedAt).toLocaleDateString()}*\\n\\n`
        exportContent += '---\\n\\n'
      })
      
      const blob = new Blob([exportContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `notes-export-${new Date().toISOString().split('T')[0]}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Notes exported successfully')
    } catch (error) {
      toast.error('Failed to export notes')
    }
  }

  // Note: Individual note colors not supported yet - would need backend changes
  // For now, we'll show the color picker but explain the limitation
  const updateNoteFolder = trpc.notes.update.useMutation({
    onSuccess: () => {
      notesQuery.refetch()
      toast.success('Note folder updated')
    },
    onError: (error) => {
      toast.error('Failed to update note folder')
    }
  })

  // Load active note data
  useEffect(() => {
    if (activeNoteQuery.data) {
      setNoteTitle(activeNoteQuery.data.title)
      setNoteContent(activeNoteQuery.data.content || '')
    }
  }, [activeNoteQuery.data])
  
  // Watch for note creation trigger from command palette
  useEffect(() => {
    if (shouldCreateNote) {
      handleCreateNote()
      clearNoteCreation()
    }
  }, [shouldCreateNote])

  // Responsive layout detection
  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const shouldBeSingleColumn = width < 600 || isMobile
        setIsSingleColumn(shouldBeSingleColumn)
        
        // Auto-show editor on mobile when note is selected
        if (shouldBeSingleColumn && activeNoteId && !showEditor) {
          setShowEditor(true)
        }
        
        // Debug logging
        console.log('Notes panel size check:', { width, shouldBeSingleColumn, isMobile, activeNoteId, showEditor })
      }
    }

    checkSize()
    const resizeObserver = new ResizeObserver(checkSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [activeNoteId, isMobile, showEditor])

  // Auto-save logic
  useEffect(() => {
    if (activeNoteId && (noteTitle || noteContent)) {
      if (saveTimer) clearTimeout(saveTimer)
      
      const timer = setTimeout(() => {
        updateNote.mutate({
          id: activeNoteId,
          title: noteTitle || 'Untitled',
          content: noteContent
        })
      }, 1000)
      
      setSaveTimer(timer)
    }
    
    return () => {
      if (saveTimer) clearTimeout(saveTimer)
    }
  }, [noteTitle, noteContent, activeNoteId])

  const handleCreateNote = () => {
    createNote.mutate({
      title: 'New Note',
      content: '',
      workspaceId,
      tags: []
    })
  }

  const { deleteItem } = useOptimisticDelete()

  const handleDeleteNote = async () => {
    if (!activeNoteId) return
    
    const noteToDelete = notesQuery.data?.notes?.find(n => n.id === activeNoteId)
    if (!noteToDelete) return
    
    await deleteItem({
      type: 'note',
      item: noteToDelete,
      itemName: noteToDelete.title || 'Untitled note',
      deleteAction: async () => {
        await deleteNote.mutateAsync({ id: activeNoteId })
        // Remove from hidden list after successful deletion
        setHiddenNoteIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(activeNoteId)
          return newSet
        })
      },
      onOptimisticRemove: () => {
        // Hide the note immediately
        setHiddenNoteIds(prev => new Set(prev).add(activeNoteId))
        // Clear active note
        const remainingNotes = notesQuery.data?.notes?.filter(n => n.id !== activeNoteId && !hiddenNoteIds.has(n.id))
        setActiveNoteId(remainingNotes?.[0]?.id || null)
      },
      onRestore: () => {
        // Show the note again
        setHiddenNoteIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(noteToDelete.id)
          return newSet
        })
        // Restore as active note
        setActiveNoteId(noteToDelete.id)
      }
    })
  }

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id)
    // Auto-show editor in single column mode
    if (isSingleColumn) {
      setShowEditor(true)
    }
  }

  const handleBackToList = () => {
    setShowEditor(false)
    // Clear active note selection when going back to list
    setActiveNoteId(null)
  }

  const handleTogglePin = (noteId: string) => {
    togglePin.mutate({ id: noteId })
  }

  const handleToggleArchive = (noteId: string) => {
    toggleArchive.mutate({ id: noteId })
  }

  const handleColorChange = (noteId: string, color: string) => {
    // Update note with individual color
    updateNote.mutate({
      id: noteId,
      color: color
    })
    toast.success('Note color updated')
  }

  const filteredNotes = (notesQuery.data?.notes || []).filter(note => 
    !hiddenNoteIds.has(note.id) &&
    (searchQuery ? 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
  )

  return (
    <div ref={containerRef} className={cn("flex h-full bg-krushr-gray-50", className)}>
      {/* Notes List */}
      <div className={cn(
        "bg-white flex flex-col shadow-sm transition-all duration-300",
        isSingleColumn 
          ? (showEditor ? "hidden" : "w-full")
          : "w-80 border-r border-krushr-gray-200"
      )}>
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onCreateNote={handleCreateNote}
          isCreating={createNote.isPending}
        />

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {notesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-krushr-primary"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-krushr-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Search className="w-5 h-5 text-krushr-gray-400" />
              </div>
              <p className="text-gray-900 font-medium font-brand">No notes found</p>
              <p className="text-gray-400 text-sm mt-1 font-manrope">
                {searchQuery ? 'Try different keywords' : 'Create your first note'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isActive={activeNoteId === note.id}
                  onClick={() => handleSelectNote(note)}
                  isFirst={index === 0}
                  isLast={index === filteredNotes.length - 1}
                  onArchiveToggle={handleToggleArchive}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className={cn(
        "flex flex-col transition-all duration-300",
        isSingleColumn 
          ? (showEditor ? "w-full" : "hidden")
          : "flex-1"
      )}>
        {activeNoteId ? (
          <>
            
            {/* Editor Header */}
            <EditorHeader
              title={noteTitle}
              onTitleChange={setNoteTitle}
              onDelete={handleDeleteNote}
              isSaving={updateNote.isPending}
              isDeleting={deleteNote.isPending}
              note={filteredNotes.find(n => n.id === activeNoteId)}
              onPin={handleTogglePin}
              onColorChange={handleColorChange}
              onArchive={handleToggleArchive}
              onExport={handleExportNotes}
              isSingleColumn={isSingleColumn}
              onBack={handleBackToList}
            />

            {/* Editor Content */}
            <div className="flex-1 p-3" style={{ backgroundColor: activeNoteId ? getNoteColor(filteredNotes.find(n => n.id === activeNoteId) || {} as Note).bgValue : '#ffffff' }}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Start writing your note..."
                className={cn(
                  "w-full h-full min-h-[400px] border-0 outline-none resize-none bg-transparent",
                  "font-manrope text-sm text-gray-700 placeholder:text-gray-400"
                )}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-krushr-primary/10 to-krushr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-8 h-8 text-krushr-primary" />
              </div>
              <h3 className={cn(
                "font-medium text-gray-900 mb-2 font-manrope",
                isSingleColumn ? "text-base" : "text-lg"
              )}>Select a note to edit</h3>
              <p className={cn(
                "text-gray-500 leading-relaxed mb-4 font-manrope",
                isSingleColumn ? "text-xs" : "text-sm"
              )}>
                {isSingleColumn 
                  ? "Tap a note to start editing"
                  : "Choose a note from the sidebar to start editing, or create a new note to get started."
                }
              </p>
              {!isSingleColumn && (
                <button
                  onClick={handleCreateNote}
                  disabled={createNote.isPending}
                  className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 disabled:opacity-50 transition-colors"
                  title="Create your first note"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

NotesPanel.displayName = 'NotesPanel'

export default NotesPanel