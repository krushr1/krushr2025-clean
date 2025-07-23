import React, { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Badge } from '../ui/badge'
import { Plus, Search, Filter, Users, Calendar, MoreHorizontal, Settings, Edit, Trash2, GripVertical } from 'lucide-react'
import { trpc } from '../../lib/trpc'
import KanbanColumnComponent from './KanbanColumn'
import TaskCard from './TaskCard'
import CompactTaskModal from './CompactTaskModal'
import TaskDetail from '../task/TaskDetail'
import { cn } from '../../lib/utils'
import { Task } from '../../types'

interface KanbanBoardProps {
  kanban: any
  className?: string
}

export default function KanbanBoard({ kanban, className }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [showCreatePanel, setShowCreatePanel] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [showColumnManagement, setShowColumnManagement] = useState(false)
  const [editingColumn, setEditingColumn] = useState<any | null>(null)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [newColumnColor, setNewColumnColor] = useState('#6B7280')
  
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  const { data: kanbanData, refetch: refetchKanban } = trpc.kanban.get.useQuery({ id: kanban.id })
  const columns = kanbanData?.columns || []
  
  const { data: tasks = [], refetch: refetchTasks } = trpc.task.list.useQuery({
    workspaceId: kanban.workspaceId,
    kanbanId: kanban.id
  })
  
  const updateTaskMutation = trpc.task.update.useMutation({
    onSuccess: () => {
      refetchTasks()
    }
  })

  const createColumnMutation = trpc.kanban.createColumn.useMutation({
    onSuccess: () => {
      refetchKanban()
      setNewColumnTitle('')
      setNewColumnColor('#6B7280')
    }
  })

  const updateColumnMutation = trpc.kanban.updateColumn.useMutation({
    onSuccess: () => {
      refetchKanban()
      setEditingColumn(null)
    }
  })

  const deleteColumnMutation = trpc.kanban.deleteColumn.useMutation({
    onSuccess: () => {
      refetchKanban()
    }
  })

  const reorderColumnsMutation = trpc.kanban.reorderColumns.useMutation({
    onSuccess: () => {
      refetchKanban()
    }
  })

  const columnIds = columns.map(col => col.id)
  const kanbanTasks = tasks.filter(task => 
    task.kanbanColumnId && columnIds.includes(task.kanbanColumnId)
  )

  const filteredTasks = kanbanTasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = selectedPriorities.length === 0 || 
      selectedPriorities.includes(task.priority)
    
    const matchesAssignee = selectedAssignees.length === 0 || 
      (task.assigneeId && selectedAssignees.includes(task.assigneeId))

    return matchesSearch && matchesPriority && matchesAssignee
  })

  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks
      .filter(task => task.kanbanColumnId === column.id)
      .sort((a, b) => a.position - b.position)
    return acc
  }, {} as Record<string, any[]>)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === 'task') {
      setActiveTask(active.data.current.task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeType = active.data.current?.type
    const overType = over.data.current?.type

    if (activeType === 'task') {
      const activeTask = active.data.current?.task as Task
      if (!activeTask) return

      const sourceColumn = columns.find(col => col.id === activeTask.kanbanColumnId)
      let targetColumn: any
      let targetIndex: number

      if (overType === 'column') {
        targetColumn = columns.find(col => col.id === over.id)!
        targetIndex = tasksByColumn[targetColumn.id]?.length || 0
      } else if (overType === 'task') {
        const overTask = over.data.current?.task as any
        targetColumn = columns.find(col => col.id === overTask.kanbanColumnId)!
        targetIndex = tasksByColumn[targetColumn.id].findIndex(task => task.id === overTask.id)
      } else {
        return
      }

      if (!sourceColumn || !targetColumn) return

      const targetTasks = tasksByColumn[targetColumn.id]
      let newOrderNumber: number

      if (targetTasks.length === 0) {
        newOrderNumber = 1
      } else if (targetIndex === 0) {
        newOrderNumber = targetTasks[0].position - 1
      } else if (targetIndex >= targetTasks.length) {
        newOrderNumber = targetTasks[targetTasks.length - 1].position + 1
      } else {
        const prevOrder = targetTasks[targetIndex - 1].position
        const nextOrder = targetTasks[targetIndex].position
        newOrderNumber = (prevOrder + nextOrder) / 2
      }

      const updates = {
        kanbanColumnId: targetColumn.id,
        position: newOrderNumber,
      }

      try {
        await updateTaskMutation.mutateAsync({
          id: activeTask.id,
          ...updates
        })
      } catch (error) {
        console.error('Failed to move task:', error)
      }
    }
  }

  const getTaskCount = (columnId: string) => {
    return tasksByColumn[columnId]?.length || 0
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-krushr-priority-high/10 text-krushr-priority-high border-krushr-priority-high/20'
      case 'medium': return 'bg-krushr-priority-medium/10 text-krushr-priority-medium border-krushr-priority-medium/20'
      case 'low': return 'bg-krushr-priority-low/10 text-krushr-priority-low border-krushr-priority-low/20'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const selectAllTasks = () => {
    const allTaskIds = new Set(filteredTasks.map(task => task.id))
    setSelectedTasks(allTaskIds)
    setShowBulkActions(allTaskIds.size > 0)
  }

  const clearSelection = () => {
    setSelectedTasks(new Set())
    setShowBulkActions(false)
    setBulkMode(false)
  }

  const handleBulkMove = (targetColumnId: string) => {
    if (selectedTasks.size === 0) return
    
    const taskIds = Array.from(selectedTasks)
    taskIds.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        updateTaskMutation.mutate({
          id: taskId,
          kanbanColumnId: targetColumnId
        })
      }
    })
    clearSelection()
  }

  const handleBulkPriority = (priority: string) => {
    if (selectedTasks.size === 0) return
    
    const taskIds = Array.from(selectedTasks)
    taskIds.forEach(taskId => {
      updateTaskMutation.mutate({
        id: taskId,
        priority
      })
    })
    clearSelection()
  }

  const handleCreateColumn = async () => {
    if (!newColumnTitle.trim()) return
    
    try {
      await createColumnMutation.mutateAsync({
        kanbanId: kanban.id,
        title: newColumnTitle.trim(),
        color: newColumnColor
      })
    } catch (error) {
      console.error('Failed to create column:', error)
    }
  }

  const handleUpdateColumn = async (columnId: string, title: string, color: string) => {
    try {
      await updateColumnMutation.mutateAsync({
        id: columnId,
        title: title.trim(),
        color
      })
    } catch (error) {
      console.error('Failed to update column:', error)
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    const taskCount = getTaskCount(columnId)
    
    if (taskCount > 0) {
      alert(`Cannot delete column "${column?.title}" because it contains ${taskCount} task${taskCount !== 1 ? 's' : ''}. Please move or delete the tasks first.`)
      return
    }
    
    if (confirm(`Delete column "${column?.title}"? This action cannot be undone.`)) {
      try {
        await deleteColumnMutation.mutateAsync({ id: columnId })
      } catch (error) {
        console.error('Failed to delete column:', error)
      }
    }
  }

  const handleReorderColumns = async (newOrder: string[]) => {
    try {
      await reorderColumnsMutation.mutateAsync({
        kanbanId: kanban.id,
        columnIds: newOrder
      })
    } catch (error) {
      console.error('Failed to reorder columns:', error)
    }
  }

  return (
    <div className={cn('flex flex-col h-full bg-gray-50', className)}>
      
      {/* Bulk Operations Toolbar */}
      {showBulkActions && (
        <div className="mx-2 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 font-manrope">
                {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={clearSelection}
                className="h-8 min-h-[32px] text-xs hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-manrope"
                aria-label="Clear task selection"
              >
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Move to Column */}
              <select 
                className="text-sm border rounded px-3 py-2 h-10 min-h-[40px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-manrope"
                onChange={(e) => e.target.value && handleBulkMove(e.target.value)}
                defaultValue=""
                aria-label="Move selected tasks to column"
              >
                <option value="">Move to...</option>
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
              
              {/* Set Priority */}
              <select 
                className="text-sm border rounded px-3 py-2 h-10 min-h-[40px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-manrope"
                onChange={(e) => e.target.value && handleBulkPriority(e.target.value)}
                defaultValue=""
                aria-label="Set priority for selected tasks"
              >
                <option value="">Set priority...</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => {
                  if (confirm(`Delete ${selectedTasks.size} selected tasks?`)) {
                    // TODO: Implement bulk delete functionality
                    clearSelection()
                  }
                }}
                className="h-10 min-h-[40px] text-sm px-3 hover:bg-red-600 focus:bg-red-600 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                aria-label={`Delete ${selectedTasks.size} selected tasks`}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center gap-2">
          <FloatingInput
            label="Search tasks"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 h-10 min-h-[40px] text-sm focus:ring-2 focus:ring-blue-500"
            type="search"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            aria-label={`${showFilters ? 'Hide' : 'Show'} task filters`}
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowColumnManagement(!showColumnManagement)}
            className="h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            aria-label={`${showColumnManagement ? 'Hide' : 'Show'} column management`}
            aria-expanded={showColumnManagement}
          >
            <Settings className="w-4 h-4 mr-2" />
            Columns
          </Button>
          
          <Button
            size="sm"
            variant={bulkMode ? "default" : "outline"}
            onClick={() => {
              setBulkMode(!bulkMode)
              if (bulkMode) clearSelection()
            }}
            className="h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            aria-label={bulkMode ? 'Exit bulk selection mode' : 'Enter bulk selection mode'}
            aria-pressed={bulkMode}
          >
            {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
          </Button>
          
          {bulkMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={selectAllTasks}
              className="h-10 min-h-[40px] text-sm hover:bg-gray-50 focus:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              aria-label="Select all visible tasks"
            >
              Select All
            </Button>
          )}
          
          <button
            onClick={() => {
              setSelectedColumnId(columns[0]?.id || null)
              setShowCreatePanel(true)
            }}
            className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors"
            aria-label="Create new task"
            title="Create new task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mx-2 mt-1 p-2 bg-gray-50 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex flex-wrap gap-2">
                  {['high', 'medium', 'low'].map((priority) => (
                    <Badge
                      key={priority}
                      variant={selectedPriorities.includes(priority) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer capitalize",
                        selectedPriorities.includes(priority) && getPriorityColor(priority)
                      )}
                      onClick={() => {
                        setSelectedPriorities(prev =>
                          prev.includes(priority)
                            ? prev.filter(p => p !== priority)
                            : [...prev, priority]
                        )
                      }}
                    >
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignees
                </label>
                <div className="text-sm text-gray-500">
                  Select team members to filter by...
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Column Management Panel */}
      {showColumnManagement && (
        <div className="mx-2 mt-1 p-3 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Manage Columns</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowColumnManagement(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          
          {/* Add New Column */}
          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <div className="flex items-center gap-2 mb-2">
              <FloatingInput
                label="Column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="flex-1 h-8 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateColumn()}
              />
              <select
                value={newColumnColor}
                onChange={(e) => setNewColumnColor(e.target.value)}
                className="h-8 text-sm border rounded px-2"
              >
                <option value="#6B7280">Gray</option>
                <option value="#3B82F6">Blue</option>
                <option value="#10B981">Green</option>
                <option value="#F59E0B">Yellow</option>
                <option value="#EF4444">Red</option>
                <option value="#8B5CF6">Purple</option>
              </select>
              <button
                onClick={handleCreateColumn}
                disabled={!newColumnTitle.trim() || createColumnMutation.isLoading}
                className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors disabled:opacity-50"
                title="Add column"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Existing Columns */}
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <div
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: column.color }}
                />
                
                {editingColumn?.id === column.id ? (
                  <>
                    <FloatingInput
                      label="Column title"
                      value={editingColumn.title}
                      onChange={(e) => setEditingColumn({ ...editingColumn, title: e.target.value })}
                      className="flex-1 h-7 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateColumn(column.id, editingColumn.title, editingColumn.color)
                        }
                      }}
                      autoFocus
                    />
                    <select
                      value={editingColumn.color}
                      onChange={(e) => setEditingColumn({ ...editingColumn, color: e.target.value })}
                      className="h-7 text-sm border rounded px-1"
                    >
                      <option value="#6B7280">Gray</option>
                      <option value="#3B82F6">Blue</option>
                      <option value="#10B981">Green</option>
                      <option value="#F59E0B">Yellow</option>
                      <option value="#EF4444">Red</option>
                      <option value="#8B5CF6">Purple</option>
                    </select>
                    <button
                      onClick={() => handleUpdateColumn(column.id, editingColumn.title, editingColumn.color)}
                      className="w-8 h-8 bg-krushr-primary text-white rounded-md flex items-center justify-center hover:bg-krushr-primary/90 transition-colors"
                      title="Save changes"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingColumn(null)}
                      className="w-8 h-8 bg-krushr-gray-light text-krushr-gray-dark rounded-md flex items-center justify-center hover:bg-krushr-gray transition-colors"
                      title="Cancel"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{column.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {getTaskCount(column.id)} tasks
                    </Badge>
                    <button
                      onClick={() => setEditingColumn({ id: column.id, title: column.title, color: column.color })}
                      className="w-8 h-8 bg-krushr-gray-light text-krushr-gray-dark rounded-md flex items-center justify-center hover:bg-krushr-gray transition-colors"
                      title="Edit column"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      disabled={getTaskCount(column.id) > 0}
                      className="w-8 h-8 bg-krushr-secondary text-white rounded-md flex items-center justify-center hover:bg-krushr-secondary/90 transition-colors disabled:opacity-50"
                      title="Delete column"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 p-2 min-w-max h-full">
            <SortableContext
              items={columns.map(col => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <KanbanColumnComponent
                  key={column.id}
                  column={column}
                  tasks={tasksByColumn[column.id] || []}
                  taskCount={getTaskCount(column.id)}
                  onTaskClick={(taskId) => setSelectedTaskId(taskId)}
                  onAddTask={() => {
                    setSelectedColumnId(column.id)
                    setShowCreatePanel(true)
                  }}
                  bulkMode={bulkMode}
                  selectedTasks={selectedTasks}
                  onTaskSelect={toggleTaskSelection}
                  onEditColumn={() => setEditingColumn({ id: column.id, title: column.title, color: column.color })}
                  onDeleteColumn={() => handleDeleteColumn(column.id)}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal - Compact Utility-Focused Design */}
      <CompactTaskModal
        open={showCreatePanel}
        onClose={() => {
          setShowCreatePanel(false)
          setSelectedColumnId(null)
        }}
        workspaceId={kanban.workspaceId}
        kanbanId={kanban.id}
        kanbanColumnId={selectedColumnId || undefined}
        onSuccess={() => {
          refetchTasks()
          refetchKanban()
          setShowCreatePanel(false)
          setSelectedColumnId(null)
        }}
      />

      {/* Task Detail */}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={() => {
            refetchTasks()
            refetchKanban()
          }}
        />
      )}
    </div>
  )
}
