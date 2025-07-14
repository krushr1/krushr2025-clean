import TaskCard from './TaskCard'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  title: string
  tasks: Array<{
    id: string
    title: string
    description: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
    assignees: Array<{
      name: string
      avatar: string
    }>
    comments?: number
    attachments?: number
    labels?: Array<{
      name: string
      color: string
    }>
  }>
  color: string
}

export default function KanbanColumn({ title, tasks, color }: KanbanColumnProps) {
  const getColumnColor = (color: string) => {
    switch (color) {
      case 'bg-gray-400': return 'bg-gray-100 border-gray-300'
      case 'bg-blue-500': return 'bg-blue-50 border-blue-200'
      case 'bg-green-500': return 'bg-green-50 border-green-200'
      case 'bg-orange-500': return 'bg-orange-50 border-orange-200'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  const getHeaderColor = (color: string) => {
    switch (color) {
      case 'bg-gray-400': return 'text-gray-700'
      case 'bg-blue-500': return 'text-blue-700'
      case 'bg-green-500': return 'text-green-700'
      case 'bg-orange-500': return 'text-orange-700'
      default: return 'text-gray-700'
    }
  }

  return (
    <div className={`w-72 ${getColumnColor(color)} rounded-lg border-2 border-dashed p-4 min-h-96`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className={`text-sm font-semibold ${getHeaderColor(color)}`}>{title}</h3>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* Add Task Button */}
      <button className="w-full mt-3 p-2 border-2 border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
        + Add Task
      </button>
    </div>
  )
}
