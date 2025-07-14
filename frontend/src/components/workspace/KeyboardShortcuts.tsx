import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { 
  CommandIcon, 
  PlusIcon, 
  SearchIcon, 
  ZapIcon, 
  MaximizeIcon, 
  MinimizeIcon, 
  LayoutGridIcon, 
  BookmarkIcon, 
  RefreshCwIcon, 
  CalendarIcon, 
  FileTextIcon, 
  MessageSquareIcon, 
  SettingsIcon, 
  UserIcon, 
  LogOutIcon,
  KeyboardIcon,
  FolderIcon,
  TrendingUpIcon,
  StarIcon,
  FilterIcon,
  SortAscIcon,
  GridIcon,
  ListIcon,
  CopyIcon,
  ShareIcon,
  DownloadIcon,
  UploadIcon,
  ArchiveIcon,
  TrashIcon
} from 'lucide-react'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutGroup {
  title: string
  shortcuts: Array<{
    key: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

export default function KeyboardShortcuts({ isOpen, onOpenChange }: KeyboardShortcutsProps) {
  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Essential Commands',
      shortcuts: [
        { key: '⌘K', description: 'Open command palette', icon: CommandIcon },
        { key: '⌘N', description: 'Quick add task', icon: PlusIcon },
        { key: '⌘/', description: 'Focus search', icon: SearchIcon },
        { key: '⌘⇧F', description: 'Focus mode', icon: MaximizeIcon },
        { key: '⌘⇧A', description: 'AI assistant', icon: ZapIcon },
        { key: '⌘?', description: 'Show shortcuts', icon: KeyboardIcon }
      ]
    },
    {
      title: 'Panel Creation',
      shortcuts: [
        { key: '⌘⇧N', description: 'Create note', icon: FileTextIcon },
        { key: '⌘⇧C', description: 'Create calendar event', icon: CalendarIcon },
        { key: '⌘⇧M', description: 'Start chat', icon: MessageSquareIcon },
        { key: '⌘⇧K', description: 'Create kanban board', icon: LayoutGridIcon }
      ]
    },
    {
      title: 'Layout Management',
      shortcuts: [
        { key: '⌘S', description: 'Save layout', icon: BookmarkIcon },
        { key: '⌘L', description: 'Load layout', icon: LayoutGridIcon },
        { key: '⌘⇧M', description: 'Minimize all panels', icon: MinimizeIcon },
        { key: '⌘⇧R', description: 'Refresh workspace', icon: RefreshCwIcon }
      ]
    },
    {
      title: 'Navigation',
      shortcuts: [
        { key: '⌘1', description: 'Go to dashboard', icon: LayoutGridIcon },
        { key: '⌘2', description: 'View projects', icon: FolderIcon },
        { key: '⌘3', description: 'Team members', icon: UserIcon },
        { key: '⌘4', description: 'Settings', icon: SettingsIcon }
      ]
    },
    {
      title: 'Content Actions',
      shortcuts: [
        { key: '⌘D', description: 'Duplicate item', icon: CopyIcon },
        { key: '⌘⇧S', description: 'Share item', icon: ShareIcon },
        { key: '⌘⇧D', description: 'Download/Export', icon: DownloadIcon },
        { key: '⌘⇧U', description: 'Upload file', icon: UploadIcon }
      ]
    },
    {
      title: 'Organization',
      shortcuts: [
        { key: '⌘F', description: 'Filter items', icon: FilterIcon },
        { key: '⌘⇧O', description: 'Sort items', icon: SortAscIcon },
        { key: '⌘G', description: 'Grid view', icon: GridIcon },
        { key: '⌘⇧L', description: 'List view', icon: ListIcon }
      ]
    },
    {
      title: 'Quick Actions',
      shortcuts: [
        { key: '⌘⇧⭐', description: 'Star/Favorite', icon: StarIcon },
        { key: '⌘⇧A', description: 'Archive item', icon: ArchiveIcon },
        { key: '⌘⇧⌫', description: 'Delete item', icon: TrashIcon },
        { key: '⌘⇧Q', description: 'Sign out', icon: LogOutIcon }
      ]
    },
    {
      title: 'AI & Analytics',
      shortcuts: [
        { key: '⌘⇧I', description: 'AI insights', icon: TrendingUpIcon },
        { key: '⌘⇧T', description: 'Task suggestions', icon: ZapIcon },
        { key: '⌘⇧P', description: 'Performance analytics', icon: TrendingUpIcon }
      ]
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <KeyboardIcon className="w-5 h-5" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div 
                      key={shortcutIndex}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group"
                    >
                      <div className="flex items-center space-x-3">
                        <shortcut.icon className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {shortcut.description}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono">
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use ⌘K to access the command palette for any action</li>
              <li>• Hold ⌘ and click to open items in new panels</li>
              <li>• Use ⌘⇧F to enter focus mode and eliminate distractions</li>
              <li>• Create custom shortcuts in Settings → Keyboard</li>
              <li>• Most shortcuts work across all panels and contexts</li>
            </ul>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Press <Badge variant="outline" className="text-xs">ESC</Badge> to close this dialog
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}