import React, { useState, useEffect } from 'react'
import { Search, Plus, Trash2, Archive, Star, Palette } from 'lucide-react'
import { FloatingInput } from '../ui/floating-input'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'

interface SimpleNotesPanelProps {
  workspaceId: string
  className?: string
}

interface Note {
  id: string
  title: string
  content: string
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
  // For now, use folder color if available, otherwise default to white
  const folderColor = note.folder?.color || '#ffffff'
  return NOTE_COLORS.find(c => c.value.toLowerCase() === folderColor.toLowerCase()) || NOTE_COLORS[7]
}

// Note Card Component
function NoteCard({ note, isActive, onClick, isFirst, isLast }: {
  note: Note
  isActive: boolean
  onClick: () => void
  isFirst?: boolean
  isLast?: boolean
}) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const colorConfig = getNoteColor(note)

  return (
    <div
      onClick={onClick}
      className={`group p-3 cursor-pointer transition-all duration-200 relative ${
        isActive
          ? 'ring-2 ring-krushr-primary ring-inset'
          : 'hover:bg-white/50'
      } ${
        !isLast ? 'border-b border-gray-200' : ''
      }`}
      style={{
        backgroundColor: isActive ? 'rgba(20, 49, 151, 0.08)' : colorConfig.bgValue,
        borderLeftColor: colorConfig.border,
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && (
            <Star className="w-3 h-3 text-amber-500 fill-current flex-shrink-0" />
          )}
          <h3 className={`font-medium text-gray-900 truncate flex-1 font-manrope ${
            isActive ? 'text-krushr-primary' : 'group-hover:text-krushr-primary'
          }`}>
            {note.title || 'Untitled Note'}
          </h3>
        </div>
        {note.isArchived && (
          <Archive className="w-3 h-3 text-gray-400 flex-shrink-0" />
        )}
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed font-manrope">
        {note.content?.substring(0, 120) || 'No content'}
        {note.content && note.content.length > 120 && '...'}
      </p>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 font-manrope">
          {formatDate(note.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          {note.content && (
            <span className="text-gray-400 font-manrope">
              {note.content.split(' ').length} words
            </span>
          )}
        </div>
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
    <div className="p-2 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2 mx-1">
        <FloatingInput
          label="Search notes"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-10 min-h-[40px] text-sm focus:ring-2 focus:ring-blue-500 font-manrope"
          type="search"
        />
        <button
          onClick={onCreateNote}
          disabled={isCreating}
          className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors disabled:opacity-50"
          title="Create new note"
        >
          {isCreating ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

// Editor Header Component
function EditorHeader({ title, onTitleChange, onDelete, isSaving, isDeleting, note, onPin, onColorChange }: {
  title: string
  onTitleChange: (title: string) => void
  onDelete: () => void
  isSaving: boolean
  isDeleting: boolean
  note?: Note
  onPin: (noteId: string) => void
  onColorChange: (noteId: string, color: string) => void
}) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  return (
    <div className="p-3 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <FloatingInput
          label="Note title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="flex-1 h-10 min-h-[40px] text-sm font-manrope mr-3"
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-amber-600 font-medium font-manrope">Saving...</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-600 font-medium font-manrope">Saved</span>
              </>
            )}
          </div>
          
          {note && (
            <>
              <button
                onClick={() => onPin(note.id)}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                  note.isPinned ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                }`}
                title={note.isPinned ? 'Unpin note' : 'Pin note'}
              >
                <Star className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  title="Change color"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowColorPicker(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 min-w-max">
                      <div className="grid grid-cols-4 gap-2">
                        {NOTE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => {
                              onColorChange(note.id, color.value)
                              setShowColorPicker(false)
                            }}
                            className={`w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform ${
                              getNoteColor(note).value === color.value ? 'border-gray-800 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-500'
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
            className="w-8 h-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
            title="Delete note"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
const SimpleNotesPanel = React.forwardRef<HTMLDivElement, SimpleNotesPanelProps>(
  ({ workspaceId, className }, ref) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // tRPC queries
  const notesQuery = trpc.notes.list.useQuery({
    workspaceId,
    search: searchQuery || undefined
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
      toast.success('Note pin status updated')
    },
    onError: (error) => {
      toast.error('Failed to update pin status')
    }
  })

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

  const handleDeleteNote = () => {
    if (activeNoteId && confirm('Delete this note?')) {
      deleteNote.mutate({ id: activeNoteId })
    }
  }

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id)
  }

  const handleTogglePin = (noteId: string) => {
    togglePin.mutate({ id: noteId })
  }

  const handleColorChange = (noteId: string, color: string) => {
    // For now, show a message that individual note colors aren't supported yet
    toast.info('Individual note colors require backend support. Notes currently use folder colors.')
    // TODO: Once backend supports note colors, use:
    // updateNoteColor.mutate({ id: noteId, color })
  }

  const filteredNotes = notesQuery.data?.notes || []

  return (
    <div ref={ref} className={`flex h-full bg-krushr-gray-50 ${className || ''}`}>
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium font-manrope">No notes found</p>
              <p className="text-gray-400 text-sm mt-1 font-manrope">
                {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {filteredNotes.map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isActive={activeNoteId === note.id}
                    onClick={() => handleSelectNote(note)}
                    isFirst={index === 0}
                    isLast={index === filteredNotes.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
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
            />

            {/* Editor Content */}
            <div className="flex-1" style={{ backgroundColor: activeNoteId ? getNoteColor(filteredNotes.find(n => n.id === activeNoteId) || {} as Note).bgValue : '#ffffff' }}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Start writing your note..."
                className="w-full h-full resize-none border-0 outline-none text-gray-700 leading-relaxed p-3 text-sm font-manrope placeholder:font-manrope"
                autoFocus
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-krushr-primary/10 to-krushr-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-krushr-primary" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-manrope">Select a note to edit</h3>
              <p className="text-gray-500 leading-relaxed mb-4 text-sm font-manrope">
                Choose a note from the sidebar to start editing, or create a new note to get started.
              </p>
              <button
                onClick={handleCreateNote}
                disabled={createNote.isPending}
                className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 disabled:opacity-50 transition-colors"
                title="Create your first note"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

SimpleNotesPanel.displayName = 'SimpleNotesPanel'

export default SimpleNotesPanel