import { Calendar, MessageCircle, Paperclip, MoreHorizontal } from 'lucide-react'

interface TaskCardProps {
  task: {
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
  }
}

export default function TaskCard({ task }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-300 bg-red-50'
      case 'medium': return 'border-l-yellow-300 bg-orange-50'
      case 'low': return 'border-l-green-300 bg-green-50'
      default: return 'border-l-gray-300 bg-gray-50'
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getPriorityColor(task.priority)}`}>
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 leading-tight">{task.title}</h4>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-1 rounded-full ${label.color}`}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Due Date */}
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Calendar className="w-3 h-3 mr-1" />
        <span>{task.dueDate}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-1">
          {task.assignees.map((assignee, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              title={assignee.name}
            >
              {assignee.name.charAt(0)}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 text-gray-400">
          {task.comments && (
            <div className="flex items-center text-xs">
              <MessageCircle className="w-3 h-3 mr-1" />
              <span>{task.comments}</span>
            </div>
          )}
          {task.attachments && (
            <div className="flex items-center text-xs">
              <Paperclip className="w-3 h-3 mr-1" />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
