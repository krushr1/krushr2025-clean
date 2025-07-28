import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  CheckCircle2, Circle, Plus, X, ChevronDown, ChevronRight, 
  MoreVertical, Trash2, Edit2, GripVertical, Loader2, Check
} from 'lucide-react'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { toast } from 'sonner'
import { useConfetti } from '../../hooks/useConfetti'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TaskChecklistProps {
  taskId: string
  workspaceId: string
  onUpdate?: () => void
  className?: string
}

interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  position: number
}

interface Checklist {
  id: string
  title: string
  items: ChecklistItem[]
}

// Sortable item component
function SortableChecklistItem({ 
  item, 
  onToggle, 
  onUpdate, 
  onDelete,
  isDragging 
}: {
  item: ChecklistItem
  onToggle: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
  isDragging?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editText.trim() && editText !== item.text) {
      onUpdate(item.id, editText.trim())
    } else {
      setEditText(item.text)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(item.text)
      setIsEditing(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md transition-all",
        "hover:bg-krushr-gray-bg",
        isDragging && "opacity-50",
        item.completed && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 -ml-1"
      >
        <GripVertical className="w-3 h-3 text-krushr-gray" />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id)}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border-2 transition-all",
          "flex items-center justify-center",
          item.completed
            ? "bg-krushr-success border-krushr-success"
            : "border-krushr-gray-border hover:border-krushr-primary"
        )}
      >
        {item.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Item Text */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex-1 px-2 py-1 text-sm bg-white border border-krushr-primary",
            "rounded focus:outline-none focus:ring-2 focus:ring-krushr-primary"
          )}
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={cn(
            "flex-1 text-sm cursor-text px-2 py-1 rounded",
            "hover:bg-white hover:shadow-sm transition-all",
            item.completed && "line-through text-krushr-gray"
          )}
        >
          {item.text}
        </div>
      )}

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="h-6 w-6 p-0 hover:text-krushr-secondary"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}

