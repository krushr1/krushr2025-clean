import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { ComponentErrorBoundary } from '../ErrorBoundary'
import { 
  Plus,
  Search,
  Star,
  Edit3,
  Save,
  Trash2,
  Archive,
  Filter,
  Pin,
  Palette,
  X,
  ArrowLeft
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'

interface NotesPanelProps {
  workspaceId: string
  className?: string
}

interface Note {
  id: string
  title: string
  content: string | null
  isPinned: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  tags: Array<{ id: string; name: string; color?: string }>
}

const noteColors = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-900' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-900' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-900' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-900' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900' },
  { name: 'orange', bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-900' },
]

const NotesPanel = React.forwardRef<HTMLDivElement, NotesPanelProps>(({ workspaceId, className }, ref) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'recent'>('all')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'editor'>('grid')
  const [noteColors, setNoteColors] = useState<Record<string, string>>({})

  // Editor State
  const [editorState, setEditorState] = useState({
    title: '',
    content: '',
    noteId: null as string | null,
    color: 'yellow',
    isModified: false
  })

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
  const containerRef = useRef<HTMLDivElement>(null)

  // Merge refs
  const mergedRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }, [ref])

  // tRPC
  const utils = trpc.useUtils()
  
  const { data: notesData, isLoading: notesLoading } = trpc.notes.list.useQuery({
    workspaceId,
    search: debouncedSearchTerm || undefined,
    isArchived: showArchived
  })

  const { data: selectedNoteData } = trpc.notes.get.useQuery(
    { id: selectedNoteId! },
    { enabled: !!selectedNoteId }
  )

  const createNoteMutation = trpc.notes.create.useMutation({
    onSuccess: (newNote) => {
      utils.notes.list.invalidate({ workspaceId })
      setSelectedNoteId(newNote.id)
      setEditorState({
        title: newNote.title,
        content: newNote.content || '',
        noteId: newNote.id,
        color: 'yellow',
        isModified: false
      })
      setViewMode('editor')
      toast.success('Note created')
    }
  })

  const updateNoteMutation = trpc.notes.update.useMutation({
    onSuccess: (updatedNote) => {
      utils.notes.list.invalidate({ workspaceId })
      setEditorState(prev => ({
        ...prev,
        isModified: false
      }))
      toast.success('Note saved')
    }
  })

  const deleteNoteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate({ workspaceId })
      setSelectedNoteId(null)
      setViewMode('grid')
      setEditorState({
        title: '',
        content: '',
        noteId: null,
        color: 'yellow',
        isModified: false
      })
      toast.success('Note deleted')
    }
  })

  const togglePinMutation = trpc.notes.togglePin.useMutation({
    onSuccess: () => {
      utils.notes.list.invalidate({ workspaceId })
    }
  })

  // Load note into editor when selected
  useEffect(() => {
    if (selectedNoteData && selectedNoteData.id !== editorState.noteId) {
      setEditorState({
        title: selectedNoteData.title,
        content: selectedNoteData.content || '',
        noteId: selectedNoteData.id,
        color: noteColors[selectedNoteData.id] || 'yellow',
        isModified: false
      })
    }
  }, [selectedNoteData?.id])

  // Auto-save with debounce
  const debouncedTitle = useDebouncedValue(editorState.title, 1000)
  const debouncedContent = useDebouncedValue(editorState.content, 1000)

  useEffect(() => {
    if (editorState.noteId && editorState.isModified && debouncedTitle && debouncedContent !== undefined) {
      updateNoteMutation.mutate({
        id: editorState.noteId,
        title: debouncedTitle,
        content: debouncedContent
      })
    }
  }, [debouncedTitle, debouncedContent])

  // Handlers
  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId)
    setViewMode('editor')
  }

  const handleCreateNote = async () => {
    createNoteMutation.mutate({
      workspaceId,
      title: 'New Note',
      content: ''
    })
  }

  const handleBackToGrid = () => {
    setViewMode('grid')
    setSelectedNoteId(null)
  }

  const handleDeleteNote = () => {
    if (editorState.noteId) {
      deleteNoteMutation.mutate({ id: editorState.noteId })
    }
  }

  const handleTitleChange = (value: string) => {
    setEditorState(prev => ({
      ...prev,
      title: value,
      isModified: true
    }))
  }

  const handleContentChange = (value: string) => {
    setEditorState(prev => ({
      ...prev,
      content: value,
      isModified: true
    }))
  }

  const handleColorChange = (color: string) => {
    setEditorState(prev => ({ ...prev, color }))
    if (editorState.noteId) {
      setNoteColors(prev => ({ ...prev, [editorState.noteId!]: color }))
    }
  }

  const handleTogglePin = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    togglePinMutation.mutate({ id: noteId })
  }

  // Filter notes
  const filteredNotes = notesData?.notes?.filter(note => {
    if (filterMode === 'pinned') return note.isPinned
    if (filterMode === 'recent') {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return new Date(note.updatedAt) > dayAgo
    }
    return true
  }) || []

  // Get note color
  const getNoteColor = (noteId: string) => {
    const colorName = noteColors[noteId] || 'yellow'
    return noteColors.find(c => c.name === colorName) || noteColors[0]
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  // Grid View Component
  const GridView = () => (
    <div className="flex flex-col h-full bg-krushr-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b border-krushr-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-krushr-gray-900 font-brand">Notes</h1>
            <p className="text-sm text-krushr-gray-600 mt-1">Capture your thoughts and ideas</p>
          </div>
          <Button
            onClick={handleCreateNote}
            className="bg-krushr-primary hover:bg-krushr-primary-700 shadow-md"
            disabled={createNoteMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-krushr-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-krushr-gray-200 rounded-lg focus:ring-2 focus:ring-krushr-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {(['all', 'pinned', 'recent'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  filterMode === mode
                    ? "bg-krushr-primary text-white shadow-sm"
                    : "bg-white text-krushr-gray-600 hover:bg-krushr-gray-100 border border-krushr-gray-200"
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <ScrollArea className="flex-1 p-6">
        {notesLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-krushr-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-krushr-gray-500">Loading notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Edit3 className="w-16 h-16 text-krushr-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-krushr-gray-700 mb-2">
                {searchTerm ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-krushr-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first note to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateNote} className="bg-krushr-primary hover:bg-krushr-primary-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => {
              const color = getNoteColor(note.id)
              return (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note.id)}
                  className={cn(
                    "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform",
                    color.bg,
                    color.border,
                    "hover:border-krushr-primary group"
                  )}
                  style={{ minHeight: '200px' }}
                >
                  {/* Pin Button */}
                  <button
                    onClick={(e) => handleTogglePin(note.id, e)}
                    className={cn(
                      "absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all",
                      note.isPinned 
                        ? "bg-krushr-warning text-white shadow-md" 
                        : "bg-white/80 text-krushr-gray-400 hover:text-krushr-warning hover:bg-white opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
                  </button>

                  {/* Content */}
                  <div className="flex flex-col h-full">
                    <h3 className={cn(
                      "font-semibold text-lg mb-3 line-clamp-2 font-brand",
                      color.text
                    )}>
                      {note.title}
                    </h3>
                    
                    <div className={cn(
                      "flex-1 text-sm leading-relaxed line-clamp-4 mb-3",
                      color.text,
                      "opacity-80"
                    )}>
                      {note.content?.replace(/<[^>]*>/g, '').slice(0, 150) || 
                       <span className="italic opacity-60">No content</span>
                      }
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className={cn("text-xs font-medium", color.text, "opacity-60")}>
                        {formatDate(note.updatedAt)}
                      </span>
                      {note.tags.length > 0 && (
                        <div className={cn("text-xs", color.text, "opacity-60")}>
                          {note.tags.length} tags
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )

  // Editor View Component
  const EditorView = () => {
    const color = noteColors.find(c => c.name === editorState.color) || noteColors[0]
    
    return (
      <div className={cn("flex flex-col h-full", color.bg)}>
        {/* Header */}
        <div className="p-4 bg-white border-b border-krushr-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBackToGrid}
                variant="outline"
                size="sm"
                className="border-krushr-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {/* Color Picker */}
              <div className="flex items-center gap-2 ml-4">
                {noteColors.map((noteColor) => (
                  <button
                    key={noteColor.name}
                    onClick={() => handleColorChange(noteColor.name)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all",
                      noteColor.bg,
                      editorState.color === noteColor.name 
                        ? "border-krushr-gray-600 scale-110" 
                        : "border-krushr-gray-300 hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-krushr-gray-500">
                {updateNoteMutation.isPending ? (
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-krushr-primary border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : editorState.isModified ? (
                  <span className="text-krushr-warning font-medium">Unsaved changes</span>
                ) : (
                  <span className="text-krushr-success font-medium">Saved</span>
                )}
              </div>
              
              <Button
                onClick={handleDeleteNote}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-6">
          <div className={cn("bg-white rounded-lg border-2 p-6 h-full flex flex-col", color.border, "shadow-sm")}>
            <input
              type="text"
              value={editorState.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className={cn(
                "text-2xl font-bold border-0 focus:ring-0 focus:outline-none bg-transparent mb-4 font-brand",
                color.text
              )}
            />
            
            <textarea
              value={editorState.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your note..."
              className={cn(
                "flex-1 resize-none border-0 focus:ring-0 focus:outline-none bg-transparent text-sm leading-relaxed",
                color.text
              )}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ComponentErrorBoundary>
      <div ref={mergedRef} className={cn("h-full", className)}>
        {viewMode === 'grid' ? <GridView /> : <EditorView />}
      </div>
    </ComponentErrorBoundary>
  )
})

NotesPanel.displayName = 'NotesPanel-ConceptA'

export default NotesPanel