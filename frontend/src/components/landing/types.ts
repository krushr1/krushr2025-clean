
export interface HeroContent {
  readonly notice: {
    readonly icon: string
    readonly highlight: string
    readonly text: string
  }
  readonly title: string
  readonly features: readonly string[]
  readonly images: {
    readonly dashboard: ImageConfig
    readonly assistant: ImageConfig
  }
  readonly buttons: {
    readonly primary: ButtonConfig
    readonly secondary: ButtonConfig
  }
}

export interface ImageConfig {
  readonly src: string
  readonly srcSet?: string
  readonly sizes?: string
  readonly alt: string
  readonly className?: string
  readonly priority?: boolean
}

export interface ButtonConfig {
  readonly text: string
  readonly href: string
  readonly dataWId?: string
  readonly ariaLabel?: string
  readonly variant?: 'primary' | 'secondary'
  readonly icon?: boolean
}

export interface DesignTokens {
  readonly colors: {
    readonly primary: string
    readonly primaryHover: string
    readonly secondary: string
    readonly secondaryHover: string
    readonly white: string
    readonly neutral800: string
    readonly neutral100: string
    readonly success: string
  }
  readonly typography: {
    readonly button: TypographyConfig
    readonly heading: TypographyConfig
  }
  readonly spacing: SpacingConfig
  readonly borderRadius: BorderRadiusConfig
  readonly transitions: TransitionConfig
  readonly breakpoints: BreakpointConfig
}

interface TypographyConfig {
  readonly size?: string
  readonly weight?: string
  readonly family: string
  readonly lineHeight?: string
}

interface SpacingConfig {
  readonly xs: string
  readonly sm: string
  readonly md: string
  readonly lg: string
  readonly xl: string
  readonly xxl: string
}

interface BorderRadiusConfig {
  readonly sm: string
  readonly md: string
  readonly lg: string
}

interface TransitionConfig {
  readonly fast: string
  readonly normal: string
  readonly slow: string
}

interface BreakpointConfig {
  readonly mobile: string
  readonly tablet: string
  readonly desktop: string
}

export interface ButtonProps {
  variant: 'primary' | 'secondary'
  href: string
  children: React.ReactNode
  className?: string
  dataWId?: string
  ariaLabel?: string
  icon?: React.ReactNode
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export interface IconProps {
  name: 'arrow-right' | 'check' | 'close' | 'menu'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: React.CSSProperties
}

export interface ResponsiveImageProps {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  loading?: 'lazy' | 'eager'
  className?: string
  variant?: 'dashboard' | 'assistant'
  priority?: boolean
}

// Performance and Analytics
export interface PerformanceMetrics {
  readonly loadTime: number
  readonly renderTime: number
  readonly interactionTime: number
}

export interface AnalyticsEvent {
  readonly type: 'button_click' | 'section_view' | 'image_load'
  readonly target: string
  readonly timestamp: number
  readonly metadata?: Record<string, unknown>
}