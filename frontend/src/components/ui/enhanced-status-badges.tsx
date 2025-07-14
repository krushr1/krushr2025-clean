
import React from 'react'
import { 
  Circle, 
  AlertCircle, 
  Eye, 
  CheckCircle2,
  Clock,
  Zap,
  Target
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { TaskStatus } from '../../types/enums'

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
  variant?: 'gradient' | 'dot-matrix' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
}

export const GradientStatusBadge = ({ status, className, size = 'md' }: StatusBadgeProps) => {
  const statusConfig = {
    [TaskStatus.TODO]: {
      gradient: 'bg-gradient-to-r from-krushr-gray-100 to-krushr-gray-200',
      textColor: 'text-krushr-gray-700',
      borderColor: 'border-krushr-gray-300',
      icon: Circle,
      label: 'To Do'
    },
    [TaskStatus.IN_PROGRESS]: {
      gradient: 'bg-gradient-to-r from-krushr-primary-100 to-krushr-info-100',
      textColor: 'text-krushr-primary-700',
      borderColor: 'border-krushr-primary-300',
      icon: Clock,
      label: 'In Progress'
    },
    [TaskStatus.REVIEW]: {
      gradient: 'bg-gradient-to-r from-krushr-purple-100 to-krushr-warning-100',
      textColor: 'text-krushr-purple-700',
      borderColor: 'border-krushr-purple-300',
      icon: Eye,
      label: 'Review'
    },
    [TaskStatus.DONE]: {
      gradient: 'bg-gradient-to-r from-krushr-success-100 to-krushr-success-200',
      textColor: 'text-krushr-success-700',
      borderColor: 'border-krushr-success-300',
      icon: CheckCircle2,
      label: 'Done'
    }
  }
  
  const config = statusConfig[status]
  const IconComponent = config.icon
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5', 
    lg: 'px-4 py-2 text-base gap-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }
  
  return (
    <div className={cn(
      "inline-flex items-center rounded-lg font-medium font-manrope",
      "border shadow-sm transition-all duration-200",
      "hover:shadow-md hover:scale-105 cursor-pointer",
      "backdrop-blur-sm",
      config.gradient,
      config.textColor,
      config.borderColor,
      sizeClasses[size],
      className
    )}>
      <IconComponent className={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  )
}

export const DotMatrixStatusBadge = ({ status, className, size = 'md' }: StatusBadgeProps) => {
  const getStatusLevel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 1
      case TaskStatus.IN_PROGRESS: return 2
      case TaskStatus.REVIEW: return 3
      case TaskStatus.DONE: return 4
      default: return 0
    }
  }
  
  const statusLevel = getStatusLevel(status)
  const statusColors = {
    1: 'bg-krushr-gray-400',
    2: 'bg-krushr-primary',
    3: 'bg-krushr-warning',
    4: 'bg-krushr-success'
  }
  
  const statusLabels = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.REVIEW]: 'Review',
    [TaskStatus.DONE]: 'Done'
  }
  
  const sizeClasses = {
    sm: 'gap-1.5 text-xs',
    md: 'gap-2 text-sm',
    lg: 'gap-2.5 text-base'
  }
  
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }
  
  return (
    <div className={cn("flex items-center font-manrope", sizeClasses[size], className)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "rounded-full transition-all duration-300 border",
              dotSizes[size],
              level <= statusLevel 
                ? cn(
                    statusColors[level as keyof typeof statusColors],
                    "border-white shadow-sm"
                  )
                : "bg-krushr-gray-100 border-krushr-gray-300",
              level === statusLevel && "ring-2 ring-offset-1 ring-current scale-110"
            )}
          />
        ))}
      </div>
      <span className="font-medium text-krushr-gray-700">
        {statusLabels[status]}
      </span>
    </div>
  )
}

export const MinimalStatusBadge = ({ status, className, size = 'md' }: StatusBadgeProps) => {
  const statusConfig = {
    [TaskStatus.TODO]: {
      bgColor: 'bg-krushr-gray-100 hover:bg-krushr-gray-200',
      textColor: 'text-krushr-gray-600',
      icon: Circle,
      tooltip: 'To Do'
    },
    [TaskStatus.IN_PROGRESS]: {
      bgColor: 'bg-krushr-primary-100 hover:bg-krushr-primary-200',
      textColor: 'text-krushr-primary-600',
      icon: Zap,
      tooltip: 'In Progress'
    },
    [TaskStatus.REVIEW]: {
      bgColor: 'bg-krushr-warning-100 hover:bg-krushr-warning-200',
      textColor: 'text-krushr-warning-600',
      icon: Target,
      tooltip: 'Review'
    },
    [TaskStatus.DONE]: {
      bgColor: 'bg-krushr-success-100 hover:bg-krushr-success-200',
      textColor: 'text-krushr-success-600',
      icon: CheckCircle2,
      tooltip: 'Done'
    }
  }
  
  const config = statusConfig[status]
  const IconComponent = config.icon
  
  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  }
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }
  
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-lg",
        "transition-all duration-200 cursor-pointer",
        "hover:shadow-sm hover:scale-110",
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
      title={config.tooltip}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  )
}

export const EnhancedStatusBadge = ({ 
  status, 
  className, 
  variant = 'gradient',
  size = 'md' 
}: StatusBadgeProps) => {
  switch (variant) {
    case 'gradient':
      return <GradientStatusBadge status={status} className={className} size={size} />
    case 'dot-matrix':
      return <DotMatrixStatusBadge status={status} className={className} size={size} />
    case 'minimal':
      return <MinimalStatusBadge status={status} className={className} size={size} />
    default:
      return <GradientStatusBadge status={status} className={className} size={size} />
  }
}

export default EnhancedStatusBadge