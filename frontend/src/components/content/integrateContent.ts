/**
 * Integrate Section Content Data
 * Centralized content management for the integrations section
 */

export const INTEGRATE_CONTENT = {
  title: 'Integrate & easily import',
  
  subtitle: 'Integrate with all tools you already use to achieve greater utility',
  
  button: {
    text: 'Browse integrations',
    href: 'integrations.html',
    ariaLabel: 'Browse all available integrations'
  }
} as const

export type IntegrateContent = typeof INTEGRATE_CONTENT