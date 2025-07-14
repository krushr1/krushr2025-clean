import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCommentList } from './TaskCommentList'

const mockComments = [
  {
    id: 'comment-1',
    content: '<p>This is the first comment</p>',
    plainText: 'This is the first comment',
    author: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'avatar1.jpg',
    },
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
    isEdited: false,
    mentions: [],
    reactions: [],
    replies: [],
  },
  {
    id: 'comment-2',
    content: '<p>This is a <strong>bold</strong> comment with @mention</p>',
    plainText: 'This is a bold comment with @mention',
    author: {
      id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'avatar2.jpg',
    },
    createdAt: new Date('2024-01-01T11:00:00Z'),
    updatedAt: new Date('2024-01-01T11:30:00Z'),
    isEdited: true,
    mentions: [
      {
        id: 'mention-1',
        userId: 'user-1',
        startPos: 35,
        endPos: 43,
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    ],
    reactions: [
      {
        id: 'reaction-1',
        emoji: '👍',
        userId: 'user-1',
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
      },
    ],
    replies: [],
  },
]

const mockProps = {
  taskId: 'task-123',
  comments: mockComments,
  currentUserId: 'user-1',
  onEditComment: vi.fn(),
  onDeleteComment: vi.fn(),
  onReactToComment: vi.fn(),
  isLoading: false,
}

