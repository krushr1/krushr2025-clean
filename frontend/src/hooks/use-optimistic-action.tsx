import { useToast } from '@/hooks/use-toast'
import { useUndoStore } from '@/stores/undo-store'
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'

interface OptimisticActionOptions {
  type: 'task' | 'note' | 'column' | 'comment' | 'conversation' | 'panel' | 'bulk-tasks'
  action: () => Promise<void> // The actual delete/action to perform
  undoAction: () => Promise<void> // How to restore/undo
  item: any // The item being acted upon (for backup)
  getMessage: () => string // Function to generate the success message
  getUndoMessage?: () => string // Optional custom undo success message
  ttl?: number // Time before undo expires (default 10 seconds)
  showUndo?: boolean // Whether to show undo button (default true)
}

export function useOptimisticAction() {
  const { toast } = useToast()
  const { addUndoableAction, undo, removeAction } = useUndoStore()

  const execute = async ({
    type,
    action,
    undoAction,
    item,
    getMessage,
    getUndoMessage,
    ttl = 10000,
    showUndo = true
  }: OptimisticActionOptions) => {
    // Show success toast with undo option FIRST
    const message = getMessage()
    let actionId: string | undefined
    
    if (showUndo) {
      actionId = addUndoableAction(
        type,
        message,
        item,
        undoAction,
        ttl
      )
        
      toast({
        title: message,
        duration: ttl,
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await undo(actionId)
                toast({
                  title: getUndoMessage?.() || 'Action undone',
                  duration: 3000
                })
              } catch (error) {
                toast({
                  title: 'Failed to undo',
                  description: 'The action could not be undone',
                  variant: 'destructive'
                })
              }
            }}
            className="ml-auto"
          >
            <Undo2 className="mr-1 h-3 w-3" />
            Undo
          </Button>
        ),
        onOpenChange: (open) => {
          // Remove action from store when toast is dismissed
          if (!open && actionId) {
            removeAction(actionId)
          }
        }
      })
    } else {
      // Just show success message without undo
      toast({
        title: message,
        duration: 3000
      })
    }
    
    try {
      // Perform the action AFTER showing the toast
      await action()
      return true
    } catch (error) {
      // If action fails, remove the undo action and show error
      if (showUndo && actionId) {
        removeAction(actionId)
      }
      toast({
        title: 'Action failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      })
      return false
    }
  }

  return { execute }
}

// Specialized hook for delete operations
export function useOptimisticDelete() {
  const { execute } = useOptimisticAction()
  
  const deleteItem = async ({
    type,
    item,
    deleteAction,
    restoreAction,
    itemName
  }: {
    type: OptimisticActionOptions['type']
    item: any
    deleteAction: () => Promise<void>
    restoreAction: () => Promise<void>
    itemName?: string
  }) => {
    return execute({
      type,
      action: deleteAction,
      undoAction: restoreAction,
      item,
      getMessage: () => {
        const typeLabels = {
          task: 'Task',
          note: 'Note', 
          column: 'Column',
          comment: 'Comment',
          conversation: 'Conversation',
          panel: 'Panel',
          'bulk-tasks': 'Tasks'
        }
        return `${typeLabels[type]} ${itemName ? `"${itemName}" ` : ''}deleted`
      },
      getUndoMessage: () => {
        const typeLabels = {
          task: 'Task',
          note: 'Note',
          column: 'Column', 
          comment: 'Comment',
          conversation: 'Conversation',
          panel: 'Panel',
          'bulk-tasks': 'Tasks'
        }
        return `${typeLabels[type]} restored`
      }
    })
  }
  
  return { deleteItem }
}