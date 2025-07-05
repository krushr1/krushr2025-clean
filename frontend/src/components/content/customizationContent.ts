/**
 * Customization Section Content Data
 * Centralized content management for the layout customization section
 */

export const CUSTOMIZATION_CONTENT = {
  title: 'Create, move, and resize everything, just how you want it',
  
  features: [
    {
      title: 'Add As Many Widgets As You Want',
      description: "Want 10 chats open? Want 3 Kanban boards? Want two calendars, and 2 note widgets? No problem. It's all yours."
    },
    {
      title: 'Move and Resize Everything',
      description: 'Move widgets and resize each one exactly how you want.'
    },
    {
      title: 'Less Whitespace = Greater Productivity',
      description: "Pretty UI doesn't require large whitespace areas. Move beyond wasteful scrolling and clicking with rich information density and a clean UI."
    }
  ],
  
  image: {
    src: 'images/Hero-portion-dashboard.webp',
    srcSet: 'images/Hero-portion-dashboard-p-500.webp 500w, images/Hero-portion-dashboard-p-800.webp 800w, images/Hero-portion-dashboard-p-1080.webp 1080w, images/Hero-portion-dashboard-p-1600.webp 1600w, images/Hero-portion-dashboard-p-2000.webp 2000w, images/Hero-portion-dashboard.webp 2296w',
    sizes: '(max-width: 767px) 100vw, (max-width: 991px) 728px, 940px',
    alt: 'Customizable dashboard interface showing layout flexibility',
    className: 'create-move-card-copy no-right-margin-copy'
  }
} as const

export type CustomizationContent = typeof CUSTOMIZATION_CONTENT