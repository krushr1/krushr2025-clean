import React from 'react'

interface SimpleEnhancedHeaderProps {
  workspaceId: string
}

export default function SimpleEnhancedHeader({ workspaceId }: SimpleEnhancedHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="text-lg font-semibold text-blue-600">
          🚀 Enhanced Workspace Header
        </div>
        <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
          Quick Add
        </button>
        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">
          Command ⌘K
        </button>
      </div>
      
      <div className="flex-1 max-w-md mx-8">
        <input 
          type="text" 
          placeholder="Search workspace or press ⌘K..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm">
          Sync
        </button>
        <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm">
          Notifications
        </button>
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
          U
        </div>
      </div>
    </header>
  )
}