"use client";

import { useState, useEffect, useCallback } from "react";
import { color, mono, sans } from "@/lib/theme";

interface Conversation {
  conversation_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ConversationListProps {
  sessionId: string;
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onNew: () => void;
  onDelete: (convId: string) => void;
  refreshTrigger: number;
}

export default function ConversationList({
  sessionId,
  activeId,
  onSelect,
  onNew,
  onDelete,
  refreshTrigger,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/sessions/${sessionId}/conversations`);
      if (res.ok) {
        const data = (await res.json()) as { conversations?: Conversation[] };
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, refreshTrigger]);

  const handleDelete = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(
        `/api/sessions/${sessionId}/conversations/${convId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
        onDelete(convId);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <div
      style={{
        width: 280,
        minWidth: 280,
        height: "100%",
        background: color.canvas,
        borderRight: `1px solid ${color.borderSubtle}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: `1px solid ${color.borderSubtle}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: color.textPrimary, fontFamily: sans }}>
          对话
        </span>
        <button
          onClick={onNew}
          style={{
            padding: "4px 12px",
            background: "transparent",
            border: `1px solid ${color.border}`,
            borderRadius: 6,
            color: color.textPrimary,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: mono,
            lineHeight: 1,
          }}
          title="新对话"
        >
          +
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: color.textTertiary, fontSize: 12 }}>
            加载中...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: color.textTertiary, fontSize: 12 }}>
            暂无对话记录
          </div>
        ) : (
          conversations.map((conv) => {
            const active = activeId === conv.conversation_id;
            return (
              <div
                key={conv.conversation_id}
                onClick={() => onSelect(conv)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  background: active ? color.brandYellowTint : "transparent",
                  borderLeft: active ? `2px solid ${color.brandYellow}` : "2px solid transparent",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: active ? color.textPrimary : color.textSecondary,
                      fontFamily: sans,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: 4,
                    }}
                  >
                    {conv.title}
                  </div>
                  <div style={{ fontSize: 10, color: color.textTertiary, fontFamily: mono }}>
                    {formatTime(conv.updated_at)} · {conv.message_count} 条消息
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(conv.conversation_id, e)}
                  style={{
                    background: "none",
                    border: "none",
                    color: color.textTertiary,
                    fontSize: 14,
                    cursor: "pointer",
                    padding: "2px 4px",
                    flexShrink: 0,
                    opacity: 0.6,
                  }}
                  title="删除对话"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.color = color.red;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.6";
                    e.currentTarget.style.color = color.textTertiary;
                  }}
                >
                  🗑
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
