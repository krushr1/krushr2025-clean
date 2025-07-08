import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCommentEditor } from './TaskCommentEditor'

// Mock TipTap editor
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: {
      setContent: vi.fn(),
      focus: vi.fn(),
      toggleBold: vi.fn(),
      toggleItalic: vi.fn(),
    },
    getHTML: vi.fn(() => '<p>Test content</p>'),
    getText: vi.fn(() => 'Test content'),
    isEmpty: false,
    isActive: vi.fn(() => false),
  })),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor Content</div>,
}))

vi.mock('@tiptap/starter-kit', () => ({
  default: vi.fn(),
}))

vi.mock('@tiptap/extension-mention', () => ({
  default: vi.fn(),
}))

const mockProps = {
  taskId: 'task-123',
  onCommentSubmit: vi.fn(),
  placeholder: 'Add a comment...',
  isSubmitting: false,
}

describe('TaskCommentEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders comment editor with placeholder', () => {
    render(<TaskCommentEditor {...mockProps} />)
    
    expect(screen.getByTestId('comment-editor')).toBeInTheDocument()
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<TaskCommentEditor {...mockProps} />)
    
    const submitButton = screen.getByTestId('submit-comment')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveTextContent('Add Comment')
  })

  it('disables submit button when submitting', () => {
    render(<TaskCommentEditor {...mockProps} isSubmitting={true} />)
    
    const submitButton = screen.getByTestId('submit-comment')
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('Adding...')
  })

  it('calls onCommentSubmit when form is submitted', async () => {
    const user = userEvent.setup()
    render(<TaskCommentEditor {...mockProps} />)
    
    const submitButton = screen.getByTestId('submit-comment')
    await user.click(submitButton)
    
    expect(mockProps.onCommentSubmit).toHaveBeenCalledWith({
      content: '<p>Test content</p>',
      plainText: 'Test content',
    })
  })

  it('renders rich text formatting toolbar', () => {
    render(<TaskCommentEditor {...mockProps} />)
    
    expect(screen.getByTestId('format-bold')).toBeInTheDocument()
    expect(screen.getByTestId('format-italic')).toBeInTheDocument()
    expect(screen.getByTestId('format-list')).toBeInTheDocument()
  })

  it('handles bold formatting toggle', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      commands: {
        setContent: vi.fn(),
        focus: vi.fn(),
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
      },
      getHTML: vi.fn(() => '<p>Test content</p>'),
      getText: vi.fn(() => 'Test content'),
      isEmpty: false,
      isActive: vi.fn(() => false),
    }

    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<TaskCommentEditor {...mockProps} />)
    
    const boldButton = screen.getByTestId('format-bold')
    await user.click(boldButton)
    
    expect(mockEditor.commands.toggleBold).toHaveBeenCalled()
  })

  it('handles mention trigger (@)', async () => {
    const user = userEvent.setup()
    render(<TaskCommentEditor {...mockProps} />)
    
    const editor = screen.getByTestId('editor-content')
    await user.type(editor, '@')
    
    // Check if mention dropdown appears (mocked behavior)
    await waitFor(() => {
      expect(screen.queryByTestId('mention-dropdown')).toBeInTheDocument()
    })
  })

  it('shows file attachment button', () => {
    render(<TaskCommentEditor {...mockProps} />)
    
    expect(screen.getByTestId('attach-file')).toBeInTheDocument()
  })

  it('handles file attachment', async () => {
    const user = userEvent.setup()
    render(<TaskCommentEditor {...mockProps} />)
    
    const attachButton = screen.getByTestId('attach-file')
    await user.click(attachButton)
    
    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).toBeInTheDocument()
    
    // Simulate file selection
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
    await user.upload(fileInput, file)
    
    expect(screen.getByTestId('attached-file')).toBeInTheDocument()
  })

  it('clears editor after successful submission', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      commands: {
        setContent: vi.fn(),
        focus: vi.fn(),
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
      },
      getHTML: vi.fn(() => '<p>Test content</p>'),
      getText: vi.fn(() => 'Test content'),
      isEmpty: false,
      isActive: vi.fn(() => false),
    }

    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<TaskCommentEditor {...mockProps} />)
    
    const submitButton = screen.getByTestId('submit-comment')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('')
    })
  })

  it('validates required content before submission', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      commands: {
        setContent: vi.fn(),
        focus: vi.fn(),
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
      },
      getHTML: vi.fn(() => ''),
      getText: vi.fn(() => ''),
      isEmpty: true,
      isActive: vi.fn(() => false),
    }

    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<TaskCommentEditor {...mockProps} />)
    
    const submitButton = screen.getByTestId('submit-comment')
    expect(submitButton).toBeDisabled()
  })

  it('handles keyboard shortcuts', async () => {
    const user = userEvent.setup()
    const mockEditor = {
      commands: {
        setContent: vi.fn(),
        focus: vi.fn(),
        toggleBold: vi.fn(),
        toggleItalic: vi.fn(),
      },
      getHTML: vi.fn(() => '<p>Test content</p>'),
      getText: vi.fn(() => 'Test content'),
      isEmpty: false,
      isActive: vi.fn(() => false),
    }

    vi.mocked(require('@tiptap/react').useEditor).mockReturnValue(mockEditor)
    
    render(<TaskCommentEditor {...mockProps} />)
    
    const editor = screen.getByTestId('editor-content')
    
    // Test Ctrl+B for bold
    await user.type(editor, '{Meta>}b{/Meta}')
    expect(mockEditor.commands.toggleBold).toHaveBeenCalled()
    
    // Test Ctrl+I for italic
    await user.type(editor, '{Meta>}i{/Meta}')
    expect(mockEditor.commands.toggleItalic).toHaveBeenCalled()
  })

  it('handles accessibility requirements', () => {
    render(<TaskCommentEditor {...mockProps} />)
    
    const editor = screen.getByTestId('comment-editor')
    expect(editor).toHaveAttribute('role', 'textbox')
    expect(editor).toHaveAttribute('aria-label', 'Comment editor')
    
    const submitButton = screen.getByTestId('submit-comment')
    expect(submitButton).toHaveAttribute('aria-label', 'Submit comment')
  })
})