"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
} from "lucide-react";
import { useCallback, useState } from "react";

// Font size via TextStyle marks
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
});

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];
const COLORS = [
  "#f0f0ff", "#9898c0", "#7c6fff", "#ff6b9d", "#43e97b",
  "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899",
  "#000000", "#ffffff",
];

interface Props {
  content: string;
  onChange: (html: string) => void;
}

function Divider() {
  return (
    <div style={{ width: 1, height: 20, background: "var(--border-color)", margin: "2px 2px" }} />
  );
}

function Btn({
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
        padding: "5px 7px",
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
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ content, onChange }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Link.configure({ openOnClick: false }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style:
          "min-height: 380px; padding: 20px; outline: none; font-size: 1rem; line-height: 1.75; color: var(--text-primary);",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-card)",
      }}
    >
      {/* ── Toolbar ─────────────────────────────── */}
      <div
        style={{
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border-color)",
          padding: "6px 10px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Font size */}
        <select
          title="Font size"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run();
            }
          }}
          style={{
            padding: "4px 6px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            fontSize: "0.78rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="">Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace("px", "")}</option>
          ))}
        </select>

        <Divider />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <span style={{ fontWeight: 700, fontSize: "0.75rem" }}>H1</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 size={14} />
        </Btn>

        <Divider />

        {/* Text style */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
          <SubscriptIcon size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
          <SuperscriptIcon size={14} />
        </Btn>

        <Divider />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
          <AlignCenter size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <AlignJustify size={14} />
        </Btn>

        <Divider />

        {/* Lists & blocks */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
          <ListOrdered size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
          <Code size={14} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus size={14} />
        </Btn>

        <Divider />

        {/* Highlight */}
        <Btn onClick={() => editor.chain().focus().toggleHighlight({ color: "#7c6fff33" }).run()} active={editor.isActive("highlight")} title="Highlight">
          <Highlighter size={14} />
        </Btn>

        {/* Text color */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <label
            title="Text color"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "5px 7px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>A</span>
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              style={{ width: 14, height: 14, border: "none", padding: 0, cursor: "pointer", background: "transparent" }}
              title="Pick text color"
            />
          </label>
        </div>

        {/* Color swatches */}
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: 90 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => editor.chain().focus().setColor(c).run()}
              title={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: 2,
                background: c,
                border: editor.isActive("textStyle", { color: c })
                  ? "2px solid var(--accent-primary)"
                  : "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        <Divider />

        {/* Link */}
        <Btn
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput((v) => !v);
            }
          }}
          active={editor.isActive("link")}
          title={editor.isActive("link") ? "Remove link" : "Add link"}
        >
          {editor.isActive("link") ? <Unlink size={14} /> : <LinkIcon size={14} />}
        </Btn>

        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <RemoveFormatting size={14} />
        </Btn>

        <div style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <Undo size={14} />
          </Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <Redo size={14} />
          </Btn>
        </div>
      </div>

      {/* ── Link input bar ───────────────────────── */}
      {showLinkInput && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-elevated)",
          }}
        >
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setLink()}
            autoFocus
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={setLink}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              background: "var(--gradient-primary)",
              border: "none",
              color: "white",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── Editor area ─────────────────────────── */}
      <EditorContent editor={editor} />

      {/* ── Editor styles ───────────────────────── */}
      <style>{`
        .tiptap a { color: var(--accent-primary); text-decoration: underline; }
        .tiptap blockquote { border-left: 3px solid var(--accent-primary); padding-left: 16px; color: var(--text-secondary); margin: 16px 0; }
        .tiptap pre { background: var(--bg-elevated); border-radius: 8px; padding: 16px; overflow-x: auto; }
        .tiptap code { background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px; font-size: 0.875em; }
        .tiptap pre code { background: none; padding: 0; }
        .tiptap hr { border: none; border-top: 1px solid var(--border-color); margin: 24px 0; }
        .tiptap h1 { font-size: 2rem; font-weight: 800; margin: 24px 0 12px; }
        .tiptap h2 { font-size: 1.5rem; font-weight: 700; margin: 20px 0 10px; }
        .tiptap h3 { font-size: 1.25rem; font-weight: 600; margin: 16px 0 8px; }
        .tiptap ul, .tiptap ol { padding-left: 24px; margin: 12px 0; }
        .tiptap li { margin: 4px 0; }
        .tiptap mark { border-radius: 3px; padding: 1px 3px; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--text-muted); pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  );
}
