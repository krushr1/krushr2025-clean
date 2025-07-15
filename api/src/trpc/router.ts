/**
 * Main tRPC Router
 * Combines all sub-routers for the complete API
 */

import { router } from './trpc'
import { authRouter } from './routers/auth'
import { workspaceRouter } from './routers/workspace'
import { teamRouter } from './routers/team'
import { projectRouter } from './routers/project'
import { kanbanRouter } from './routers/kanban'
import { taskRouter } from './routers/task'
import { notificationRouter } from './routers/notification'
import { chatRouter } from './routers/chat'
import { uploadRouter } from './routers/upload'
import { fileRouter } from './routers/file'
import { userRouter } from './routers/user'
import { commentRouter } from './routers/comment'
import { attachmentRouter } from './routers/attachment'
import { activityRouter } from './routers/activity'
import { searchRouter } from './routers/search'
import { checklistRouter } from './routers/checklist'
import { panelRouter } from './routers/panel'
import { notesRouter } from './routers/notes'
import { layoutRouter } from './routers/layout'
import { templateRouter } from './routers/template'
import { calendarRouter } from './routers/calendar'
import { preferencesRouter } from './routers/preferences'
import { aiRouter } from './routers/ai'

/**
 * Main application router
 * Add new routers here as they're created
 */
export const appRouter = router({
  auth: authRouter,
  workspace: workspaceRouter,
  team: teamRouter,
  project: projectRouter,
  kanban: kanbanRouter,
  task: taskRouter,
  notification: notificationRouter,
  chat: chatRouter,
  upload: uploadRouter,
  file: fileRouter,
  user: userRouter,
  comment: commentRouter,
  attachment: attachmentRouter,
  activity: activityRouter,
  search: searchRouter,
  checklist: checklistRouter,
  panel: panelRouter,
  notes: notesRouter,
  layout: layoutRouter,
  template: templateRouter,
  calendar: calendarRouter,
  preferences: preferencesRouter,
  ai: aiRouter,
})

export type AppRouter = typeof appRouter