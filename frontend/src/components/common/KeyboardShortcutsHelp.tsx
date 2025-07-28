import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Separator } from '../ui/separator'
import { KEYBOARD_SHORTCUTS } from '../../hooks/useKeyboardShortcuts'
import { Command } from 'lucide-react'

interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const renderKey = (key: string) => {
    // Replace modifier symbols based on platform
    if (key === '⌘' && !isMac) return 'Ctrl'
    if (key === 'Ctrl' && isMac) return '⌘'
    return key
  }

  const renderShortcut = (shortcut: { keys: string[], description: string, modifiers?: string[] }) => {
    const keys = isMac ? shortcut.keys : (shortcut.modifiers || shortcut.keys)
    
    return (
      <div className="flex items-center justify-between py-2.5 px-1 hover:bg-gray-50 rounded-lg transition-colors">
        <span className="text-sm text-gray-700">{shortcut.description}</span>
        <div className="flex items-center gap-1">
          {keys.map((key, index) => (
            <React.Fragment key={index}>
              <kbd className="min-w-[28px] h-7 px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm flex items-center justify-center">
                {renderKey(key)}
              </kbd>
              {index < keys.length - 1 && (
                <span className="text-xs text-gray-400 mx-0.5">+</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const renderSection = (title: string, shortcuts: typeof KEYBOARD_SHORTCUTS.actions) => (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-krushr-primary uppercase tracking-wide">{title}</h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div key={index}>
            {renderShortcut(shortcut)}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 bg-krushr-primary rounded-lg flex items-center justify-center">
              <Command className="w-6 h-6 text-white" />
            </div>
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-2 -mr-2">
          <div className="space-y-6">
            {/* Quick tip */}
            <div className="bg-krushr-primary-50 border border-krushr-primary-100 rounded-lg p-4">
              <p className="text-sm text-krushr-primary-800">
                <span className="font-semibold">Pro tip:</span> These shortcuts work anywhere in the dashboard. 
                They're automatically disabled when you're typing in text fields.
              </p>
            </div>

            {/* Actions */}
            {renderSection('Actions', KEYBOARD_SHORTCUTS.actions)}
            
            <Separator className="my-4" />
            
            {/* Filters */}
            {renderSection('Task Filters', KEYBOARD_SHORTCUTS.filters)}
            
            <Separator className="my-4" />
            
            {/* Navigation */}
            {renderSection('Navigation', KEYBOARD_SHORTCUTS.navigation)}
            
            <Separator className="my-4" />
            
            {/* Help */}
            {renderSection('Help', KEYBOARD_SHORTCUTS.help)}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded mx-1">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}