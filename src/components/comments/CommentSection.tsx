"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, ChevronDown, Reply, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatRelativeDate } from "@/lib/utils";
import type { Comment } from "@/types";

const PAGE_SIZE = 5;
const TRUNCATE_AT = 300;

function CommentText({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = content.length > TRUNCATE_AT;
  return (
    <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "var(--text-secondary)", margin: 0 }}>
      {long && !expanded ? content.slice(0, TRUNCATE_AT) + "…" : content}
      {long && (
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent-primary)",
            cursor: "pointer",
            fontSize: "0.85rem",
            marginLeft: 6,
            padding: 0,
          }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </p>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: "var(--gradient-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "white",
        fontSize: "0.8rem",
        flexShrink: 0,
      }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  articleId: string;
  onDeleted: (id: string) => void;
  onReplyPosted: (reply: Comment) => void;
  depth?: number;
}

function CommentItem({ comment, articleId, onDeleted, onReplyPosted, depth = 0 }: CommentItemProps) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await api.patch(`/responses/${comment.id}/`, { content: editContent });
      comment.content = editContent;
      setEditing(false);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/responses/${comment.id}/`);
      onDeleted(comment.id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    if (!user) { toast.error("Log in to reply"); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/responses/article/${articleId}/`, {
        content: replyContent,
        parent_response: comment.id,
      });
      onReplyPosted(data);
      setReplyContent("");
      setReplying(false);
      toast.success("Reply posted");
    } catch {
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 10, paddingLeft: depth > 0 ? 40 : 0 }}>
      <Avatar name={comment.user_first_name} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
            {comment.user_first_name}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {formatRelativeDate(comment.created_at)}
          </span>
        </div>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                resize: "vertical",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleEdit}
                disabled={submitting}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--gradient-primary)",
                  border: "none",
                  color: "white",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setEditContent(comment.content); }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "transparent",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <CommentText content={comment.content} />
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {user && depth === 0 && (
            <button
              onClick={() => setReplying((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
            >
              <Reply size={13} />
              Reply
            </button>
          )}
          {user && comment.user_first_name === user.first_name && (
            <>
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                }}
              >
                <Edit2 size={12} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-secondary)",
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                }}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </>
          )}
        </div>

        {replying && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
                resize: "none",
                outline: "none",
              }}
            />
            <button
              onClick={handleReply}
              disabled={submitting || !replyContent.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--gradient-primary)",
                border: "none",
                color: "white",
                cursor: "pointer",
                opacity: submitting || !replyContent.trim() ? 0.6 : 1,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = async (pageNum = 1) => {
    try {
      const { data } = await api.get(`/responses/article/${articleId}/`, {
        params: { page: pageNum, page_size: PAGE_SIZE },
      });
      const results: Comment[] = data.results ?? data;
      const topLevel = results.filter((c) => c.parent_response === null);
      const nested = results.filter((c) => c.parent_response !== null);

      setComments((prev) => pageNum === 1 ? topLevel : [...prev, ...topLevel]);
      setReplies((prev) => pageNum === 1 ? nested : [...prev, ...nested]);
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [articleId]);

  const handlePost = async () => {
    if (!user) { toast.error("Log in to comment"); return; }
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/responses/article/${articleId}/`, {
        content: newComment,
        parent_response: null,
      });
      setComments((prev) => [data, ...prev]);
      setNewComment("");
      toast.success("Comment posted");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setReplies((prev) => prev.filter((c) => c.id !== id));
  };

  const handleReplyPosted = (reply: Comment) => {
    setReplies((prev) => [...prev, reply]);
  };

  const getReplies = (commentId: string) =>
    replies.filter((r) => r.parent_response === commentId);

  return (
    <div>
      {/* Collapsible header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: expanded ? "var(--radius-lg) var(--radius-lg) 0 0" : "var(--radius-lg)",
          padding: "14px 20px",
          cursor: "pointer",
          marginBottom: 0,
          transition: "border-radius var(--transition-fast)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
          <MessageCircle size={17} style={{ color: "var(--accent-primary)" }} />
          Discussion
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              height: 22,
              borderRadius: "var(--radius-full)",
              background: "rgba(124,111,255,0.15)",
              border: "1px solid rgba(124,111,255,0.3)",
              color: "var(--accent-primary)",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0 6px",
            }}
          >
            {comments.length}
          </span>
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-muted)",
            transition: "transform var(--transition-fast)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderTop: "none",
                borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
                padding: "24px 20px",
              }}
            >

      {/* New comment input */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Avatar name={user?.first_name ?? "?"} />
          <div style={{ flex: 1, display: "flex", gap: 8 }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Share your thoughts..." : "Log in to comment"}
              disabled={!user}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
              }}
              style={{
                flex: 1,
                padding: "12px 14px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "0.9rem",
                resize: "vertical",
                outline: "none",
                transition: "border-color var(--transition-fast)",
                opacity: user ? 1 : 0.6,
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
            />
            <button
              onClick={handlePost}
              disabled={posting || !newComment.trim() || !user}
              style={{
                padding: "12px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--gradient-primary)",
                border: "none",
                color: "white",
                cursor: posting || !newComment.trim() || !user ? "not-allowed" : "pointer",
                opacity: posting || !newComment.trim() || !user ? 0.5 : 1,
                transition: "opacity var(--transition-fast)",
                alignSelf: "flex-start",
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Comment list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--bg-elevated)", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 12, width: "20%", background: "var(--bg-elevated)", borderRadius: 4 }} />
                <div style={{ height: 14, width: "80%", background: "var(--bg-elevated)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "32px 0" }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <CommentItem
                comment={comment}
                articleId={articleId}
                onDeleted={handleDeleted}
                onReplyPosted={handleReplyPosted}
              />
              {getReplies(comment.id).map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  onDeleted={handleDeleted}
                  onReplyPosted={handleReplyPosted}
                  depth={1}
                />
              ))}
            </div>
          ))}

          {hasMore && (
            <button
              onClick={() => fetchComments(page + 1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-full)",
                color: "var(--text-secondary)",
                padding: "8px 20px",
                cursor: "pointer",
                fontSize: "0.85rem",
                margin: "0 auto",
                transition: "border-color var(--transition-fast)",
              }}
            >
              <ChevronDown size={14} />
              Load more comments
            </button>
          )}
        </div>
      )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
