"use client";

import { useRef, useEffect } from "react";
import { color, mono, sans } from "@/lib/theme";

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
          color: color.textTertiary,
          fontFamily: sans,
          fontSize: 14,
          padding: 48,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
          <div>发送一条消息开始体验 LLM 的流式回复</div>
          <div style={{ fontSize: 12, marginTop: 8, color: color.textDisabled }}>
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
        background: color.canvas,
      }}
    >
      {messages
        .filter((m) => m.role !== "system")
        .map((msg, i) => {
          const hasMetrics = msg.role === "assistant" && msg.outputTokens != null;
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
              }}
            >
              {/* Chain-of-thought (reasoning) box — assistant only; orange is content-semantic */}
              {msg.role === "assistant" && msg.reasoning && (
                <div
                  style={{
                    maxWidth: "75%",
                    marginBottom: 6,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: `color-mix(in srgb, ${color.orange} 8%, transparent)`,
                    borderLeft: `2px solid ${color.orange}`,
                    color: color.orange,
                    fontFamily: mono,
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
                  borderRadius: 10,
                  background: isUser ? color.surface : color.surfaceSubtle,
                  border: `1px solid ${isUser ? color.border : color.borderSubtle}`,
                  color: color.textPrimary,
                  fontFamily: sans,
                  fontSize: 14,
                  lineHeight: 1.65,
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
                      height: 15,
                      background: color.brandYellow,
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                )}
              </div>

              {/* Per-message metrics footer — assistant only, after completion */}
              {hasMetrics && (
                <div style={{ marginTop: 4, fontSize: 10, color: color.textTertiary, fontFamily: mono, display: "flex", gap: 12 }}>
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
