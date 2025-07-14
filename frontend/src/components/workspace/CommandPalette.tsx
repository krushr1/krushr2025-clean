import React, { useState, useEffect, useCallback } from 'react'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from '../ui/command'
import { 
  PlusIcon, 
  SearchIcon, 
  CalendarIcon, 
  MessageSquareIcon, 
  FileTextIcon, 
  LayoutGridIcon,
  ZapIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  FolderIcon,
  TagIcon,
  ClockIcon,
  TrendingUpIcon,
  BarChart3Icon,
  UsersIcon,
  BellIcon,
  StarIcon,
  BookmarkIcon,
  ArchiveIcon,
  TrashIcon,
  FilterIcon,
  SortAscIcon,
  DownloadIcon,
  UploadIcon,
  ShareIcon,
  CopyIcon,
  RefreshCwIcon,
  MaximizeIcon,
  MinimizeIcon,
  LayoutIcon,
  GridIcon,
  ListIcon,
  MapIcon,
  PieChartIcon,
  BarChartIcon,
  LineChartIcon,
  CommandIcon
} from 'lucide-react'
import { trpc } from '../../lib/trpc'
import { useAuthStore } from '../../stores/auth-store'
import { Badge } from '../ui/badge'

interface CommandPaletteProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  onNavigate?: (path: string) => void
  onCreatePanel?: (type: string) => void
  onAction?: (action: string) => void
}

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  action: () => void
  group: string
  keywords?: string[]
  priority?: number
}

