
export const LAYOUT_BUILDER_CONTENT = {
  title: 'Build the layout of your dreams in 5 minutes',
  
  heading: 'Everything you want, just how you want it',
  
  description: 'We asked our engineers and UI/UX designers to add a mind-bending array of features and functionalities, and give it a great UI. They aced it.',
  
  button: {
    text: 'More features',
    href: 'features-pages/features-v2.html',
    ariaLabel: 'View more features'
  }
} as const

export type LayoutBuilderContent = typeof LAYOUT_BUILDER_CONTENT