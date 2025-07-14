
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Plus, Calendar, FileText, Kanban } from 'lucide-react'
import UniversalInputForm from './UniversalInputForm'
import { ContentType, UniversalFormData } from '../../types/universal-form'
import { Priority, TaskStatus } from '../../types/enums'

export default function UniversalFormDemo() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState<ContentType>(ContentType.TASK)
  const [recentItems, setRecentItems] = useState<Array<{ 
    id: string
    title: string
    type: ContentType
    createdAt: Date
  }>>([])

  const handleFormSuccess = (data: UniversalFormData, contentType: ContentType) => {
    console.log('Form submitted successfully:', { data, contentType })
    
    const newItem = {
      id: Date.now().toString(),
      title: data.title,
      type: contentType,
      createdAt: new Date()
    }
    setRecentItems(prev => [newItem, ...prev.slice(0, 4)])
  }

  const openForm = (type: ContentType) => {
    setSelectedContentType(type)
    setIsFormOpen(true)
  }

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.TASK:
        return <Kanban className="w-4 h-4" />
      case ContentType.NOTE:
        return <FileText className="w-4 h-4" />
      case ContentType.CALENDAR_EVENT:
        return <Calendar className="w-4 h-4" />
      default:
        return <Plus className="w-4 h-4" />
    }
  }

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.TASK:
        return 'bg-blue-100 text-blue-800'
      case ContentType.NOTE:
        return 'bg-green-100 text-green-800'
      case ContentType.CALENDAR_EVENT:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Universal Input Form Demo</h1>
        <p className="text-gray-600">
          Comprehensive form for creating tasks, notes, calendar events, and mixed content
        </p>
      </div>

      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => openForm(ContentType.TASK)}
              className="h-24 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Kanban className="w-8 h-8 text-blue-600" />
              <span>Create Task</span>
            </Button>
            
            <Button
              onClick={() => openForm(ContentType.NOTE)}
              className="h-24 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <FileText className="w-8 h-8 text-green-600" />
              <span>Create Note</span>
            </Button>
            
            <Button
              onClick={() => openForm(ContentType.CALENDAR_EVENT)}
              className="h-24 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Calendar className="w-8 h-8 text-purple-600" />
              <span>Create Event</span>
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={() => openForm(ContentType.MIXED)}
              className="w-full"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              Universal Form (All Types)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getContentTypeIcon(item.type)}
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500">
                        {item.createdAt.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={getContentTypeColor(item.type)}>
                    {item.type.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Form Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Content Creation</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multi-content type support</li>
                <li>• Rich text editing with toolbar</li>
                <li>• Priority and tag management</li>
                <li>• Team assignment</li>
                <li>• Due dates and scheduling</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Advanced Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• File attachments with drag & drop</li>
                <li>• Recurring events</li>
                <li>• Workflow automation toggles</li>
                <li>• Checklist and subtasks</li>
                <li>• Form validation and error handling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Universal Input Form */}
      <UniversalInputForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        contentType={selectedContentType}
        workspaceId="demo-workspace-id"
        projectId="demo-project-id"
        kanbanColumnId="demo-column-id"
        showWorkflowToggles={true}
        showFileUploads={true}
        allowContentTypeSwitch={selectedContentType === ContentType.MIXED}
        initialData={{
          priority: Priority.MEDIUM,
          status: TaskStatus.TODO,
          tags: [],
          workflow: {
            createVideoMeeting: true,
            createCall: true,
            kanbanTaskBoard: true,
            notes: true,
            ganttTimeline: true,
            ganttDependency: false,
            reminder: true,
            notifyTeam: false,
            changesNotifyTeam: false,
            reminders: [
              { enabled: true, timeBefore: '1d', type: 'notification' },
              { enabled: true, timeBefore: '1h', type: 'notification' }
            ]
          }
        }}
      />
    </div>
  )
}