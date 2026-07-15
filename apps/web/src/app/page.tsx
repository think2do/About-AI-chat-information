"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import ConversationList from "@/components/ConversationList";
import ErrorBubble from "@/components/ErrorBubble";
import PipelineDetail from "@/components/PipelineDetail";
import ModelParamsPanel from "@/components/ModelParamsPanel";
import ThreePane from "@/components/layout/ThreePane";
import { sendMessage, validateBeforeSend } from "@/lib/api";
import { color, mono, sans } from "@/lib/theme";
import type { ChatStreamEvent } from "@teaching-tool/shared";

interface DisplayMessage {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  reasoning?: string;
  ttftMs?: number;
  tps?: number;
  outputTokens?: number;
}

interface ErrorInfo {
  message: string;
  retryable: boolean;
  code?: string;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("teaching_tool_session_id");
  if (!sid) {
    sid = `anon_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    localStorage.setItem("teaching_tool_session_id", sid);
  }
  return sid;
}

export default function ChatPage() {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pipelinePhase, setPipelinePhase] = useState(0);
  const [showConvList, setShowConvList] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("你是一个专业的 AI 技术助手，请用简洁清晰的中文回答问题。");
  const [chatConfig, setChatConfig] = useState({ provider: "", model: "" });
  const [modelParams, setModelParams] = useState({
    temperature: 0.7, topP: 1.0, maxTokens: 2048, frequencyPenalty: 0, presencePenalty: 0, reasoningEnabled: false,
  });
  const [metrics, setMetrics] = useState<{ ttftMs?: number; tps?: number; inputTokens?: number; outputTokens?: number; totalTokens?: number; show: boolean }>({ show: false });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("llm_viz_settings");
      if (raw) {
        const s = JSON.parse(raw);
        const p = s.activeProvider || "openrouter";
        setChatConfig({ provider: p, model: s.providers?.[p]?.model || s.model || "" });
      }
    } catch { /* ignore */ }
  }, [refreshTrigger]);

  const handleSelectConversation = useCallback(async (conv: { conversation_id: string }) => {
    setConversationId(conv.conversation_id);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/conversations/${conv.conversation_id}`);
      if (res.ok) {
        const data = (await res.json()) as {
          messages?: Array<{ role: string; content: string }>;
        };
        const msgs: DisplayMessage[] = (data.messages || []).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }, [sessionId]);

  const handleNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const handleDeleteConversation = useCallback((convId: string) => {
    if (convId === conversationId) {
      setConversationId(null);
      setMessages([]);
    }
  }, [conversationId]);

  const handleSend = useCallback(async (text: string) => {
    const preCheckError = validateBeforeSend();
    if (preCheckError) {
      setError({ message: preCheckError, retryable: false, code: "MISSING_API_KEY" });
      return;
    }

    setError(null);
    setMetrics({ show: false });
    setPipelinePhase(1);
    const userMsg: DisplayMessage = { role: "user", content: text };
    const assistantMsg: DisplayMessage = { role: "assistant", content: "", isStreaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const phaseTimers: ReturnType<typeof setTimeout>[] = [];
    phaseTimers.push(setTimeout(() => setPipelinePhase(2), 350));
    phaseTimers.push(setTimeout(() => setPipelinePhase(3), 700));
    phaseTimers.push(setTimeout(() => setPipelinePhase(4), 1050));
    phaseTimers.push(setTimeout(() => setPipelinePhase(5), 1550));

    const controller = new AbortController();
    abortRef.current = controller;

    const sys = systemPrompt.trim() ? [{ role: "system" as const, content: systemPrompt.trim() }] : [];
    const allMessages = [...sys, ...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    let t0 = 0;
    let outTok = 0;
    let ttftMs: number | undefined;
    let reasoningText = "";

    const onEvent = (event: ChatStreamEvent) => {
      switch (event.event) {
        case "request_started":
          if (event.conversation_id) setConversationId(event.conversation_id);
          break;

        case "delta":
          if (ttftMs === undefined) ttftMs = Date.now() - t0;
          outTok++;
          if (pipelinePhase < 6) setPipelinePhase(6);
          setMetrics((prev) => ({ ...prev, ttftMs, outputTokens: outTok }));
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], content: updated[lastIdx].content + event.content };
            }
            return updated;
          });
          break;

        case "reasoning":
          reasoningText += event.content;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], reasoning: reasoningText };
            }
            return updated;
          });
          break;

        case "usage":
          setMetrics((prev) => ({ ...prev, inputTokens: event.prompt_tokens, outputTokens: event.completion_tokens, totalTokens: event.total_tokens }));
          break;

        case "error":
          setError({ message: event.message, retryable: event.retryable, code: event.code });
          setPipelinePhase(0);
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
          setPipelinePhase(0);
        case "completed": {
          setPipelinePhase(7);
          const elapsed = Math.max((Date.now() - t0) / 1000, 0.01);
          const tps = outTok > 0 ? Math.round(outTok / elapsed) : undefined;
          setMetrics((prev) => ({ ...prev, tps, ttftMs, outputTokens: outTok, show: true }));
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], isStreaming: false, ...(outTok > 0 ? { ttftMs, tps, outputTokens: outTok } : {}) };
            }
            return updated;
          });
          break;
        }
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
      setRefreshTrigger((t) => t + 1);
      if (!conversationId) setTimeout(() => setRefreshTrigger((t) => t + 1), 500);
    };

    t0 = Date.now();
    try {
      await sendMessage(allMessages, modelParams, onEvent, onError, onComplete, controller.signal, conversationId);
    } catch {
      setIsStreaming(false);
    }
  }, [messages, conversationId, modelParams, pipelinePhase, systemPrompt]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setPipelinePhase(0);
    setRefreshTrigger((t) => t + 1);
  }, []);

  const handleDismissError = useCallback(() => setError(null), []);
  const visibleCount = messages.filter((m) => m.role !== "system").length;

  const headerBtn = (active: boolean) => ({
    padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: mono,
    background: active ? color.brandYellowTint : "transparent",
    border: `1px solid ${active ? color.brandYellow : color.border}`,
    color: active ? color.textPrimary : color.textSecondary,
  });

  return (
    <div style={{ display: "flex", height: "100%", minWidth: 0 }}>
      {showConvList && (
        <ConversationList
          sessionId={sessionId}
          activeId={conversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
          refreshTrigger={refreshTrigger}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <ThreePane
          leftWidth={420}
          left={
            <PipelineDetail
              activePhase={pipelinePhase}
              isStreaming={isStreaming}
              messages={messages}
              systemPrompt={systemPrompt}
              params={modelParams}
              provider={chatConfig.provider}
              model={chatConfig.model}
              metrics={metrics}
            />
          }
          rightWidth={340}
          right={
            <ModelParamsPanel
              params={modelParams}
              onChange={(p) => setModelParams({ ...p, reasoningEnabled: p.reasoningEnabled ?? false })}
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
              messageCount={visibleCount}
            />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
            {/* Header / info bar */}
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${color.borderSubtle}`, background: color.surface, display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 15, fontWeight: 600, color: color.textPrimary, fontFamily: sans, letterSpacing: "-0.01em" }}>Chat</h1>
              <span style={{ fontSize: 11, color: color.textTertiary, fontFamily: mono }}>{chatConfig.provider || "—"} · {chatConfig.model || "未配置"}</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowConvList((v) => !v)} style={headerBtn(showConvList)}>历史</button>
              <button onClick={handleNewConversation} style={headerBtn(false)}>＋ 新对话</button>
            </div>

            {error && <ErrorBubble error={error} onDismiss={handleDismissError} />}
            <ChatArea messages={messages} />
            <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
          </div>
        </ThreePane>
      </div>
    </div>
  );
}
