import { and, asc, count, desc, eq, gt, isNull } from "drizzle-orm";
import { ensureConversationSchema, getDb } from "../../db";
import { conversations, messages, sessions } from "../../db/schema";

export type StoredMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function assertSessionId(sessionId: string) {
  if (!/^anon_[a-f0-9]{16,48}$/i.test(sessionId)) {
    throw new Error("INVALID_SESSION");
  }
}

function expiryFrom(now: Date) {
  return new Date(now.getTime() + THIRTY_DAYS_MS).toISOString();
}

async function touchSession(sessionId: string, now: string) {
  await ensureConversationSchema();
  const db = getDb();
  await db
    .insert(sessions)
    .values({ sessionId, createdAt: now, lastSeenAt: now })
    .onConflictDoUpdate({
      target: sessions.sessionId,
      set: { lastSeenAt: now },
    });
}

export async function replaceConversation(
  sessionId: string,
  conversationId: string | null | undefined,
  snapshot: StoredMessage[],
) {
  assertSessionId(sessionId);
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const expiresAt = expiryFrom(nowDate);
  const db = getDb();
  await touchSession(sessionId, now);

  let id = conversationId ?? null;
  if (id) {
    const [owned] = await db
      .select({ conversationId: conversations.conversationId })
      .from(conversations)
      .where(
        and(
          eq(conversations.conversationId, id),
          eq(conversations.sessionId, sessionId),
          isNull(conversations.deletedAt),
        ),
      )
      .limit(1);
    if (!owned) throw new Error("CONVERSATION_NOT_FOUND");
    await db
      .update(conversations)
      .set({ updatedAt: now, expiresAt })
      .where(eq(conversations.conversationId, id));
  } else {
    id = `conv_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
    const firstUser = snapshot.find((message) => message.role === "user");
    const title = (firstUser?.content.trim() || "新对话").slice(0, 50);
    await db.insert(conversations).values({
      conversationId: id,
      sessionId,
      title,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      deletedAt: null,
    });
  }

  const stored = snapshot
    .filter((message) => message.role === "user" || message.role === "assistant")
    .filter((message) => message.content.trim())
    .slice(-50);

  await db.delete(messages).where(eq(messages.conversationId, id));
  if (stored.length) {
    await db.insert(messages).values(
      stored.map((message, position) => ({
        messageId: `msg_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
        conversationId: id!,
        role: message.role,
        content: message.content,
        createdAt: now,
        position,
      })),
    );
  }

  return { conversation_id: id };
}

export async function listConversations(sessionId: string) {
  assertSessionId(sessionId);
  const now = new Date().toISOString();
  await touchSession(sessionId, now);
  const db = getDb();
  const rows = await db
    .select({
      conversation_id: conversations.conversationId,
      title: conversations.title,
      created_at: conversations.createdAt,
      updated_at: conversations.updatedAt,
      message_count: count(messages.messageId),
    })
    .from(conversations)
    .leftJoin(messages, eq(messages.conversationId, conversations.conversationId))
    .where(
      and(
        eq(conversations.sessionId, sessionId),
        isNull(conversations.deletedAt),
        gt(conversations.expiresAt, now),
      ),
    )
    .groupBy(conversations.conversationId)
    .orderBy(desc(conversations.updatedAt));
  return rows;
}

export async function getConversation(sessionId: string, conversationId: string) {
  assertSessionId(sessionId);
  await ensureConversationSchema();
  const db = getDb();
  const [conversation] = await db
    .select({
      conversation_id: conversations.conversationId,
      session_id: conversations.sessionId,
      title: conversations.title,
      created_at: conversations.createdAt,
      updated_at: conversations.updatedAt,
      expires_at: conversations.expiresAt,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.conversationId, conversationId),
        eq(conversations.sessionId, sessionId),
        isNull(conversations.deletedAt),
        gt(conversations.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);
  if (!conversation) return null;

  const conversationMessages = await db
    .select({
      message_id: messages.messageId,
      role: messages.role,
      content: messages.content,
      created_at: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.position));
  return { ...conversation, messages: conversationMessages };
}

export async function deleteConversation(sessionId: string, conversationId: string) {
  assertSessionId(sessionId);
  await ensureConversationSchema();
  const db = getDb();
  const result = await db
    .update(conversations)
    .set({ deletedAt: new Date().toISOString() })
    .where(
      and(
        eq(conversations.conversationId, conversationId),
        eq(conversations.sessionId, sessionId),
        isNull(conversations.deletedAt),
      ),
    )
    .returning({ conversationId: conversations.conversationId });
  return result.length > 0;
}
