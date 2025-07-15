import React, { useRef, lazy, Suspense, useState, useEffect, useMemo } from 'react'
import { useToast } from '../../hooks/use-toast'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { 
  Minimize2, 
  Maximize2, 
  X, 
  Lock, 
  Unlock, 
  GripVertical,
  MessageCircle,
  Calendar,
  StickyNote,
  Columns,
  Mail,
  Users,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Expand,
  Shrink,
  Focus,
  Loader2,
  AlertCircle,
  FolderOpen,
  Bot
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'

const KanbanBoard = lazy(() => import('../kanban/KanbanBoard'))
const Chat = lazy(() => import('../chat/Chat'))  
const NotesPanel = lazy(() => import('../notes/NotesPanel'))
const NewCalendarPanel = lazy(() => import('../calendar/NewCalendarPanel'))
const Contacts = lazy(() => import('../contacts/Contacts'))
const WorkspaceAiChat = lazy(() => import('../ai/WorkspaceAiChat'))

import type { NotesPanelRef } from '../notes/NotesPanel'

import SimpleCreatePanel from '../forms/SimpleCreatePanel'


const PanelLoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="w-6 h-6 animate-spin text-krushr-primary" />
  </div>
)

class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Panel loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Failed to load panel</p>
            <p className="text-xs mt-1">Try refreshing the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// TODO: Import other components as they're created

interface Panel {
  id: string
  type: string
  title: string
  position_x: number
  position_y: number
  width: number
  height: number
  is_minimized: boolean
  is_locked: boolean
  data: Record<string, any>
}

interface PanelRendererProps {
  panel: Panel
  workspaceId: string
  onRefresh?: () => void
  onFullscreen?: (panelId: string, isFullscreen: boolean) => void
  onFocus?: (panelId: string) => void
}

