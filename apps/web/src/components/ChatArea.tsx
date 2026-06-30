"use client";

import { useRef, useEffect } from "react";
import type { ChatMessage, ChatStreamEvent } from "@teaching-tool/shared";

interface ChatAreaProps {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    isStreaming?: boolean;
    reasoning?: string;
    ttftMs?: number;
    tps?: number;
    outputTokens?: number;
  }>;
}

export default function ChatArea({ messages }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#484f58",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13,
          padding: 48,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <div>发送一条消息开始体验 LLM 的流式回复</div>
          <div style={{ fontSize: 11, marginTop: 8, color: "#30363d" }}>
            请在设置中配置 API Key 后使用
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: "24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {messages
        .filter((m) => m.role !== "system")
        .map((msg, i) => {
          const hasMetrics = msg.role === "assistant" && msg.outputTokens != null;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {/* Chain-of-thought (reasoning) box — assistant only */}
              {msg.role === "assistant" && msg.reasoning && (
                <div
                  style={{
                    maxWidth: "75%",
                    marginBottom: 6,
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "rgba(255,166,87,0.06)",
                    borderLeft: "2px solid #ffa657",
                    color: "#ffa657",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 12,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  🧠 {msg.reasoning}
                </div>
              )}

              <div
                style={{
                  maxWidth: "75%",
                  padding: "10px 16px",
                  borderRadius: 8,
                  background:
                    msg.role === "user"
                      ? "rgba(0, 255, 160, 0.08)"
                      : "rgba(48, 54, 61, 0.5)",
                  border:
                    msg.role === "user"
                      ? "1px solid rgba(0, 255, 160, 0.2)"
                      : "1px solid #21262d",
                  color: msg.role === "user" ? "#00ffa0" : "#c9d1d9",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
                {msg.isStreaming && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 14,
                      background: "#00ffa0",
                      marginLeft: 2,
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                )}
              </div>

              {/* Per-message metrics footer — assistant only, after completion */}
              {hasMetrics && (
                <div style={{ marginTop: 4, fontSize: 10, color: "#484f58", fontFamily: "JetBrains Mono, monospace", display: "flex", gap: 12 }}>
                  <span>输出 {msg.outputTokens} tok</span>
                  {msg.tps != null && <span>TPS {msg.tps}</span>}
                  {msg.ttftMs != null && <span>TTFT {msg.ttftMs}ms</span>}
                </div>
              )}
            </div>
          );
        })}
      <div ref={bottomRef} />
    </div>
  );
}
