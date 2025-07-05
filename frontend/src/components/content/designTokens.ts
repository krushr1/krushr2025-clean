/**
 * Design Tokens for Landing Page Components
 * Centralized design system values for consistency and maintainability
 */

export const DESIGN_TOKENS = {
  colors: {
    primary: '#EB5857',
    primaryHover: '#d44c4c',
    secondary: '#143197',
    secondaryHover: '#0f266e',
    white: '#ffffff',
    neutral800: '#1f2937',
    neutral100: '#f9fafb'
  },
  
  typography: {
    button: {
      size: '16px',
      weight: '400',
      family: 'Satoshi, sans-serif',
      lineHeight: '1.2'
    },
    heading: {
      family: 'Manrope, sans-serif'
    }
  },
  
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '28px',
    xxl: '32px'
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px'
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.35s ease'
  },
  
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px'
  }
} as const

export type DesignTokens = typeof DESIGN_TOKENS