export default function PanelRenderer({ panel, workspaceId, onRefresh, onFullscreen, onFocus }: PanelRendererProps) {
  const { toast } = useToast()
  const notesRef = useRef<NotesPanelRef>(null)
  const utils = trpc.useUtils()
  const [floatingPanels, setFloatingPanels] = useState<Set<string>>(() => new Set())
  
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(panel.title)

  // Update editedTitle when panel title changes from external updates
  useEffect(() => {
    if (!isEditingTitle) {
      setEditedTitle(panel.title)
    }
  }, [panel.title, isEditingTitle])
  
  const toggleMinimize = trpc.panel.toggleMinimize.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
      onRefresh?.()
    },
    onError: (error) => {
      console.error('Minimize toggle failed:', error)
      toast({
        title: "Error",
        description: "Failed to minimize/restore panel",
        variant: "destructive"
      })
    }
  })
  const toggleLock = trpc.panel.toggleLock.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
      onRefresh?.()
    },
    onError: (error) => {
      console.error('Lock toggle failed:', error)
      toast({
        title: "Error",
        description: "Failed to lock/unlock panel",
        variant: "destructive"
      })
    }
  })

  // Handle floating mode toggle
  const handleToggleFloating = () => {
    setFloatingPanels(prev => {
      const newFloatingPanels = new Set(prev)
      if (newFloatingPanels.has(panel.id)) {
        newFloatingPanels.delete(panel.id)
      } else {
        newFloatingPanels.add(panel.id)
      }
      return newFloatingPanels
    })
  }

  const handleCloseFloating = () => {
    setFloatingPanels(prev => {
      const newFloatingPanels = new Set(prev)
      newFloatingPanels.delete(panel.id)
      return newFloatingPanels
    })
  }

  const isFloating = useMemo(() => floatingPanels.has(panel.id), [floatingPanels, panel.id])
  const toggleFullscreen = trpc.panel.toggleFullscreen.useMutation({
    onSuccess: (updatedPanel) => {
      try {
        const panelData = JSON.parse(updatedPanel.data)
        // Invalidate cache to ensure UI updates immediately
        utils.panel.list.invalidate({ workspaceId })
        onFullscreen?.(panel.id, panelData.isFullscreen || false)
        onRefresh?.()
      } catch (error) {
        console.error('Error parsing panel data:', error, updatedPanel)
        // Still invalidate cache even if parsing fails
        utils.panel.list.invalidate({ workspaceId })
        onRefresh?.()
      }
    },
    onError: (error) => {
      console.error('Fullscreen toggle failed:', error)
      toast({
        title: "Error",
        description: "Failed to toggle fullscreen mode",
        variant: "destructive"
      })
    }
  })
  const setFocus = trpc.panel.setFocus.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
      onRefresh?.()
    }
  })
  const deletePanel = trpc.panel.delete.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
      onRefresh?.()
    },
    onError: (error) => {
      console.error('Panel deletion failed:', error)
      toast({
        title: "Error",
        description: "Failed to delete panel",
        variant: "destructive"
      })
    }
  })

  const updatePanel = trpc.panel.update.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
      onRefresh?.()
      setIsEditingTitle(false)
      toast({
        title: "Success",
        description: "Panel title updated"
      })
    },
    onError: (error) => {
      console.error('Update failed:', error)
      toast({
        title: "Error", 
        description: "Failed to update panel title",
        variant: "destructive"
      })
      setEditedTitle(panel.title) // Reset to original title
      setIsEditingTitle(false)
    }
  })

  const getPanelIcon = (type: string) => {
    switch (type) {
      case 'KANBAN':
        return <FolderOpen className="w-4 h-4 text-krushr-coral-red" />
      case 'CHAT':
        return <MessageCircle className="w-4 h-4 text-krushr-coral-red" />
      case 'AI_CHAT':
        return <Bot className="w-4 h-4 text-krushr-primary" />
      case 'CALENDAR':
        return <Calendar className="w-4 h-4 text-krushr-coral-red" />
      case 'NOTES':
        return <StickyNote className="w-4 h-4 text-krushr-coral-red" />
      case 'EMAIL':
        return <Mail className="w-4 h-4 text-krushr-coral-red" />
      case 'CONTACTS':
        return <Users className="w-4 h-4 text-krushr-coral-red" />
      default:
        return <GripVertical className="w-4 h-4 text-krushr-coral-red" />
    }
  }

  const renderPanelContent = () => {
    if (panel.is_minimized) {
      return null
    }

    switch (panel.type) {
      case 'KANBAN':
        const kanbanId = panel.data?.kanbanId
        if (!kanbanId) {
          return (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Columns className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No Kanban board selected</p>
                <p className="text-xs mt-1">Create a Kanban board first, then edit this panel</p>
              </div>
            </div>
          )
        }
        return (
          <div className="h-full">
            <Suspense fallback={<PanelLoadingSpinner />}>
              <KanbanBoard kanban={{ id: kanbanId, workspaceId: panel.data?.workspaceId }} className="h-full" />
            </Suspense>
          </div>
        )

      case 'CHAT':
        const chatId = panel.data?.chatId
        return (
          <PanelErrorBoundary>
            <Suspense fallback={<PanelLoadingSpinner />}>
              <Chat threadId={chatId} className="h-full" />
            </Suspense>
          </PanelErrorBoundary>
        )

      case 'AI_CHAT':
        return (
          <PanelErrorBoundary>
            <Suspense fallback={<PanelLoadingSpinner />}>
              <WorkspaceAiChat 
                workspaceId={workspaceId} 
                className="h-full" 
                isFloating={isFloating}
                onToggleFloating={handleToggleFloating}
                onClose={handleCloseFloating}
              />
            </Suspense>
          </PanelErrorBoundary>
        )

      case 'CALENDAR':
        return (
          <Suspense fallback={<PanelLoadingSpinner />}>
            <NewCalendarPanel workspaceId={panel.data?.workspaceId} className="h-full" />
          </Suspense>
        )

      case 'NOTES':
        return (
          <Suspense fallback={<PanelLoadingSpinner />}>
            <NotesPanel ref={notesRef} workspaceId={workspaceId} className="h-full" />
          </Suspense>
        )

      case 'EMAIL':
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Email component coming soon</p>
            </div>
          </div>
        )

      case 'CONTACTS':
        return (
          <Suspense fallback={<PanelLoadingSpinner />}>
            <Contacts workspaceId={panel.data?.workspaceId} className="h-full" />
          </Suspense>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <GripVertical className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Unknown panel type: {panel.type}</p>
            </div>
          </div>
        )
    }
  }

  const handleToggleMinimize = () => {
    toggleMinimize.mutate({ id: panel.id })
  }

  const handleToggleLock = () => {
    toggleLock.mutate({ id: panel.id })
  }

  const handleExportNotes = () => {
    if (panel.type === 'NOTES' && notesRef.current) {
      notesRef.current.exportNotes()
    }
  }

  const handleCreateNewNote = () => {
    if (panel.type === 'NOTES' && notesRef.current) {
      notesRef.current.createNewNote()
    }
  }

  const handleToggleFullscreen = () => {
    toggleFullscreen.mutate({ id: panel.id })
  }

  const handleFocus = () => {
    setFocus.mutate({ id: panel.id, focused: true })
    onFocus?.(panel.id)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.panel-drag-handle')) {
      e.stopPropagation()
    } else if (target.closest('.panel-content')) {
      return
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.panel-drag-handle')) {
      e.stopPropagation()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('.panel-drag-handle')) {
      e.stopPropagation()
    }
  }

  const handleDelete = () => {
    if (confirm(`Delete panel "${panel.title}"?`)) {
      deletePanel.mutate({ id: panel.id })
    }
  }

  const handleTitleClick = () => {
    if (!panel.is_locked) {
      setIsEditingTitle(true)
      setEditedTitle(panel.title)
    }
  }

  const handleTitleSave = () => {
    const trimmedTitle = editedTitle.trim()
    if (trimmedTitle && trimmedTitle !== panel.title) {
      updatePanel.mutate({
        id: panel.id,
        title: trimmedTitle
      })
    } else {
      setIsEditingTitle(false)
      setEditedTitle(panel.title)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
      setEditedTitle(panel.title)
    }
  }

  const handleTitleBlur = () => {
    handleTitleSave()
  }

  const isFullscreen = panel.data?.isFullscreen || false
  const isFocused = panel.data?.isFocused || false

  return (
    <Card 
      className={cn(
        "panel-card h-full flex flex-col",
        panel.is_locked && "border-amber-200 bg-amber-50",
        panel.is_minimized && "min-h-0",
        isFullscreen && "fixed inset-0 z-[9999] m-0 rounded-none shadow-2xl bg-white"
      )}
      onClick={handleFocus}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader 
        className={cn(
          "panel-drag-handle flex-shrink-0 cursor-move",
          "flex flex-row items-center justify-between space-y-0 p-0 px-3 py-1.5",
          panel.is_locked && "cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="text-krushr-coral-red">
            {getPanelIcon(panel.type)}
          </div>
          {isEditingTitle ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleBlur}
              className="h-6 px-1 py-0 text-sm font-medium border-krushr-primary focus:border-krushr-primary focus:ring-1 focus:ring-krushr-primary"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 
              className={cn(
                "font-medium text-sm truncate",
                !panel.is_locked && "cursor-pointer hover:text-krushr-primary transition-colors"
              )}
              onClick={handleTitleClick}
              title={panel.is_locked ? "Panel is locked" : "Click to edit title"}
            >
              {panel.title}
            </h3>
          )}
          {panel.is_locked && (
            <Lock className="w-3 h-3 text-amber-600 flex-shrink-0" />
          )}
          
        </div>
        
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Panel-specific actions dropdown */}
          {(panel.type === 'KANBAN' || panel.type === 'CHAT' || panel.type === 'AI_CHAT' || panel.type === 'NOTES') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-5 h-5 p-0 hover:bg-gray-100"
                  title="Panel actions"
                >
                  <MoreHorizontal className="w-2.5 h-2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {panel.type === 'KANBAN' ? (
                  <>
                    <DropdownMenuItem className="text-xs" onClick={() => setShowCreatePanel(true)}>
                      <Plus className="w-3 h-3 mr-2" />
                      Add Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs">
                      <Users className="w-3 h-3 mr-2" />
                      Members
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Calendar className="w-3 h-3 mr-2" />
                      Timeline
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Filter className="w-3 h-3 mr-2" />
                      Filters
                    </DropdownMenuItem>
                  </>
                ) : panel.type === 'CHAT' ? (
                  <>
                    <DropdownMenuItem className="text-xs">
                      <MessageCircle className="w-3 h-3 mr-2" />
                      New Message
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Users className="w-3 h-3 mr-2" />
                      Participants
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Search className="w-3 h-3 mr-2" />
                      Search Chat
                    </DropdownMenuItem>
                  </>
                ) : panel.type === 'AI_CHAT' ? (
                  <>
                    <DropdownMenuItem className="text-xs">
                      <Plus className="w-3 h-3 mr-2" />
                      New Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <MessageCircle className="w-3 h-3 mr-2" />
                      Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Search className="w-3 h-3 mr-2" />
                      Search Messages
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-xs" onClick={handleToggleFloating}>
                      <Bot className="w-3 h-3 mr-2" />
                      {isFloating ? 'Dock to Panel' : 'Pop Out to Float'}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="text-xs" onClick={handleCreateNewNote}>
                      <Plus className="w-3 h-3 mr-2" />
                      New Note
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs">
                      <Search className="w-3 h-3 mr-2" />
                      Search Notes
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs" onClick={handleExportNotes}>
                      <StickyNote className="w-3 h-3 mr-2" />
                      Export Notes
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-gray-600">
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-5 h-5 p-0 hover:bg-gray-100"
            onClick={handleToggleLock}
            disabled={toggleLock.isPending}
            title={panel.is_locked ? "Unlock panel" : "Lock panel"}
          >
            {toggleLock.isPending ? (
              <div className="w-2.5 h-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : panel.is_locked ? (
              <Unlock className="w-2.5 h-2.5" />
            ) : (
              <Lock className="w-2.5 h-2.5" />
            )}
          </Button>

          <Button 
            size="sm" 
            variant="ghost" 
            className="w-5 h-5 p-0 hover:bg-blue-100 hover:text-blue-600"
            onClick={handleToggleFullscreen}
            disabled={toggleFullscreen.isPending}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {toggleFullscreen.isPending ? (
              <div className="w-2.5 h-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : isFullscreen ? (
              <Shrink className="w-2.5 h-2.5" />
            ) : (
              <Expand className="w-2.5 h-2.5" />
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-5 h-5 p-0 hover:bg-gray-100"
            onClick={handleToggleMinimize}
            disabled={toggleMinimize.isPending}
            title={panel.is_minimized ? "Restore panel" : "Minimize panel"}
          >
            {toggleMinimize.isPending ? (
              <div className="w-2.5 h-2.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : panel.is_minimized ? (
              <Maximize2 className="w-2.5 h-2.5" />
            ) : (
              <Minimize2 className="w-2.5 h-2.5" />
            )}
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-5 h-5 p-0 hover:bg-red-100 hover:text-red-600"
            onClick={handleDelete}
            title="Delete panel"
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        </div>
      </CardHeader>
      
      {!panel.is_minimized && (
        <CardContent className="panel-content flex-1 p-1 pt-0 overflow-hidden">
          {renderPanelContent()}
        </CardContent>
      )}
      
      {/* Task Creation Panel */}
      {showCreatePanel && (
        <SimpleCreatePanel
          workspaceId={workspaceId}
          kanbanColumnId={panel.type === 'KANBAN' && panel.data?.kanbanId ? panel.data.kanbanId : undefined}
          open={showCreatePanel}
          onClose={() => setShowCreatePanel(false)}
          onSuccess={() => {
            setShowCreatePanel(false)
            onRefresh?.()
          }}
        />
      )}
    </Card>
  )
}
