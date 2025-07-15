import React, { useState, useMemo } from 'react'
import { 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Zap,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Phone,
  Video,
  Building,
  Coffee,
  Target,
  TrendingUp,
  FileText,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, isToday, isTomorrow, isYesterday } from 'date-fns'
import { formatDateShort } from '../../../../shared/utils'

interface AgendaViewProps {
  workspaceId: string
  className?: string
}

interface AgendaItem {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  type: 'meeting' | 'task' | 'deadline' | 'call' | 'review' | 'planning'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  attendees?: string[]
  tags?: string[]
  notes?: string
}

const SAMPLE_AGENDA_DATA: AgendaItem[] = [
  {
    id: '1',
    title: 'Leadership Team Sync',
    description: 'Weekly leadership alignment - Q4 priorities, resource allocation, blockers',
    startTime: new Date(2025, 6, 4, 9, 0), // July 4, 2025, 9:00 AM
    endTime: new Date(2025, 6, 4, 10, 0),
    location: 'Executive Conference Room',
    type: 'meeting',
    priority: 'high',
    status: 'confirmed',
    attendees: ['Sarah Chen', 'Mike Rodriguez', 'David Kim'],
    tags: ['strategy', 'leadership'],
    notes: 'Focus on API performance metrics and mobile release timeline'
  },
  {
    id: '2',
    title: 'Review Sprint 23 Deliverables',
    description: 'Final review of authentication system and user onboarding flow',
    startTime: new Date(2025, 6, 4, 11, 30),
    endTime: new Date(2025, 6, 4, 12, 30),
    type: 'review',
    priority: 'high',
    status: 'confirmed',
    attendees: ['Engineering Team', 'QA Team'],
    tags: ['sprint-review', 'deliverables'],
    notes: 'Security audit results due. Check penetration testing report.'
  },
  {
    id: '3',
    title: 'Client Check-in: TechCorp Integration',
    description: 'Progress update on API integration, timeline confirmation',
    startTime: new Date(2025, 6, 4, 14, 0),
    endTime: new Date(2025, 6, 4, 15, 0),
    location: 'Zoom',
    type: 'call',
    priority: 'critical',
    status: 'confirmed',
    attendees: ['Jennifer Walsh (TechCorp)', 'Alex Thompson'],
    tags: ['client', 'integration'],
    notes: '$2.3M contract. Address their concerns about data migration timeline.'
  },
  {
    id: '4',
    title: 'Finalize Q4 Budget Proposal',
    description: 'Complete budget analysis for additional engineering headcount',
    startTime: new Date(2025, 6, 4, 16, 30),
    endTime: new Date(2025, 6, 4, 17, 30),
    type: 'task',
    priority: 'high',
    status: 'pending',
    tags: ['budget', 'planning'],
    notes: 'Include ROI projections for 3 senior engineers. CFO meeting Monday.'
  },

  {
    id: '5',
    title: 'Architecture Review Board',
    description: 'Microservices migration proposal - security, scalability, timeline',
    startTime: new Date(2025, 6, 5, 10, 0),
    endTime: new Date(2025, 6, 5, 11, 30),
    location: 'Tech Hub - Room 401',
    type: 'meeting',
    priority: 'critical',
    status: 'confirmed',
    attendees: ['CTO', 'Senior Architects', 'Security Team'],
    tags: ['architecture', 'migration'],
    notes: 'Present 6-month migration plan. Emphasize zero-downtime approach.'
  },
  {
    id: '6',
    title: 'All-Hands Presentation Prep',
    description: 'Rehearse quarterly results presentation - focus on team achievements',
    startTime: new Date(2025, 6, 5, 13, 0),
    endTime: new Date(2025, 6, 5, 14, 0),
    type: 'planning',
    priority: 'medium',
    status: 'confirmed',
    tags: ['presentation', 'all-hands'],
    notes: 'Highlight 40% performance improvement and 99.7% uptime achievement'
  },
  {
    id: '7',
    title: 'Vendor Evaluation: Cloud Infrastructure',
    description: 'Final decision on AWS vs Azure for new regions',
    startTime: new Date(2025, 6, 5, 15, 30),
    endTime: new Date(2025, 6, 5, 16, 30),
    type: 'meeting',
    priority: 'high',
    status: 'confirmed',
    attendees: ['DevOps Lead', 'Finance', 'Procurement'],
    tags: ['vendor', 'infrastructure'],
    notes: 'Cost analysis complete. AWS 23% more cost-effective for our use case.'
  },

  {
    id: '8',
    title: 'Product Roadmap Review',
    description: 'H1 2026 feature prioritization with product and design teams',
    startTime: new Date(2025, 6, 6, 9, 30),
    endTime: new Date(2025, 6, 6, 11, 0),
    location: 'Product Suite',
    type: 'planning',
    priority: 'high',
    status: 'confirmed',
    attendees: ['Product Team', 'Design Team', 'Engineering Leads'],
    tags: ['roadmap', 'planning'],
    notes: 'Focus on AI features and mobile-first initiatives'
  },
  {
    id: '9',
    title: 'Security Incident Response Drill',
    description: 'Quarterly security simulation - test response procedures',
    startTime: new Date(2025, 6, 6, 14, 0),
    endTime: new Date(2025, 6, 6, 15, 30),
    type: 'task',
    priority: 'medium',
    status: 'confirmed',
    attendees: ['Security Team', 'DevOps', 'On-call Engineers'],
    tags: ['security', 'drill'],
    notes: 'Simulating data breach scenario. Update runbooks based on results.'
  },
  {
    id: '10',
    title: 'Performance Review: Senior Engineers',
    description: 'Quarterly performance discussions and career development planning',
    startTime: new Date(2025, 6, 6, 16, 0),
    endTime: new Date(2025, 6, 6, 17, 30),
    type: 'meeting',
    priority: 'high',
    status: 'confirmed',
    tags: ['performance', 'career-development'],
    notes: 'Promotion recommendations due. Focus on growth paths and compensation.'
  }
]

