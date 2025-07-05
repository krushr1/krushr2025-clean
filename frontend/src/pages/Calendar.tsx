import Layout from '../components/project/Layout'
import CalendarView from '../components/calendar/CalendarView'
import { useRealtimeConnection } from '../hooks/use-realtime'
import { Loader2 } from 'lucide-react'

/**
 * Enhanced Calendar Page
 * Integrated task deadlines and meeting management
 */
export default function Calendar() {
  const { isLoading } = useRealtimeConnection()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="h-full">
        <CalendarView />
      </div>
    </Layout>
  )
}
