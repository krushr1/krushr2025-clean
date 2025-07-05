import React from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  variant: 'primary' | 'secondary'
  href: string
  children: React.ReactNode
  className?: string
  dataWId?: string
  ariaLabel?: string
  icon?: React.ReactNode
}

/**
 * Reusable Button Component
 * Supports primary/secondary variants with consistent styling and accessibility
 */
export const Button: React.FC<ButtonProps> = ({
  variant,
  href,
  children,
  className = '',
  dataWId,
  ariaLabel,
  icon
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    className
  ].filter(Boolean).join(' ')

  return (
    <a
      href={href}
      className={buttonClasses}
      data-w-id={dataWId}
      aria-label={ariaLabel}
      role="button"
    >
      {children}
      {icon && <span className={styles.iconRight}>{icon}</span>}
    </a>
  )
}