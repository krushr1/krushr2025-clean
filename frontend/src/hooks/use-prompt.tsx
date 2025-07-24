import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PromptOptions {
  title?: string
  description?: string
  label?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
  validate?: (value: string) => string | null
}

interface PromptContextValue {
  prompt: (options?: PromptOptions) => Promise<string | null>
}

const PromptContext = React.createContext<PromptContextValue | undefined>(undefined)

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [options, setOptions] = React.useState<PromptOptions>({})
  const [value, setValue] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const resolveRef = React.useRef<(value: string | null) => void>()

  const prompt = React.useCallback((options: PromptOptions = {}) => {
    return new Promise<string | null>((resolve) => {
      setOptions({
        title: options.title || 'Enter value',
        description: options.description,
        label: options.label,
        placeholder: options.placeholder || '',
        defaultValue: options.defaultValue || '',
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Cancel',
        validate: options.validate,
      })
      setValue(options.defaultValue || '')
      setError(null)
      setIsOpen(true)
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = React.useCallback(() => {
    if (options.validate) {
      const validationError = options.validate(value)
      if (validationError) {
        setError(validationError)
        return
      }
    }
    setIsOpen(false)
    resolveRef.current?.(value)
  }, [value, options])

  const handleCancel = React.useCallback(() => {
    setIsOpen(false)
    resolveRef.current?.(null)
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleConfirm()
      }
    },
    [handleConfirm]
  )

  return (
    <PromptContext.Provider value={{ prompt }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{options.title}</DialogTitle>
            {options.description && (
              <DialogDescription>{options.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {options.label && (
              <Label htmlFor="prompt-input">{options.label}</Label>
            )}
            <Input
              id="prompt-input"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder={options.placeholder}
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText}
            </Button>
            <Button onClick={handleConfirm}>
              {options.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PromptContext.Provider>
  )
}

export function usePrompt() {
  const context = React.useContext(PromptContext)
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider')
  }
  return context.prompt
}