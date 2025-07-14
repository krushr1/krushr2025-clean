
export const PRODUCTIVITY_CONTENT = {
  title: 'Effortless Productivity',
  
  features: [
    'Communication & Productivity Supertool',
    'Create Your Perfect Layout To Crush Tasks Faster',
    'Tailored ChatGPT Powered AI Composer & Assistant'
  ],
  
  image: {
    src: 'images/Screenshot-2023-03-08-at-3.52.47-PM.png',
    srcSet: 'images/Screenshot-2023-03-08-at-3.52.47-PM-p-500.png 500w, images/Screenshot-2023-03-08-at-3.52.47-PM-p-800.png 800w, images/Screenshot-2023-03-08-at-3.52.47-PM-p-1080.png 1080w, images/Screenshot-2023-03-08-at-3.52.47-PM-p-1600.png 1600w, images/Screenshot-2023-03-08-at-3.52.47-PM-p-2000.png 2000w, images/Screenshot-2023-03-08-at-3.52.47-PM.png 2350w',
    sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
    alt: 'Krushr - Customizable all-in-one productivity tool',
    className: 'top-section-imgs-right---img-large landing'
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: '9f0b8505-99cb-9825-916c-c3e9dff544c8',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Explore features',
      href: '#',
      ariaLabel: 'Explore all Krushr features'
    }
  }
} as const

export type ProductivityContent = typeof PRODUCTIVITY_CONTENT