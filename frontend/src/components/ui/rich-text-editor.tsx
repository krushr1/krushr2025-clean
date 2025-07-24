import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
 
  Quote, 
  Code2, 
  Link2, 
  Link2Off 
} from 'lucide-react';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  minimal?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  onBlur,
  placeholder = 'Start typing...',
  className,
  editable = true,
  minimal = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-krushr-primary hover:text-krushr-primary-700 underline cursor-pointer',
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    onBlur: () => {
      onBlur?.();
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none',
          'focus:outline-none',
          'text-krushr-gray-dark',
          'cursor-text',
          'text-sm leading-relaxed',
          '[&_p]:my-1 [&_p]:text-sm [&_p]:leading-relaxed',
          '[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-krushr-gray-900 [&_h1]:my-2',
          '[&_h2]:text-base [&_h2]:font-medium [&_h2]:text-krushr-gray-900 [&_h2]:my-1.5',
          '[&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-krushr-gray-900 [&_h3]:my-1',
          '[&_ul]:my-1 [&_ul]:list-disc [&_ul]:ml-4',
          '[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:ml-4',
          '[&_li]:my-0.5 [&_li]:text-sm',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-krushr-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-krushr-gray-600 [&_blockquote]:text-sm',
          '[&_code]:bg-krushr-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-krushr-gray-800',
          '[&_pre]:bg-krushr-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-sm',
          '[&_strong]:font-semibold [&_strong]:text-krushr-gray-900',
          '[&_em]:italic',
          className
        ),
        spellcheck: 'true',
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  React.useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  if (!editor) {
    return null;
  }

  const handleClick = () => {
    console.log('🎯 RichTextEditor clicked:', { editor: !!editor, editable, isDestroyed: editor?.isDestroyed });
    if (editor && editable) {
      console.log('🎯 Calling editor.focus()');
      editor.chain().focus().run();
    } else {
      console.log('🚫 Cannot focus editor:', { editor: !!editor, editable });
    }
  };

  return (
    <div className="relative">
      {!minimal && (
        <div className="border-b border-krushr-gray-200 pb-1 mb-2">
          <EditorToolbar editor={editor} />
        </div>
      )}
      <div
        onClick={handleClick}
        className={cn(
          'min-h-[60px] p-3',
          'border-2 border-blue-300 rounded-lg bg-white',
          'focus-within:border-blue-500',
          !editable && 'bg-gray-100 cursor-not-allowed opacity-60',
          editable && 'cursor-text',
          className
        )}
        style={{ 
          minHeight: '60px',
          padding: '12px',
          border: '2px solid #93c5fd',
          cursor: editable ? 'text' : 'not-allowed'
        }}
      >
        <EditorContent
          editor={editor}
          className="w-full"
          style={{ minHeight: '40px' }}
        />
      </div>
    </div>
  );
};

interface EditorToolbarProps {
  editor: any;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  
  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, isActive, children, title }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    };
    
    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={(e) => e.preventDefault()}
        title={title}
        className={cn(
          'p-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center',
          'hover:bg-krushr-gray-100',
          isActive
            ? 'bg-krushr-primary text-white hover:bg-krushr-primary-700'
            : 'text-krushr-gray-600'
        )}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-krushr-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-krushr-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>


      <div className="w-px h-6 bg-krushr-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <Code2 className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-krushr-gray-300 mx-1" />

      <ToolbarButton
        onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              alert('URL must start with http:// or https://');
              return;
            }
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        isActive={editor.isActive('link')}
        title="Add Link"
      >
        <Link2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().unsetLink().run()}
        title="Remove Link"
        isActive={false}
      >
        <Link2Off className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

export default RichTextEditor;