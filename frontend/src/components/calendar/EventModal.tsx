import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { FloatingInput } from '../ui/floating-input'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  Users,
  AlertCircle,
  CheckCircle2,
  Zap,
  X
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'

interface EventModalProps {
  open: boolean
  onClose: () => void
  onEventCreated?: () => void
  workspaceId: string
  selectedDate?: Date | null
  event?: any // For editing existing events
  isEditMode?: boolean
}

const EVENT_TYPES = [
  { value: 'MEETING', label: 'Meeting', icon: Users },
  { value: 'TASK', label: 'Task', icon: CheckCircle2 },
  { value: 'REMINDER', label: 'Reminder', icon: AlertCircle },
  { value: 'EVENT', label: 'Event', icon: CalendarIcon },
  { value: 'DEADLINE', label: 'Deadline', icon: Zap },
  { value: 'MILESTONE', label: 'Milestone', icon: CheckCircle2 }
] as const

const EVENT_PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' }
] as const

const EVENT_COLORS = [
  { value: 'blue', label: 'Blue', preview: 'bg-blue-500' },
  { value: 'green', label: 'Green', preview: 'bg-green-500' },
  { value: 'purple', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', preview: 'bg-orange-500' },
  { value: 'red', label: 'Red', preview: 'bg-red-500' }
] as const

export default function EventModal({ 
  open, 
  onClose, 
  onEventCreated,
  workspaceId,
  selectedDate,
  event,
  isEditMode = false
}: EventModalProps) {
  // Form state
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [startTime, setStartTime] = useState(
    event?.startTime ? format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm") :
    selectedDate ? format(selectedDate, "yyyy-MM-dd'T'09:00") :
    format(new Date(), "yyyy-MM-dd'T'09:00")
  )
  const [endTime, setEndTime] = useState(
    event?.endTime ? format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm") :
    selectedDate ? format(selectedDate, "yyyy-MM-dd'T'10:00") :
    format(new Date(), "yyyy-MM-dd'T'10:00")
  )
  const [allDay, setAllDay] = useState(event?.allDay || false)
  const [location, setLocation] = useState(event?.location || '')
  const [type, setType] = useState(event?.type || 'EVENT')
  const [priority, setPriority] = useState(event?.priority || 'MEDIUM')
  const [color, setColor] = useState(event?.color || 'blue')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (open && !isEditMode) {
      setTitle('')
      setDescription('')
      setLocation('')
      setType('EVENT')
      setPriority('MEDIUM')
      setColor('blue')
      setAllDay(false)
      
      if (selectedDate) {
        setStartTime(format(selectedDate, "yyyy-MM-dd'T'09:00"))
        setEndTime(format(selectedDate, "yyyy-MM-dd'T'10:00"))
      }
    }
  }, [open, isEditMode, selectedDate])

  // Mutations
  const createEventMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      onEventCreated?.()
      onClose()
    },
    onError: (error) => {
      console.error('Failed to create event:', error)
    }
  })

  const updateEventMutation = trpc.calendar.update.useMutation({
    onSuccess: () => {
      onEventCreated?.()
      onClose()
    },
    onError: (error) => {
      console.error('Failed to update event:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    setIsLoading(true)

    try {
      const eventData = {
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        allDay,
        location: location.trim() || undefined,
        type: type as any,
        priority: priority as any,
        color,
        status: 'CONFIRMED' as const,
        workspaceId
      }

      if (isEditMode && event) {
        await updateEventMutation.mutateAsync({
          id: event.id,
          ...eventData
        })
      } else {
        await createEventMutation.mutateAsync(eventData)
      }
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <CalendarIcon className="w-5 h-5 text-krushr-primary" />
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <FloatingInput
              label="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="text-lg font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <FloatingInput
              label="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? startTime.split('T')[0] : startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-krushr-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? endTime.split('T')[0] : endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-krushr-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-gray-300 text-krushr-primary focus:ring-krushr-primary"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
              All day event
            </label>
          </div>

          {/* Location */}
          <div>
            <FloatingInput
              label="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              icon={MapPin}
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Event Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map((eventType) => {
                const IconComponent = eventType.icon
                return (
                  <button
                    key={eventType.value}
                    type="button"
                    onClick={() => setType(eventType.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                      type === eventType.value
                        ? "border-krushr-primary bg-krushr-primary/5 text-krushr-primary"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-xs font-medium">{eventType.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_PRIORITIES.map((priorityOption) => (
                  <button
                    key={priorityOption.value}
                    type="button"
                    onClick={() => setPriority(priorityOption.value)}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all text-center",
                      priority === priorityOption.value
                        ? "border-krushr-primary bg-krushr-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Badge className={cn("text-xs", priorityOption.color)}>
                      {priorityOption.label}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color
              </label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      colorOption.preview,
                      color === colorOption.value
                        ? "border-gray-900 ring-2 ring-gray-300"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={!title.trim() || isLoading}
              className="bg-krushr-primary hover:bg-krushr-primary/90"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}