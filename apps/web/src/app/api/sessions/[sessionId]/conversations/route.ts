import {
  listConversations,
  replaceConversation,
  type StoredMessage,
} from "@/server/conversations";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    return Response.json({
      session_id: sessionId,
      conversations: await listConversations(sessionId),
    });
  } catch {
    return Response.json({ detail: "无法读取对话" }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    const body = (await request.json()) as {
      conversation_id?: string;
      messages?: StoredMessage[];
    };
    if (!body.messages?.length) {
      return Response.json({ detail: "messages is required" }, { status: 400 });
    }
    return Response.json(
      await replaceConversation(
        sessionId,
        body.conversation_id,
        body.messages,
      ),
    );
  } catch {
    return Response.json({ detail: "无法保存对话" }, { status: 400 });
  }
}
