/**
 * Shared Types for Landing Page Sections
 * Provides consistent type definitions across all section components
 */

// Base configuration types
export interface ImageConfig {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  className?: string
}

export interface ButtonConfig {
  text: string
  href: string
  dataWId?: string
  ariaLabel?: string
  className?: string
}

export interface StatData {
  number: string
  suffix?: string
  label: string
}

// Section content structure types
export interface BaseSectionContent {
  title: string
  subtitle?: string
  description?: string
  buttons: {
    primary: ButtonConfig
    secondary: ButtonConfig
  }
}

export interface FeatureSectionContent extends BaseSectionContent {
  features: readonly string[]
  images: Record<string, ImageConfig>
}

export interface StatsSectionContent extends BaseSectionContent {
  features: readonly string[]
  stats: readonly StatData[]
  images: Record<string, ImageConfig>
}

// Layout configuration types
export type SectionVariant = 'hero' | 'features' | 'ai' | 'superform' | 'communication' | 'aiPowered' | 'productivity' | 'workflow'

export interface LayoutConfig {
  containerClass: string
  gridClass: string
  innerClass: string
  backgroundClass?: string
}

export interface SectionLayoutProps {
  variant: SectionVariant
  children: React.ReactNode
  className?: string
}

// Component variant types
export type FeatureListVariant = 'hero' | 'standard' | 'nested' | 'compact'
export type ImageGalleryVariant = 'hero' | 'features' | 'ai' | 'superform' | 'communication' | 'aiPowered' | 'productivity' | 'workflow'
export type ImageLayoutType = 'stacked' | 'side-by-side' | 'custom'

// Enhanced component props
export interface EnhancedFeaturesListProps {
  features: readonly string[]
  variant: FeatureListVariant
  className?: string
}

export interface EnhancedImageGalleryProps {
  images: readonly ImageConfig[]
  layout: ImageLayoutType
  variant: ImageGalleryVariant
  containerClassName?: string
}

// Section component composition props
export interface SectionHeaderProps {
  title: string
  subtitle?: string
  description?: string
  variant: SectionVariant
}

export interface SectionBodyProps {
  features?: readonly string[]
  stats?: readonly StatData[]
  buttons: {
    primary: ButtonConfig
    secondary: ButtonConfig
  }
  variant: SectionVariant
}

export interface SectionImagesProps {
  images: readonly ImageConfig[]
  variant: SectionVariant
  layout: ImageLayoutType
}

// Layout configuration constants
export const LAYOUT_CONFIGS: Record<SectionVariant, LayoutConfig> = {
  hero: {
    containerClass: 'desktop-wrapper-section-with-images',
    gridClass: 'pricing-template-hero',
    innerClass: 'pricing-template-body'
  },
  features: {
    containerClass: 'unified-form bg-neutral-200 overflow-hidden',
    gridClass: 'grid-2-columns _1-col-tablet gap-row-64px vertical',
    innerClass: 'inner-container _534px w-clearfix'
  },
  ai: {
    containerClass: 'unified-form bg-neutral-200 overflow-hidden',
    gridClass: 'grid-2-columns _1-col-tablet gap-row-64px vertical',
    innerClass: 'inner-container _534px w-clearfix'
  },
  superform: {
    containerClass: 'unified-form bg-neutral-200 overflow-hidden',
    gridClass: 'grid-2-columns _1-col-tablet gap-row-64px vertical',
    innerClass: 'inner-container _534px w-clearfix'
  },
  communication: {
    containerClass: 'integrated-meetings bg-neutral-200 overflow-hidden',
    gridClass: 'grid-2-columns _1-col-tablet gap-row-64px vertical',
    innerClass: 'inner-container _534px w-clearfix'
  },
  aiPowered: {
    containerClass: 'messages bg-neutral-200 overflow-hidden',
    gridClass: 'grid-2-columns _1-col-tablet gap-row-64px vertical',
    innerClass: 'inner-container _534px w-clearfix'
  },
  productivity: {
    containerClass: 'mobile-wrapper-section-with-images',
    gridClass: 'top-section---images-right remove-btm-margin',
    innerClass: 'inner-container _48 _100-tablet width-constraint'
  },
  workflow: {
    containerClass: 'tasks bg-neutral-200 overflow-hidden',
    gridClass: 'grid-2-columns _1-col-tablet gap-row-64px vertical',
    innerClass: 'inner-container _534px w-clearfix'
  }
}

// Feature list configuration
export const FEATURE_LIST_CONFIGS: Record<FeatureListVariant, string> = {
  hero: 'grid-1-column-1-copy gap-row-32px-copy',
  standard: 'grid-1-column-list gap-row-32px-copy',
  nested: 'grid-1-column-1-copy gap-row-32px-copy',
  compact: 'grid-1-column-2 gap-row-32px'
}