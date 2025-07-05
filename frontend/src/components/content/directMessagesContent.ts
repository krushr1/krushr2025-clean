/**
 * Direct Messages Section Content Data
 * Centralized content management for the direct messaging features section
 */

export const DIRECT_MESSAGES_CONTENT = {
  title: 'Master your direct messages',
  
  features: [
    {
      title: 'Multiple DMs & Threads Open on 1 Screen',
      description: 'Open concurrent DMs on one screen, read and reply to each without switching between them.'
    },
    {
      title: 'Full-Featured Chats',
      description: '1:1, team, or project threads with the ability to add tags, quotes, reactions/emojis, rich formatting, code, and drag-and-drop image and file uploads'
    },
    {
      title: 'Drop Tasks Right Into Your Messages',
      description: "Eliminate confusion and time wasted trying to describe what you're referring to. Link tasks right into your DMs & Threads so your team always knows exactly what you're talking about."
    }
  ],
  
  image: {
    src: 'images/3x-Chat--Tasks.gif',
    alt: 'Multiple chat interfaces showing concurrent direct messages and task integration',
    className: '_2-graph-cards---card-right-copy'
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: 'd28a12e7-34c9-34a9-bae3-5fb511decda2',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Browse features',
      href: '#',
      ariaLabel: 'Browse all Krushr features'
    }
  }
} as const

export type DirectMessagesContent = typeof DIRECT_MESSAGES_CONTENT