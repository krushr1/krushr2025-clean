/**
 * PanelToolbar - Toolbar for creating new panels
 * Allows users to add unlimited instances of any panel type
 */

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { FloatingInput } from '../ui/floating-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { 
  Plus,
  MessageCircle,
  Calendar,
  StickyNote,
  Columns,
  Mail,
  Users,
  Loader2,
  Lock,
  Unlock,
  Minimize2,
  Maximize2,
  Trash2,
  Settings2,
  MoreVertical
} from 'lucide-react'
import { trpc } from '../../lib/trpc'
import { cn } from '../../lib/utils'
import LayoutManager from './LayoutManager'

interface PanelToolbarProps {
  workspaceId: string
  panels?: any[]
  className?: string
}

const PANEL_TYPES = [
  { 
    type: 'KANBAN', 
    icon: Columns, 
    label: 'Kanban Board',
    description: 'Task management with drag-and-drop columns',
    defaultTitle: 'New Kanban'
  },
  { 
    type: 'CHAT', 
    icon: MessageCircle, 
    label: 'Chat',
    description: 'Team communication and messaging',
    defaultTitle: 'Team Chat'
  },
  { 
    type: 'CALENDAR', 
    icon: Calendar, 
    label: 'Calendar',
    description: 'Schedule and event management',
    defaultTitle: 'Calendar'
  },
  { 
    type: 'NOTES', 
    icon: StickyNote, 
    label: 'Notes',
    description: 'Quick notes and documentation',
    defaultTitle: 'Notes'
  },
  { 
    type: 'EMAIL', 
    icon: Mail, 
    label: 'Email',
    description: 'Email management and communication',
    defaultTitle: 'Email'
  },
  { 
    type: 'CONTACTS', 
    icon: Users, 
    label: 'Contacts',
    description: 'Contact and customer management',
    defaultTitle: 'Contacts'
  }
] as const

