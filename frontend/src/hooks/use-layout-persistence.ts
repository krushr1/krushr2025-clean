
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

  const generateLayoutData = useCallback((currentPanels: Panel[], layouts?: Layouts): LayoutData => {
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

  const loadPreset = useCallback((presetId: string) => {
    if (!enabled || !workspaceId) return

    loadPresetMutation.mutate({
      presetId,
      workspaceId
    })
  }, [enabled, workspaceId, loadPresetMutation])

  const deletePreset = useCallback((presetId: string) => {
    if (!enabled || !workspaceId) return

    deletePresetMutation.mutate({
      presetId,
      workspaceId
    })
  }, [enabled, workspaceId, deletePresetMutation])

  const setDefaultPreset = useCallback((presetId: string) => {
    if (!enabled || !workspaceId) return

    setDefaultMutation.mutate({
      presetId,
      workspaceId
    })
  }, [enabled, workspaceId, setDefaultMutation])

  const performAutoSave = useCallback(() => {
    if (!enabled || !workspaceId || panels.length === 0) return

    const layoutData = generateLayoutData(panels)
    const layoutString = JSON.stringify(layoutData)

    if (layoutString !== lastSavedLayoutRef.current) {
      autoSaveMutation.mutate({
        workspaceId,
        layoutData
      })
      lastSavedLayoutRef.current = layoutString
    }
  }, [enabled, workspaceId, panels, generateLayoutData, autoSaveMutation])

  const scheduleAutoSave = useCallback(() => {
    if (!enabled || autoSaveInterval <= 0) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave()
      scheduleAutoSave() // Schedule next auto-save
    }, autoSaveInterval)
  }, [enabled, autoSaveInterval, performAutoSave])

  const onLayoutChange = useCallback((layouts: Layouts) => {
    if (!enabled) return

    const layoutData = generateLayoutData(panels, layouts)
    lastSavedLayoutRef.current = JSON.stringify(layoutData)

    scheduleAutoSave()
  }, [enabled, panels, generateLayoutData, scheduleAutoSave])

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

  useEffect(() => {
    if (enabled && panels.length > 0) {
      const layoutData = generateLayoutData(panels)
      const layoutString = JSON.stringify(layoutData)
      
      if (lastSavedLayoutRef.current && layoutString !== lastSavedLayoutRef.current) {
        const lastData = JSON.parse(lastSavedLayoutRef.current)
        const currentData = layoutData
        
        if (lastData.panels.length !== currentData.panels.length) {
          performAutoSave()
        }
      }
    }
  }, [enabled, panels, generateLayoutData, performAutoSave])

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    setDefaultPreset,
    refetchPresets,

    performAutoSave,
    onLayoutChange,

    isSaving: savePresetMutation.isLoading,
    isLoading: loadPresetMutation.isLoading,
    isDeleting: deletePresetMutation.isLoading,
    isSettingDefault: setDefaultMutation.isLoading,

    isAutoSaving: autoSaveMutation.isLoading,

    generateLayoutData
  }
}