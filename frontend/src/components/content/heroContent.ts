
export const HERO_CONTENT = {
  notice: {
    icon: '✨',
    highlight: 'Latest OpenAI Model Inside',
    text: 'Your workflow copilot'
  },
  
  title: 'Ultimate AI-powered productivity platform',
  
  features: [
    'Email, messages, tasks, calendars, and meetings in one screen',
    'Tailored OpenAI model writes and takes action in your style',
    'Create the perfect layout to conquer tasks with ease'
  ],
  
  images: {
    dashboard: {
      src: 'images/Hero-portion-dashboard.webp',
      srcSet: 'images/Hero-portion-dashboard-p-500.webp 500w, images/Hero-portion-dashboard-p-800.webp 800w, images/Hero-portion-dashboard-p-1080.webp 1080w, images/Hero-portion-dashboard-p-1600.webp 1600w, images/Hero-portion-dashboard-p-2000.webp 2000w, images/Hero-portion-dashboard.webp 2296w',
      sizes: '(max-width: 2296px) 100vw, 2296px',
      alt: 'Krushr Dashboard Preview',
      className: '_3-graph-cards---card-top-4 source-dupe-1'
    },
    assistant: {
      src: 'images/ChatGPT-Assistant.webp',
      srcSet: 'images/ChatGPT-Assistant-p-500.webp 500w, images/ChatGPT-Assistant-p-800.webp 800w, images/ChatGPT-Assistant.webp 936w',
      sizes: '(max-width: 936px) 100vw, 936px',
      alt: 'ChatGPT Assistant Integration',
      className: '_3-graph-cards---card-bottom-2'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/pricing',
      dataWId: 'd28a12e7-34c9-34a9-bae3-5fb511decca6',
      ariaLabel: 'Create your custom layout - go to pricing page'
    },
    secondary: {
      text: 'Explore features',
      href: '#features',
      ariaLabel: 'Learn more about Krushr features'
    }
  }
} as const

export type HeroContent = typeof HERO_CONTENT