"use client";

import { useState, useEffect } from "react";

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface Settings {
  activeProvider: string;
  providers: Record<string, ProviderConfig>;
}

const DEFAULT_BASE_URLS: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  aihubmix: "https://aihubmix.com/v1",
  packy: "https://api.packy.top/v1",
};

const PROVIDER_LABELS: Record<string, string> = {
  openrouter: "OpenRouter",
  aihubmix: "AI HubMix",
  packy: "Packy API",
  custom: "自定义",
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("llm_viz_settings");
    if (!raw) return { activeProvider: "openrouter", providers: {} };

    const parsed = JSON.parse(raw);

    // Legacy migration: old format { apiKey, model, baseUrl }
    if (parsed.apiKey && !parsed.providers) {
      return {
        activeProvider: "openrouter",
        providers: {
          openrouter: {
            apiKey: parsed.apiKey || "",
            baseUrl: parsed.baseUrl || DEFAULT_BASE_URLS.openrouter,
            model: parsed.model || "openai/gpt-4o",
          },
        },
      };
    }

    return {
      activeProvider: parsed.activeProvider || "openrouter",
      providers: parsed.providers || {},
    };
  } catch {
    return { activeProvider: "openrouter", providers: {} };
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem("llm_viz_settings", JSON.stringify(settings));
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [activeProvider, setActiveProvider] = useState(settings.activeProvider);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const s = loadSettings();
      setSettings(s);
      setActiveProvider(s.activeProvider);
      setSaved(false);
    }
  }, [isOpen]);

  const currentConfig: ProviderConfig = settings.providers[activeProvider] || {
    apiKey: "",
    baseUrl: DEFAULT_BASE_URLS[activeProvider] || "",
    model: "",
  };

  const updateConfig = (field: keyof ProviderConfig, value: string) => {
    setSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [activeProvider]: {
          ...prev.providers[activeProvider] || { apiKey: "", baseUrl: DEFAULT_BASE_URLS[activeProvider] || "", model: "" },
          [field]: value,
        },
      },
    }));
  };

  const handleSwitchProvider = (provider: string) => {
    setActiveProvider(provider);
    // Ensure base URL default
    if (!settings.providers[provider]?.baseUrl && DEFAULT_BASE_URLS[provider]) {
      setSettings((prev) => ({
        ...prev,
        providers: {
          ...prev.providers,
          [provider]: {
            ...prev.providers[provider] || { apiKey: "", model: "" },
            baseUrl: DEFAULT_BASE_URLS[provider],
          },
        },
      }));
    }
  };

  const handleSave = () => {
    const finalSettings: Settings = {
      activeProvider,
      providers: settings.providers,
    };
    saveSettings(finalSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearKey = () => {
    updateConfig("apiKey", "");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #21262d",
          borderRadius: 12,
          width: 480,
          maxHeight: "80vh",
          overflow: "auto",
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>
            ⚙ 设置
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8b949e", fontSize: 20, cursor: "pointer" }}>
            ×
          </button>
        </div>

        {/* Provider selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#8b949e", fontFamily: "JetBrains Mono, monospace", display: "block", marginBottom: 8 }}>
            Provider
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleSwitchProvider(key)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: activeProvider === key ? "1px solid #00ffa0" : "1px solid #21262d",
                  background: activeProvider === key ? "rgba(0,255,160,0.08)" : "#0a0e14",
                  color: activeProvider === key ? "#00ffa0" : "#8b949e",
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#8b949e", fontFamily: "JetBrains Mono, monospace", display: "block", marginBottom: 6 }}>
            API Key
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              value={currentConfig.apiKey}
              onChange={(e) => updateConfig("apiKey", e.target.value.trim())}
              placeholder="sk-..."
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "#0a0e14",
                border: "1px solid #21262d",
                borderRadius: 6,
                color: "#c9d1d9",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 12,
                outline: "none",
              }}
            />
            <button
              onClick={handleClearKey}
              style={{
                padding: "8px 12px",
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.2)",
                borderRadius: 6,
                color: "#ff6b6b",
                fontSize: 11,
                fontFamily: "JetBrains Mono, monospace",
                cursor: "pointer",
              }}
            >
              清除
            </button>
          </div>
        </div>

        {/* Base URL */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: "#8b949e", fontFamily: "JetBrains Mono, monospace", display: "block", marginBottom: 6 }}>
            Base URL
          </label>
          <input
            type="text"
            value={currentConfig.baseUrl}
            onChange={(e) => updateConfig("baseUrl", e.target.value.trim())}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#0a0e14",
              border: "1px solid #21262d",
              borderRadius: 6,
              color: "#c9d1d9",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Model ID */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#8b949e", fontFamily: "JetBrains Mono, monospace", display: "block", marginBottom: 6 }}>
            Model ID
          </label>
          <input
            type="text"
            value={currentConfig.model}
            onChange={(e) => updateConfig("model", e.target.value.trim())}
            placeholder="openai/gpt-4o"
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#0a0e14",
              border: "1px solid #21262d",
              borderRadius: 6,
              color: "#c9d1d9",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Privacy Notice */}
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(0,255,160,0.04)",
            border: "1px solid rgba(0,255,160,0.1)",
            borderRadius: 6,
            marginBottom: 20,
            fontSize: 11,
            color: "#8b949e",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
          }}
        >
          🔒 API Key 只保存在当前浏览器。发送消息时，Key 会临时传给本教学工具后端用于转发模型请求；后端不会保存 Key。对话内容会被保存用于学习记录和问题排查，默认 30 天后过期。
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #21262d",
              borderRadius: 6,
              color: "#8b949e",
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 20px",
              background: saved ? "rgba(0,255,160,0.15)" : "#00ffa0",
              border: "none",
              borderRadius: 6,
              color: saved ? "#00ffa0" : "#0d1117",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "JetBrains Mono, monospace",
              cursor: "pointer",
            }}
          >
            {saved ? "✓ 已保存" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
