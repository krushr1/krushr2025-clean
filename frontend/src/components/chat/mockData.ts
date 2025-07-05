import { ChatMessage } from './types'

export const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hey team, how\'s the progress on the dashboard redesign?',
    type: 'text',
    sender: { id: '1', name: 'John Doe', avatar: 'JD' },
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    reactions: [{ emoji: '👍', count: 2, users: ['2', '3'] }]
  },
  {
    id: '2',
    content: 'We\'re about 70% done! Should be ready for review by Friday.',
    type: 'text',
    sender: { id: '2', name: 'You', avatar: 'ME' },
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    replyTo: { id: '1', content: 'Hey team, how\'s the progress...', sender: 'John Doe' }
  },
  {
    id: '3',
    content: 'Alice joined the conversation',
    type: 'system',
    sender: { id: 'system', name: 'System', avatar: '' },
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    content: 'Here are the latest mockups for review:',
    type: 'file',
    sender: { id: '3', name: 'Alice Smith', avatar: 'AS' },
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    reactions: [
      { emoji: '🚀', count: 1, users: ['2'] },
      { emoji: '💯', count: 1, users: ['1'] }
    ]
  }
]

export const quickReactions = ['👍', '❤️', '😊', '🚀', '💯', '👏']