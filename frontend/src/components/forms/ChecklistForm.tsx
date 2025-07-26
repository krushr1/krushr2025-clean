import React, { useState, useRef, useEffect } from 'react'
import { 
  CheckCircle2, Circle, Plus, X, ChevronDown, ChevronRight, 
  MoreVertical, Trash2, Edit2, GripVertical, Loader2, Check,
  ListChecks, Sparkles, Target, AlertCircle
} from 'lucide-react'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { FloatingTextarea } from '../ui/floating-textarea'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Switch } from '../ui/switch'
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

interface ChecklistFormProps {
  workspaceId: string
  taskId?: string
  projectId?: string
  onSuccess?: (checklist: any) => void
  onClose?: () => void
  mode?: 'create' | 'quick' | 'template'
  className?: string
}

interface ChecklistTemplate {
  id: string
  name: string
  icon: React.ReactNode
  items: string[]
  category: string
}

// Pre-defined checklist templates
const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'task-breakdown',
    name: 'Task Breakdown',
    icon: <ListChecks className="w-4 h-4" />,
    category: 'Planning',
    items: [
      'Define clear objectives',
      'Break down into subtasks',
      'Estimate time for each step',
      'Identify dependencies',
      'Assign responsibilities',
      'Set milestones'
    ]
  },
  {
    id: 'code-review',
    name: 'Code Review',
    icon: <Target className="w-4 h-4" />,
    category: 'Development',
    items: [
      'Check code functionality',
      'Review code style and conventions',
      'Test edge cases',
      'Verify documentation',
      'Check for security issues',
      'Confirm tests pass'
    ]
  },
  {
    id: 'deployment',
    name: 'Deployment',
    icon: <Sparkles className="w-4 h-4" />,
    category: 'DevOps',
    items: [
      'Run all tests',
      'Update version number',
      'Build production bundle',
      'Backup database',
      'Deploy to staging',
      'Verify staging',
      'Deploy to production',
      'Monitor for issues'
    ]
  },
  {
    id: 'meeting-prep',
    name: 'Meeting Preparation',
    icon: <AlertCircle className="w-4 h-4" />,
    category: 'Communication',
    items: [
      'Define meeting agenda',
      'Send calendar invites',
      'Prepare presentation materials',
      'Review previous meeting notes',
      'List discussion points',
      'Prepare questions'
    ]
  }
]

