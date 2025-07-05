/**
 * Team Communication Section Content Data
 * Centralized content management for the team communication section
 */

export const TEAM_COMMUNICATION_CONTENT = {
  title: 'Effortless team communication',
  
  subtitle: 'Chat with your team, where your work happens',
  
  description: 'Elevate your collaboration and communication with a unified meeting and workspace. Meet on the fly, or schedule meetings within your team, or with customers and clients.',
  
  images: {
    contactsView: {
      src: 'images/Screenshot-2023-03-08-at-7.13.42-PM.png',
      srcSet: 'images/Screenshot-2023-03-08-at-7.13.42-PM-p-500.png 500w, images/Screenshot-2023-03-08-at-7.13.42-PM-p-800.png 800w, images/Screenshot-2023-03-08-at-7.13.42-PM-p-1080.png 1080w, images/Screenshot-2023-03-08-at-7.13.42-PM.png 1378w',
      sizes: '100vw',
      alt: 'Team contacts and communication interface',
      className: '_3-cards---contacts-image'
    },
    fullDesktop: {
      src: 'images/Full-Desktop.webp',
      srcSet: 'images/Full-Desktop-p-500.webp 500w, images/Full-Desktop-p-800.webp 800w, images/Full-Desktop-p-1080.webp 1080w, images/Full-Desktop-p-1600.webp 1600w, images/Full-Desktop-p-2000.webp 2000w, images/Full-Desktop.webp 2350w',
      sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
      alt: 'Full desktop workspace interface',
      className: '_3-graph-cards---card-middle-copy'
    },
    meetingInterface: {
      src: 'images/Screenshot-2023-03-08-at-7.10.24-PM.png',
      srcSet: 'images/Screenshot-2023-03-08-at-7.10.24-PM-p-500.png 500w, images/Screenshot-2023-03-08-at-7.10.24-PM-p-800.png 800w, images/Screenshot-2023-03-08-at-7.10.24-PM-p-1080.png 1080w, images/Screenshot-2023-03-08-at-7.10.24-PM.png 1418w',
      sizes: '100vw',
      alt: 'Meeting and communication interface',
      className: '_3-graph-cards---card-bottom shaow-optimized'
    }
  },
  
  buttons: {
    primary: {
      text: 'Create My Layout',
      href: '/#/workspace',
      dataWId: 'd28a12e7-34c9-34a9-bae3-5fb511decd49',
      ariaLabel: 'Create your custom layout - go to workspace'
    },
    secondary: {
      text: 'Browse features',
      href: '#',
      ariaLabel: 'Browse all Krushr features'
    }
  }
} as const

export type TeamCommunicationContent = typeof TEAM_COMMUNICATION_CONTENT