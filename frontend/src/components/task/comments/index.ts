
export { default as TaskCommentEditor } from './TaskCommentEditor'
export { default as TaskCommentList } from './TaskCommentList'
export { default as TaskCommentItem } from './TaskCommentItem'
export { MentionDropdown, MentionDropdownComponent } from './MentionDropdown'
export { EmojiPicker } from './EmojiPicker'
export { CommentAttachment } from './CommentAttachment'
export { default as TaskCommentSystem } from './TaskCommentSystem'

export type {
  TaskComment,
  CommentMention,
  CommentReaction,
  CommentAttachment as CommentAttachmentType
} from '../../../stores/comments-store'

export {
  useCommentsStore,
  useTaskComments,
  useThreadedComments,
  useCommentCount,
  useCommentDraft,
  useCommentLoading,
  useCommentUI
} from '../../../stores/comments-store'

export { useComments, type UseCommentsReturn } from '../../../hooks/use-comments'