const TYPE_ICONS = {
  meeting: Users,
  task: CheckCircle2,
  deadline: Zap,
  call: Phone,
  review: FileText,
  planning: Target
}

const PRIORITY_COLORS = {
  low: 'bg-gray-400',
  medium: 'bg-krushr-priority-medium',
  high: 'bg-krushr-priority-high',
  critical: 'bg-krushr-priority-critical'
}

const STATUS_COLORS = {
  pending: 'border-gray-300 bg-gray-50',
  confirmed: 'border-krushr-primary/20 bg-krushr-primary/5',
  completed: 'border-krushr-success/20 bg-krushr-success/5',
  cancelled: 'border-red-300 bg-red-50'
}

export default function AgendaView({ workspaceId, className }: AgendaViewProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set(['today']))
  const [selectedItem, setSelectedItem] = useState<AgendaItem | null>(null)

  const groupedAgenda = useMemo(() => {
    const today = new Date()
    const tomorrow = addDays(today, 1)
    const dayAfter = addDays(today, 2)

    const groups = [
      {
        key: 'today',
        label: 'Today',
        date: today,
        items: SAMPLE_AGENDA_DATA.filter(item => isSameDay(item.startTime, today))
      },
      {
        key: 'tomorrow',
        label: `Tomorrow (${formatDateShort(tomorrow)})`,
        date: tomorrow,
        items: SAMPLE_AGENDA_DATA.filter(item => isSameDay(item.startTime, tomorrow))
      },
      {
        key: 'dayafter',
        label: formatDateShort(dayAfter),
        date: dayAfter,
        items: SAMPLE_AGENDA_DATA.filter(item => isSameDay(item.startTime, dayAfter))
      }
    ]

    return groups.filter(group => group.items.length > 0)
  }, [])

  const toggleDayExpansion = (dayKey: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey)
    } else {
      newExpanded.add(dayKey)
    }
    setExpandedDays(newExpanded)
  }

  const getTimeString = (startTime: Date, endTime: Date) => {
    return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`
  }

  const getDayStats = (items: AgendaItem[]) => {
    const meetings = items.filter(item => item.type === 'meeting' || item.type === 'call').length
    const tasks = items.filter(item => item.type === 'task' || item.type === 'review').length
    const critical = items.filter(item => item.priority === 'critical').length
    
    return { meetings, tasks, critical }
  }

  return (
    <div className={cn("flex h-full bg-white", className)}>
      {/* Main Agenda List */}
      <div className="flex-1 flex flex-col">
        <div className="px-3 py-1.5 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900 font-manrope">
            Executive Agenda
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groupedAgenda.map(group => {
            const isExpanded = expandedDays.has(group.key)
            const stats = getDayStats(group.items)
            const isToday = isSameDay(group.date, new Date())

            return (
              <div key={group.key} className="border-b border-gray-100/50">
                <button
                  onClick={() => toggleDayExpansion(group.key)}
                  className={cn(
                    "w-full px-3 py-1.5 flex items-center justify-between hover:bg-gray-50 transition-colors",
                    isToday && "bg-krushr-primary/5"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-400" />
                    )}
                    <h3 className={cn(
                      "font-medium text-xs font-manrope",
                      isToday ? "text-krushr-primary" : "text-gray-900"
                    )}>
                      {group.label} ({group.items.length})
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {stats.critical > 0 && (
                      <Badge variant="destructive" className="text-xs px-1 py-0 h-3.5 text-xs">
                        {stats.critical}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 font-manrope">
                      {stats.meetings}m • {stats.tasks}t
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-1">
                    <div className="space-y-0.5">
                      {group.items.map(item => {
                        const IconComponent = TYPE_ICONS[item.type]
                        const priorityColor = PRIORITY_COLORS[item.priority]

                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "border-l-2 pl-2 py-1 cursor-pointer hover:bg-gray-50 transition-colors rounded-r text-xs",
                              item.priority === 'critical' && "border-l-krushr-priority-critical bg-red-50/30",
                              item.priority === 'high' && "border-l-krushr-priority-high bg-orange-50/30",
                              item.priority === 'medium' && "border-l-krushr-priority-medium bg-yellow-50/30",
                              item.priority === 'low' && "border-l-gray-400 bg-gray-50/30"
                            )}
                            onClick={() => setSelectedItem(item)}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <IconComponent className="w-2.5 h-2.5 text-krushr-primary flex-shrink-0" />
                              <div className={cn("w-1 h-1 rounded-full flex-shrink-0", priorityColor)} />
                              <h4 className="font-medium text-xs text-gray-900 font-manrope truncate flex-1">{item.title}</h4>
                              <div className="flex items-center gap-0.5 text-xs text-gray-500 font-manrope">
                                <Clock className="w-2.5 h-2.5" />
                                {format(item.startTime, 'h:mm a')}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-600 pl-4">
                              <div className="flex items-center gap-1.5 truncate">
                                {item.location && (
                                  <div className="flex items-center gap-0.5">
                                    {item.location.includes('Zoom') || item.location.includes('Teams') ? (
                                      <Video className="w-2.5 h-2.5" />
                                    ) : (
                                      <MapPin className="w-2.5 h-2.5" />
                                    )}
                                    <span className="truncate text-xs">{item.location}</span>
                                  </div>
                                )}
                                {item.attendees && item.attendees.length > 0 && (
                                  <div className="flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5" />
                                    <span className="text-xs">{item.attendees.length}</span>
                                  </div>
                                )}
                              </div>
                              
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-0.5">
                                  {item.tags.slice(0, 1).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0 h-3.5">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {item.tags.length > 1 && (
                                    <span className="text-xs text-gray-400">+{item.tags.length - 1}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Details Sidebar */}
      {selectedItem && (
        <div className="w-72 border-l border-gray-200 bg-gray-50">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-900 font-manrope">Details</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedItem(null)}
                className="p-1 h-5 w-5"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-1 font-manrope">{selectedItem.title}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {selectedItem.type}
                  </Badge>
                  <div className={cn("w-2 h-2 rounded-full", PRIORITY_COLORS[selectedItem.priority])} />
                  <span className="text-xs text-gray-600 capitalize">{selectedItem.priority}</span>
                </div>
                {selectedItem.description && (
                  <p className="text-xs text-gray-600 font-manrope leading-relaxed">{selectedItem.description}</p>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="font-manrope">{getTimeString(selectedItem.startTime, selectedItem.endTime)}</span>
                </div>
                
                {selectedItem.location && (
                  <div className="flex items-center gap-2">
                    {selectedItem.location.includes('Zoom') || selectedItem.location.includes('Teams') ? (
                      <Video className="w-3 h-3 text-gray-400" />
                    ) : (
                      <MapPin className="w-3 h-3 text-gray-400" />
                    )}
                    <span className="font-manrope">{selectedItem.location}</span>
                  </div>
                )}

                {selectedItem.attendees && selectedItem.attendees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="font-manrope">{selectedItem.attendees.length} attendees</span>
                  </div>
                )}
              </div>

              {selectedItem.attendees && selectedItem.attendees.length > 0 && (
                <div>
                  <h5 className="font-medium text-xs text-gray-900 mb-1 font-manrope">Attendees</h5>
                  <div className="space-y-0.5">
                    {selectedItem.attendees.slice(0, 4).map(attendee => (
                      <div key={attendee} className="text-xs text-gray-600 font-manrope">
                        {attendee}
                      </div>
                    ))}
                    {selectedItem.attendees.length > 4 && (
                      <div className="text-xs text-gray-400">+{selectedItem.attendees.length - 4} more</div>
                    )}
                  </div>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <h5 className="font-medium text-xs text-gray-900 mb-1 font-manrope">Notes</h5>
                  <p className="text-xs text-gray-600 font-manrope bg-white p-2 rounded border leading-relaxed">
                    {selectedItem.notes}
                  </p>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h5 className="font-medium text-xs text-gray-900 mb-1 font-manrope">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}