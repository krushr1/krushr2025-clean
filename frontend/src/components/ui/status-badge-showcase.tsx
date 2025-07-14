
import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from './card'
import { Button } from './button'
import { EnhancedStatusBadge, GradientStatusBadge, DotMatrixStatusBadge, MinimalStatusBadge } from './enhanced-status-badges'
import { TaskStatus } from '../../types/enums'
import { cn } from '../../lib/utils'

export const EnhancedTaskCard = ({ 
  title, 
  description, 
  status, 
  badgeVariant = 'gradient' 
}: {
  title: string
  description: string
  status: TaskStatus
  badgeVariant?: 'gradient' | 'dot-matrix' | 'minimal'
}) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-krushr-primary cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium font-manrope text-krushr-gray-dark">
            {title}
          </CardTitle>
          <EnhancedStatusBadge 
            status={status} 
            variant={badgeVariant}
            size="sm"
            className="flex-shrink-0"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-krushr-gray-600 font-manrope leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export const EnhancedStatusSelector = ({ 
  currentStatus, 
  onStatusChange,
  variant = 'gradient'
}: {
  currentStatus: TaskStatus
  onStatusChange: (status: TaskStatus) => void
  variant?: 'gradient' | 'dot-matrix' | 'minimal'
}) => {
  const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE]
  
  return (
    <div className="flex items-center gap-2 p-3 bg-krushr-gray-bg rounded-lg">
      <span className="text-sm font-medium text-krushr-gray-dark font-manrope mr-2">
        Status:
      </span>
      <div className="flex gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              "transition-all duration-200",
              currentStatus === status 
                ? "ring-2 ring-krushr-primary ring-offset-2" 
                : "hover:scale-105"
            )}
          >
            <EnhancedStatusBadge 
              status={status} 
              variant={variant}
              size="sm"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export const EnhancedKanbanColumnHeader = ({ 
  title, 
  count, 
  status,
  badgeVariant = 'minimal' 
}: {
  title: string
  count: number
  status: TaskStatus
  badgeVariant?: 'gradient' | 'dot-matrix' | 'minimal'
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-krushr-gray-border">
      <div className="flex items-center gap-3">
        <EnhancedStatusBadge 
          status={status} 
          variant={badgeVariant}
          size="md"
        />
        <div>
          <h3 className="font-semibold text-krushr-gray-dark font-manrope">
            {title}
          </h3>
          <span className="text-sm text-krushr-gray-light font-manrope">
            {count} tasks
          </span>
        </div>
      </div>
    </div>
  )
}

export const StatusBadgeShowcase = () => {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [selectedVariant, setSelectedVariant] = useState<'gradient' | 'dot-matrix' | 'minimal'>('gradient')
  
  const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE]
  const variants = ['gradient', 'dot-matrix', 'minimal'] as const
  
  return (
    <div className="space-y-8 p-6 bg-krushr-gray-bg-light min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-krushr-gray-dark font-manrope mb-2">
            Enhanced Status Badge System
          </h1>
          <p className="text-krushr-gray-600 font-manrope">
            Three new variations aligned with Krushr brandkit design system
          </p>
        </div>
        
        {/* Variant Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badge Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              {variants.map((variant) => (
                <Button
                  key={variant}
                  variant={selectedVariant === variant ? 'default' : 'outline'}
                  onClick={() => setSelectedVariant(variant)}
                  className="capitalize"
                >
                  {variant.replace('-', ' ')}
                </Button>
              ))}
            </div>
            
            {/* Show all statuses in selected variant */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statuses.map((status) => (
                <div key={status} className="text-center p-4 bg-white rounded-lg border">
                  <EnhancedStatusBadge 
                    status={status} 
                    variant={selectedVariant}
                    size="md"
                    className="mb-2"
                  />
                  <p className="text-sm text-krushr-gray-600 font-manrope">
                    {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Integration Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Card Example */}
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Task Cards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedTaskCard
                title="Implement new dashboard design"
                description="Create responsive dashboard layout with drag-and-drop panels and real-time updates."
                status={TaskStatus.IN_PROGRESS}
                badgeVariant={selectedVariant}
              />
              <EnhancedTaskCard
                title="Fix authentication bug"
                description="Resolve session timeout issue affecting mobile users during login flow."
                status={TaskStatus.REVIEW}
                badgeVariant={selectedVariant}
              />
            </CardContent>
          </Card>
          
          {/* Status Selector Example */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Status Selector</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedStatusSelector
                currentStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                variant={selectedVariant}
              />
              <p className="text-sm text-krushr-gray-600 mt-4 font-manrope">
                Selected: <strong>{selectedStatus.replace('_', ' ')}</strong>
              </p>
            </CardContent>
          </Card>
          
          {/* Kanban Column Example */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Kanban Column Headers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <EnhancedKanbanColumnHeader
                  title="To Do"
                  count={5}
                  status={TaskStatus.TODO}
                  badgeVariant={selectedVariant}
                />
                <EnhancedKanbanColumnHeader
                  title="In Progress"
                  count={3}
                  status={TaskStatus.IN_PROGRESS}
                  badgeVariant={selectedVariant}
                />
                <EnhancedKanbanColumnHeader
                  title="Review"
                  count={2}
                  status={TaskStatus.REVIEW}
                  badgeVariant={selectedVariant}
                />
                <EnhancedKanbanColumnHeader
                  title="Done"
                  count={8}
                  status={TaskStatus.DONE}
                  badgeVariant={selectedVariant}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Size Variations */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <GradientStatusBadge status={TaskStatus.IN_PROGRESS} size="sm" />
                <p className="text-xs text-krushr-gray-500 mt-2 font-manrope">Small</p>
              </div>
              <div className="text-center">
                <GradientStatusBadge status={TaskStatus.IN_PROGRESS} size="md" />
                <p className="text-xs text-krushr-gray-500 mt-2 font-manrope">Medium</p>
              </div>
              <div className="text-center">
                <GradientStatusBadge status={TaskStatus.IN_PROGRESS} size="lg" />
                <p className="text-xs text-krushr-gray-500 mt-2 font-manrope">Large</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StatusBadgeShowcase