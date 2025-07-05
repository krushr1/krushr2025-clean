import { CalendarEvent } from './types'

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    description: 'Daily team sync meeting',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
    attendees: ['team@company.com'],
    color: 'blue',
    type: 'meeting'
  },
  {
    id: '2',
    title: 'Product Review',
    description: 'Q2 product roadmap review with stakeholders',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 25.5 * 60 * 60 * 1000).toISOString(),
    location: 'Conference Room A',
    attendees: ['alice@company.com', 'bob@company.com'],
    color: 'green',
    type: 'meeting'
  },
  {
    id: '3',
    title: 'Design Sprint Planning',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    location: 'Design Studio',
    color: 'purple',
    type: 'event'
  },
  {
    id: '4',
    title: 'Client Demo',
    description: 'Demo new panel system features',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    attendees: ['client@external.com'],
    color: 'orange',
    type: 'meeting'
  }
]