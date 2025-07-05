/**
 * Hook for workspace layout persistence
 * Handles saving, loading, and auto-saving panel layouts
 */

import { useCallback, useEffect, useRef } from 'react'
import { Layout, Layouts } from 'react-grid-layout'
import { trpc } from '../lib/trpc'
import { useToast } from './use-toast'

interface Panel {
  id: string
  type: string
  title: string
  position_x: number
  position_y: number
  width: number
  height: number
  is_minimized: boolean
  is_locked: boolean
  data: Record<string, any>
}

interface LayoutData {
  panels: Panel[]
  gridLayout: {
    lg: Layout[]
    md?: Layout[]
    sm?: Layout[]
    xs?: Layout[]
    xxs?: Layout[]
  }
}

interface UseLayoutPersistenceOptions {
  workspaceId: string
  panels: Panel[]
  autoSaveInterval?: number // in milliseconds, default 30000 (30 seconds)
  enabled?: boolean
}

export function useLayoutPersistence({
  workspaceId,
  panels,
  autoSaveInterval = 30000,
  enabled = true
}: UseLayoutPersistenceOptions) {
  const { toast } = useToast()
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedLayoutRef = useRef<string>('')

  // tRPC mutations and queries
  const savePresetMutation = trpc.layout.savePreset.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Layout Saved',
        description: `Layout preset "${data.name}" saved successfully`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  const loadPresetMutation = trpc.layout.loadPreset.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Layout Loaded',
        description: data.message,
      })
      // Trigger a page refresh or panel refetch to show the new layout
      window.location.reload()
    },
    onError: (error) => {
      toast({
        title: 'Load Failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  const autoSaveMutation = trpc.layout.autoSave.useMutation({
    onError: (error) => {
      console.warn('Auto-save failed:', error.message)
    }
  })

  const { data: presets = [], refetch: refetchPresets } = trpc.layout.listPresets.useQuery(
    { workspaceId },
    { enabled: enabled && !!workspaceId }
  )

  const deletePresetMutation = trpc.layout.deletePreset.useMutation({
    onSuccess: () => {
      toast({
        title: 'Layout Deleted',
        description: 'Layout preset deleted successfully',
      })
      refetchPresets()
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  const setDefaultMutation = trpc.layout.setDefaultPreset.useMutation({
    onSuccess: () => {
      toast({
        title: 'Default Set',
        description: 'Default layout preset updated',
      })
      refetchPresets()
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      })
    }
  })

  // Convert panels to layout data format
  const generateLayoutData = useCallback((currentPanels: Panel[], layouts?: Layouts): LayoutData => {
    // Use provided layouts or generate from panels
    const gridLayout = layouts || {
      lg: currentPanels.map(panel => ({
        i: panel.id,
        x: panel.position_x,
        y: panel.position_y,
        w: panel.width,
        h: panel.height,
        minW: 2,
        minH: 2,
        maxW: 24,
        maxH: 24,
        isDraggable: !panel.is_locked,
        isResizable: !panel.is_locked
      }))
    }

    return {
      panels: currentPanels,
      gridLayout
    }
  }, [])

  // Save current layout as named preset
  const savePreset = useCallback((name: string, description?: string, isDefault = false) => {
    if (!enabled || !workspaceId || panels.length === 0) return

    const layoutData = generateLayoutData(panels)
    
    savePresetMutation.mutate({
      workspaceId,
      name,
      description,
      isDefault,
      layoutData
    })
  }, [enabled, workspaceId, panels, generateLayoutData, savePresetMutation])

  // Load a preset by ID
  const loadPreset = useCallback((presetId: string) => {
    if (!enabled || !workspaceId) return

    loadPresetMutation.mutate({
      presetId,
      workspaceId
    })
  }, [enabled, workspaceId, loadPresetMutation])

  // Delete a preset
  const deletePreset = useCallback((presetId: string) => {
    if (!enabled || !workspaceId) return

    deletePresetMutation.mutate({
      presetId,
      workspaceId
    })
  }, [enabled, workspaceId, deletePresetMutation])

  // Set default preset
  const setDefaultPreset = useCallback((presetId: string) => {
    if (!enabled || !workspaceId) return

    setDefaultMutation.mutate({
      presetId,
      workspaceId
    })
  }, [enabled, workspaceId, setDefaultMutation])

  // Auto-save current layout
  const performAutoSave = useCallback(() => {
    if (!enabled || !workspaceId || panels.length === 0) return

    const layoutData = generateLayoutData(panels)
    const layoutString = JSON.stringify(layoutData)

    // Only save if layout has changed
    if (layoutString !== lastSavedLayoutRef.current) {
      autoSaveMutation.mutate({
        workspaceId,
        layoutData
      })
      lastSavedLayoutRef.current = layoutString
    }
  }, [enabled, workspaceId, panels, generateLayoutData, autoSaveMutation])

  // Schedule auto-save
  const scheduleAutoSave = useCallback(() => {
    if (!enabled || autoSaveInterval <= 0) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Schedule new auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave()
      scheduleAutoSave() // Schedule next auto-save
    }, autoSaveInterval)
  }, [enabled, autoSaveInterval, performAutoSave])

  // Handle layout changes (debounced auto-save)
  const onLayoutChange = useCallback((layouts: Layouts) => {
    if (!enabled) return

    // Update last saved layout reference with new layout
    const layoutData = generateLayoutData(panels, layouts)
    lastSavedLayoutRef.current = JSON.stringify(layoutData)

    // Schedule auto-save
    scheduleAutoSave()
  }, [enabled, panels, generateLayoutData, scheduleAutoSave])

  // Start auto-save on mount and clean up on unmount
  useEffect(() => {
    if (enabled && panels.length > 0) {
      scheduleAutoSave()
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [enabled, panels.length, scheduleAutoSave])

  // Save immediately when panels change significantly
  useEffect(() => {
    if (enabled && panels.length > 0) {
      const layoutData = generateLayoutData(panels)
      const layoutString = JSON.stringify(layoutData)
      
      // If this is a significant change (panel added/removed), save immediately
      if (lastSavedLayoutRef.current && layoutString !== lastSavedLayoutRef.current) {
        const lastData = JSON.parse(lastSavedLayoutRef.current)
        const currentData = layoutData
        
        // Check if panel count changed (significant change)
        if (lastData.panels.length !== currentData.panels.length) {
          performAutoSave()
        }
      }
    }
  }, [enabled, panels, generateLayoutData, performAutoSave])

  return {
    // Preset management
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    setDefaultPreset,
    refetchPresets,

    // Auto-save
    performAutoSave,
    onLayoutChange,

    // Loading states
    isSaving: savePresetMutation.isLoading,
    isLoading: loadPresetMutation.isLoading,
    isDeleting: deletePresetMutation.isLoading,
    isSettingDefault: setDefaultMutation.isLoading,

    // Auto-save state
    isAutoSaving: autoSaveMutation.isLoading,

    // Utils
    generateLayoutData
  }
}