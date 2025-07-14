import Layout from '../components/project/Layout'
import ChatInterface from '../components/chat/ChatInterface'
import { useAuthStore } from '../stores/auth-store'
import { trpc } from '../lib/trpc'
import { Loader2 } from 'lucide-react'

export default function Chat() {
  const { isAuthenticated } = useAuthStore()
  const { data: threads = [], isLoading } = trpc.chat.getThreads.useQuery()

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="h-full">
        <ChatInterface threads={threads} />
      </div>
    </Layout>
  )
}
