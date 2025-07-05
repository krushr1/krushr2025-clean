/**
 * Workspace Page - Modern panel-based workspace
 * Replaces traditional app switching with unlimited panels
 */

import React from 'react'
import Layout from '../components/project/Layout'
import PanelWorkspace from '../components/workspace/PanelWorkspace'
import PanelToolbar from '../components/workspace/PanelToolbar'
import { trpc } from '../lib/trpc'
import { Loader2 } from 'lucide-react'

export default function Workspace() {
  const { data: workspaces, isLoading } = trpc.workspace.list.useQuery(undefined, {
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000, // Keep in cache for 10 minutes
  })
  const activeWorkspace = workspaces?.[0]

  // Fetch panels when workspace is available
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
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workspace Found</h2>
            <p className="text-gray-600">
              You need to create or join a workspace to use the panel system.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-full">
        {/* Panel Creation Toolbar */}
        <PanelToolbar 
          workspaceId={activeWorkspace.id}
          panels={panels}
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