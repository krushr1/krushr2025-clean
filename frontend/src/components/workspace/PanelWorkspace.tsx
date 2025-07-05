import React, { useMemo, useCallback, useEffect, useState } from 'react'
import GridLayout, { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { trpc } from '../../lib/trpc'
import PanelRenderer from './PanelRenderer'
import { cn, debounce } from '../../lib/utils'
import { useLayoutPersistence } from '../../hooks/use-layout-persistence'

// Make GridLayout responsive with width provider but use fixed layout
const ResponsiveGridLayout = WidthProvider(Responsive)
const FixedGridLayout = WidthProvider(GridLayout)

interface PanelWorkspaceProps {
  workspaceId: string
  className?: string
}

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

export default function PanelWorkspace({ workspaceId, className }: PanelWorkspaceProps) {
  // State for focused panel (keep local state for focus, but not fullscreen)
  const [focusedPanelId, setFocusedPanelId] = useState<string | null>(null)

  // Fetch panels for this workspace with fresh data on mount
  const { data: panels = [], refetch } = trpc.panel.list.useQuery(
    { workspaceId },
    { 
      staleTime: 0, // Always fetch fresh data
      gcTime: 60000, // Keep in cache for 1 minute only (was cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: 'always', // Always refetch on component mount
      onSuccess: (data) => {
        console.log('🔍 Panels loaded from database:', {
          count: data.length,
          panels: data.map(p => ({ 
            id: p.id, 
            title: p.title,
            dimensions: { w: p.width, h: p.height, x: p.position_x, y: p.position_y }
          }))
        })
      }
    }
  )

  // Container width tracking for responsive layout
  const [containerWidth, setContainerWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth // Use full width
    }
    return 1600
  })
  
  // Update container width when window resizes
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.panel-workspace-container')
      if (container) {
        // Use full available width
        const width = container.clientWidth || window.innerWidth
        setContainerWidth(width)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Layout persistence hook (enabled for auto-save)
  const {
    onLayoutChange: onLayoutPersistenceChange,
    performAutoSave,
    isAutoSaving
  } = useLayoutPersistence({
    workspaceId,
    panels,
    autoSaveInterval: 30000, // Auto-save every 30 seconds
    enabled: false // Temporarily disable to prevent conflicts with real-time updates
  })
  
  // Find fullscreen panel from database state, not local state
  const fullscreenPanel = panels.find(panel => {
    try {
      const panelData = typeof panel.data === 'string' ? JSON.parse(panel.data) : panel.data
      return panelData?.isFullscreen === true
    } catch {
      return false
    }
  })
  const updatePositions = trpc.panel.updatePositions.useMutation({
    onSuccess: () => {
      // Optionally refetch or use optimistic updates
    }
  })

  // Panel control mutations for keyboard shortcuts
  const toggleFullscreen = trpc.panel.toggleFullscreen.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  const toggleMinimize = trpc.panel.toggleMinimize.useMutation({
    onSuccess: () => {
      refetch()
    }
  })

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when no input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Escape key exits fullscreen
      if (e.key === 'Escape' && fullscreenPanel) {
        e.preventDefault()
        // Exit fullscreen mode
        toggleFullscreen.mutate({ id: fullscreenPanel.id })
      }

      // Cmd/Ctrl + M toggles minimize on focused panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'm' && focusedPanelId) {
        e.preventDefault()
        toggleMinimize.mutate({ id: focusedPanelId })
      }

      // Cmd/Ctrl + F toggles fullscreen on focused panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && focusedPanelId) {
        e.preventDefault()
        toggleFullscreen.mutate({ id: focusedPanelId })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenPanel, focusedPanelId, panels])

  // Handle fullscreen changes - now just triggers a refetch since state is in database
  const handleFullscreen = useCallback((panelId: string, isFullscreen: boolean) => {
    // The state is already updated in the database by the mutation
    // Just refetch to get the latest data
    refetch()
  }, [refetch])

  // Handle panel focus
  const handleFocus = useCallback((panelId: string) => {
    setFocusedPanelId(panelId)
  }, [])

  // Debounced update function to prevent excessive database calls (defined early for use in handlers)
  const debouncedUpdatePositions = useMemo(() => 
    debounce((updates: any[]) => {
      if (updates.length > 0) {
        updatePositions.mutate({
          workspaceId,
          updates
        })
      }
    }, 100), // 100ms delay - very responsive for position stability
    [workspaceId, updatePositions]
  )

  // iOS-style smart layout change handler (defined early for use in drag handlers)
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    // Only update if we have panels and the layout actually changed
    if (panels.length === 0 || !newLayout) return
    
    console.log('🔄 Layout Change Handler:', {
      panelCount: panels.length,
      newLayoutCount: newLayout.length,
      newLayout: newLayout.map(item => ({ id: item.i, x: item.x, y: item.y, w: item.w, h: item.h }))
    })

    // Preserve exact positions and dimensions - minimal constraints only
    const optimizedLayout = newLayout.map(item => ({
      ...item,
      w: Math.max(2, Math.min(24, item.w)), // Ensure width between 2-24 grid units
      h: Math.max(2, Math.min(50, item.h))  // Ensure height between 2-50 grid units
    }))

    const updates = optimizedLayout
      .filter(item => {
        const panel = panels.find(p => p.id === item.i)
        const hasChanges = panel && (
          panel.position_x !== item.x ||
          panel.position_y !== item.y ||
          panel.width !== item.w ||
          panel.height !== item.h
        )
        
        if (hasChanges && panel) {
          console.log('🔄 Panel dimension change detected:', {
            panelId: panel.id,
            oldDimensions: { x: panel.position_x, y: panel.position_y, w: panel.width, h: panel.height },
            newDimensions: { x: item.x, y: item.y, w: item.w, h: item.h }
          })
        }
        
        return hasChanges
      })
      .map(item => ({
        id: item.i,
        position_x: item.x,
        position_y: item.y,
        width: item.w,
        height: item.h
      }))

    // Only update if there are actual changes
    if (updates.length > 0) {
      console.log('💾 Applying layout updates:', updates.length, 'panels')
      debouncedUpdatePositions(updates)
    }

    // Note: Removed onLayoutPersistenceChange call to prevent conflicts
    // Layout persistence is now handled only by real-time panel updates
  }, [panels, debouncedUpdatePositions, onLayoutPersistenceChange])

  // Store original layout for potential snap-back (iOS behavior)
  const [originalLayout, setOriginalLayout] = useState<Layout[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // iOS-style snap-back on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging && originalLayout) {
        console.log('🔄 Escape pressed - snapping back to original layout')
        // This would need to be implemented with a ref to the grid layout
        // For now, we'll rely on the natural drag cancellation behavior
      }
    }

    if (isDragging) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDragging, originalLayout])

  // Fluid, receptive panel drag handlers with iOS-style behavior
  const handlePanelDragStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // Store current layout for potential snap-back
    setOriginalLayout([...layout])
    setIsDragging(true)
    
    // Enhanced visual feedback for dragging with Krushr colors
    element.style.zIndex = '9998' // Below fullscreen panels
    element.style.opacity = '0.95'
    element.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out'
    element.style.transform += ' scale(1.02)'
    
    // Use Krushr brand colors for better visual consistency
    element.style.boxShadow = '0 8px 20px rgba(20, 49, 151, 0.15), 0 4px 8px rgba(0,0,0,0.1)'
    
    // Add Krushr primary color border
    element.style.border = '2px solid rgba(20, 49, 151, 0.4)'
    
    console.log('🎯 Drag started - stored original layout:', {
      originalCount: layout.length,
      draggedPanel: oldItem.i
    })
  }, [])

  const handlePanelDrag = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // iOS-style collision handling - other panels move out of the way intelligently
    // React Grid Layout handles this automatically with compactType="vertical"
    
    // Welcoming placeholder styling - shows where panel will land
    if (placeholder) {
      placeholder.style = {
        ...placeholder.style,
        background: 'rgba(34, 197, 94, 0.15)', // Gentle green - welcoming
        border: '2px dashed rgba(34, 197, 94, 0.4)',
        borderRadius: '12px',
        transition: 'all 0.2s ease-out'
      }
    }
    
    // Smooth visual feedback during drag
    element.style.transform = element.style.transform.replace(/scale\([^)]*\)/, 'scale(1.02)')
  }, [])

  const handlePanelDragStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    setIsDragging(false)
    
    // Check if position actually changed significantly (iOS behavior)
    const positionChanged = Math.abs(oldItem.x - newItem.x) > 0.1 || Math.abs(oldItem.y - newItem.y) > 0.1
    const sizeChanged = Math.abs(oldItem.w - newItem.w) > 0.1 || Math.abs(oldItem.h - newItem.h) > 0.1
    
    console.log('🎯 Drag stopped:', {
      panelId: newItem.i,
      positionChanged,
      sizeChanged,
      oldPos: { x: oldItem.x, y: oldItem.y },
      newPos: { x: newItem.x, y: newItem.y }
    })
    
    // Smooth transition back to normal state
    element.style.transition = 'all 0.3s ease-out'
    element.style.zIndex = ''
    element.style.opacity = ''
    element.style.transform = element.style.transform
      .replace(/scale\([^)]*\)/, '')
      .trim()
    element.style.boxShadow = ''
    element.style.border = ''
    
    // Immediately save the layout change (no delays)
    if (positionChanged || sizeChanged) {
      console.log('💾 Saving layout change immediately')
      handleLayoutChange(layout)
    }
    
    // Clean up transition after animation
    setTimeout(() => {
      element.style.transition = ''
      setOriginalLayout(null)
    }, 300)
  }, [handleLayoutChange])

  // Responsive panel resize handlers
  const handlePanelResizeStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // Enhanced visual feedback for resizing with Krushr success color
    element.style.zIndex = '9997' // Below dragging panels
    element.style.opacity = '0.98'
    element.style.transition = 'border 0.15s ease-out'
    element.style.border = '2px solid rgba(31, 187, 101, 0.5)' // Krushr success color
  }, [])

  const handlePanelResize = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // Welcoming resize preview
    if (placeholder) {
      placeholder.style = {
        ...placeholder.style,
        background: 'rgba(16, 185, 129, 0.1)', // Very subtle green
        border: '2px dashed rgba(16, 185, 129, 0.4)',
        borderRadius: '12px',
        transition: 'all 0.15s ease-out'
      }
    }
  }, [])

  const handlePanelResizeStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    // Smooth transition back to normal state
    element.style.transition = 'all 0.2s ease-out'
    element.style.zIndex = ''
    element.style.opacity = ''
    element.style.border = ''
    
    // Clean up transition after animation
    setTimeout(() => {
      element.style.transition = ''
    }, 200)
    
    // Trigger gentle layout update
    handleLayoutChange(layout)
  }, [handleLayoutChange])

  // Convert panels to grid layout format - fixed size regardless of screen
  const layout = useMemo(() => {
    const gridLayout = panels.map(panel => ({
      i: panel.id,
      x: panel.position_x,
      y: panel.position_y,
      w: panel.width,
      h: panel.height,
      minW: 2,
      minH: 2,
      maxW: 24,
      maxH: 50,
      isDraggable: !panel.is_locked,
      isResizable: !panel.is_locked
    }))
    
    console.log('📊 Panel to Grid Layout Conversion:', {
      panelCount: panels.length,
      panelDimensions: panels.map(p => ({ id: p.id, w: p.width, h: p.height, x: p.position_x, y: p.position_y })),
      gridLayout: gridLayout.map(l => ({ id: l.i, w: l.w, h: l.h, x: l.x, y: l.y, minW: l.minW, minH: l.minH, maxW: l.maxW, maxH: l.maxH }))
    })
    
    // Check for any constraints that might be causing shrinkage
    gridLayout.forEach(item => {
      if (item.w < item.minW || item.h < item.minH) {
        console.warn('⚠️ Panel size below minimum:', item)
      }
    })
    
    return gridLayout
  }, [panels])



  // Increased columns for more granular sizing control
  const cols = 24

  if (panels.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full p-8', className)}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No panels yet</h3>
          <p className="text-gray-600">Add panels using the toolbar above to get started.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('panel-workspace panel-workspace-container h-full flex-1', className)} style={{ overflowX: 'visible', overflowY: 'auto', scrollBehavior: 'auto' }}>
      <style>{`
        .react-grid-layout {
          position: relative;
          min-height: 100%;
          overflow: visible;
        }
        
        .react-grid-item {
          transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
          transition-property: left, top, width, height, transform, box-shadow, border;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06);
          will-change: transform, box-shadow;
          cursor: grab;
        }
        
        .react-grid-item:hover {
          box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px -2px rgb(0 0 0 / 0.08);
          transform: translateY(-0.5px);
          border-color: rgba(59, 130, 246, 0.3);
          cursor: grab;
        }
        
        .react-grid-item:active {
          cursor: grabbing;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgba(34, 197, 94, 0.1);
          border: 2px dashed rgba(34, 197, 94, 0.4);
          border-radius: 12px;
          transition: all 150ms cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 2;
          user-select: none;
          backdrop-filter: blur(2px);
        }
        
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 9998;
          opacity: 0.95;
          transform: scale(1.02);
          box-shadow: 0 8px 20px rgba(20, 49, 151, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(20, 49, 151, 0.4);
          cursor: grabbing;
        }
        
        .react-grid-item.resizing {
          z-index: 9997;
          opacity: 0.95;
          border: 2px solid rgba(31, 187, 101, 0.4);
          box-shadow: 0 8px 24px rgba(31, 187, 101, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        /* iOS-style magnetic snap indicators with Krushr branding */
        .react-grid-item.snapping {
          border: 2px solid rgba(20, 49, 151, 0.6);
          box-shadow: 0 0 0 4px rgba(20, 49, 151, 0.1);
        }

        /* Enhanced animations for panel interactions */
        .react-grid-item.focusing {
          animation: focusPulse 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes focusPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        /* Smooth transitions for layout compaction */
        .react-grid-layout {
          transition: height 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Invisible full-edge resize handles */
        .react-resizable-handle {
          position: absolute;
          background-color: transparent !important;
          background-image: none !important;
          background: none !important;
        }

        .react-resizable-handle::before,
        .react-resizable-handle::after {
          display: none !important;
          content: none !important;
          background: none !important;
        }

        .react-resizable-handle > * {
          display: none !important;
        }

        /* Corner handles - larger and more accessible */
        .react-resizable-handle-se {
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          cursor: se-resize;
        }

        .react-resizable-handle-ne {
          top: 0;
          right: 0;
          width: 20px;
          height: 20px;
          cursor: ne-resize;
        }

        .react-resizable-handle-sw {
          bottom: 0;
          left: 0;
          width: 20px;
          height: 20px;
          cursor: sw-resize;
        }

        .react-resizable-handle-nw {
          top: 0;
          left: 0;
          width: 20px;
          height: 20px;
          cursor: nw-resize;
        }

        /* Full-length edge handles - wider and easier to grab */
        .react-resizable-handle-e {
          top: 0;
          right: -6px;
          bottom: 0;
          width: 12px;
          cursor: e-resize;
        }

        .react-resizable-handle-w {
          top: 0;
          left: -6px;
          bottom: 0;
          width: 12px;
          cursor: w-resize;
        }

        .react-resizable-handle-n {
          top: -6px;
          left: 0;
          right: 0;
          height: 12px;
          cursor: n-resize;
        }

        .react-resizable-handle-s {
          bottom: -6px;
          left: 0;
          right: 0;
          height: 12px;
          cursor: s-resize;
        }
      `}</style>
      
      <FixedGridLayout
        className="layout"
        layout={layout}
        cols={cols}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se', 'e', 's', 'w', 'n', 'nw', 'ne', 'sw']}
        margin={[12, 12]}
        containerPadding={[16, 16]}
        rowHeight={25}
        draggableHandle=".panel-drag-handle"
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
        autoSize={true}
        draggableCancel="input,textarea,button,select,option,.panel-content"
        transformScale={1}
        width={Math.max(containerWidth, 5000)}
        onDrag={handlePanelDrag}
        onDragStart={handlePanelDragStart}
        onDragStop={handlePanelDragStop}
        onResize={handlePanelResize}
        onResizeStart={handlePanelResizeStart}
        onResizeStop={handlePanelResizeStop}
      >
        {panels.map(panel => (
          <div 
            key={panel.id} 
            className="panel-container"
            data-panel-type={panel.type}
          >
            <PanelRenderer 
              panel={panel} 
              workspaceId={workspaceId}
              onRefresh={refetch}
              onFullscreen={handleFullscreen}
              onFocus={handleFocus}
            />
          </div>
        ))}
      </FixedGridLayout>

      {/* No separate fullscreen overlay needed - PanelRenderer handles fullscreen with CSS classes */}
    </div>
  )
}

/**
 * PanelWorkspace - Modern drag-and-drop panel workspace
 * Replaces legacy Packery.js with React Grid Layout
 */