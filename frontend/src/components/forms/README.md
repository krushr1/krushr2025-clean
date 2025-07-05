# Universal Input Form

A comprehensive, reusable form component for creating tasks, notes, calendar events, and mixed content in Krushr.

## Features

### 🎯 **Multi-Content Support**
- **Tasks**: Full kanban integration with status, priority, assignments
- **Notes**: Rich text editing with tags and organization
- **Calendar Events**: Scheduling, recurring events, reminders
- **Mixed**: Create multiple content types simultaneously

### 🎨 **Rich UI Components**
- **Priority Indicators**: Visual dot system (1-5 priority levels)
- **Team Assignment**: Avatar-based team member selection
- **File Attachments**: Drag & drop with preview and progress tracking
- **Rich Text Editor**: Comprehensive toolbar with formatting options
- **Date/Time Picker**: Flexible scheduling with all-day events
- **Workflow Automation**: Toggle-based automation settings

### 🔧 **Technical Excellence**
- **Type Safety**: Full TypeScript integration with tRPC
- **Performance**: Optimized re-renders, lazy loading, efficient state management
- **Accessibility**: WCAG compliant with keyboard navigation
- **Responsive**: Mobile-first design with adaptive layouts
- **Validation**: Real-time form validation with error handling

## Usage

### Basic Implementation

```tsx
import UniversalInputForm from '../components/forms/UniversalInputForm'
import { ContentType, Priority, TaskStatus } from '../types'

function MyComponent() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const handleSuccess = (data, contentType) => {
    console.log('Created:', data)
    // Handle successful creation
  }

  return (
    <>
      <Button onClick={() => setIsFormOpen(true)}>
        Create New Item
      </Button>
      
      <UniversalInputForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
        contentType={ContentType.TASK}
        workspaceId="workspace-123"
        showWorkflowToggles={true}
        showFileUploads={true}
      />
    </>
  )
}
```

### Advanced Configuration

```tsx
<UniversalInputForm
  open={isOpen}
  onClose={onClose}
  onSuccess={onSuccess}
  
  // Content configuration
  contentType={ContentType.MIXED}
  allowContentTypeSwitch={true}
  
  // Context
  workspaceId="workspace-123"
  projectId="project-456" 
  kanbanColumnId="column-789"
  
  // UI options
  showWorkflowToggles={true}
  showFileUploads={true}
  compactMode={false}
  
  // Validation
  requiredFields={['title', 'description']}
  maxTitleLength={200}
  maxDescriptionLength={5000}
  
  // Pre-filled data
  initialData={{
    title: 'Pre-filled title',
    priority: Priority.HIGH,
    tags: ['urgent', 'client-request'],
    workflow: {
      createVideoMeeting: true,
      kanbanTaskBoard: true,
      reminder: true,
      reminders: [
        { enabled: true, timeBefore: '1d', type: 'notification' }
      ]
    }
  }}
/>
```

## Content Types

### Task Creation
- **Status Management**: TODO, IN_PROGRESS, DONE
- **Priority Levels**: Visual dot indicators (1-5)
- **Assignment**: Team member selection with avatars
- **Kanban Integration**: Direct column assignment
- **Time Tracking**: Estimated hours and deadlines

### Note Creation
- **Rich Text**: Formatted content with toolbar
- **Organization**: Tags and workspace categorization
- **Collaboration**: Team sharing and permissions

### Calendar Events
- **Scheduling**: Start/end dates with time selection
- **Recurring Events**: Daily, weekly, monthly patterns
- **All-Day Events**: Toggle for full-day events
- **Reminders**: Multiple reminder configurations

### Mixed Content
- **Unified Interface**: Create multiple types simultaneously
- **Content Type Switching**: Dynamic form adaptation
- **Workflow Coordination**: Automated task/event creation

## Component Architecture

### State Management
```tsx
// Form data structure
interface UniversalFormData {
  contentType: ContentType
  title: string
  description: string
  priority: Priority
  tags: string[]
  
  // Date/time fields
  allDay: boolean
  startDate?: Date
  endDate?: Date
  
  // Task-specific
  status: TaskStatus
  assigneeId?: string
  kanbanColumnId?: string
  
  // Calendar-specific
  recurring: RecurringConfig
  calendar?: string
  
  // Shared
  attachments: FileAttachment[]
  checklist: ChecklistItem[]
  workflow: WorkflowConfig
  teamMembers: TeamAssignment[]
}
```

