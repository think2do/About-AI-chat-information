import {
  replaceConversation,
  type StoredMessage,
} from "@/server/conversations";

export const dynamic = "force-dynamic";

type ChatRequest = {
  session_id: string;
  conversation_id?: string;
  provider: "openrouter" | "aihubmix" | "packy" | "custom";
  base_url: string;
  model: string;
  api_key: string;
  messages: StoredMessage[];
  params?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    reasoning_enabled?: boolean;
  };
  stream: true;
};

const PROVIDER_URLS: Record<Exclude<ChatRequest["provider"], "custom">, string> = {
  openrouter: "https://openrouter.ai/api/v1",
  aihubmix: "https://aihubmix.com/v1",
  packy: "https://api.packy.top/v1",
};

const requestWindow = new Map<string, number[]>();
const encoder = new TextEncoder();

function event(data: Record<string, unknown>) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  provider?: string,
) {
  return Response.json(
    {
      event: "error",
      code,
      message,
      request_id: `req_${crypto.randomUUID().slice(0, 12)}`,
      retryable: status >= 429 || status >= 500,
      provider,
    },
    { status },
  );
}

function isRateLimited(sessionId: string) {
  const now = Date.now();
  const active = (requestWindow.get(sessionId) ?? []).filter(
    (timestamp) => now - timestamp < 60_000,
  );
  if (active.length >= 10) return true;
  active.push(now);
  requestWindow.set(sessionId, active);
  return false;
}

function validateBody(body: ChatRequest) {
  if (!/^anon_[a-f0-9]{16,48}$/i.test(body.session_id)) return "会话标识无效";
  if (!body.api_key?.trim()) return "请先配置 API Key";
  if (!body.model?.trim() || body.model.length > 100) return "模型名称无效";
  if (!Array.isArray(body.messages) || !body.messages.some((item) => item.role === "user")) {
    return "消息中必须包含用户输入";
  }
  if (body.messages.length > 50) return "单次最多发送 50 条消息";
  if (body.messages.reduce((sum, item) => sum + (item.content?.length ?? 0), 0) > 100_000) {
    return "消息内容过长";
  }
  if (!(["openrouter", "aihubmix", "packy", "custom"] as string[]).includes(body.provider)) {
    return "Provider 不受支持";
  }
  return null;
}

function providerBaseUrl(body: ChatRequest) {
  if (body.provider !== "custom") return PROVIDER_URLS[body.provider];
  const url = new URL(body.base_url);
  if (url.protocol !== "https:") throw new Error("CUSTOM_URL_BLOCKED");
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^(0|10|127|169\.254|192\.168)\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "::1"
  ) {
    throw new Error("CUSTOM_URL_BLOCKED");
  }
  return url.toString().replace(/\/$/, "");
}

function mapProviderError(status: number) {
  if (status === 401 || status === 403) {
    return { code: "PROVIDER_AUTH_FAILED", message: "API Key 无效或没有访问权限" };
  }
  if (status === 429) {
    return { code: "PROVIDER_RATE_LIMITED", message: "模型服务请求过于频繁，请稍后重试" };
  }
  if (status >= 500) {
    return { code: "PROVIDER_UNAVAILABLE", message: "模型服务暂时不可用" };
  }
  return { code: "PROVIDER_ERROR", message: "模型服务返回了错误" };
}

