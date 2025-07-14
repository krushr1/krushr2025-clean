
export const AI_CONTENT = {
  title: 'Adaptive OpenAI o1 learns your style',
  
  description: 'Automate tasks, checklists, email drafts, deadlines, scheduling, collaboration, and reminders in one click',
  
  features: [
    'A individually trained model that improves with time',
    'Automate tasks, scheduling & reminders', 
    'Generate mindblowing automations on everyday tasks'
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
      label: 'Clicks & Key Taps Saved/Week'
    }
  ],
  
  images: {
    emailSection: {
      src: 'images/Email-Section_1.webp',
      srcSet: 'images/Email-Section_1-p-500.webp 500w, images/Email-Section_1-p-800.webp 800w, images/Email-Section_1-p-1080.webp 1080w, images/Email-Section_1-p-1600.webp 1600w, images/Email-Section_1.webp 1998w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
      alt: 'Email interface showing AI automation features',
      className: '_2-graph-cards---card-right-2'
    },
    chatGPT: {
      src: 'images/ChatGPT-Assistant.webp',
      srcSet: 'images/ChatGPT-Assistant-p-500.webp 500w, images/ChatGPT-Assistant-p-800.webp 800w, images/ChatGPT-Assistant.webp 936w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 936px',
      alt: 'ChatGPT Assistant integration with analysis features',
      className: '_2-graph-cards---card-left-2 gpt-analyze'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: '37dfc407-3ce3-91bf-fcea-24c2c44f09a5',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Browse features',
      href: '#features',
      ariaLabel: 'Browse all Krushr features'
    }
  }
} as const

export type AIContent = typeof AI_CONTENT