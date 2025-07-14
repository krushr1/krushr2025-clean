import React, { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  SearchIcon, 
  BellIcon, 
  SettingsIcon, 
  ChevronDownIcon,
  ZapIcon,
  CommandIcon,
  FolderIcon,
  UsersIcon,
  RefreshCwIcon,
  WifiIcon,
  WifiOffIcon,
  MoreHorizontalIcon,
  KeyboardIcon,
  Columns,
  MessageCircle,
  Calendar,
  StickyNote,
  Mail,
  Users,
  Settings2,
  Minimize2,
  Maximize2,
  Lock,
  Unlock,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { FloatingInput } from '../ui/floating-input'
import CommandPalette from './CommandPalette'
import KeyboardShortcuts from './KeyboardShortcuts'
import LayoutManager from './LayoutManager'
import { trpc } from '../../lib/trpc'
import { useAuthStore } from '../../stores/auth-store'
import { cn } from '../../lib/utils'

interface WorkspaceHeaderConsolidatedProps {
  workspaceId: string
  panels?: any[]
  currentPanel?: {
    type: string
    id: string
    title?: string
  }
  onNavigate?: (path: string) => void
  onCreatePanel?: (type: string) => void
  onAction?: (action: string) => void
  className?: string
}

const PANEL_TYPES = [
  { 
    type: 'KANBAN', 
    icon: Columns, 
    label: 'Kanban',
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

export default function WorkspaceHeaderConsolidated({
  workspaceId,
  panels = [],
  currentPanel,
  onNavigate,
  onCreatePanel,
  onAction,
  className
}: WorkspaceHeaderConsolidatedProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  const [isCustomPanelOpen, setIsCustomPanelOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const { user } = useAuthStore()

  // tRPC hooks
  const utils = trpc.useUtils()
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const { data: currentWorkspace } = trpc.workspace.findById.useQuery(
    { id: workspaceId },
    { enabled: !!workspaceId }
  )
  const { data: notifications = [] } = trpc.notification.list.useQuery(
    { workspaceId, unreadOnly: true },
    { enabled: !!workspaceId }
  )
  const { data: kanbans = [] } = trpc.kanban.list.useQuery({ workspaceId })
  const { data: chatThreads = [] } = trpc.chat.listThreads.useQuery({ workspaceId })

  // Panel mutations
  const createPanel = trpc.panel.create.useMutation({
    onSuccess: () => {
      utils.panel.list.invalidate({ workspaceId })
      setIsCustomPanelOpen(false)
      setSelectedType(null)
      setCustomTitle('')
    }
  })

  const toggleMinimizeAll = trpc.panel.toggleMinimizeAll.useMutation({
    onSuccess: () => utils.panel.list.invalidate({ workspaceId })
  })

  const toggleLockAll = trpc.panel.toggleLockAll.useMutation({
    onSuccess: () => utils.panel.list.invalidate({ workspaceId })
  })

  const deleteAll = trpc.panel.deleteAll.useMutation({
    onSuccess: () => utils.panel.list.invalidate({ workspaceId })
  })

  const exitAllFullscreen = trpc.panel.exitAllFullscreen.useMutation({
    onSuccess: () => utils.panel.list.invalidate({ workspaceId })
  })

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleQuickCreate('KANBAN')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault()
        setIsKeyboardShortcutsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Panel creation handlers
  const handleQuickCreate = (type: string) => {
    const panelType = PANEL_TYPES.find(p => p.type === type)
    if (!panelType) return

    let data: Record<string, any> = { workspaceId }
    let size = { width: 4, height: 3 }

    if (type === 'KANBAN') {
      size = { width: 8, height: 6 }
      // Create new empty Kanban board - don't reference existing ones
      data = { workspaceId, createNew: true }
    } else if (type === 'CHAT') {
      size = { width: 4, height: 5 }
      // Create new chat thread - don't reference existing ones
      data = { workspaceId, createNew: true }
    } else if (type === 'NOTES') {
      size = { width: 6, height: 5 }
      // Notes panel starts empty by default
      data = { workspaceId, createNew: true }
    }

    createPanel.mutate({
      type: type as any,
      title: panelType.defaultTitle,
      workspaceId,
      position: { x: 0, y: 0 },
      size,
      data
    })

    onCreatePanel?.(type)
  }

  const handleCustomCreate = () => {
    if (!selectedType) return

    const panelType = PANEL_TYPES.find(p => p.type === selectedType)
    if (!panelType) return

    const title = customTitle.trim() || panelType.defaultTitle

    let data: Record<string, any> = { workspaceId, createNew: true }
    let size = { width: 4, height: 3 }
    
    if (selectedType === 'KANBAN') {
      size = { width: 8, height: 6 }
    } else if (selectedType === 'CHAT') {
      size = { width: 4, height: 5 }
    } else if (selectedType === 'NOTES') {
      size = { width: 6, height: 5 }
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

  // Panel control handlers
  const handleMinimizeAll = () => {
    const hasMinimized = panels.some((panel: any) => panel.is_minimized)
    toggleMinimizeAll.mutate({ 
      workspaceId, 
      minimize: !hasMinimized
    })
  }

  const handleLockAll = () => {
    const hasLocked = panels.some((panel: any) => panel.is_locked)
    toggleLockAll.mutate({ 
      workspaceId, 
      lock: !hasLocked
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

  // Panel state checks
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
    <TooltipProvider>
      <header className={cn(
        "h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm",
        className
      )}>
        {/* Left Section - Workspace + Layout Manager */}
        <div className="flex items-center space-x-4">
          {/* Workspace Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-3 hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-4 h-4 text-krushr-primary" />
                  <span className="font-semibold text-gray-900 max-w-32 truncate">
                    {currentWorkspace?.name || 'Workspace'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((workspace: any) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => onNavigate?.(`/workspace/${workspace.id}`)}
                  className="flex items-center space-x-3 p-3"
                >
                  <FolderIcon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{workspace.name}</div>
                    <div className="text-xs text-gray-500">
                      {workspace.memberCount || 0} members
                    </div>
                  </div>
                  {workspace.id === workspaceId && (
                    <Badge variant="secondary" className="text-xs">Current</Badge>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate?.('/workspaces/new')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Manager */}
          <LayoutManager 
            workspaceId={workspaceId}
            panels={panels}
          />
        </div>

        {/* Center Section - Smart Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search workspace or type ⌘K for commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-20 h-9 bg-gray-50 border-gray-200 focus:bg-white focus:border-krushr-primary"
              onFocus={() => setIsCommandPaletteOpen(true)}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-xs font-medium bg-gray-100 border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section - Panel Controls + Quick Actions + Global Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Panel Creation */}
          <div className="flex items-center space-x-1">
            {PANEL_TYPES.slice(0, 4).map(({ type, icon: Icon, label }) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCreate(type)}
                    disabled={createPanel.isLoading}
                    className="h-8 w-8 p-0 hover:bg-krushr-secondary hover:text-white"
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">Add {label}</span>
                </TooltipContent>
              </Tooltip>
            ))}
            
            {/* More panels dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Panels</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PANEL_TYPES.slice(4).map(({ type, icon: Icon, label }) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleQuickCreate(type)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCustomPanelOpen(true)}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Custom Panel...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Panel Controls (when panels exist) */}
          {panels.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Settings2 className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Panel Controls</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleMinimizeAll}
                  disabled={toggleMinimizeAll.isPending}
                  className="flex items-center gap-2"
                >
                  {hasMinimizedPanels ? (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      Restore All
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      Minimize All
                    </>
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
                      Unlock All
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Lock All
                    </>
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
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Quick Actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="h-8 w-8 p-0 bg-krushr-info hover:bg-krushr-info/90 text-white"
              >
                <CommandIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-medium">Command Palette</div>
                <div className="text-xs opacity-70">⌘K</div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => onAction?.('ai-assistant')}
                className="h-8 w-8 p-0 bg-krushr-success hover:bg-krushr-success/90 text-white"
              >
                <ZapIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-medium">AI Assistant</div>
                <div className="text-xs opacity-70">⌘⇧A</div>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Sync Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOnline ? (
                  <WifiIcon className="w-4 h-4 text-krushr-success" />
                ) : (
                  <WifiIcon className="w-4 h-4 text-krushr-warning" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">{isOnline ? 'Connected' : 'Offline'}</span>
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <BellIcon className="w-4 h-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-krushr-secondary">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">
                {notifications.length > 0 ? 
                  `${notifications.length} new notifications` : 
                  'No notifications'
                }
              </span>
            </TooltipContent>
          </Tooltip>

          {/* Global Controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Global Controls</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction?.('save-layout')}>
                Save Layout
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('load-layout')}>
                Load Layout
                <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('focus-mode')}>
                Focus Mode
                <DropdownMenuShortcut>⌘⇧F</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsKeyboardShortcutsOpen(true)}>
                Keyboard Shortcuts
                <DropdownMenuShortcut>⌘?</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onNavigate?.('/settings')}
              >
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">Settings</span>
            </TooltipContent>
          </Tooltip>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs bg-krushr-primary text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate?.('/profile')}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate?.('/preferences')}>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onAction?.('logout')}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Custom Panel Creation Dialog */}
        <Dialog open={isCustomPanelOpen} onOpenChange={setIsCustomPanelOpen}>
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
                  onClick={() => setIsCustomPanelOpen(false)}
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
                    <PlusIcon className="w-4 h-4 mr-2" />
                  )}
                  Create Panel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
          workspaceId={workspaceId}
          onNavigate={onNavigate}
          onCreatePanel={onCreatePanel}
          onAction={onAction}
        />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcuts
          isOpen={isKeyboardShortcutsOpen}
          onOpenChange={setIsKeyboardShortcutsOpen}
        />
      </header>
    </TooltipProvider>
  )
}