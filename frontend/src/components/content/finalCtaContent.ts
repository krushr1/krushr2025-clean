/**
 * Final CTA Section Content Data
 * Centralized content management for the final call-to-action section
 */

export const FINAL_CTA_CONTENT = {
  title: 'Upgrade to Krushr for free, now.',
  
  buttons: {
    primary: {
      text: 'Open Your Workspace',
      href: '/#/workspace',
      nodeId: '10ac351b-afaf-fdd2-f4fb-f5d33b3955b2'
    },
    secondary: {
      text: 'Browse features',
      href: 'features-pages/features-v2.html'
    }
  },

  image: {
    src: 'images/Screenshot-2023-03-18-at-12.02.30-AM.png',
    srcSet: [
      { url: 'images/Screenshot-2023-03-18-at-12.02.30-AM-p-500.png', width: '500w' },
      { url: 'images/Screenshot-2023-03-18-at-12.02.30-AM-p-800.png', width: '800w' },
      { url: 'images/Screenshot-2023-03-18-at-12.02.30-AM-p-1080.png', width: '1080w' },
      { url: 'images/Screenshot-2023-03-18-at-12.02.30-AM.png', width: '1122w' }
    ],
    sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
    alt: 'Krushr Workspace Screenshot'
  }
} as const

export type FinalCtaContent = typeof FINAL_CTA_CONTENT