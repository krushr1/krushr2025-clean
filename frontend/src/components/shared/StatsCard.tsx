import React from 'react'

interface StatsCardProps {
  number: string
  suffix?: string
  label: string
  className?: string
}

/**
 * Reusable Stats Card Component
 * Displays statistical information with large numbers and descriptions
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  number,
  suffix = '',
  label,
  className = "card pd-40px---20px border-radius-24px min-width"
}) => {
  return (
    <div className={className}>
      <div className="text-center">
        <div className="display-3">
          {number}
          {suffix && <span className="text-span-11">{suffix}</span>}
        </div>
        <div className="text-200 medium">{label}</div>
      </div>
    </div>
  )
}