"use client";

import { useState, useEffect, useCallback } from "react";

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
        const data = await res.json();
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
        background: "#0a0e14",
        borderRight: "1px solid #21262d",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e6edf3",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          💬 对话
        </span>
        <button
          onClick={onNew}
          style={{
            padding: "4px 10px",
            background: "rgba(0, 255, 160, 0.1)",
            border: "1px solid rgba(0, 255, 160, 0.25)",
            borderRadius: 4,
            color: "#00ffa0",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "JetBrains Mono, monospace",
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
          <div style={{ padding: 24, textAlign: "center", color: "#484f58", fontSize: 12 }}>
            加载中...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#484f58", fontSize: 12 }}>
            暂无对话记录
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              onClick={() => onSelect(conv)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                background:
                  activeId === conv.conversation_id
                    ? "rgba(0, 255, 160, 0.06)"
                    : "transparent",
                borderLeft:
                  activeId === conv.conversation_id
                    ? "3px solid #00ffa0"
                    : "3px solid transparent",
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
                    fontSize: 12,
                    color: activeId === conv.conversation_id ? "#e6edf3" : "#c9d1d9",
                    fontFamily: "Inter, sans-serif",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 4,
                  }}
                >
                  {conv.title}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#484f58",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {formatTime(conv.updated_at)} · {conv.message_count} 条消息
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(conv.conversation_id, e)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#484f58",
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "2px 4px",
                  flexShrink: 0,
                  opacity: 0.5,
                }}
                title="删除对话"
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.color = "#ff6b6b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.5";
                  e.currentTarget.style.color = "#484f58";
                }}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