export default function CommandPalette({
  isOpen,
  onOpenChange,
  workspaceId,
  onNavigate,
  onCreatePanel,
  onAction
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuthStore()
  
  // Fetch recent items and workspaces
  const { data: recentItems = [] } = trpc.activity.getRecent.useQuery(
    { workspaceId, limit: 10 },
    { enabled: !!workspaceId }
  )
  
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  
  // Command categories with AI-powered suggestions
  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: 'quick-task',
      title: 'Create Task',
      subtitle: 'Add new task to Kanban',
      icon: PlusIcon,
      shortcut: '⌘N',
      action: () => onCreatePanel?.('KANBAN'),
      group: 'Quick Actions',
      keywords: ['task', 'todo', 'create', 'add', 'kanban'],
      priority: 10
    },
    {
      id: 'quick-note',
      title: 'Create Note',
      subtitle: 'Start writing immediately',
      icon: FileTextIcon,
      shortcut: '⌘⇧N',
      action: () => onCreatePanel?.('NOTES'),
      group: 'Quick Actions',
      keywords: ['note', 'write', 'document', 'create'],
      priority: 9
    },
    {
      id: 'quick-event',
      title: 'Schedule Event',
      subtitle: 'Add to calendar',
      icon: CalendarIcon,
      shortcut: '⌘⇧C',
      action: () => onCreatePanel?.('CALENDAR'),
      group: 'Quick Actions',
      keywords: ['event', 'meeting', 'schedule', 'calendar'],
      priority: 8
    },
    {
      id: 'quick-chat',
      title: 'Start Chat',
      subtitle: 'Message team members',
      icon: MessageSquareIcon,
      shortcut: '⌘/',
      action: () => onCreatePanel?.('CHAT'),
      group: 'Quick Actions',
      keywords: ['chat', 'message', 'communicate', 'talk'],
      priority: 7
    },
    
    // AI Assistant
    {
      id: 'ai-analyze',
      title: 'AI Task Analysis',
      subtitle: 'Get insights on your tasks',
      icon: TrendingUpIcon,
      action: () => onAction?.('ai-analyze'),
      group: 'AI Assistant',
      keywords: ['ai', 'analyze', 'insights', 'smart', 'assistant'],
      priority: 6
    },
    {
      id: 'ai-schedule',
      title: 'Smart Scheduling',
      subtitle: 'AI-powered time blocking',
      icon: ZapIcon,
      action: () => onAction?.('ai-schedule'),
      group: 'AI Assistant',
      keywords: ['ai', 'schedule', 'smart', 'time', 'block'],
      priority: 5
    },
    {
      id: 'ai-suggest',
      title: 'Task Suggestions',
      subtitle: 'Get AI recommendations',
      icon: StarIcon,
      action: () => onAction?.('ai-suggest'),
      group: 'AI Assistant',
      keywords: ['ai', 'suggest', 'recommend', 'smart'],
      priority: 4
    },
    
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Overview of all projects',
      icon: LayoutGridIcon,
      shortcut: '⌘1',
      action: () => onNavigate?.('/dashboard'),
      group: 'Navigation',
      keywords: ['dashboard', 'home', 'overview'],
      priority: 3
    },
    {
      id: 'nav-projects',
      title: 'View Projects',
      subtitle: 'All workspace projects',
      icon: FolderIcon,
      shortcut: '⌘2',
      action: () => onNavigate?.('/projects'),
      group: 'Navigation',
      keywords: ['projects', 'folders', 'workspace'],
      priority: 2
    },
    {
      id: 'nav-team',
      title: 'Team Members',
      subtitle: 'View and manage team',
      icon: UsersIcon,
      shortcut: '⌘3',
      action: () => onNavigate?.('/team'),
      group: 'Navigation',
      keywords: ['team', 'members', 'users', 'people'],
      priority: 1
    },
    
    // Panel Management
    {
      id: 'panel-layout-save',
      title: 'Save Layout',
      subtitle: 'Save current panel arrangement',
      icon: BookmarkIcon,
      shortcut: '⌘S',
      action: () => onAction?.('save-layout'),
      group: 'Panel Management',
      keywords: ['save', 'layout', 'panels', 'arrangement']
    },
    {
      id: 'panel-layout-load',
      title: 'Load Layout',
      subtitle: 'Switch to saved layout',
      icon: LayoutIcon,
      shortcut: '⌘L',
      action: () => onAction?.('load-layout'),
      group: 'Panel Management',
      keywords: ['load', 'layout', 'switch', 'panels']
    },
    {
      id: 'panel-focus',
      title: 'Focus Mode',
      subtitle: 'Hide all but current panel',
      icon: MaximizeIcon,
      shortcut: '⌘⇧F',
      action: () => onAction?.('focus-mode'),
      group: 'Panel Management',
      keywords: ['focus', 'hide', 'minimize', 'distraction-free']
    },
    {
      id: 'panel-minimize-all',
      title: 'Minimize All',
      subtitle: 'Collapse all panels',
      icon: MinimizeIcon,
      shortcut: '⌘⇧M',
      action: () => onAction?.('minimize-all'),
      group: 'Panel Management',
      keywords: ['minimize', 'collapse', 'hide', 'panels']
    },
    
    // View Options
    {
      id: 'view-grid',
      title: 'Grid View',
      subtitle: 'Arrange panels in grid',
      icon: GridIcon,
      action: () => onAction?.('view-grid'),
      group: 'View Options',
      keywords: ['grid', 'view', 'arrange', 'layout']
    },
    {
      id: 'view-list',
      title: 'List View',
      subtitle: 'Vertical panel layout',
      icon: ListIcon,
      action: () => onAction?.('view-list'),
      group: 'View Options',
      keywords: ['list', 'view', 'vertical', 'layout']
    },
    
    // Settings & Account
    {
      id: 'settings-workspace',
      title: 'Workspace Settings',
      subtitle: 'Configure workspace',
      icon: SettingsIcon,
      action: () => onNavigate?.('/settings'),
      group: 'Settings',
      keywords: ['settings', 'configure', 'workspace', 'options']
    },
    {
      id: 'settings-profile',
      title: 'Profile Settings',
      subtitle: 'Update your profile',
      icon: UserIcon,
      action: () => onNavigate?.('/profile'),
      group: 'Settings',
      keywords: ['profile', 'account', 'user', 'settings']
    },
    {
      id: 'logout',
      title: 'Sign Out',
      subtitle: 'Log out of workspace',
      icon: LogOutIcon,
      action: () => onAction?.('logout'),
      group: 'Settings',
      keywords: ['logout', 'sign out', 'exit', 'leave']
    }
  ]
  
  // Add workspace switching commands
  const workspaceCommands: CommandItem[] = workspaces.map((workspace: any) => ({
    id: `workspace-${workspace.id}`,
    title: `Switch to ${workspace.name}`,
    subtitle: `${workspace.memberCount || 0} members`,
    icon: FolderIcon,
    action: () => onNavigate?.(`/workspace/${workspace.id}`),
    group: 'Workspaces',
    keywords: ['workspace', 'switch', workspace.name.toLowerCase()],
    priority: workspace.id === workspaceId ? 10 : 1
  }))
  
  // Add recent items as commands
  const recentCommands: CommandItem[] = recentItems.map((item: any) => ({
    id: `recent-${item.id}`,
    title: item.title || item.name,
    subtitle: `${item.type} • ${item.updatedAt}`,
    icon: item.type === 'TASK' ? PlusIcon : item.type === 'NOTE' ? FileTextIcon : CalendarIcon,
    action: () => onNavigate?.(`/${item.type.toLowerCase()}/${item.id}`),
    group: 'Recent',
    keywords: ['recent', item.title?.toLowerCase(), item.type.toLowerCase()],
    priority: 5
  }))
  
  // Combine all commands
  const allCommands = [...commands, ...workspaceCommands, ...recentCommands]
  
  // Filter commands based on search
  const filteredCommands = allCommands.filter(command => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const titleMatch = command.title.toLowerCase().includes(query)
    const subtitleMatch = command.subtitle?.toLowerCase().includes(query)
    const keywordMatch = command.keywords?.some(keyword => keyword.includes(query))
    
    return titleMatch || subtitleMatch || keywordMatch
  })
  
  // Group filtered commands
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.group]) acc[command.group] = []
    acc[command.group].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)
  
  // Sort groups by priority
  const sortedGroups = Object.entries(groupedCommands).sort(([a], [b]) => {
    const priority = { 'Quick Actions': 1, 'AI Assistant': 2, 'Recent': 3, 'Navigation': 4, 'Workspaces': 5, 'Panel Management': 6, 'View Options': 7, 'Settings': 8 }
    return (priority[a as keyof typeof priority] || 9) - (priority[b as keyof typeof priority] || 9)
  })
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(true)
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange])
  
  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search commands, create items, or ask AI..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="text-center py-6">
            <CommandIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No commands found.</p>
            <p className="text-sm text-gray-400 mt-1">Try searching for actions, panels, or navigation</p>
          </div>
        </CommandEmpty>
        
        {sortedGroups.map(([group, commands]) => (
          <CommandGroup key={group} heading={group}>
            {commands
              .sort((a, b) => (b.priority || 0) - (a.priority || 0))
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => {
                    command.action()
                    onOpenChange(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
                >
                  <command.icon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{command.title}</div>
                    {command.subtitle && (
                      <div className="text-xs text-gray-500 truncate">{command.subtitle}</div>
                    )}
                  </div>
                  {command.shortcut && (
                    <CommandShortcut className="text-xs">{command.shortcut}</CommandShortcut>
                  )}
                  {group === 'AI Assistant' && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      AI
                    </Badge>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}