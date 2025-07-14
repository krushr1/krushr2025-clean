
import React, { useState } from 'react'
import { PlusIcon, SearchIcon, BellIcon, SettingsIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import QuickCreatePanel from './QuickCreatePanel'
import { useAuthStore } from '../../stores/auth-store'

interface WorkspaceHeaderProps {
  workspaceName: string
  workspaceId: string
  currentPanel?: string
  onPanelChange?: (panel: string) => void
}

export default function WorkspaceHeader({
  workspaceName,
  workspaceId,
  currentPanel,
  onPanelChange
}: WorkspaceHeaderProps) {
  
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false)
  const { user } = useAuthStore()
  
  const handleQuickCreateToggle = () => {
    setIsQuickCreateOpen(!isQuickCreateOpen)
  }
  
  return (
    <>
      <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {workspaceName}
          </h1>
          
          {/* Quick Create Button */}
          <Button
            onClick={handleQuickCreateToggle}
            className="h-8 gap-2 bg-krushr-coral-red hover:bg-krushr-coral-red/90 text-white"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Create</span>
          </Button>
          
          {/* Context Badge */}
          {currentPanel && (
            <Badge variant="secondary" className="text-xs">
              {currentPanel === 'kanban' && '📋'}
              {currentPanel === 'calendar' && '📅'}
              {currentPanel === 'notes' && '📝'}
              {currentPanel === 'chat' && '💬'}
              {currentPanel?.charAt(0).toUpperCase() + currentPanel?.slice(1)}
            </Badge>
          )}
        </div>
        
        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <FloatingInput
              label="Search workspace"
              className="pl-10 h-8 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            <BellIcon className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
              3
            </Badge>
          </Button>
          
          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <SettingsIcon className="h-4 w-4" />
          </Button>
          
          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-xs">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      {/* Quick Create Panel */}
      <QuickCreatePanel
        workspaceId={workspaceId}
        isOpen={isQuickCreateOpen}
        onToggle={handleQuickCreateToggle}
        position="modal"
      />
    </>
  )
}