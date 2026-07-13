"use client";

import { useState, useRef, useEffect } from "react";
import { color, mono, sans } from "@/lib/theme";

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

  const sendDisabled = !input.trim() || disabled;

  return (
    <div
      style={{
        borderTop: `1px solid ${color.borderSubtle}`,
        padding: "16px 24px",
        background: color.surface,
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
          background: color.surfaceSubtle,
          border: `1px solid ${color.border}`,
          borderRadius: 10,
          padding: "10px 14px",
          color: color.textPrimary,
          fontFamily: sans,
          fontSize: 14,
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
            background: `color-mix(in srgb, ${color.red} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color.red} 30%, transparent)`,
            borderRadius: 6,
            color: color.red,
            fontFamily: mono,
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
          disabled={sendDisabled}
          style={{
            padding: "10px 18px",
            background: sendDisabled ? color.surfaceSubtle : color.ctaBg,
            border: "none",
            borderRadius: 6,
            color: sendDisabled ? color.textDisabled : color.ctaText,
            fontFamily: mono,
            fontSize: 12,
            fontWeight: 600,
            cursor: sendDisabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          发送 ↑
        </button>
      )}
    </div>
  );
}
