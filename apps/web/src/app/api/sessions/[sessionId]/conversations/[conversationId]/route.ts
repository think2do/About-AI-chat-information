import {
  deleteConversation,
  getConversation,
} from "@/server/conversations";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ sessionId: string; conversationId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { sessionId, conversationId } = await context.params;
    const conversation = await getConversation(sessionId, conversationId);
    if (!conversation) {
      return Response.json({ detail: "Conversation not found" }, { status: 404 });
    }
    return Response.json(conversation);
  } catch {
    return Response.json({ detail: "无法读取对话" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { sessionId, conversationId } = await context.params;
    const deleted = await deleteConversation(sessionId, conversationId);
    if (!deleted) {
      return Response.json({ detail: "Conversation not found" }, { status: 404 });
    }
    return Response.json({ conversation_id: conversationId, deleted: true });
  } catch {
    return Response.json({ detail: "无法删除对话" }, { status: 400 });
  }
}
