/**
 * Quick Create Panel - Workspace Integration
 * Floating panel for universal content creation
 */

import React, { useState } from 'react'
import { PlusIcon, XIcon, MinimizeIcon, MaximizeIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import SimpleCreatePanel from '../forms/SimpleCreatePanel'
import { cn } from '../../lib/utils'

interface QuickCreatePanelProps {
  workspaceId: string
  isOpen?: boolean
  onToggle?: () => void
  position?: 'floating' | 'docked' | 'modal'
}

export default function QuickCreatePanel({
  workspaceId,
  isOpen = false,
  onToggle,
  position = 'floating'
}: QuickCreatePanelProps) {
  
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20 })
  
  const handleSuccess = () => {
    onToggle?.() // Close panel after creation
  }
  
  const handleClose = () => {
    onToggle?.()
  }
  
  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className={cn(
          "fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50",
          "bg-krushr-coral-red hover:bg-krushr-coral-red/90 text-white",
          "flex items-center justify-center"
        )}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>
    )
  }
  
  if (position === 'modal') {
    return (
      <SimpleCreatePanel
        workspaceId={workspaceId}
        open={isOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    )
  }
  
  if (position === 'floating') {
    return (
      <Card 
        className={cn(
          "fixed z-50 shadow-xl border-2",
          "w-80 max-h-96",
          isDragging && "cursor-move"
        )}
        style={{
          left: panelPosition.x,
          top: panelPosition.y
        }}
      >
        {/* Draggable Header */}
        <div 
          className="flex items-center justify-between p-2 bg-gray-50 border-b cursor-move"
          onMouseDown={(e) => {
            setIsDragging(true)
            const startX = e.clientX - panelPosition.x
            const startY = e.clientY - panelPosition.y
            
            const handleMouseMove = (e: MouseEvent) => {
              setPanelPosition({
                x: e.clientX - startX,
                y: e.clientY - startY
              })
            }
            
            const handleMouseUp = () => {
              setIsDragging(false)
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        >
          <span className="text-sm font-medium">Quick Create</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <MaximizeIcon className="h-3 w-3" />
              ) : (
                <MinimizeIcon className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Note: Floating mode simplified - will show modal instead */}
        {!isMinimized && (
          <div className="p-3 text-center text-sm text-gray-500">
            <p>Click to open task creator</p>
            <Button onClick={() => {
              setIsMinimized(true)
              onToggle?.()
            }} className="mt-2" size="sm">
              Create Task
            </Button>
          </div>
        )}
      </Card>
    )
  }
  
  // Docked position - use the same side panel as tasks
  return (
    <SimpleCreatePanel
      workspaceId={workspaceId}
      open={isOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}