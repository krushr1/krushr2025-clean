import React, { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  SearchIcon, 
  BellIcon, 
  SettingsIcon, 
  ChevronDownIcon,
  ZapIcon,
  CommandIcon,
  LayoutGridIcon,
  FolderIcon,
  UsersIcon,
  TrendingUpIcon,
  RefreshCwIcon,
  WifiIcon,
  WifiOffIcon,
  CircleIcon,
  StarIcon,
  BookmarkIcon,
  MaximizeIcon,
  MinimizeIcon,
  GridIcon,
  ListIcon,
  FilterIcon,
  SortAscIcon,
  MoreHorizontalIcon,
  KeyboardIcon
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
import CommandPalette from './CommandPalette'
import KeyboardShortcuts from './KeyboardShortcuts'
import { trpc } from '../../lib/trpc'
import { useAuthStore } from '../../stores/auth-store'
import { cn } from '../../lib/utils'
import { shouldProcessHotkey } from '../../lib/keyboard-utils'

interface WorkspaceHeaderEnhancedProps {
  workspaceId: string
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

export default function WorkspaceHeaderEnhanced({
  workspaceId,
  currentPanel,
  onNavigate,
  onCreatePanel,
  onAction,
  className
}: WorkspaceHeaderEnhancedProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthStore()

  // Fetch workspace data
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const { data: currentWorkspace } = trpc.workspace.findById.useQuery(
    { id: workspaceId },
    { enabled: !!workspaceId }
  )
  const { data: notifications = [] } = trpc.notification.list.useQuery(
    { workspaceId, unreadOnly: true },
    { enabled: !!workspaceId }
  )

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
      // Don't process hotkeys if user is typing
      if (!shouldProcessHotkey(e)) {
        return
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        onCreatePanel?.('KANBAN')
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault()
        onCreatePanel?.('NOTES')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault()
        setIsKeyboardShortcutsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCreatePanel])

  // Quick action buttons with keyboard shortcuts
  const quickActions = [
    {
      id: 'quick-add',
      icon: PlusIcon,
      label: 'Quick Add',
      shortcut: '⌘N',
      color: 'bg-krushr-primary hover:bg-krushr-primary/90',
      action: () => onCreatePanel?.('KANBAN')
    },
    {
      id: 'command-palette',
      icon: CommandIcon,
      label: 'Command Palette',
      shortcut: '⌘K',
      color: 'bg-krushr-info hover:bg-krushr-info/90',
      action: () => setIsCommandPaletteOpen(true)
    },
    {
      id: 'ai-assistant',
      icon: ZapIcon,
      label: 'AI Assistant',
      shortcut: '⌘⇧A',
      color: 'bg-krushr-success hover:bg-krushr-success/90',
      action: () => onAction?.('ai-assistant')
    },
    {
      id: 'focus-mode',
      icon: MaximizeIcon,
      label: 'Focus Mode',
      shortcut: '⌘⇧F',
      color: 'bg-krushr-warning hover:bg-krushr-warning/90',
      action: () => onAction?.('focus-mode')
    }
  ]

  // Context tools based on current panel
  const getContextTools = () => {
    if (!currentPanel) return []
    
    switch (currentPanel.type) {
      case 'KANBAN':
        return [
          { icon: FilterIcon, label: 'Filter', action: () => onAction?.('filter-tasks') },
          { icon: SortAscIcon, label: 'Sort', action: () => onAction?.('sort-tasks') },
          { icon: GridIcon, label: 'View', action: () => onAction?.('change-view') }
        ]
      case 'CALENDAR':
        return [
          { icon: TrendingUpIcon, label: 'Analytics', action: () => onAction?.('calendar-analytics') },
          { icon: RefreshCwIcon, label: 'Sync', action: () => onAction?.('sync-calendar') }
        ]
      case 'NOTES':
        return [
          { icon: BookmarkIcon, label: 'Bookmark', action: () => onAction?.('bookmark-note') },
          { icon: StarIcon, label: 'Favorite', action: () => onAction?.('favorite-note') }
        ]
      case 'CHAT':
        return [
          { icon: UsersIcon, label: 'Members', action: () => onAction?.('chat-members') },
          { icon: CircleIcon, label: 'Status', action: () => onAction?.('chat-status') }
        ]
      default:
        return []
    }
  }

  const contextTools = getContextTools()

  return (
    <TooltipProvider>
      <header className={cn(
        "h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm",
        className
      )}>
        {/* Left Section - Workspace + Quick Actions */}
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

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {quickActions.map((action) => (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={action.action}
                    className={cn(
                      "h-8 w-8 p-0 text-white shadow-sm",
                      action.color
                    )}
                  >
                    <action.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs opacity-70">{action.shortcut}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
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

        {/* Right Section - Context Tools + Global Controls */}
        <div className="flex items-center space-x-3">
          {/* Context Tools */}
          {contextTools.length > 0 && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-lg">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {currentPanel?.type}
              </Badge>
              {contextTools.map((tool, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={tool.action}
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <tool.icon className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">{tool.label}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Sync Status */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOnline ? (
                  syncStatus === 'syncing' ? (
                    <RefreshCwIcon className="w-4 h-4 text-krushr-info animate-spin" />
                  ) : (
                    <WifiIcon className="w-4 h-4 text-krushr-success" />
                  )
                ) : (
                  <WifiOffIcon className="w-4 h-4 text-krushr-warning" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">
                {isOnline ? 
                  syncStatus === 'syncing' ? 'Syncing...' : 'Connected' : 
                  'Offline'
                }
              </span>
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
                <BookmarkIcon className="w-4 h-4 mr-2" />
                Save Layout
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('load-layout')}>
                <LayoutGridIcon className="w-4 h-4 mr-2" />
                Load Layout
                <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('focus-mode')}>
                <MaximizeIcon className="w-4 h-4 mr-2" />
                Focus Mode
                <DropdownMenuShortcut>⌘⇧F</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('minimize-all')}>
                <MinimizeIcon className="w-4 h-4 mr-2" />
                Minimize All
                <DropdownMenuShortcut>⌘⇧M</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsKeyboardShortcutsOpen(true)}>
                <KeyboardIcon className="w-4 h-4 mr-2" />
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