import { Home, Calendar, MessageCircle, StickyNote, Users, FolderOpen, Settings, User, Layout, LogOut, Menu, ChevronLeft, Palette, BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import { trpc } from '../../lib/trpc'
import KrushrLogo from '../common/KrushrLogo'
import { useNavigate } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

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
  
  const { data: workspaceMembers = [], isLoading: membersLoading, error: membersError } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId: activeWorkspace?.id || '' },
    { 
      enabled: !!activeWorkspace?.id,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 3,
      refetchOnWindowFocus: false
    }
  )
  
  const displayMembers = workspaceMembers.length > 0 ? workspaceMembers : []
  const shouldShowMembersList = activeWorkspace && !membersError
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
    <div className={`${isCollapsed ? 'w-16' : 'w-48'} bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300`}>
      <div className="p-3 border-b border-sidebar-border flex-shrink-0">
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
              <Menu className="w-4 h-4 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-sidebar-border flex-shrink-0">
          <nav className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = currentPage === item.key
            
            return (
              <button
                key={item.key}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(item.key)
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-1.5 text-sm font-light rounded-lg transition-colors ${
                  isActive
                    ? 'bg-krushr-primary text-white font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'} ${isActive ? '' : 'text-sidebar-icon'}`} />
                {!isCollapsed && item.name}
              </button>
            )
          })}

          <div>
            <button
              onClick={() => setIsBrandkitOpen(!isBrandkitOpen)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-1.5 text-sm font-light rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`}
              title={isCollapsed ? "Design System" : undefined}
            >
              <Palette className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'} text-sidebar-icon`} />
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

            {isBrandkitOpen && !isCollapsed && (
              <div className="ml-6 mt-0.5 space-y-0.5">
                {brandkitItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center px-3 py-1.5 text-sm font-light rounded-lg transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className="w-4 h-4 mr-2 text-sidebar-icon" />
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        </div>

        {shouldShowMembersList && (
          <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-t border-sidebar-border flex-shrink-0 overflow-hidden`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wide">
                Team {membersLoading ? '...' : `(${displayMembers.length})`}
              </h3>
              {membersLoading && (
                <div className="w-3 h-3 border border-sidebar-foreground/30 border-t-sidebar-foreground rounded-full animate-spin"></div>
              )}
            </div>
          )}
          
          <div className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''} max-h-[200px] overflow-y-auto`}>
            {membersLoading && displayMembers.length === 0 && (
              <div className={`flex ${isCollapsed ? 'justify-center' : 'items-center space-x-2'} p-1`}>
                <div className="w-7 h-7 rounded-full bg-sidebar-accent animate-pulse"></div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="h-2.5 bg-sidebar-accent rounded animate-pulse mb-1"></div>
                    <div className="h-2 bg-sidebar-accent/60 rounded w-3/4 animate-pulse"></div>
                  </div>
                )}
              </div>
            )}
            
            {displayMembers.slice(0, isCollapsed ? 6 : 5).map((member) => (
              <div 
                key={member.id} 
                className={`group transition-colors cursor-pointer ${
                  isCollapsed 
                    ? 'flex justify-center' 
                    : 'flex items-center space-x-2 p-1 rounded-lg hover:bg-sidebar-accent'
                }`}
                title={isCollapsed ? `${member.name} (${member.email})` : undefined}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-krushr-primary to-krushr-primary/80 flex items-center justify-center text-white text-xs font-medium group-hover:scale-105 transition-transform">
                    {getInitials(member.name || 'U')}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-sidebar rounded-full"></div>
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
                      {member.name}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate leading-tight">
                      {member.email?.split('@')[0] || 'user'}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {displayMembers.length > (isCollapsed ? 6 : 5) && (
              <div className={`${isCollapsed ? 'flex justify-center' : 'text-center pt-1'}`}>
                {isCollapsed ? (
                  <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-foreground text-xs font-medium" title={`+${displayMembers.length - 6} more members`}>
                    +{displayMembers.length - 6}
                  </div>
                ) : (
                  <button className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                    +{displayMembers.length - 5} more members
                  </button>
                )}
              </div>
            )}
            
            {!membersLoading && displayMembers.length === 0 && !isCollapsed && (
              <div className="text-xs text-sidebar-foreground/60 text-center py-1">
                No team members yet
              </div>
            )}
          </div>
        </div>
        )}

        {!shouldShowMembersList && (
          <div className="flex-1"></div>
        )}
      </div>

      {user && (
        <div className="p-3 border-t border-sidebar-border flex-shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-red-500 text-white text-xs font-medium">
                  {getInitials(user.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate leading-tight">{user.email}</p>
              </div>
              <div className="flex space-x-0.5">
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1">
              <Avatar className="w-7 h-7" title={user.name}>
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-red-500 text-white text-xs font-medium">
                  {getInitials(user.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
