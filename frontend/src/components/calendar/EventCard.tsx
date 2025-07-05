import React from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { CalendarIcon, MapPin, Users, MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { CalendarEvent } from './types'
import { formatDate, formatTime } from './utils'

interface EventCardProps {
  event: CalendarEvent
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "w-3 h-3 rounded-full",
              event.color === 'blue' && "bg-blue-500",
              event.color === 'green' && "bg-green-500",
              event.color === 'purple' && "bg-purple-500",
              event.color === 'orange' && "bg-orange-500",
              event.color === 'red' && "bg-red-500"
            )} />
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {event.title}
            </h4>
            <Badge variant="outline" className="text-xs">
              {event.type}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" />
              <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{event.location}</span>
              </div>
            )}
            
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span>{event.attendees.length} attendees</span>
              </div>
            )}
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-700 mt-2">
              {event.description}
            </p>
          )}
        </div>
        
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}