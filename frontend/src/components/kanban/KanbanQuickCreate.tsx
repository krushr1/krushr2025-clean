/**
 * Kanban Quick Create Integration
 * Inline form for creating tasks directly in Kanban columns
 */

import React, { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import UniversalInputFormCompact from '../forms/UniversalInputFormCompact'
import { ContentType } from '../../types/universal-form'
import { Priority, TaskStatus } from '../../types/enums'
import { cn } from '../../lib/utils'

interface KanbanQuickCreateProps {
  workspaceId: string
  projectId?: string
  columnId: string
  columnStatus: TaskStatus
  onTaskCreated?: (task: any) => void
  className?: string
}

export default function KanbanQuickCreate({
  workspaceId,
  projectId,
  columnId,
  columnStatus,
  onTaskCreated,
  className
}: KanbanQuickCreateProps) {
  
  const [isOpen, setIsOpen] = useState(false)
  
  const contextualDefaults = {
    status: columnStatus,
    projectId,
    kanbanColumnId: columnId,
    priority: Priority.MEDIUM
  }
  
  const handleSuccess = (data: any, type: ContentType) => {
    onTaskCreated?.(data)
    setIsOpen(false)
  }
  
  const handleClose = () => {
    setIsOpen(false)
  }
  
  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full h-8 justify-start text-base text-krushr-secondary hover:text-krushr-secondary",
          "border-2 border-dashed border-krushr-secondary/30 hover:border-krushr-secondary/50 hover:bg-krushr-secondary/5",
          "rounded-lg mb-2 font-medium",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add a card
      </Button>
    )
  }
  
  return (
    <Card className={cn("mb-2", className)}>
      <UniversalInputFormCompact
        workspaceId={workspaceId}
        contentType={ContentType.TASK}
        initialData={contextualDefaults}
        onSuccess={handleSuccess}
        onClose={handleClose}
        integrationMode="inline"
        maxHeight="300px"
        showHeader={false}
      />
    </Card>
  )
}