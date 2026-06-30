"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import ConversationList from "@/components/ConversationList";
import ErrorBubble from "@/components/ErrorBubble";
import { sendMessage, validateBeforeSend } from "@/lib/api";
import type { ChatStreamEvent } from "@teaching-tool/shared";

interface DisplayMessage {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

interface ErrorInfo {
  message: string;
  retryable: boolean;
  code?: string;
}

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem("teaching_tool_session_id");
  if (!sid) {
    sid = `anon_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    localStorage.setItem("teaching_tool_session_id", sid);
  }
  return sid;
}

export default function ChatPage() {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversation messages when selecting
  const handleSelectConversation = useCallback(async (conv: { conversation_id: string }) => {
    setConversationId(conv.conversation_id);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/conversations/${conv.conversation_id}`);
      if (res.ok) {
        const data = await res.json();
        const msgs: DisplayMessage[] = (data.messages || []).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }, [sessionId]);

  const handleNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const handleDeleteConversation = useCallback((convId: string) => {
    if (convId === conversationId) {
      setConversationId(null);
      setMessages([]);
    }
  }, [conversationId]);

  const handleSend = useCallback(async (text: string) => {
    const preCheckError = validateBeforeSend();
    if (preCheckError) {
      setError({ message: preCheckError, retryable: false, code: "MISSING_API_KEY" });
      return;
    }

    setError(null);
    const userMsg: DisplayMessage = { role: "user", content: text };
    const assistantMsg: DisplayMessage = { role: "assistant", content: "", isStreaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const allMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const onEvent = (event: ChatStreamEvent) => {
      switch (event.event) {
        case "delta":
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], content: updated[lastIdx].content + event.content };
            }
            return updated;
          });
          break;
        case "error":
          setError({ message: event.message, retryable: event.retryable, code: event.code });
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
            }
            return updated;
          });
          break;
        case "cancelled":
        case "completed":
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
            }
            return updated;
          });
          break;
      }
    };

    const onError = (err: Error) => {
      setError({ message: err.message, retryable: true });
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
          updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
        }
        return updated;
      });
    };

    const onComplete = () => {
      setIsStreaming(false);
      abortRef.current = null;
      // Refresh conversation list
      setRefreshTrigger((t) => t + 1);
      // If this was a new conversation, get the conversation_id from the saved result
      if (!conversationId) {
        // The backend creates a new conversation — next load will show it
        setTimeout(() => setRefreshTrigger((t) => t + 1), 500);
      }
    };

    try {
      await sendMessage(allMessages, {}, onEvent, onError, onComplete, controller.signal, conversationId);
    } catch {
      setIsStreaming(false);
    }
  }, [messages, conversationId]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setRefreshTrigger((t) => t + 1);
  }, []);

  const handleDismissError = useCallback(() => setError(null), []);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Conversation sidebar */}
      <ConversationList
        sessionId={sessionId}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        refreshTrigger={refreshTrigger}
      />

      {/* Chat main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: "12px 24px", borderBottom: "1px solid #21262d", background: "#0a0e14",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <h1 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>
            💬 Chat
          </h1>
          <span style={{ fontSize: 11, color: "#484f58" }}>/ Playground</span>
        </div>

        {error && <ErrorBubble error={error} onDismiss={handleDismissError} />}
        <ChatArea messages={messages} />
        <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
