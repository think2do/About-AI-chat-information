"use client";

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
  // Highlight settings link for auth errors
  const isAuthError =
    error.code === "PROVIDER_AUTH_FAILED" || error.code === "MISSING_API_KEY";

  return (
    <div
      style={{
        margin: "12px 24px 0",
        padding: "10px 16px",
        borderRadius: 8,
        background: "rgba(255, 107, 107, 0.1)",
        border: "1px solid rgba(255, 107, 107, 0.25)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>❌</span>
        <div>
          <div
            style={{
              fontSize: 13,
              color: "#ff6b6b",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
            }}
          >
            {error.message}
          </div>
          {isAuthError && (
            <button
              onClick={() => {
                // Trigger settings open — show alert for now (Spec 004 will add full settings modal)
                alert("请在设置面板中配置 API Key。\n\n点击右上角 ⚙ 图标打开设置。");
              }}
              style={{
                marginTop: 8,
                padding: "4px 10px",
                background: "rgba(0, 255, 160, 0.1)",
                border: "1px solid rgba(0, 255, 160, 0.25)",
                borderRadius: 4,
                color: "#00ffa0",
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                cursor: "pointer",
              }}
            >
              打开设置 ⚙
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {error.retryable && onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: "4px 10px",
              background: "rgba(0, 255, 160, 0.1)",
              border: "1px solid rgba(0, 255, 160, 0.25)",
              borderRadius: 4,
              color: "#00ffa0",
              fontSize: 11,
              fontFamily: "JetBrains Mono, monospace",
              cursor: "pointer",
            }}
          >
            重试
          </button>
        )}
        <button
          onClick={onDismiss}
          style={{
            padding: "4px 8px",
            background: "transparent",
            border: "none",
            color: "#8b949e",
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
