import React from 'react'
import { Button } from '../ui/button'
import { Plus, Grid3X3, List } from 'lucide-react'
import { ViewMode } from './types'

interface CalendarHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
      <div className="flex items-center gap-2">
        {/* View Mode Buttons */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('month')}
            className="h-8 px-3 text-sm rounded-md focus:ring-2 focus:ring-krushr-primary focus:outline-none"
            title="Month view"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Month
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'agenda' ? 'default' : 'ghost'}
            onClick={() => onViewModeChange('agenda')}
            className="h-8 px-3 text-sm rounded-md focus:ring-2 focus:ring-krushr-primary focus:outline-none"
            title="Agenda view"
          >
            <List className="w-4 h-4 mr-2" />
            Agenda
          </Button>
        </div>
        
        <Button 
          size="sm" 
          className="h-8 w-8 p-0 bg-krushr-primary hover:bg-krushr-primary/90 text-white rounded-lg focus:ring-2 focus:ring-krushr-primary focus:outline-none"
          title="Create new event"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}