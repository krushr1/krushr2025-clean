import NotesPanel from '../components/notes/NotesPanel'
import { PageErrorBoundary } from '../components/ErrorBoundary'
import { useAuthStore } from '../stores/auth-store'

export default function Notes() {
  const { currentWorkspace } = useAuthStore()
  
  if (!currentWorkspace) {
    return <div>Loading...</div>
  }
  
  return (
    <div className="h-screen">
      <PageErrorBoundary>
        <NotesPanel workspaceId={currentWorkspace.id} />
      </PageErrorBoundary>
    </div>
  )
}