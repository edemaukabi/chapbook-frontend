"use client";

import { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function FollowButton({ authorId }: { authorId: string }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (following) {
        await api.post(`/profiles/${authorId}/unfollow/`);
        setFollowing(false);
        toast.success("Unfollowed");
      } else {
        await api.post(`/profiles/${authorId}/follow/`);
        setFollowing(true);
        toast.success("Following!");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 18px",
        borderRadius: "var(--radius-full)",
        border: `1px solid ${following ? "var(--border-color)" : "var(--accent-primary)"}`,
        background: following ? "transparent" : "var(--gradient-primary)",
        color: following ? "var(--text-secondary)" : "white",
        fontWeight: 600,
        fontSize: "0.875rem",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "all var(--transition-fast)",
        flexShrink: 0,
      }}
    >
      {following ? <UserMinus size={15} /> : <UserPlus size={15} />}
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}
