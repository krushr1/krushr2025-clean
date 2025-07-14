
export const AI_POWERED_CONTENT = {
  title: 'Backed by Mindblowing ChatGPT Powered AI',
  
  description: 'Automate tasks, email drafts, scheduling, and reminders',
  
  features: [
    'Tailored ChatGPT AI trains to your style & actions',
    'Automate tasks, scheduling & reminders',
    'Get mindblowing suggestions on everyday tasks'
  ],
  
  stats: [
    {
      number: '15',
      suffix: '+',
      label: 'Hours Saved Per Week'
    },
    {
      number: '1000',
      suffix: '+',
      label: 'Keyboard Taps Saved/Week'
    }
  ],
  
  images: {
    aiInterface: {
      src: 'images/Screenshot-2023-03-08-at-5.55.50-PM.png',
      srcSet: 'images/Screenshot-2023-03-08-at-5.55.50-PM-p-500.png 500w, images/Screenshot-2023-03-08-at-5.55.50-PM-p-800.png 800w, images/Screenshot-2023-03-08-at-5.55.50-PM-p-1080.png 1080w, images/Screenshot-2023-03-08-at-5.55.50-PM-p-1600.png 1600w, images/Screenshot-2023-03-08-at-5.55.50-PM-p-2000.png 2000w, images/Screenshot-2023-03-08-at-5.55.50-PM.png 2112w',
      sizes: '100vw',
      alt: 'AI interface showing automation capabilities',
      className: '_3-graph-cards---card-top less-right-margin'
    },
    aiAssistant: {
      src: 'images/Screenshot-2023-03-08-at-5.55.28-PM.png',
      srcSet: 'images/Screenshot-2023-03-08-at-5.55.28-PM-p-500.png 500w, images/Screenshot-2023-03-08-at-5.55.28-PM-p-800.png 800w, images/Screenshot-2023-03-08-at-5.55.28-PM.png 936w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 936px',
      alt: 'AI assistant interface with suggestions',
      className: '_3-graph-cards---card-bottom shaow-optimized'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: '9f0b8505-99cb-9825-916c-c3e9dff54545',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Browse features',
      href: '#',
      ariaLabel: 'Browse all Krushr features'
    }
  }
} as const

export type AIPoweredContent = typeof AI_POWERED_CONTENT