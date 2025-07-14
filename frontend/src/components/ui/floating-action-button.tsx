
import React from 'react'
import { Button } from './button'
import { Plus, MessageCircle, Calendar, FileText, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FloatingActionButtonProps {
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon?: 'plus' | 'message' | 'calendar' | 'note' | 'team'
  tooltip?: string
}

const iconMap = {
  plus: Plus,
  message: MessageCircle,
  calendar: Calendar,
  note: FileText,
  team: Users,
}

export default function FloatingActionButton({
  onClick,
  className,
  variant = 'primary',
  size = 'md',
  icon = 'plus',
  tooltip
}: FloatingActionButtonProps) {
  const IconComponent = iconMap[icon]
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  }
  
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-7 h-7'
  }
  
  const variantClasses = {
    primary: 'bg-krushr-secondary hover:bg-krushr-secondary/90 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-krushr-blue hover:bg-krushr-blue/90 text-white shadow-lg hover:shadow-xl'
  }

  return (
    <Button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 z-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      title={tooltip}
    >
      <IconComponent className={iconSizes[size]} />
    </Button>
  )
}