export default function ChecklistForm({
  workspaceId,
  taskId,
  projectId,
  onSuccess,
  onClose,
  mode = 'create',
  className
}: ChecklistFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<string[]>([''])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [showTemplates, setShowTemplates] = useState(mode === 'template')
  const [isCreating, setIsCreating] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  // Mutations
  const createChecklistMutation = trpc.checklist.create.useMutation({
    onSuccess: (data) => {
      toast.success('Checklist created successfully')
      onSuccess?.(data)
      onClose?.()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const addItemsMutation = trpc.checklist.addItem.useMutation()

  // Focus title input on mount
  useEffect(() => {
    if (titleRef.current && mode !== 'template') {
      titleRef.current.focus()
    }
  }, [mode])

  // Handle template selection
  const handleTemplateSelect = (template: ChecklistTemplate) => {
    setSelectedTemplate(template.id)
    setTitle(template.name)
    setItems(template.items)
    setShowTemplates(false)
    setTimeout(() => titleRef.current?.focus(), 100)
  }

  // Handle adding new item
  const handleAddItem = () => {
    setItems([...items, ''])
  }

  // Handle removing item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Handle updating item
  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a checklist title')
      return
    }

    if (!taskId && mode !== 'quick') {
      toast.error('Task ID is required')
      return
    }

    const validItems = items.filter(item => item.trim())
    if (validItems.length === 0) {
      toast.error('Please add at least one checklist item')
      return
    }

    setIsCreating(true)
    try {
      // Create checklist
      const checklist = await createChecklistMutation.mutateAsync({
        title: title.trim(),
        taskId: taskId!,
        description: description.trim() || undefined
      })

      // Add items
      for (const item of validItems) {
        await addItemsMutation.mutateAsync({
          checklistId: checklist.id,
          text: item.trim()
        })
      }

      // Success handled by mutation onSuccess
    } catch (error) {
      // Error handled by mutation onError
    } finally {
      setIsCreating(false)
    }
  }

  // Quick mode - minimal UI
  if (mode === 'quick') {
    return (
      <Card className={cn("p-4", className)}>
        <div className="space-y-3">
          <FloatingInput
            ref={titleRef}
            label="Checklist title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (items[0]) {
                  handleAddItem()
                }
              }
            }}
          />
          
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <FloatingInput
                  label={`Item ${index + 1}`}
                  value={item}
                  onChange={(e) => handleUpdateItem(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (index === items.length - 1) {
                        handleAddItem()
                      }
                    }
                  }}
                  className="flex-1"
                />
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="h-9 w-9 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Full form mode
  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-krushr-primary/10 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-krushr-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-krushr-gray-dark">
              Create Checklist
            </h2>
            <p className="text-sm text-krushr-gray">
              Organize tasks with a structured checklist
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Template Selection */}
      {showTemplates && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-krushr-gray-dark mb-3">
            Start with a template
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {CHECKLIST_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  "hover:border-krushr-primary hover:shadow-sm",
                  selectedTemplate === template.id
                    ? "border-krushr-primary bg-krushr-primary/5"
                    : "border-krushr-gray-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-krushr-gray-bg rounded flex items-center justify-center flex-shrink-0">
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-krushr-gray-dark">
                      {template.name}
                    </h4>
                    <p className="text-xs text-krushr-gray mt-0.5">
                      {template.items.length} items • {template.category}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(false)}
            >
              Start from scratch
            </Button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      {!showTemplates && (
        <div className="space-y-6">
          {/* Title */}
          <div>
            <FloatingInput
              ref={titleRef}
              label="Checklist title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <FloatingTextarea
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Checklist Items */}
          <div>
            <label className="text-sm font-medium text-krushr-gray-dark mb-3 block">
              Checklist Items
            </label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <div className="w-5 h-5 rounded border-2 border-krushr-gray-border flex items-center justify-center">
                    <span className="text-xs text-krushr-gray">{index + 1}</span>
                  </div>
                  <FloatingInput
                    label={`Item ${index + 1}`}
                    value={item}
                    onChange={(e) => handleUpdateItem(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (index === items.length - 1 && item.trim()) {
                          handleAddItem()
                          // Focus next input after adding
                          setTimeout(() => {
                            const inputs = document.querySelectorAll('input[type="text"]')
                            const nextInput = inputs[inputs.length - 1] as HTMLInputElement
                            nextInput?.focus()
                          }, 100)
                        }
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className={cn(
                      "h-9 w-9 p-0 transition-opacity",
                      items.length > 1
                        ? "opacity-0 group-hover:opacity-100"
                        : "opacity-0 pointer-events-none"
                    )}
                  >
                    <X className="w-4 h-4 text-krushr-secondary" />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add item
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="bg-krushr-gray-bg-light rounded-lg p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-krushr-gray-dark">
                Private checklist
              </span>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                className="data-[state=checked]:bg-krushr-primary"
              />
            </label>
            <p className="text-xs text-krushr-gray mt-1">
              Only visible to you and workspace admins
            </p>
          </div>

          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="bg-krushr-primary/5 border border-krushr-primary/20 rounded-lg p-3">
              <p className="text-sm text-krushr-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Based on "{CHECKLIST_TEMPLATES.find(t => t.id === selectedTemplate)?.name}" template
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || items.filter(i => i.trim()).length === 0 || isCreating}
              className="min-w-[120px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Checklist
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}