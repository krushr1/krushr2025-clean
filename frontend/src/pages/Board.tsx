import { useEffect, useState } from 'react'
import Layout from '../components/project/Layout'
import KanbanBoard from '../components/kanban/KanbanBoard'
import { useAuthStore } from '../stores/auth-store'
import { trpc } from '../lib/trpc'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import KrushrLoader from '../components/common/KrushrLoader'
import KrushrLogo from '../components/common/KrushrLogo'
import FloatingActionButton from '../components/ui/floating-action-button'
import SimpleCreatePanel from '../components/forms/SimpleCreatePanel'

/**
 * Dedicated board page for focused kanban task management
 * Integrates with real-time backend data and state management
 */
export default function Board() {
  const { isAuthenticated } = useAuthStore()
  const [selectedKanban, setSelectedKanban] = useState<string | null>(null)
  const [showQuickTaskModal, setShowQuickTaskModal] = useState(false)
  
  const { data: workspaces = [] } = trpc.workspace.list.useQuery()
  const activeWorkspace = workspaces[0]
  
  const { data: kanbans = [], isLoading, error } = trpc.kanban.list.useQuery(
    { workspaceId: activeWorkspace?.id || '' },
    { enabled: !!activeWorkspace?.id }
  )

  // Auto-select first kanban
  useEffect(() => {
    if (kanbans.length > 0 && !selectedKanban) {
      setSelectedKanban(kanbans[0].id)
    }
  }, [kanbans, selectedKanban])
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const currentKanban = kanbans.find(k => k.id === selectedKanban)

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <KrushrLoader text="Loading your kanban boards..." />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <KrushrLogo size="md" showText={false} />
              </div>
              <p className="text-destructive mb-4">{error?.message || 'An error occurred'}</p>
              <Button onClick={() => window.location.reload()} className="bg-primary">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  if (kanbans.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <KrushrLogo size="lg" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Welcome to Krushr!</h3>
              <p className="text-muted-foreground mb-6">
                Create your first kanban board to start organizing tasks and boosting productivity.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">

        {/* Board Selector */}
        {kanbans.length > 1 && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Board:</span>
              <div className="flex space-x-2">
                {kanbans.map((kanban) => (
                  <Button
                    key={kanban.id}
                    variant={selectedKanban === kanban.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedKanban(kanban.id)}
                  >
                    {kanban.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Board */}
        <div className="flex-1">
          {currentKanban && activeWorkspace?.id ? (
            <KanbanBoard kanban={{ ...currentKanban, workspaceId: activeWorkspace.id }} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">
                    {!currentKanban ? 'Select a kanban board to view tasks.' : 'Loading workspace...'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Floating Action Button for Quick Task Creation */}
        <FloatingActionButton
          icon="plus"
          tooltip="Create New Task"
          onClick={() => setShowQuickTaskModal(true)}
        />
      </div>

      {/* Quick Task Creation Panel */}
      {showQuickTaskModal && activeWorkspace && (
        <SimpleCreatePanel
          workspaceId={activeWorkspace.id}
          open={showQuickTaskModal}
          onClose={() => setShowQuickTaskModal(false)}
          onSuccess={() => {
            setShowQuickTaskModal(false)
            // Refresh data when task is created
            // The KanbanBoard component will handle its own refresh
          }}
        />
      )}
    </Layout>
  )
}