### tRPC Integration
```tsx
// Mutations used
const createTaskMutation = trpc.task.create.useMutation()
const createNoteMutation = trpc.notes.create.useMutation()
const uploadFileMutation = trpc.upload.uploadTaskFile.useMutation()

// Queries used  
const { data: users } = trpc.user.listWorkspaceMembers.useQuery()
const { data: projects } = trpc.project.list.useQuery()
```

### File Upload
```tsx
// Integrated with existing FileUpload component
<FileUpload
  onUpload={handleFileUpload}
  accept={{
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md']
  }}
  maxSize={10 * 1024 * 1024} // 10MB
  maxFiles={5}
/>
```

## Workflow Automation

### Available Toggles
- **Create video meeting**: Zoom/Teams integration
- **Create call**: Phone call scheduling  
- **Kanban task board**: Auto-create kanban cards
- **Notes**: Generate associated notes
- **Gantt timeline**: Project timeline integration
- **Gantt Dependency**: Task dependency mapping
- **Reminder**: Multiple reminder configurations
- **Team notifications**: Automated team alerts

### Reminder Configuration
```tsx
interface ReminderConfig {
  enabled: boolean
  timeBefore: string // '1d', '1h', '30m'
  type: 'email' | 'notification' | 'both'
}
```

## Validation & Error Handling

### Real-time Validation
- **Required Fields**: Configurable required field validation
- **Length Limits**: Title and description length checking
- **Date Logic**: Start/end date relationship validation
- **File Constraints**: Size and type validation

### Error Display
```tsx
interface FormValidation {
  isValid: boolean
  errors: Record<string, string>    // Blocking errors
  warnings: Record<string, string>  // Non-blocking warnings
}
```

## Performance Optimizations

### Re-render Optimization
- **useCallback**: All event handlers memoized
- **useMemo**: Computed values cached
- **Conditional Rendering**: Sections load only when expanded

### Memory Management
- **File Cleanup**: URL.createObjectURL cleanup
- **State Reset**: Form reset on close/success
- **Lazy Loading**: Heavy components loaded on demand

### Network Optimization
- **Batch Operations**: Multiple file uploads batched
- **Optimistic Updates**: UI updates before server confirmation
- **Debounced Validation**: Real-time validation debounced

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Accessibility**: WCAG 2.1 AA compliant
- **Keyboard Navigation**: Full keyboard support

## Testing

### Demo Component
```tsx
import UniversalFormDemo from '../components/forms/UniversalFormDemo'

// Shows all form capabilities with test data
<UniversalFormDemo />
```

### Unit Testing
```bash
# Run component tests
npm test UniversalInputForm

# Run integration tests  
npm test UniversalFormDemo
```

## Migration Guide

### From TaskModal
```tsx
// Old TaskModal usage
<TaskModal 
  open={isOpen}
  onClose={onClose}
  workspaceId={workspaceId}
  onSuccess={onSuccess}
/>

// New UniversalInputForm usage
<UniversalInputForm
  open={isOpen}
  onClose={onClose}
  contentType={ContentType.TASK}
  workspaceId={workspaceId}
  onSuccess={(data, type) => onSuccess(data)}
/>
```

### Benefits of Migration
- **Unified Interface**: Single component for all content types
- **Enhanced Features**: File uploads, workflow automation, rich text
- **Better Performance**: Optimized rendering and state management
- **Improved UX**: Consistent form behavior across application

## Future Enhancements

### Planned Features
- **Template System**: Save and load form templates
- **Auto-save**: Periodic form state saving
- **Collaborative Editing**: Real-time multi-user editing
- **Voice Input**: Voice-to-text integration
- **AI Assistance**: Smart content suggestions

### Extension Points
- **Custom Sections**: Plugin architecture for custom form sections
- **Third-party Integrations**: Slack, Microsoft Teams, etc.
- **Custom Validation**: User-defined validation rules
- **Theming**: Custom color schemes and layouts

## Support

For issues or questions:
1. Check existing components in `frontend/src/components/forms/`
2. Review tRPC router definitions in `api/src/trpc/routers/`
3. Test with UniversalFormDemo component
4. Check browser console for validation errors

## Contributing

When extending the Universal Input Form:
1. **Maintain Type Safety**: All additions must be fully typed
2. **Follow Patterns**: Use existing hooks and state management patterns  
3. **Test Thoroughly**: Add tests for new functionality
4. **Document Changes**: Update this README with new features
5. **Performance**: Ensure optimizations are maintained