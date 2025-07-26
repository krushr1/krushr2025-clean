
import React, { useState, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import { Button } from '../../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { Send, Bold, Italic, List, ListOrdered, Link, Paperclip, Smile, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { trpc } from '../../../lib/trpc'
import { toast } from 'sonner'
import { MentionDropdown } from './MentionDropdown'
import { EmojiPicker } from './EmojiPicker'
import AttachmentUpload from '../../common/AttachmentUpload'

interface TaskCommentEditorProps {
  taskId: string
  workspaceId: string
  placeholder?: string
  autoFocus?: boolean
  onSubmit?: (comment: any) => void
  onCancel?: () => void
  initialContent?: string
  isEditing?: boolean
  commentId?: string
  className?: string
}

export default function TaskCommentEditor({
  taskId,
  workspaceId,
  placeholder = "Add a comment...",
  autoFocus = false,
  onSubmit,
  onCancel,
  initialContent = '',
  isEditing = false,
  commentId,
  className
}: TaskCommentEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const editorRef = useRef<HTMLDivElement>(null)

  const { data: workspaceMembers = [] } = trpc.user.listWorkspaceMembers.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  )

  const createComment = trpc.comment.create.useMutation({
    onSuccess: (comment) => {
      onSubmit?.(comment)
      editor?.commands.clearContent()
      setAttachments([])
      setShowAttachments(false)
      toast.success('Comment added successfully')
    },
    onError: (error) => {
      toast.error('Failed to add comment')
      console.error('Create comment error:', error)
    }
  })

  const updateComment = trpc.comment.update.useMutation({
    onSuccess: (comment) => {
      onSubmit?.(comment)
      toast.success('Comment updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update comment')
      console.error('Update comment error:', error)
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return workspaceMembers
              .filter(member => 
                member.name.toLowerCase().includes(query.toLowerCase()) ||
                member.email.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5)
              .map(member => ({
                id: member.id,
                label: member.name,
                email: member.email,
                avatar: member.avatar
              }))
          },
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = new MentionDropdown({
                  items: props.items,
                  command: props.command,
                })
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props: any) {
                component.updateProps(props)
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                  popup[0].hide()
                  return true
                }
                return component.onKeyDown(props)
              },
              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
        },
      }),
    ],
    content: initialContent,
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
    },
  })

  const handleSubmit = useCallback(async () => {
    if (!editor || isSubmitting) return

    const content = editor.getHTML()
    const plainText = editor.getText()
    
    if (!content.trim() || plainText.trim().length === 0) {
      toast.error('Please enter a comment')
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && commentId) {
        await updateComment.mutateAsync({
          id: commentId,
          content: content
        })
      } else {
        await createComment.mutateAsync({
          taskId,
          content: content
        })
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }, [editor, isSubmitting, taskId, commentId, isEditing, createComment, updateComment])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault()
      onCancel()
    }
  }, [handleSubmit, onCancel])

  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run()
  const toggleLink = () => {
    if (!editor) return;
    
    // Get selected text
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    // If there's selected text that looks like a URL, use it
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (selectedText && urlPattern.test(selectedText)) {
      const url = selectedText.startsWith('http') ? selectedText : `https://${selectedText}`;
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      // For now, just add a placeholder link
      // In a real app, you'd show a proper link dialog
      editor.chain().focus().setLink({ href: 'https://example.com' }).run();
    }
  }

  const insertEmoji = (emoji: string) => {
    editor?.chain().focus().insertContent(emoji).run()
    setShowEmojis(false)
  }

  const isEmpty = editor?.isEmpty ?? true

  return (
    <div className={cn("border border-gray-200 rounded-lg bg-white", className)}>
      {/* Editor Content */}
      <div 
        ref={editorRef}
        className="min-h-[80px] max-h-[300px] overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-1">
          {/* Formatting buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBold}
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive('bold') && "bg-gray-200"
            )}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleItalic}
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive('italic') && "bg-gray-200"
            )}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBulletList}
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive('bulletList') && "bg-gray-200"
            )}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleOrderedList}
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive('orderedList') && "bg-gray-200"
            )}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLink}
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive('link') && "bg-gray-200"
            )}
          >
            <Link className="h-4 w-4" />
          </Button>

          {/* Attachments button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachments(!showAttachments)}
            className={cn(
              "h-8 w-8 p-0",
              showAttachments && "bg-gray-200"
            )}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Emoji picker */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojis(!showEmojis)}
              className={cn(
                "h-8 w-8 p-0",
                showEmojis && "bg-gray-200"
              )}
            >
              <Smile className="h-4 w-4" />
            </Button>
            {showEmojis && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <EmojiPicker
                  onEmojiSelect={insertEmoji}
                  onClose={() => setShowEmojis(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isEmpty || isSubmitting}
            size="sm"
            className="bg-krushr-primary hover:bg-krushr-primary/90"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            {isEditing ? 'Update' : 'Comment'}
          </Button>
        </div>
      </div>

      {/* Attachments section */}
      {showAttachments && (
        <div className="p-3 border-t border-gray-100">
          <AttachmentUpload
            type="comment"
            targetId={taskId}
            onUploadComplete={(uploadedFiles) => {
              setAttachments([...attachments, ...uploadedFiles])
            }}
          />
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
        <span className="font-medium">Tip:</span> Use @ to mention team members, 
        Ctrl+Enter to send, Escape to cancel
      </div>
    </div>
  )
}