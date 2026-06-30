"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onCancel,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        borderTop: "1px solid #21262d",
        padding: "16px 24px",
        background: "#0a0e14",
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
      }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的问题… (Enter 发送, Shift+Enter 换行)"
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          background: "#0d1117",
          border: "1px solid #21262d",
          borderRadius: 8,
          padding: "10px 14px",
          color: "#c9d1d9",
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          lineHeight: 1.5,
          resize: "none",
          outline: "none",
          maxHeight: 200,
        }}
      />
      {isStreaming ? (
        <button
          onClick={onCancel}
          style={{
            padding: "10px 18px",
            background: "rgba(255, 107, 107, 0.15)",
            border: "1px solid rgba(255, 107, 107, 0.3)",
            borderRadius: 8,
            color: "#ff6b6b",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          取消
        </button>
      ) : (
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          style={{
            padding: "10px 18px",
            background:
              !input.trim() || disabled
                ? "#21262d"
                : "#00ffa0",
            border: "none",
            borderRadius: 8,
            color:
              !input.trim() || disabled
                ? "#484f58"
                : "#0d1117",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            fontWeight: 600,
            cursor:
              !input.trim() || disabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          发送 ↑
        </button>
      )}
    </div>
  );
}
