/**
 * Workspace Page - Modern panel-based workspace
 * Replaces traditional app switching with unlimited panels
 */

import React from 'react'
import { useNavigate, useParams } from 'react-router'
import Layout from '../components/project/Layout'
import PanelWorkspace from '../components/workspace/PanelWorkspace'
import WorkspaceHeaderConsolidated from '../components/workspace/WorkspaceHeaderConsolidated'
import SimpleEnhancedHeader from '../components/workspace/SimpleEnhancedHeader'
import { trpc } from '../lib/trpc'
import { Loader2 } from 'lucide-react'

export default function Workspace() {
  const navigate = useNavigate()
  const { workspaceId } = useParams()
  
  const { data: workspaces, isLoading } = trpc.workspace.list.useQuery(undefined, {
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000, // Keep in cache for 10 minutes
  })
  
  // Use workspace from URL params, or fallback to first workspace
  const activeWorkspace = workspaceId 
    ? workspaces?.find(w => w.id === workspaceId)
    : workspaces?.find(w => w._count.projects > 0 || w._count.teams > 0 || w._count.kanbans > 0) || workspaces?.[0]

  const { data: panels = [] } = trpc.panel.list.useQuery(
    { workspaceId: activeWorkspace?.id ?? '' },
    { 
      enabled: !!activeWorkspace?.id,
      staleTime: 60000, // Cache for 1 minute
      cacheTime: 300000, // Keep in cache for 5 minutes
    }
  )

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

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path)
    navigate(path)
  }

  const handleCreatePanel = (type: string) => {
    // Handle panel creation
    console.log('Create panel:', type)
  }

  const handleAction = (action: string) => {
    // Handle various actions
    console.log('Action:', action)
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-full" style={{ backgroundColor: 'hsl(0deg 0% 96.47%)' }}>
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
      </div>
    </Layout>
  )
}