export default function PanelToolbar({ workspaceId, panels = [], className }: PanelToolbarProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const utils = trpc.useUtils()
  const createPanel = trpc.panel.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch panel list
      utils.panel.list.invalidate({ workspaceId })
      setDialogOpen(false)
      setSelectedType(null)
      setCustomTitle('')
    }
  })

  // Global panel control mutations
  const toggleMinimizeAll = trpc.panel.toggleMinimizeAll.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
    }
  })

  const toggleLockAll = trpc.panel.toggleLockAll.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
    }
  })

  const deleteAll = trpc.panel.deleteAll.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
    }
  })

  const exitAllFullscreen = trpc.panel.exitAllFullscreen.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
    }
  })

  // Get available Kanban boards and Chat threads for selection
  const { data: kanbans = [] } = trpc.kanban.list.useQuery({ workspaceId })
  const { data: chatThreads = [] } = trpc.chat.listThreads.useQuery({ workspaceId })

  const handleQuickCreate = (type: string) => {
    const panelType = PANEL_TYPES.find(p => p.type === type)
    if (!panelType) return

    // Prepare panel data and size based on type
    let data: Record<string, any> = { workspaceId }
    let size = { width: 4, height: 3 }

    if (type === 'KANBAN') {
      size = { width: 8, height: 6 } // Much larger for Kanban to show columns properly
      if (kanbans.length > 0) {
        data = { kanbanId: kanbans[0].id, workspaceId }
      }
    } else if (type === 'CHAT') {
      size = { width: 4, height: 5 } // Tall and narrow for chat
      if (chatThreads.length > 0) {
        data = { chatId: chatThreads[0].id, workspaceId }
      }
    } else if (type === 'NOTES') {
      size = { width: 6, height: 5 } // Wide for notes editor with sidebar
    }

    createPanel.mutate({
      type: type as any,
      title: panelType.defaultTitle,
      workspaceId,
      position: { x: 0, y: 0 },
      size,
      data
    })
  }

  const handleCustomCreate = () => {
    if (!selectedType) return

    const panelType = PANEL_TYPES.find(p => p.type === selectedType)
    if (!panelType) return

    const title = customTitle.trim() || panelType.defaultTitle

    // Prepare panel data and size based on type
    let data: Record<string, any> = { workspaceId }
    let size = { width: 4, height: 3 }
    
    if (selectedType === 'KANBAN') {
      size = { width: 8, height: 6 } // Much larger for Kanban
      if (kanbans.length > 0) {
        data = { kanbanId: kanbans[0].id, workspaceId }
      }
    } else if (selectedType === 'CHAT') {
      size = { width: 4, height: 5 } // Tall and narrow for chat
      if (chatThreads.length > 0) {
        data = { chatId: chatThreads[0].id, workspaceId }
      }
    } else if (selectedType === 'NOTES') {
      size = { width: 6, height: 5 } // Wide for notes editor with sidebar
    }

    createPanel.mutate({
      type: selectedType as any,
      title,
      workspaceId,
      position: { x: 0, y: 0 },
      size,
      data
    })
  }

  // Global control handlers
  const handleMinimizeAll = () => {
    const hasMinimized = panels.some((panel: any) => panel.is_minimized)
    toggleMinimizeAll.mutate({ 
      workspaceId, 
      minimize: !hasMinimized // If any are minimized, restore all. If none minimized, minimize all
    })
  }

  const handleLockAll = () => {
    const hasLocked = panels.some((panel: any) => panel.is_locked)
    toggleLockAll.mutate({ 
      workspaceId, 
      lock: !hasLocked // If any are locked, unlock all. If none locked, lock all
    })
  }

  const handleDeleteAll = () => {
    if (confirm(`Delete all ${panels.length} panels in this workspace?`)) {
      deleteAll.mutate({ workspaceId })
    }
  }

  const handleExitAllFullscreen = () => {
    exitAllFullscreen.mutate({ workspaceId })
  }

  // Check panel states for UI
  const hasMinimizedPanels = panels.some((panel: any) => panel.is_minimized)
  const hasLockedPanels = panels.some((panel: any) => panel.is_locked)
  const hasFullscreenPanels = panels.some((panel: any) => {
    try {
      const panelData = typeof panel.data === 'string' ? JSON.parse(panel.data) : panel.data
      return panelData?.isFullscreen === true
    } catch {
      return false
    }
  })

  return (
    <Card className={cn('panel-toolbar border-b rounded-t-lg rounded-b-none', className)}>
      <CardContent className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <LayoutManager 
            workspaceId={workspaceId}
            panels={panels}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Global panel controls dropdown */}
          {panels.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 hover:bg-gray-100"
                  title="Global panel controls"
                >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Controls</span>
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleMinimizeAll}
                  disabled={toggleMinimizeAll.isPending}
                  className="flex items-center gap-2"
                >
                  {hasMinimizedPanels ? (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      Restore All Panels
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      Minimize All Panels
                    </>
                  )}
                  {toggleMinimizeAll.isPending && (
                    <Loader2 className="w-3 h-3 ml-auto animate-spin" />
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleLockAll}
                  disabled={toggleLockAll.isPending}
                  className="flex items-center gap-2"
                >
                  {hasLockedPanels ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      Unlock All Panels
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Lock All Panels
                    </>
                  )}
                  {toggleLockAll.isPending && (
                    <Loader2 className="w-3 h-3 ml-auto animate-spin" />
                  )}
                </DropdownMenuItem>

                {hasFullscreenPanels && (
                  <DropdownMenuItem 
                    onClick={handleExitAllFullscreen}
                    disabled={exitAllFullscreen.isPending}
                    className="flex items-center gap-2"
                  >
                    <Minimize2 className="w-4 h-4" />
                    Exit All Fullscreen
                    {exitAllFullscreen.isPending && (
                      <Loader2 className="w-3 h-3 ml-auto animate-spin" />
                    )}
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  onClick={handleDeleteAll}
                  disabled={deleteAll.isPending}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Panels
                  {deleteAll.isPending && (
                    <Loader2 className="w-3 h-3 ml-auto animate-spin" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Quick create buttons for each panel type */}
          {PANEL_TYPES.map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => handleQuickCreate(type)}
              disabled={createPanel.isLoading}
              className="flex items-center gap-2 hover:bg-krushr-secondary hover:text-white"
              title={`Add ${label}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}

          {/* Custom create dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm"
                className="bg-krushr-primary hover:bg-krushr-primary/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Custom Panel</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Custom Panel</DialogTitle>
                <DialogDescription>
                  Choose a panel type and customize its settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Panel type selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Panel Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PANEL_TYPES.map(({ type, icon: Icon, label, description }) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={cn(
                          "p-3 border rounded-lg text-left transition-all",
                          selectedType === type
                            ? "border-krushr-primary bg-krushr-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-krushr-secondary" />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom title */}
                {selectedType && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Panel Title
                    </label>
                    <FloatingInput
                      label="Panel Title"
                      placeholder={PANEL_TYPES.find(p => p.type === selectedType)?.defaultTitle}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>
                )}

                {/* Create button */}
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCustomCreate}
                    disabled={!selectedType || createPanel.isLoading}
                    className="bg-krushr-primary hover:bg-krushr-primary/90"
                  >
                    {createPanel.isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Panel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}