/**
 * Workflow Section Content Data
 * Centralized content management for the revolutionized workflow section
 */

export const WORKFLOW_CONTENT = {
  title: 'Revolutionized Workflow: All On One Page, Your Way',
  
  description: 'Instantly optimize your workflow. Easily access messages, meetings, tasks, notes, calendars, and files, all arranged in a fully customizable layout.',
  
  features: [
    'Messages',
    'Video & Calls',
    'Kanban Task Boards',
    'Gantt Timelines',
    'Calendar',
    'Notes'
  ],
  
  stats: [
    {
      number: '0',
      suffix: '',
      label: 'Clicking Between Apps'
    },
    {
      number: '1000',
      suffix: '+',
      label: 'Clicks Saved Per Day'
    }
  ],
  
  images: {
    dualChats: {
      src: 'images/Dual-Chats.png',
      srcSet: 'images/Dual-Chats-p-500.png 500w, images/Dual-Chats-p-800.png 800w, images/Dual-Chats-p-1080.png 1080w, images/Dual-Chats-p-1600.png 1600w, images/Dual-Chats.png 1624w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
      alt: 'Dual chat interfaces showing concurrent messaging',
      className: '_3-graph-cards---card-middle'
    },
    customMovement: {
      src: 'images/custommovement_1.gif',
      alt: 'Custom layout movement animation',
      className: '_3-graph-cards---card-top'
    },
    dashboard: {
      src: 'images/Screenshot-2023-02-15-at-9.24.31-PM.png',
      srcSet: 'images/Screenshot-2023-02-15-at-9.24.31-PM-p-500.png 500w, images/Screenshot-2023-02-15-at-9.24.31-PM-p-800.png 800w, images/Screenshot-2023-02-15-at-9.24.31-PM-p-1080.png 1080w, images/Screenshot-2023-02-15-at-9.24.31-PM.png 1196w',
      sizes: '100vw',
      alt: 'Dashboard interface showing workspace layout',
      className: '_3-graph-cards---card-bottom shaow-optimized'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: '9f0b8505-99cb-9825-916c-c3e9dff5450d',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Explore features',
      href: '#',
      ariaLabel: 'Explore all Krushr features'
    }
  }
} as const

export type WorkflowContent = typeof WORKFLOW_CONTENT