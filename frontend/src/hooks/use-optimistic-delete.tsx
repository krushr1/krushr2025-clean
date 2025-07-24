import { useToast } from '@/hooks/use-toast'
import { useUndoStore } from '@/stores/undo-store'
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'
import { useState, useRef } from 'react'

interface OptimisticDeleteOptions<T> {
  type: 'task' | 'note' | 'column' | 'comment' | 'conversation' | 'panel' | 'bulk-tasks'
  item: T
  itemName?: string
  deleteAction: () => Promise<void>
  onOptimisticRemove?: () => void // Called immediately to update UI
  onRestore?: (item: T) => void // Called when undoing
  ttl?: number
}

export function useOptimisticDelete() {
  const { toast } = useToast()
  const { addUndoableAction, removeAction } = useUndoStore()
  const [deletedItems] = useState(new Map<string, any>())
  const pendingDeletions = useRef(new Map<string, NodeJS.Timeout>())

  const deleteItem = async <T extends any>({
    type,
    item,
    itemName,
    deleteAction,
    onOptimisticRemove,
    onRestore,
    ttl = 10000
  }: OptimisticDeleteOptions<T>) => {
    // Generate a unique key for this deletion
    const deletionKey = `${type}-${Date.now()}-${Math.random()}`
    
    // Store the item for potential restoration
    deletedItems.set(deletionKey, item)
    
    // Call the optimistic UI update immediately
    onOptimisticRemove?.()
    
    // Generate the success message
    const typeLabels = {
      task: 'Task',
      note: 'Note',
      column: 'Column',
      comment: 'Comment',
      conversation: 'Conversation',
      panel: 'Panel',
      'bulk-tasks': 'Tasks'
    }
    const message = `${typeLabels[type]} ${itemName ? `"${itemName}" ` : ''}deleted`
    
    // Create the undo action
    const undoAction = async () => {
      // Cancel the pending deletion
      const timeout = pendingDeletions.current.get(deletionKey)
      if (timeout) {
        clearTimeout(timeout)
        pendingDeletions.current.delete(deletionKey)
      }
      
      // Restore the item in the UI
      const restoredItem = deletedItems.get(deletionKey)
      if (restoredItem && onRestore) {
        onRestore(restoredItem)
      }
      
      // Clean up
      deletedItems.delete(deletionKey)
    }
    
    // Add to undo store
    const actionId = addUndoableAction(
      type,
      message,
      item,
      undoAction,
      ttl
    )
    
    // Show toast with undo button
    toast({
      title: message,
      duration: ttl,
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              await undoAction()
              removeAction(actionId)
              toast({
                title: `${typeLabels[type]} restored`,
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
        if (!open) {
          removeAction(actionId)
        }
      }
    })
    
    // Schedule the actual deletion after TTL
    const deletionTimeout = setTimeout(async () => {
      try {
        await deleteAction()
        deletedItems.delete(deletionKey)
        pendingDeletions.current.delete(deletionKey)
      } catch (error) {
        console.error('Failed to delete item:', error)
        // If deletion fails, we should restore the item
        if (onRestore) {
          const restoredItem = deletedItems.get(deletionKey)
          if (restoredItem) {
            onRestore(restoredItem)
          }
        }
        toast({
          title: 'Delete failed',
          description: 'The item could not be deleted',
          variant: 'destructive'
        })
      }
    }, ttl)
    
    pendingDeletions.current.set(deletionKey, deletionTimeout)
    
    return true
  }
  
  return { deleteItem }
}