function providerPayload(body: ChatRequest) {
  const payload: Record<string, unknown> = {
    model: body.model,
    messages: body.messages.map(({ role, content }) => ({ role, content })),
    temperature: body.params?.temperature ?? 0.7,
    top_p: body.params?.top_p ?? 1,
    max_tokens: body.params?.max_tokens ?? 2048,
    frequency_penalty: body.params?.frequency_penalty ?? 0,
    presence_penalty: body.params?.presence_penalty ?? 0,
    stream: true,
    stream_options: { include_usage: true },
  };
  if (body.provider === "openrouter" && body.params?.reasoning_enabled) {
    payload.reasoning = { effort: "medium" };
  }
  return payload;
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return errorResponse(400, "INVALID_REQUEST", "请求格式无效");
  }

  const validationError = validateBody(body);
  if (validationError) return errorResponse(400, "INVALID_REQUEST", validationError);
  if (isRateLimited(body.session_id)) {
    return errorResponse(429, "PROVIDER_RATE_LIMITED", "请求过于频繁，请稍后重试");
  }

  let baseUrl: string;
  try {
    baseUrl = providerBaseUrl(body);
  } catch {
    return errorResponse(400, "INVALID_BASE_URL", "自定义 Provider 仅支持安全的 HTTPS 地址");
  }

  let storedConversation: { conversation_id: string };
  try {
    storedConversation = await replaceConversation(
      body.session_id,
      body.conversation_id,
      body.messages,
    );
  } catch {
    return errorResponse(400, "CONVERSATION_ERROR", "无法保存当前对话");
  }

  const providerHeaders: Record<string, string> = {
    Authorization: `Bearer ${body.api_key}`,
    "Content-Type": "application/json",
  };
  if (body.provider === "openrouter") {
    providerHeaders["HTTP-Referer"] = new URL(request.url).origin;
    providerHeaders["X-Title"] = "AI Teaching Tool";
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: providerHeaders,
      body: JSON.stringify(providerPayload(body)),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    return errorResponse(502, "PROVIDER_UNAVAILABLE", "无法连接模型服务", body.provider);
  }

  if (!providerResponse.ok || !providerResponse.body) {
    const normalized = mapProviderError(providerResponse.status);
    return errorResponse(
      providerResponse.status >= 400 ? providerResponse.status : 502,
      normalized.code,
      normalized.message,
      body.provider,
    );
  }

  const requestId = `req_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const conversationId = storedConversation.conversation_id;
  const providerReader = providerResponse.body.getReader();
  const decoder = new TextDecoder();
  let assistantContent = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        event({
          event: "request_started",
          request_id: requestId,
          conversation_id: conversationId,
          timestamp: new Date().toISOString(),
        }),
      );

      let buffer = "";
      let completed = false;
      try {
        while (true) {
          const { done, value } = await providerReader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              completed = true;
              break;
            }
            try {
              const chunk = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string; reasoning?: string; reasoning_content?: string };
                }>;
                usage?: {
                  prompt_tokens?: number;
                  completion_tokens?: number;
                  total_tokens?: number;
                };
              };
              const delta = chunk.choices?.[0]?.delta;
              const reasoning = delta?.reasoning ?? delta?.reasoning_content;
              if (reasoning) {
                controller.enqueue(
                  event({ event: "reasoning", content: reasoning, timestamp: new Date().toISOString() }),
                );
              }
              if (delta?.content) {
                assistantContent += delta.content;
                controller.enqueue(
                  event({ event: "delta", content: delta.content, timestamp: new Date().toISOString() }),
                );
              }
              if (chunk.usage) {
                controller.enqueue(
                  event({
                    event: "usage",
                    prompt_tokens: chunk.usage.prompt_tokens ?? 0,
                    completion_tokens: chunk.usage.completion_tokens ?? 0,
                    total_tokens: chunk.usage.total_tokens ?? 0,
                  }),
                );
              }
            } catch {
              // Ignore provider keep-alives or non-JSON extension events.
            }
          }
          if (completed) break;
        }

        if (assistantContent) {
          await replaceConversation(body.session_id, conversationId, [
            ...body.messages,
            { role: "assistant", content: assistantContent },
          ]);
        }
        controller.enqueue(event({ event: "completed", timestamp: new Date().toISOString() }));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        controller.enqueue(
          event({
            event: "error",
            code: "PROVIDER_STREAM_ERROR",
            message: "模型响应流意外中断",
            request_id: requestId,
            retryable: true,
            provider: body.provider,
          }),
        );
      } finally {
        providerReader.releaseLock();
        controller.close();
      }
    },
    cancel() {
      providerReader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
