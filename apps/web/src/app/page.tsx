"use client";

import { useState, useRef, useCallback } from "react";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
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

export default function ChatPage() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async (text: string) => {
    // Frontend validation
    const preCheckError = validateBeforeSend();
    if (preCheckError) {
      setError({ message: preCheckError, retryable: false, code: "MISSING_API_KEY" });
      return;
    }

    setError(null);

    // Add user message
    const userMsg: DisplayMessage = { role: "user", content: text };
    // Add placeholder for assistant response
    const assistantMsg: DisplayMessage = {
      role: "assistant",
      content: "",
      isStreaming: true,
    };

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
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: updated[lastIdx].content + event.content,
              };
            }
            return updated;
          });
          break;

        case "error":
          setError({
            message: event.message,
            retryable: event.retryable,
            code: event.code,
          });
          // Mark streaming as stopped on the assistant message
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
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], isStreaming: false };
            }
            return updated;
          });
          break;

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
    };

    try {
      await sendMessage(allMessages, {}, onEvent, onError, onComplete, controller.signal);
    } catch {
      setIsStreaming(false);
    }
  }, [messages]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        color: "#c9d1d9",
        fontFamily: "Inter, sans-serif",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid #21262d",
          background: "#0a0e14",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <h1
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#e6edf3",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          💬 Chat
        </h1>
        <span style={{ fontSize: 11, color: "#484f58" }}>
          / Playground
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <ErrorBubble
          error={error}
          onDismiss={handleDismissError}
        />
      )}

      {/* Chat messages */}
      <ChatArea messages={messages} />

      {/* Input area */}
      <ChatInput
        onSend={handleSend}
        onCancel={handleCancel}
        isStreaming={isStreaming}
      />
    </div>
  );
}
