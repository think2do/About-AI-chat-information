"use client";

import { useState, useRef, useCallback } from "react";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import ConversationList from "@/components/ConversationList";
import ErrorBubble from "@/components/ErrorBubble";
import PipelineVisualization from "@/components/PipelineVisualization";
import ModelParamsPanel from "@/components/ModelParamsPanel";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import { sendMessage, validateBeforeSend } from "@/lib/api";
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
  const [modelParams, setModelParams] = useState({
    temperature: 0.7, topP: 1.0, maxTokens: 2048, frequencyPenalty: 0, presencePenalty: 0, reasoningEnabled: false,
  });
  const [metrics, setMetrics] = useState<{ ttftMs?: number; tps?: number; inputTokens?: number; outputTokens?: number; totalTokens?: number; costUsd?: number; show: boolean }>({ show: false });
  const abortRef = useRef<AbortController | null>(null);

  // Load conversation messages when selecting
  const handleSelectConversation = useCallback(async (conv: { conversation_id: string }) => {
    setConversationId(conv.conversation_id);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/conversations/${conv.conversation_id}`);
      if (res.ok) {
        const data = await res.json();
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
    setPipelinePhase(1); // Phase 1: 上下文组装
    const userMsg: DisplayMessage = { role: "user", content: text };
    const assistantMsg: DisplayMessage = { role: "assistant", content: "", isStreaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Simulate pipeline phases by timer (visual teaching tool)
    const phaseTimers: ReturnType<typeof setTimeout>[] = [];
    phaseTimers.push(setTimeout(() => setPipelinePhase(2), 350));   // Phase 2: 请求编码
    phaseTimers.push(setTimeout(() => setPipelinePhase(3), 700));   // Phase 3: 分词预处理
    phaseTimers.push(setTimeout(() => setPipelinePhase(4), 1050));  // Phase 4: API 调度
    phaseTimers.push(setTimeout(() => setPipelinePhase(5), 1550));  // Phase 5: Transformer 推理

    const controller = new AbortController();
    abortRef.current = controller;

    const allMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Per-message metrics measurement (TTFT / TPS / output tokens).
    let t0 = 0;
    let outTok = 0;
    let ttftMs: number | undefined;
    let reasoningText = "";

    const onEvent = (event: ChatStreamEvent) => {
      switch (event.event) {
        case "delta":
          if (ttftMs === undefined) ttftMs = Date.now() - t0;
          outTok++;
          if (pipelinePhase < 6) setPipelinePhase(6); // Phase 6: 自回归解码
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
          setMetrics((prev) => ({
            ...prev,
            inputTokens: event.prompt_tokens,
            outputTokens: event.completion_tokens,
            totalTokens: event.total_tokens,
          }));
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
          setPipelinePhase(7); // Phase 7: 响应完成
          const elapsed = Math.max((Date.now() - t0) / 1000, 0.01);
          const tps = outTok > 0 ? Math.round(outTok / elapsed) : undefined;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                isStreaming: false,
                ...(outTok > 0 ? { ttftMs, tps, outputTokens: outTok } : {}),
              };
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
      setMetrics((prev) => ({ ...prev, show: true }));
      setRefreshTrigger((t) => t + 1);
      if (!conversationId) {
        setTimeout(() => setRefreshTrigger((t) => t + 1), 500);
      }
    };

    t0 = Date.now();
    try {
      await sendMessage(allMessages, modelParams, onEvent, onError, onComplete, controller.signal, conversationId);
    } catch {
      setIsStreaming(false);
    }
  }, [messages, conversationId, modelParams, pipelinePhase]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setPipelinePhase(0);
    setRefreshTrigger((t) => t + 1);
  }, []);

  const handleDismissError = useCallback(() => setError(null), []);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* Conversation sidebar */}
      <ConversationList
        sessionId={sessionId}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        refreshTrigger={refreshTrigger}
      />

      {/* Chat main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: "12px 24px", borderBottom: "1px solid #21262d", background: "#0a0e14",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <h1 style={{ fontSize: 13, fontWeight: 600, color: "#e6edf3", fontFamily: "JetBrains Mono, monospace" }}>
            💬 Chat
          </h1>
          <span style={{ fontSize: 11, color: "#484f58" }}>/ Playground</span>
        </div>

        {error && <ErrorBubble error={error} onDismiss={handleDismissError} />}
        <PipelineVisualization activePhase={pipelinePhase} isStreaming={isStreaming} />
        <ModelParamsPanel
          params={modelParams}
          onChange={(p) => setModelParams({ ...p, reasoningEnabled: p.reasoningEnabled ?? false })}
          collapsed={messages.length > 0}
          messageCount={messages.filter((m) => m.role !== "system").length}
        />
        <ChatArea messages={messages} />
        <PerformanceMetrics {...metrics} />
        <ChatInput onSend={handleSend} onCancel={handleCancel} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
