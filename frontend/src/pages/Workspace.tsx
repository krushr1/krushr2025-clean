/**
 * Workspace Page - Modern panel-based workspace
 * Replaces traditional app switching with unlimited panels
 */

import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import Layout from '../components/project/Layout'
import PanelWorkspace from '../components/workspace/PanelWorkspace'
import WorkspaceHeaderConsolidated from '../components/workspace/WorkspaceHeaderConsolidated'
import SimpleEnhancedHeader from '../components/workspace/SimpleEnhancedHeader'
import { trpc } from '../lib/trpc'
import { Loader2, Focus } from 'lucide-react'
import { useAuthStore } from '../stores/auth-store'
import { useUIStore } from '../stores/ui-store'
import CompactTaskModal from '../components/kanban/CompactTaskModal'
import LayoutManagerModal from '../components/workspace/LayoutManagerModal'

export default function Workspace() {
  const navigate = useNavigate()
  const { workspaceId } = useParams()
  
  // All hooks must be called unconditionally
  const utils = trpc.useUtils()
  const { 
    showTaskCreationModal, 
    taskCreationColumnId,
    taskCreationKanbanId,
    openTaskCreationModal, 
    closeTaskCreationModal,
    showLayoutManager,
    layoutManagerMode,
    openLayoutManager,
    closeLayoutManager,
    triggerNoteCreation,
    toggleFocusMode,
    focusMode
  } = useUIStore()
  
  const { data: workspaces, isLoading } = trpc.workspace.list.useQuery(undefined, {
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000, // Keep in cache for 10 minutes
  })
  
  console.log('[Workspace Debug] workspaces data:', workspaces)
  console.log('[Workspace Debug] workspaces length:', workspaces?.length)
  console.log('[Workspace Debug] first workspace:', workspaces?.[0])
  console.log('[Workspace Debug] first workspace _count:', workspaces?.[0]?._count)
  
  // Use workspace from URL params, or fallback to first workspace
  const activeWorkspace = workspaceId 
    ? workspaces?.find(w => w.id === workspaceId)
    : workspaces?.find(w => {
        console.log('[Workspace Debug] Checking workspace:', w.id, 'with _count:', w._count)
        return w._count?.projects > 0 || w._count?.teams > 0 || w._count?.kanbans > 0
      }) || workspaces?.[0]

  console.log('[Workspace Debug] activeWorkspace selected:', activeWorkspace)

  const { data: panels = [] } = trpc.panel.list.useQuery(
    { workspaceId: activeWorkspace?.id ?? '' },
    { 
      enabled: !!activeWorkspace?.id,
      staleTime: 60000, // Cache for 1 minute
      cacheTime: 300000, // Keep in cache for 5 minutes
    }
  )
  
  // Get the first kanban board to create tasks in
  const { data: kanbans = [] } = trpc.kanban.list.useQuery(
    { workspaceId: activeWorkspace?.id ?? '' },
    { 
      enabled: !!activeWorkspace?.id,
      staleTime: 60000,
      cacheTime: 300000,
    }
  )
  
  const firstKanban = kanbans[0]
  
  // Get kanban columns for the first kanban
  const { data: firstKanbanData } = trpc.kanban.get.useQuery(
    { id: firstKanban?.id ?? '' },
    { 
      enabled: !!firstKanban?.id,
      staleTime: 60000,
      cacheTime: 300000,
    }
  )
  
  const createPanel = trpc.panel.create.useMutation({
    onSuccess: () => {
      // Refetch panels after creation
      if (activeWorkspace) {
        utils.panel.list.invalidate({ workspaceId: activeWorkspace.id })
      }
    }
  })

  const toggleMinimizeAll = trpc.panel.toggleMinimizeAll.useMutation({
    onSuccess: () => {
      if (activeWorkspace) {
        utils.panel.list.invalidate({ workspaceId: activeWorkspace.id })
      }
    }
  })

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path)
    navigate(path)
  }

  // Keyboard shortcut handler for focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+Shift+F or Ctrl+Shift+F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-krushr-primary" />
            <p className="text-gray-600">Loading workspace...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!activeWorkspace) {
    return (
      <Layout>
        <div className="flex flex-col min-h-full" style={{ backgroundColor: 'hsl(0deg 0% 96.47%)' }}>
          {/* Simple Enhanced Header for testing */}
          <SimpleEnhancedHeader workspaceId="demo-workspace-id" />
          
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workspace Found</h2>
              <p className="text-gray-600">
                You need to create or join a workspace to use the panel system.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                (Enhanced header shown above for testing)
              </p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const handleCreatePanel = (type: string) => {
    if (!activeWorkspace) return
    
    // Special handling for task creation - open modal instead of creating a panel
    if (type === 'TASK') {
      // Get the first kanban column if available
      const firstKanbanColumn = firstKanbanData?.columns?.[0]
      openTaskCreationModal({ 
        kanbanId: firstKanban?.id,
        columnId: firstKanbanColumn?.id 
      })
      return
    }
    
    // Special handling for note creation - trigger note creation in existing panel
    if (type === 'NOTE') {
      triggerNoteCreation()
      return
    }
    
    // Create a new panel based on type
    const panelConfig = {
      KANBAN: { title: 'New Kanban Board', width: 8, height: 12 },
      NOTES: { title: 'New Note', width: 6, height: 10 },
      CALENDAR: { title: 'Calendar', width: 10, height: 14 },
      CHAT: { title: 'Chat', width: 6, height: 12 },
    }
    
    const config = panelConfig[type as keyof typeof panelConfig] || { title: 'New Panel', width: 6, height: 10 }
    
    createPanel.mutate({
      workspaceId: activeWorkspace.id,
      type,
      title: config.title,
      position_x: 0,
      position_y: 0,
      width: config.width,
      height: config.height,
      data: {}
    })
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'logout':
        const authStore = useAuthStore.getState()
        authStore.logout()
        navigate('/login')
        break
        
      case 'save-layout':
        openLayoutManager('save')
        break
        
      case 'load-layout':
        openLayoutManager('load')
        break
        
      case 'focus-mode':
        toggleFocusMode()
        break
        
      case 'minimize-all':
        handleMinimizeAll()
        break
        
      case 'view-grid':
      case 'view-list':
        // TODO: Implement view switching
        console.log(`Switching to ${action.replace('view-', '')} view...`)
        break
        
      case 'ai-analyze':
      case 'ai-schedule':
      case 'ai-suggest':
        // TODO: Implement AI features
        console.log(`AI feature: ${action}`)
        break
        
      default:
        console.log('Unknown action:', action)
    }
  }

  const handleMinimizeAll = () => {
    if (!activeWorkspace) return
    
    // Check if any panels are currently not minimized
    const hasNonMinimizedPanels = (panels || []).some(panel => !panel.is_minimized)
    
    // If all panels are already minimized, restore them; otherwise minimize all
    toggleMinimizeAll.mutate({
      workspaceId: activeWorkspace.id,
      minimize: hasNonMinimizedPanels
    })
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-full" style={{ backgroundColor: 'hsl(0deg 0% 96.47%)' }}>
        {/* Focus mode indicator */}
        {focusMode && (
          <div className="bg-krushr-primary text-white text-sm py-1 px-4 flex items-center justify-center">
            <Focus className="w-4 h-4 mr-2" />
            Focus Mode Active - Press ⌘⇧F to exit
          </div>
        )}
        
        {/* Consolidated Workspace Header */}
        <WorkspaceHeaderConsolidated
          workspaceId={activeWorkspace.id}
          panels={panels}
          onNavigate={handleNavigate}
          onCreatePanel={handleCreatePanel}
          onAction={handleAction}
        />
        
        {/* Drag-and-Drop Panel Workspace */}
        <PanelWorkspace 
          workspaceId={activeWorkspace.id} 
          className="flex-1"
        />
        
        {/* Global Task Creation Modal */}
        {showTaskCreationModal && firstKanban && (
          <CompactTaskModal
            open={showTaskCreationModal}
            onClose={closeTaskCreationModal}
            workspaceId={activeWorkspace.id}
            kanbanId={taskCreationKanbanId || firstKanban.id}
            kanbanColumnId={taskCreationColumnId || firstKanbanData?.columns?.[0]?.id}
            onSuccess={() => {
              closeTaskCreationModal()
              // Refetch tasks across all Kanban boards
              utils.task.list.invalidate()
              utils.kanban.get.invalidate()
            }}
          />
        )}
        
        {/* Layout Manager Modal */}
        {showLayoutManager && (
          <LayoutManagerModal
            open={showLayoutManager}
            onClose={closeLayoutManager}
            workspaceId={activeWorkspace.id}
            panels={panels}
            initialMode={layoutManagerMode}
          />
        )}
      </div>
    </Layout>
  )
}