// Main checklist component
export default function TaskChecklist({ 
  taskId, 
  workspaceId,
  onUpdate,
  className 
}: TaskChecklistProps) {
  const { triggerSubtleConfetti } = useConfetti()
  const [newChecklistTitle, setNewChecklistTitle] = useState('')
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string>>(new Set())
  const [showNewChecklist, setShowNewChecklist] = useState(false)
  const newChecklistRef = useRef<HTMLInputElement>(null)
  const utils = trpc.useContext()

  // Queries
  const { data: task, refetch } = trpc.task.get.useQuery(
    { id: taskId },
    { 
      enabled: !!taskId,
      select: (data) => ({
        checklists: data?.checklists || []
      })
    }
  )

  const checklists = task?.checklists || []

  // Mutations
  const createChecklistMutation = trpc.checklist.create.useMutation({
    onSuccess: () => {
      setNewChecklistTitle('')
      setShowNewChecklist(false)
      refetch()
      onUpdate?.()
      toast.success('Checklist created')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const updateChecklistMutation = trpc.checklist.update.useMutation({
    onSuccess: () => {
      refetch()
      onUpdate?.()
    }
  })

  const deleteChecklistMutation = trpc.checklist.delete.useMutation({
    onSuccess: () => {
      refetch()
      onUpdate?.()
      toast.success('Checklist deleted')
    }
  })

  const addItemMutation = trpc.checklist.addItem.useMutation({
    onSuccess: (_, variables) => {
      setNewItemTexts(prev => ({ ...prev, [variables.checklistId]: '' }))
      refetch()
      onUpdate?.()
    }
  })

  const updateItemMutation = trpc.checklist.updateItem.useMutation({
    onSuccess: () => {
      refetch()
      onUpdate?.()
    }
  })

  const deleteItemMutation = trpc.checklist.deleteItem.useMutation({
    onSuccess: () => {
      refetch()
      onUpdate?.()
    }
  })

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handlers
  const handleCreateChecklist = () => {
    if (newChecklistTitle.trim()) {
      createChecklistMutation.mutate({
        taskId,
        title: newChecklistTitle.trim()
      })
    }
  }

  const handleAddItem = (checklistId: string) => {
    const text = newItemTexts[checklistId]?.trim()
    if (text) {
      addItemMutation.mutate({
        checklistId,
        text
      })
    }
  }

  const handleToggleItem = (itemId: string, completed: boolean) => {
    updateItemMutation.mutate({
      id: itemId,
      completed: !completed
    })
  }

  const handleUpdateItem = (itemId: string, text: string) => {
    updateItemMutation.mutate({
      id: itemId,
      text
    })
  }

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate({ id: itemId })
  }

  const handleDragEnd = (event: DragEndEvent, items: ChecklistItem[]) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        // Update positions in backend
        newItems.forEach((item, index) => {
          if (item.position !== index) {
            updateItemMutation.mutate({
              id: item.id,
              position: index
            })
          }
        })
      }
    }
  }

  const toggleChecklist = (checklistId: string) => {
    setExpandedChecklists(prev => {
      const next = new Set(prev)
      if (next.has(checklistId)) {
        next.delete(checklistId)
      } else {
        next.add(checklistId)
      }
      return next
    })
  }

  // Calculate progress
  const calculateProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0
    const completed = items.filter(item => item.completed).length
    return Math.round((completed / items.length) * 100)
  }

  useEffect(() => {
    if (showNewChecklist && newChecklistRef.current) {
      newChecklistRef.current.focus()
    }
  }, [showNewChecklist])

  // Auto-expand first checklist if only one exists
  useEffect(() => {
    if (checklists.length === 1 && expandedChecklists.size === 0) {
      setExpandedChecklists(new Set([checklists[0].id]))
    }
  }, [checklists])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-krushr-gray-dark" />
          <h3 className="text-base font-medium text-krushr-gray-dark">Checklists</h3>
          {checklists.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {checklists.reduce((acc, cl) => acc + cl.items.filter(i => i.completed).length, 0)}/
              {checklists.reduce((acc, cl) => acc + cl.items.length, 0)}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewChecklist(true)}
          className="text-krushr-primary hover:text-krushr-primary hover:bg-krushr-primary/10"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Checklist
        </Button>
      </div>

      {/* New Checklist Form */}
      {showNewChecklist && (
        <div className="p-3 bg-krushr-gray-bg-light rounded-lg border border-krushr-gray-border">
          <FloatingInput
            ref={newChecklistRef}
            label="Checklist title"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreateChecklist()
              } else if (e.key === 'Escape') {
                setShowNewChecklist(false)
                setNewChecklistTitle('')
              }
            }}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateChecklist}
              disabled={!newChecklistTitle.trim() || createChecklistMutation.isLoading}
              className="bg-krushr-primary hover:bg-krushr-primary/90"
            >
              {createChecklistMutation.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create'
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowNewChecklist(false)
                setNewChecklistTitle('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Checklists */}
      <div className="space-y-3">
        {checklists.map((checklist) => {
          const isExpanded = expandedChecklists.has(checklist.id)
          const progress = calculateProgress(checklist.items)
          
          return (
            <div
              key={checklist.id}
              className={cn(
                "bg-white rounded-lg border transition-all",
                isExpanded ? "border-krushr-gray-border shadow-sm" : "border-krushr-gray-border"
              )}
            >
              {/* Checklist Header */}
              <div className="px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => toggleChecklist(checklist.id)}
                  className="flex-shrink-0 p-0.5 hover:bg-krushr-gray-bg rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-krushr-gray" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-krushr-gray" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-krushr-gray-dark truncate">
                    {checklist.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={progress} className="h-1.5 flex-1 max-w-[120px]" />
                    <span className="text-xs text-krushr-gray">
                      {checklist.items.filter(i => i.completed).length}/{checklist.items.length} completed
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        const newTitle = prompt('Rename checklist:', checklist.title)
                        if (newTitle && newTitle !== checklist.title) {
                          updateChecklistMutation.mutate({
                            id: checklist.id,
                            title: newTitle
                          })
                        }
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm('Delete this checklist? This action cannot be undone.')) {
                          deleteChecklistMutation.mutate({ id: checklist.id })
                        }
                      }}
                      className="text-krushr-secondary"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Checklist Items */}
              {isExpanded && (
                <div className="px-4 pb-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, checklist.items)}
                  >
                    <SortableContext
                      items={checklist.items.map(item => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {checklist.items.map((item) => (
                          <SortableChecklistItem
                            key={item.id}
                            item={item}
                            onToggle={(id) => handleToggleItem(id, item.completed)}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteItem}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add Item Form */}
                  <div className="mt-3 flex gap-2">
                    <FloatingInput
                      label="Add item"
                      value={newItemTexts[checklist.id] || ''}
                      onChange={(e) => setNewItemTexts(prev => ({
                        ...prev,
                        [checklist.id]: e.target.value
                      }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddItem(checklist.id)
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddItem(checklist.id)}
                      disabled={!newItemTexts[checklist.id]?.trim() || addItemMutation.isLoading}
                      className="text-krushr-primary hover:text-krushr-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {checklists.length === 0 && !showNewChecklist && (
        <div className="text-center py-8 text-krushr-gray">
          <Circle className="w-12 h-12 mx-auto mb-3 text-krushr-gray-light" />
          <p className="text-sm">No checklists yet</p>
          <p className="text-xs mt-1">Create a checklist to track subtasks</p>
        </div>
      )}
    </div>
  )
}