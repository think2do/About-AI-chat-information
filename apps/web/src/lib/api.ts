/** Chat API wrapper — reads settings from localStorage and calls POST /api/chat/stream. */

import { streamChat } from "./sse-client";
import type { ChatMessage, ModelParams, ChatStreamEvent } from "@teaching-tool/shared";

export interface SendMessageConfig {
  messages: ChatMessage[];
  onEvent: (event: ChatStreamEvent) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
  signal?: AbortSignal;
}

/** Read provider settings from localStorage (llm_viz_settings). */
function getSettings(): {
  provider: string;
  baseUrl: string;
  model: string;
  apiKey: string;
} | null {
  try {
    const raw = localStorage.getItem("llm_viz_settings");
    if (!raw) return null;
    const settings = JSON.parse(raw);

    // Support legacy format: { apiKey: "..." }
    if (settings.apiKey && !settings.providers) {
      return {
        provider: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        model: settings.model || "openai/gpt-4o",
        apiKey: settings.apiKey,
      };
    }

    // Modern format: { activeProvider, providers: { [id]: { apiKey, baseUrl, model } } }
    const activeProvider = settings.activeProvider || "openrouter";
    const providerConfig = settings.providers?.[activeProvider];
    if (!providerConfig || !providerConfig.apiKey) return null;

    return {
      provider: activeProvider,
      baseUrl: providerConfig.baseUrl || getDefaultBaseUrl(activeProvider),
      model: providerConfig.model || "gpt-4o",
      apiKey: providerConfig.apiKey,
    };
  } catch {
    return null;
  }
}

function getDefaultBaseUrl(provider: string): string {
  const defaults: Record<string, string> = {
    openrouter: "https://openrouter.ai/api/v1",
    aihubmix: "https://aihubmix.com/v1",
    packy: "https://api.packy.top/v1",
  };
  return defaults[provider] || "";
}

/** Check if API Key is configured. Returns error message if not. */
export function validateBeforeSend(): string | null {
  const settings = getSettings();
  if (!settings) return "请先配置 API Key";
  if (!settings.apiKey.trim()) return "请先配置 API Key";
  if (!settings.model.trim()) return "请先选择 Model";
  if (settings.provider === "custom" && !settings.baseUrl.trim()) {
    return "自定义 Provider 需要填写 Base URL";
  }
  return null; // OK
}

/** Send a chat message to the streaming API. */
export async function sendMessage(
  messages: ChatMessage[],
  params: Partial<ModelParams> = {},
  onEvent: (event: ChatStreamEvent) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
  signal?: AbortSignal,
  conversationId?: string | null,
): Promise<void> {
  const settings = getSettings();
  if (!settings) {
    onError(new Error("请先配置 API Key"));
    return;
  }

  const sessionId = getOrCreateSessionId();

  const body = {
    session_id: sessionId,
    provider: settings.provider,
    base_url: settings.baseUrl,
    model: settings.model,
    api_key: settings.apiKey,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    params: {
      temperature: params.temperature ?? 0.7,
      top_p: params.topP ?? 1.0,
      max_tokens: params.maxTokens ?? 2048,
      frequency_penalty: params.frequencyPenalty ?? 0,
      presence_penalty: params.presencePenalty ?? 0,
      reasoning_enabled: params.reasoningEnabled ?? false,
    },
    stream: true,
    ...(conversationId ? { conversation_id: conversationId } : {}),
  };

  for await (const event of streamChat(body, { signal, onComplete })) {
    onEvent(event);
  }
}

/** Get or create anonymous session ID in localStorage. */
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem("teaching_tool_session_id");
  if (!sessionId) {
    sessionId = `anon_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    localStorage.setItem("teaching_tool_session_id", sessionId);
  }
  return sessionId;
}
