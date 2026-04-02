"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        padding: "6px 8px",
        borderRadius: "var(--radius-sm)",
        border: "none",
        background: active ? "rgba(124,111,255,0.2)" : "transparent",
        color: active ? "var(--accent-primary)" : "var(--text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background var(--transition-fast)",
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style:
          "min-height: 400px; padding: 20px; outline: none; font-size: 1rem; line-height: 1.75; color: var(--text-primary);",
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-card)",
        transition: "border-color var(--transition-fast)",
      }}
      onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)")}
      onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)")}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          padding: "8px 12px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-elevated)",
        }}
      >
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarBtn>

        <div style={{ width: 1, height: 20, background: "var(--border-color)", margin: "4px 4px" }} />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolbarBtn>

        <div style={{ width: 1, height: 20, background: "var(--border-color)", margin: "4px 4px" }} />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          <ListOrdered size={15} />
        </ToolbarBtn>

        <div style={{ width: 1, height: 20, background: "var(--border-color)", margin: "4px 4px" }} />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <Code size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus size={15} />
        </ToolbarBtn>

        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <ToolbarBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={15} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={15} />
          </ToolbarBtn>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
