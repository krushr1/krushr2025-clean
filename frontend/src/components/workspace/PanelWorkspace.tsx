import React, { useMemo, useCallback, useEffect, useState } from 'react'
import GridLayout, { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { trpc } from '../../lib/trpc'
import PanelRenderer from './PanelRenderer'
import { cn, debounce } from '../../lib/utils'
import { useLayoutPersistence } from '../../hooks/use-layout-persistence'

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
  data?: any
}

export default function PanelWorkspace({ workspaceId, className }: PanelWorkspaceProps) {
  const [focusedPanelId, setFocusedPanelId] = useState<string | null>(null)

  const { data: allPanels = [], refetch } = trpc.panel.list.useQuery(
    { workspaceId },
    { 
      staleTime: 0,
      gcTime: 60000,
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    }
  )

  // Track hidden panels
  const [hiddenPanelIds, setHiddenPanelIds] = useState<Set<string>>(new Set())

  // Visible panels for layout
  const panels = useMemo(() =>
    allPanels.filter(panel => !hiddenPanelIds.has(panel.id)) as any[],
    [allPanels, hiddenPanelIds]
  )

  const [containerWidth, setContainerWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth // Use full width
    }
    return 1600
  })
  
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.panel-workspace-container')
      if (container) {
        const width = container.clientWidth || window.innerWidth
        setContainerWidth(width)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

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
    }
  })

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'Escape' && fullscreenPanel) {
        e.preventDefault()
        toggleFullscreen.mutate({ id: fullscreenPanel.id })
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'm' && focusedPanelId) {
        e.preventDefault()
        toggleMinimize.mutate({ id: focusedPanelId })
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && focusedPanelId) {
        e.preventDefault()
        toggleFullscreen.mutate({ id: focusedPanelId })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenPanel, focusedPanelId, panels])

  const handleFullscreen = useCallback((panelId: string, isFullscreen: boolean) => {
    refetch()
  }, [refetch])

  const handleFocus = useCallback((panelId: string) => {
    setFocusedPanelId(panelId)
  }, [])

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

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (panels.length === 0 || !newLayout) return
    
    console.log('🔄 Layout Change Handler:', {
      panelCount: panels.length,
      newLayoutCount: newLayout.length,
      newLayout: newLayout.map(item => ({ id: item.i, x: item.x, y: item.y, w: item.w, h: item.h }))
    })

    const optimizedLayout = newLayout.map(item => ({
      ...item,
      w: Math.max(2, Math.min(24, item.w)), // Ensure width between 2-24 grid units
      h: Math.max(2, Math.min(50, item.h))  // Ensure height between 2-50 grid units
    }))

    const updates = optimizedLayout
      .filter(item => {
        const panel = allPanels.find(p => p.id === item.i)
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

    if (updates.length > 0) {
      console.log('💾 Applying layout updates:', updates.length, 'panels')
      debouncedUpdatePositions(updates)
    }

    // Note: Removed onLayoutPersistenceChange call to prevent conflicts
  }, [panels, debouncedUpdatePositions, onLayoutPersistenceChange, allPanels])

  const [originalLayout, setOriginalLayout] = useState<Layout[] | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging && originalLayout) {
        console.log('🔄 Escape pressed - snapping back to original layout')
      }
    }

    if (isDragging) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDragging, originalLayout])

  const handlePanelDragStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    setOriginalLayout([...layout])
    setIsDragging(true)
    
    element.style.zIndex = '9998' // Below fullscreen panels
    element.style.opacity = '0.95'
    element.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out'
    element.style.transform += ' scale(1.02)'
    
    element.style.boxShadow = '0 8px 20px rgba(20, 49, 151, 0.15), 0 4px 8px rgba(0,0,0,0.1)'
    
    element.style.border = '2px solid rgba(20, 49, 151, 0.4)'
    
    console.log('🎯 Drag started - stored original layout:', {
      originalCount: layout.length,
      draggedPanel: oldItem.i
    })
  }, [])

  const handlePanelDrag = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    element.style.transform = element.style.transform.replace(/scale\([^)]*\)/, 'scale(1.02)')
  }, [])

  const handlePanelDragStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    setIsDragging(false)
    
    const positionChanged = Math.abs(oldItem.x - newItem.x) > 0.1 || Math.abs(oldItem.y - newItem.y) > 0.1
    const sizeChanged = Math.abs(oldItem.w - newItem.w) > 0.1 || Math.abs(oldItem.h - newItem.h) > 0.1
    
    console.log('🎯 Drag stopped:', {
      panelId: newItem.i,
      positionChanged,
      sizeChanged,
      oldPos: { x: oldItem.x, y: oldItem.y },
      newPos: { x: newItem.x, y: newItem.y }
    })
    
    element.style.transition = 'all 0.3s ease-out'
    element.style.zIndex = ''
    element.style.opacity = ''
    element.style.transform = element.style.transform
      .replace(/scale\([^)]*\)/, '')
      .trim()
    element.style.boxShadow = ''
    element.style.border = ''
    
    if (positionChanged || sizeChanged) {
      console.log('💾 Saving layout change immediately')
      handleLayoutChange(layout)
    }
    
    setTimeout(() => {
      element.style.transition = ''
      setOriginalLayout(null)
    }, 300)
  }, [handleLayoutChange])

  const handlePanelResizeStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    element.style.zIndex = '9997' // Below dragging panels
    element.style.opacity = '0.98'
    element.style.transition = 'border 0.15s ease-out'
    element.style.border = '2px solid rgba(31, 187, 101, 0.5)' // Krushr success color
  }, [])

  const handlePanelResize = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {}, [])

  const handlePanelResizeStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
    element.style.transition = 'all 0.2s ease-out'
    element.style.zIndex = ''
    element.style.opacity = ''
    element.style.border = ''
    
    setTimeout(() => {
      element.style.transition = ''
    }, 200)
    
    handleLayoutChange(layout)
  }, [handleLayoutChange])

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
    } as Layout))
    
    console.log('📊 Panel to Grid Layout Conversion:', {
      panelCount: panels.length,
      panelDimensions: panels.map(p => ({ id: p.id, w: p.width, h: p.height, x: p.position_x, y: p.position_y })),
      gridLayout: gridLayout.map(l => ({ id: l.i, w: l.w, h: l.h, x: l.x, y: l.y, minW: l.minW, minH: l.minH, maxW: l.maxW, maxH: l.maxH }))
    })
    
    gridLayout.forEach(item => {
      if ((item.w || 0) < (item.minW || 2) || (item.h || 0) < (item.minH || 2)) {
        console.warn('⚠️ Panel size below minimum:', item)
      }
    })
    
    return gridLayout
  }, [panels])



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
          border-radius: 16px;
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
          border-radius: 16px;
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

        .react-grid-item.snapping {
          border: 2px solid rgba(20, 49, 151, 0.6);
          box-shadow: 0 0 0 4px rgba(20, 49, 151, 0.1);
        }

        .react-grid-item.focusing {
          animation: focusPulse 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @keyframes focusPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        .react-grid-layout {
          transition: height 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

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
        {allPanels.map(panel => (
          <div 
            key={panel.id} 
            className="panel-container"
            data-panel-type={panel.type}
            style={{ display: hiddenPanelIds.has(panel.id) ? 'none' : 'block' }}
          >
                                      <PanelRenderer 
              panel={{ ...panel, data: panel.data || {} }}
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