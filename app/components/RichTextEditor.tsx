'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import React from 'react';

import { Select, MenuItem, FormControl } from '@mui/material';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TitleIcon from '@mui/icons-material/Title';
import FontDownloadIcon from '@mui/icons-material/FontDownload';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONTS = [
  { name: 'Default', value: 'Inter' },
  { name: 'Elegant (Serif)', value: 'Playfair Display' },
  { name: 'Classic (Serif)', value: 'Merriweather' },
  { name: 'Modern (Sans)', value: 'Outfit' },
  { name: 'Monospace', value: 'Roboto Mono' },
  { name: 'Handwriting', value: 'cursive' },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '200px' }: RichTextEditorProps) {
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
      TextStyle,
      FontFamily,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Sync editor content with value if it changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    active = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    children: React.ReactNode; 
    title: string 
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus from editor
        onClick();
      }}
      title={title}
      style={{
        background: active ? 'var(--accent-primary)' : 'transparent',
        color: active ? 'black' : 'white',
        border: 'none',
        borderRadius: '4px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="glass" style={{ 
      borderRadius: '8px', 
      overflow: 'hidden', 
      border: '1px solid var(--border-color)',
      background: 'rgba(255,255,255,0.02)'
    }}>
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.25rem', 
        padding: '0.5rem', 
        background: 'rgba(0,0,0,0.5)', 
        borderBottom: '1px solid var(--border-color)',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive('bold')} 
          title="Bold"
        >
          <FormatBoldIcon fontSize="small" />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive('italic')} 
          title="Italic"
        >
          <FormatItalicIcon fontSize="small" />
        </ToolbarButton>
        
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.25rem' }} />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          active={editor.isActive('heading', { level: 2 })} 
          title="Heading"
        >
          <TitleIcon fontSize="small" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive('bulletList')} 
          title="Bullet List"
        >
          <FormatListBulletedIcon fontSize="small" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive('orderedList')} 
          title="Ordered List"
        >
          <FormatListNumberedIcon fontSize="small" />
        </ToolbarButton>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.25rem' }} />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={editor.isActive('blockquote')} 
          title="Quote"
        >
          <FormatQuoteIcon fontSize="small" />
        </ToolbarButton>
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          active={editor.isActive('codeBlock')} 
          title="Code Block"
        >
          <CodeIcon fontSize="small" />
        </ToolbarButton>
        
        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

        {/* Font Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
          <FontDownloadIcon sx={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }} />
          <FormControl size="small" variant="outlined">
            <Select
              value={editor.getAttributes('textStyle').fontFamily || ''}
              onChange={(e) => {
                const font = e.target.value;
                if (font) {
                  editor.chain().focus().setFontFamily(font).run();
                } else {
                  editor.chain().focus().unsetFontFamily().run();
                }
              }}
              displayEmpty
              sx={{
                height: '32px',
                color: 'white',
                background: 'rgba(255,255,255,0.05)',
                fontSize: '0.8rem',
                minWidth: '130px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--accent-primary)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--accent-primary)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'var(--accent-primary)',
                },
              }}
              MenuProps={{
                sx: {
                  '& .MuiPaper-root': {
                    bgcolor: '#1a1b1e',
                    color: 'white',
                    border: '1px solid var(--border-color)',
                  },
                  '& .MuiMenuItem-root': {
                    fontSize: '0.9rem',
                  },
                  '& .MuiMenuItem-root:hover': {
                    bgcolor: 'rgba(235, 183, 0, 0.1)',
                  },
                  '& .Mui-selected': {
                    bgcolor: 'rgba(235, 183, 0, 0.2) !important',
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Default Font</em>
              </MenuItem>
              {FONTS.slice(1).map((font) => (
                <MenuItem 
                  key={font.value} 
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Editor Content */}
      <style jsx global>{`
        .ProseMirror {
          padding: 1rem;
          min-height: ${minHeight};
          outline: none;
          color: white;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-muted);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid var(--accent-primary);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--accent-primary);
        }
        .ProseMirror code {
          background: rgba(255,255,255,0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Roboto Mono', monospace;
        }
        .ProseMirror pre {
          background: #000;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