describe('TaskCommentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list of comments', () => {
    render(<TaskCommentList {...mockProps} />)
    
    expect(screen.getByTestId('comments-list')).toBeInTheDocument()
    expect(screen.getAllByTestId('comment-item')).toHaveLength(2)
  })

  it('displays comment content correctly', () => {
    render(<TaskCommentList {...mockProps} />)
    
    expect(screen.getByText('This is the first comment')).toBeInTheDocument()
    expect(screen.getByText(/This is a.*bold.*comment/)).toBeInTheDocument()
  })

  it('shows author information', () => {
    render(<TaskCommentList {...mockProps} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays timestamps correctly', () => {
    render(<TaskCommentList {...mockProps} />)
    
    expect(screen.getByText(/ago/)).toBeInTheDocument()
  })

  it('shows edited indicator for edited comments', () => {
    render(<TaskCommentList {...mockProps} />)
    
    const editedIndicator = screen.getByTestId('edited-indicator')
    expect(editedIndicator).toBeInTheDocument()
    expect(editedIndicator).toHaveTextContent('edited')
  })

  it('displays reactions with counts', () => {
    render(<TaskCommentList {...mockProps} />)
    
    const reaction = screen.getByTestId('reaction-👍')
    expect(reaction).toBeInTheDocument()
    expect(reaction).toHaveTextContent('👍 1')
  })

  it('shows edit and delete options for own comments', () => {
    render(<TaskCommentList {...mockProps} />)
    
    const firstComment = screen.getAllByTestId('comment-item')[0]
    const moreButton = firstComment.querySelector('[data-testid="comment-options"]')
    
    expect(moreButton).toBeInTheDocument()
  })

  it('hides edit/delete options for other users comments', () => {
    render(<TaskCommentList {...mockProps} />)
    
    const secondComment = screen.getAllByTestId('comment-item')[1]
    const editButton = secondComment.querySelector('[data-testid="edit-comment"]')
    
    expect(editButton).not.toBeInTheDocument()
  })

  it('handles comment editing', async () => {
    const user = userEvent.setup()
    render(<TaskCommentList {...mockProps} />)
    
    const editButton = screen.getByTestId('edit-comment')
    await user.click(editButton)
    
    expect(mockProps.onEditComment).toHaveBeenCalledWith('comment-1')
  })

  it('handles comment deletion with confirmation', async () => {
    const user = userEvent.setup()
    render(<TaskCommentList {...mockProps} />)
    
    const deleteButton = screen.getByTestId('delete-comment')
    await user.click(deleteButton)
    
    expect(screen.getByTestId('delete-confirmation')).toBeInTheDocument()
    
    const confirmButton = screen.getByTestId('confirm-delete')
    await user.click(confirmButton)
    
    expect(mockProps.onDeleteComment).toHaveBeenCalledWith('comment-1')
  })

  it('handles reaction toggling', async () => {
    const user = userEvent.setup()
    render(<TaskCommentList {...mockProps} />)
    
    const reactionButton = screen.getByTestId('add-reaction')
    await user.click(reactionButton)
    
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument()
    
    const thumbsUpEmoji = screen.getByTestId('emoji-👍')
    await user.click(thumbsUpEmoji)
    
    expect(mockProps.onReactToComment).toHaveBeenCalledWith('comment-1', '👍')
  })

  it('highlights mentions correctly', () => {
    render(<TaskCommentList {...mockProps} />)
    
    const mentionElement = screen.getByTestId('mention-user-1')
    expect(mentionElement).toBeInTheDocument()
    expect(mentionElement).toHaveClass('mention-highlighted')
  })

  it('shows loading state', () => {
    render(<TaskCommentList {...mockProps} isLoading={true} />)
    
    expect(screen.getByTestId('comments-loading')).toBeInTheDocument()
    expect(screen.getByText(/Loading comments/)).toBeInTheDocument()
  })

  it('shows empty state when no comments', () => {
    render(<TaskCommentList {...mockProps} comments={[]} />)
    
    expect(screen.getByTestId('no-comments')).toBeInTheDocument()
    expect(screen.getByText(/No comments yet/)).toBeInTheDocument()
  })

  it('supports threaded replies (nested comments)', () => {
    const commentsWithReplies = [
      {
        ...mockComments[0],
        replies: [
          {
            id: 'reply-1',
            content: '<p>This is a reply</p>',
            plainText: 'This is a reply',
            author: mockComments[1].author,
            createdAt: new Date('2024-01-01T10:30:00Z'),
            updatedAt: new Date('2024-01-01T10:30:00Z'),
            isEdited: false,
            mentions: [],
            reactions: [],
            replies: [],
          },
        ],
      },
    ]
    
    render(<TaskCommentList {...mockProps} comments={commentsWithReplies} />)
    
    expect(screen.getByTestId('reply-item')).toBeInTheDocument()
    expect(screen.getByText('This is a reply')).toBeInTheDocument()
  })

  it('handles real-time updates correctly', async () => {
    const { rerender } = render(<TaskCommentList {...mockProps} />)
    
    const newComment = {
      id: 'comment-3',
      content: '<p>New real-time comment</p>',
      plainText: 'New real-time comment',
      author: mockComments[0].author,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      mentions: [],
      reactions: [],
      replies: [],
    }
    
    const updatedComments = [...mockComments, newComment]
    rerender(<TaskCommentList {...mockProps} comments={updatedComments} />)
    
    await waitFor(() => {
      expect(screen.getByText('New real-time comment')).toBeInTheDocument()
    })
    
    expect(screen.getByTestId('comment-item-comment-3')).toHaveClass('new-comment')
  })

  it('supports comment sorting options', async () => {
    const user = userEvent.setup()
    render(<TaskCommentList {...mockProps} />)
    
    const sortButton = screen.getByTestId('sort-comments')
    await user.click(sortButton)
    
    expect(screen.getByTestId('sort-oldest-first')).toBeInTheDocument()
    expect(screen.getByTestId('sort-newest-first')).toBeInTheDocument()
    
    const newestFirstOption = screen.getByTestId('sort-newest-first')
    await user.click(newestFirstOption)
    
    const commentItems = screen.getAllByTestId('comment-item')
    expect(commentItems[0]).toHaveTextContent('Jane Smith') // Newer comment first
  })

  it('handles accessibility correctly', () => {
    render(<TaskCommentList {...mockProps} />)
    
    const commentsList = screen.getByTestId('comments-list')
    expect(commentsList).toHaveAttribute('role', 'list')
    
    const commentItems = screen.getAllByTestId('comment-item')
    commentItems.forEach(item => {
      expect(item).toHaveAttribute('role', 'listitem')
    })
    
    const reactionButton = screen.getByTestId('add-reaction')
    expect(reactionButton).toHaveAttribute('aria-label', 'Add reaction')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<TaskCommentList {...mockProps} />)
    
    await user.tab()
    expect(screen.getByTestId('comment-options')).toHaveFocus()
    
    await user.tab()
    expect(screen.getByTestId('add-reaction')).toHaveFocus()
  })

  it('handles long content with read more/less', async () => {
    const longComment = {
      ...mockComments[0],
      content: '<p>' + 'Very long comment content. '.repeat(50) + '</p>',
      plainText: 'Very long comment content. '.repeat(50),
    }
    
    render(<TaskCommentList {...mockProps} comments={[longComment]} />)
    
    expect(screen.getByTestId('read-more')).toBeInTheDocument()
    
    const user = userEvent.setup()
    const readMoreButton = screen.getByTestId('read-more')
    await user.click(readMoreButton)
    
    expect(screen.getByTestId('read-less')).toBeInTheDocument()
  })
})