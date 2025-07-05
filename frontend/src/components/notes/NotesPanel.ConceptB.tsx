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
  GripVertical,
  Tag,
  Clock,
  FileText,
  Bookmark,
  MoreHorizontal,
  ArrowLeft,
  Eye,
  Calendar
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

const NotesPanel = React.forwardRef<HTMLDivElement, NotesPanelProps>(({ workspaceId, className }, ref) => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'recent'>('all')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [isTwoColumn, setIsTwoColumn] = useState(true)
  const [leftPaneWidth, setLeftPaneWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)

  // Editor State
  const [editorState, setEditorState] = useState({
    title: '',
    content: '',
    noteId: null as string | null,
    isModified: false
  })

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

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
        isModified: false
      })
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
      setEditorState({
        title: '',
        content: '',
        noteId: null,
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

  // Responsive layout
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth
      const shouldBeTwoColumn = containerWidth >= 768
      setIsTwoColumn(shouldBeTwoColumn)
      
      if (shouldBeTwoColumn) {
        const maxLeftWidth = containerWidth * 0.5
        const minLeftWidth = Math.min(320, containerWidth * 0.3)
        setLeftPaneWidth(prev => Math.max(minLeftWidth, Math.min(prev, maxLeftWidth)))
      }
    }
  }, [])

  useEffect(() => {
    handleResize()
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [handleResize])

  // Resizer mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left
      const minWidth = 280
      const maxWidth = containerRect.width * 0.6
      
      setLeftPaneWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Load note into editor when selected
  useEffect(() => {
    if (selectedNoteData && selectedNoteData.id !== editorState.noteId) {
      setEditorState({
        title: selectedNoteData.title,
        content: selectedNoteData.content || '',
        noteId: selectedNoteData.id,
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
  }

  const handleCreateNote = async () => {
    createNoteMutation.mutate({
      workspaceId,
      title: 'Untitled Note',
      content: ''
    })
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Get word count
  const getWordCount = (content: string) => {
    return content?.trim().split(/\s+/).filter(word => word.length > 0).length || 0
  }

  // Notes List Component
  const NotesList = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-krushr-gray-200 bg-gradient-to-r from-krushr-primary/5 to-krushr-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-krushr-gray-900 font-brand">Notes</h1>
            <p className="text-sm text-krushr-gray-600 mt-1">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Button
            onClick={handleCreateNote}
            size="sm"
            className="bg-krushr-primary hover:bg-krushr-primary-700 shadow-md"
            disabled={createNoteMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-krushr-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-krushr-gray-200 rounded-lg focus:ring-2 focus:ring-krushr-primary focus:border-transparent bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['all', 'pinned', 'recent'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filterMode === mode
                  ? "bg-krushr-primary text-white shadow-sm"
                  : "bg-white text-krushr-gray-600 hover:bg-krushr-gray-50 border border-krushr-gray-200"
              )}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1">
        {notesLoading ? (
          <div className="p-6 text-center">
            <div className="w-6 h-6 border-2 border-krushr-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-krushr-gray-500">Loading notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-6 text-center">
            <div className="max-w-sm mx-auto">
              <FileText className="w-12 h-12 text-krushr-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-krushr-gray-700 mb-2">
                {searchTerm ? 'No matching notes' : 'No notes yet'}
              </h3>
              <p className="text-sm text-krushr-gray-500 mb-4">
                {searchTerm ? 'Try different search terms' : 'Create your first note to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateNote} size="sm" className="bg-krushr-primary hover:bg-krushr-primary-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-krushr-gray-100">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteSelect(note.id)}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:bg-krushr-gray-50 group relative",
                  selectedNoteId === note.id && "bg-krushr-primary/10 border-r-2 border-krushr-primary"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {note.isPinned && (
                      <Star className="w-4 h-4 text-krushr-warning fill-current flex-shrink-0" />
                    )}
                    <h3 className={cn(
                      "font-semibold text-base font-brand truncate",
                      selectedNoteId === note.id ? "text-krushr-primary" : "text-krushr-gray-900"
                    )}>
                      {note.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleTogglePin(note.id, e)}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded transition-colors",
                        note.isPinned 
                          ? "text-krushr-warning hover:bg-krushr-warning/10" 
                          : "text-krushr-gray-400 hover:text-krushr-warning hover:bg-krushr-warning/10"
                      )}
                    >
                      <Star className={cn("w-3.5 h-3.5", note.isPinned && "fill-current")} />
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-krushr-gray-400 hover:text-krushr-gray-600 hover:bg-krushr-gray-100 transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Preview */}
                <div className="mb-3">
                  <p className="text-sm text-krushr-gray-600 line-clamp-3 leading-relaxed">
                    {note.content?.replace(/<[^>]*>/g, '').slice(0, 200) || 
                     <span className="italic text-krushr-gray-400">No content</span>
                    }
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-krushr-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {getWordCount(note.content || '')} words
                    </span>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <span className="flex items-center gap-1 text-krushr-primary">
                      <Tag className="w-3 h-3" />
                      {note.tags.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )

  // Note Editor Component
  const NoteEditor = () => (
    <div className="flex flex-col h-full bg-white">
      {selectedNoteId ? (
        <>
          {/* Editor Header */}
          <div className="p-4 border-b border-krushr-gray-200 bg-gradient-to-r from-white to-krushr-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isTwoColumn && (
                  <Button
                    onClick={() => setSelectedNoteId(null)}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <div className="text-xs text-krushr-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last edited {selectedNoteData && formatDate(selectedNoteData.updatedAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-xs text-krushr-gray-500">
                  {updateNoteMutation.isPending ? (
                    <span className="flex items-center gap-1 text-krushr-primary">
                      <div className="w-3 h-3 border border-krushr-primary border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : editorState.isModified ? (
                    <span className="flex items-center gap-1 text-krushr-warning">
                      <div className="w-2 h-2 rounded-full bg-krushr-warning"></div>
                      Unsaved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-krushr-success">
                      <div className="w-2 h-2 rounded-full bg-krushr-success"></div>
                      Saved
                    </span>
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
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <div className="p-6 pb-0">
              <input
                type="text"
                value={editorState.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Untitled note"
                className="w-full text-2xl font-bold border-0 focus:ring-0 focus:outline-none bg-transparent font-brand text-krushr-gray-900 placeholder-krushr-gray-400"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 p-6 pt-4">
              <textarea
                value={editorState.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing..."
                className="w-full h-full resize-none border-0 focus:ring-0 focus:outline-none bg-transparent text-sm leading-relaxed text-krushr-gray-700 placeholder-krushr-gray-400"
              />
            </div>
          </div>

          {/* Editor Footer */}
          <div className="p-4 border-t border-krushr-gray-200 bg-krushr-gray-50">
            <div className="flex items-center justify-between text-xs text-krushr-gray-500">
              <div className="flex items-center gap-4">
                <span>{getWordCount(editorState.content)} words</span>
                <span>{editorState.content.length} characters</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-krushr-gray-400 hover:text-krushr-primary transition-colors">
                  <Tag className="w-4 h-4" />
                </button>
                <button className="text-krushr-gray-400 hover:text-krushr-primary transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-krushr-gray-50">
          <div className="text-center max-w-md">
            <Eye className="w-16 h-16 text-krushr-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-krushr-gray-700 mb-2 font-brand">
              Select a note to view
            </h3>
            <p className="text-sm text-krushr-gray-500 mb-6">
              Choose a note from the list to start reading and editing
            </p>
            <Button onClick={handleCreateNote} className="bg-krushr-primary hover:bg-krushr-primary-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Note
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <ComponentErrorBoundary>
      <div ref={mergedRef} className={cn("flex h-full bg-krushr-gray-50", className)}>
        {isTwoColumn ? (
          <>
            {/* Left Pane */}
            <div style={{ width: leftPaneWidth }} className="flex-shrink-0 border-r border-krushr-gray-200">
              <NotesList />
            </div>
            
            {/* Resizer */}
            <div
              ref={resizerRef}
              className={cn(
                "w-1 bg-krushr-gray-200 hover:bg-krushr-primary transition-colors cursor-col-resize relative group",
                isResizing && "bg-krushr-primary"
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                setIsResizing(true)
              }}
            >
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                <GripVertical className="w-3 h-3 text-krushr-gray-400 group-hover:text-krushr-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            {/* Right Pane */}
            <div className="flex-1">
              <NoteEditor />
            </div>
          </>
        ) : (
          /* Single Column Layout */
          <div className="flex-1">
            {selectedNoteId ? (
              <NoteEditor />
            ) : (
              <NotesList />
            )}
          </div>
        )}
      </div>
    </ComponentErrorBoundary>
  )
})

NotesPanel.displayName = 'NotesPanel-ConceptB'

export default NotesPanel