
export const FEATURES_CONTENT = {
  title: 'Put your workflow on one super-page',
  
  description: 'An AI-powered super-app that automatically composes email drafts in your personal style, comes with full-featured chat, collaborative task boards, video meetings, notes, calendars, and files, all in a fully customizable single page.',
  
  features: [
    'Email',
    'Kanban Task Boards', 
    'Messages',
    'Gantt Timeline Charts',
    'Calendar',
    'Notes'
  ],
  
  images: {
    dualChats: {
      src: 'images/Dual-Chats.png',
      srcSet: 'images/Dual-Chats-p-500.png 500w, images/Dual-Chats-p-800.png 800w, images/Dual-Chats-p-1080.png 1080w, images/Dual-Chats-p-1600.png 1600w, images/Dual-Chats.png 1624w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
      alt: 'Dual chat interface showing team communication',
      className: '_3-graph-cards---card-middle'
    },
    taskBoard: {
      src: 'images/Screenshot-2023-03-28-at-10.24.08-PM.png', 
      srcSet: 'images/Screenshot-2023-03-28-at-10.24.08-PM-p-500.png 500w, images/Screenshot-2023-03-28-at-10.24.08-PM-p-800.png 800w, images/Screenshot-2023-03-28-at-10.24.08-PM-p-1080.png 1080w, images/Screenshot-2023-03-28-at-10.24.08-PM-p-1600.png 1600w, images/Screenshot-2023-03-28-at-10.24.08-PM-p-2000.png 2000w, images/Screenshot-2023-03-28-at-10.24.08-PM.png 2296w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
      alt: 'Task board interface with project management features',
      className: '_3-graph-cards---card-top'
    },
    taskDetail: {
      src: 'images/Task-Board-detail_1.webp',
      srcSet: 'images/Task-Board-detail_1-p-500.webp 500w, images/Task-Board-detail_1.webp 668w',
      sizes: '(max-width: 668px) 100vw, 668px',
      alt: 'Detailed task board view with individual task cards',
      className: '_3-graph-cards---card-bottom shaow-optimized'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: 'd28a12e7-34c9-34a9-bae3-5fb511decca6',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Explore features',
      href: '#features',
      ariaLabel: 'Learn more about Krushr features'
    }
  }
} as const

export type FeaturesContent = typeof FEATURES_CONTENT