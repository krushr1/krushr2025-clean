import { Home, Calendar, MessageCircle, StickyNote, Users, FolderOpen, Settings, User, Layout, LogOut, Menu, ChevronLeft, Palette, BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import { trpc } from '../../lib/trpc'
import KrushrLogo from '../common/KrushrLogo'
import { useNavigate } from 'react-router'

/**
 * Professional sidebar with dynamic user information and collapsible functionality
 */
interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isBrandkitOpen, setIsBrandkitOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const activeWorkspace = workspaces[0]
  
  const { data: workspaceMembers = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId: activeWorkspace?.id || '' },
    { enabled: !!activeWorkspace?.id }
  )
  const navigation = [
    { name: 'Dashboard', icon: Home, href: '/home', key: 'home' },
    { name: 'Workspace', icon: Layout, href: '/workspace', key: 'workspace' },
    { name: 'Board', icon: FolderOpen, href: '/board', key: 'board' },
    { name: 'Calendar', icon: Calendar, href: '/calendar', key: 'calendar' },
    { name: 'Chat', icon: MessageCircle, href: '/chat', key: 'chat' },
    { name: 'Notes', icon: StickyNote, href: '/notes', key: 'notes' },
    { name: 'Teams', icon: Users, href: '/teams', key: 'teams' },
    { name: 'Projects', icon: FolderOpen, href: '/projects', key: 'projects' },
    { name: 'Contacts', icon: User, href: '/contacts', key: 'contacts' },
  ]

  const brandkitItems = [
    { name: 'Brandkit', icon: Palette, href: '/brandkit.html', key: 'brandkit' },
    { name: 'Brandkit 2', icon: Palette, href: '/brandkit-2.html', key: 'brandkit2' },
    { name: 'Landing Design System', icon: BookOpen, href: '/design-system-landing.html', key: 'landingkit' },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300`}>
      {/* Header with Toggle */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <KrushrLogo size={isCollapsed ? "sm" : "md"} showText={!isCollapsed} />
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-sidebar-accent rounded transition-colors ml-2"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-sidebar-border">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = currentPage === item.key
            
            return (
              <button
                key={item.key}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(item.key)
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2 text-sm font-light rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} ${isActive ? '' : 'text-sidebar-icon'}`} />
                {!isCollapsed && item.name}
              </button>
            )
          })}

          {/* Brandkit Folding Menu */}
          <div>
            <button
              onClick={() => setIsBrandkitOpen(!isBrandkitOpen)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2 text-sm font-light rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
              title={isCollapsed ? "Design System" : undefined}
            >
              <Palette className={`w-4 h-4 ${isCollapsed ? '' : 'mr-3'} text-sidebar-icon`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Design System</span>
                  {isBrandkitOpen ? (
                    <ChevronDown className="w-4 h-4 text-sidebar-icon" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-sidebar-icon" />
                  )}
                </>
              )}
            </button>

            {/* Brandkit Submenu */}
            {isBrandkitOpen && !isCollapsed && (
              <div className="ml-6 mt-1 space-y-1">
                {brandkitItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-3 py-2 text-sm font-light rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className="w-4 h-4 mr-3 text-sidebar-icon" />
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Workspace Members Section - Now under the menu */}
      {workspaceMembers.length > 1 && !isCollapsed && (
        <div className="flex-1 p-4">
          <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide mb-3">
            Workspace Members ({workspaceMembers.length})
          </h3>
          <div className="space-y-2">
            {workspaceMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-medium">
                    {getInitials(member.name || 'U')}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-sidebar rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {member.name} 
                    <span className="text-xs text-sidebar-foreground/60 font-normal ml-1">
                      • {member.email.split('@')[0]}
                    </span>
                  </p>
                </div>
              </div>
            ))}
            {workspaceMembers.length > 4 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{workspaceMembers.length - 4} more members
              </p>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Workspace Members - Show only avatars */}
      {workspaceMembers.length > 1 && isCollapsed && (
        <div className="flex-1 p-2">
          <div className="space-y-2">
            {workspaceMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex justify-center">
                <div className="relative" title={member.name}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-xs font-medium">
                    {getInitials(member.name || 'U')}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-sidebar rounded-full"></div>
                </div>
              </div>
            ))}
            {workspaceMembers.length > 4 && (
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium" title={`+${workspaceMembers.length - 4} more`}>
                  +{workspaceMembers.length - 4}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer - Current User */}
      {user && (
        <div className="p-4 border-t border-sidebar-border">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-xs font-medium">
                {getInitials(user.name || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-sidebar-foreground/60" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-sidebar-foreground/60" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-xs font-medium" title={user.name}>
                {getInitials(user.name || 'U')}
              </div>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4 text-sidebar-foreground/60" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-sidebar-foreground/60" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
