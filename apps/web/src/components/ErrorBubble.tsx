"use client";

import { color, mono, sans } from "@/lib/theme";

interface ErrorInfo {
  message: string;
  retryable: boolean;
  code?: string;
}

interface ErrorBubbleProps {
  error: ErrorInfo;
  onDismiss: () => void;
  onRetry?: () => void;
}

export default function ErrorBubble({ error, onDismiss, onRetry }: ErrorBubbleProps) {
  const isAuthError =
    error.code === "PROVIDER_AUTH_FAILED" || error.code === "MISSING_API_KEY";

  const ghostBtn = {
    marginTop: 8,
    padding: "4px 10px",
    background: "transparent",
    border: `1px solid ${color.border}`,
    borderRadius: 6,
    color: color.textPrimary,
    fontSize: 11,
    fontFamily: mono,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        margin: "12px 24px 0",
        padding: "10px 16px",
        borderRadius: 10,
        background: `color-mix(in srgb, ${color.red} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color.red} 30%, transparent)`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>❌</span>
        <div>
          <div style={{ fontSize: 13, color: color.red, fontFamily: sans, lineHeight: 1.5 }}>
            {error.message}
          </div>
          {isAuthError && (
            <button
              onClick={() => {
                alert("请在设置面板中配置 API Key。\n\n点击左下角 ⚙ 图标打开设置。");
              }}
              style={ghostBtn}
            >
              打开设置 ⚙
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {error.retryable && onRetry && (
          <button onClick={onRetry} style={{ ...ghostBtn, marginTop: 0 }}>
            重试
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            padding: "4px 8px",
            background: "transparent",
            border: "none",
            color: color.textTertiary,
            fontSize: 16,
            cursor: "pointer",
            lineHeight: 1,
          }}
          title="关闭"
        >
          ×
        </button>
      </div>
    </div>
  );
}
