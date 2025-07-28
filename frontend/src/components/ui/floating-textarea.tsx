import * as React from "react"
import { cn } from "../../lib/utils"

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, id, placeholder, ...props }, ref) => {
    const inputId = id || `floating_textarea_${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="relative">
        <textarea
          id={inputId}
          className={cn(
            "block px-2.5 py-2 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-krushr-primary shadow-sm hover:shadow-md focus:shadow-md transition-shadow peer resize-none",
            className
          )}
          placeholder={placeholder || label}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
FloatingTextarea.displayName = "FloatingTextarea"

export { FloatingTextarea }