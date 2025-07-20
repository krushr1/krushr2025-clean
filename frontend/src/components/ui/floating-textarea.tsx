import * as React from "react"
import { cn } from "../../lib/utils"

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `floating_textarea_${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="relative">
        <textarea
          id={inputId}
          className={cn(
            "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-krushr-primary peer resize-none",
            className
          )}
          placeholder=" "
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-krushr-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
        >
          {label}
        </label>
      </div>
    )
  }
)
FloatingTextarea.displayName = "FloatingTextarea"

export { FloatingTextarea }