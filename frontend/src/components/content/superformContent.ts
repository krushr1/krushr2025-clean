/**
 * Superform Section Content Data
 * Centralized content management for the powerful input form section
 */

export const SUPERFORM_CONTENT = {
  title: 'Easy, powerful, input',
  
  subtitle: 'Staggering Capabilities in 1 Superform',
  
  description: 'An intuitive, feature-rich input form that brings the controls you need right to your fingertips.',
  
  features: [
    'Tags',
    'Priority Meter',
    'Teams',
    'Add To Multiple Tools',
    'Notes',
    'Deadlines',
    'Checklists',
    'Notifications',
    'Subtasks',
    'Templates',
    'Files',
    'Reminders'
  ],
  
  images: {
    kanbanBoard: {
      src: 'images/Kanban-Board.webp',
      srcSet: 'images/Kanban-Board-p-500.webp 500w, images/Kanban-Board-p-800.webp 800w, images/Kanban-Board-p-1080.webp 1080w, images/Kanban-Board-p-1600.webp 1600w, images/Kanban-Board.webp 1924w',
      sizes: '100vw',
      alt: 'Kanban Board interface showing task management',
      className: '_3-graph-cards---card-top-copy less-right-margin-copy'
    },
    formInterface: {
      src: 'images/Screenshot-2023-05-04-at-6.29.05-PM.png',
      srcSet: 'images/Screenshot-2023-05-04-at-6.29.05-PM-p-500.png 500w, images/Screenshot-2023-05-04-at-6.29.05-PM-p-800.png 800w, images/Screenshot-2023-05-04-at-6.29.05-PM-p-1080.png 1080w, images/Screenshot-2023-05-04-at-6.29.05-PM.png 1168w',
      sizes: '100vw',
      alt: 'Superform interface showing powerful input capabilities',
      className: '_3-graph-cards---card-bottom-copy shaow-optimized-copy easy-form'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: '28c77717-e2b8-6db7-465a-cc93debd14cf',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Browse features',
      href: '#',
      ariaLabel: 'Browse all Krushr features'
    }
  }
} as const

export type SuperformContent = typeof SUPERFORM_CONTENT