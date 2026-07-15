import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessions = sqliteTable("sessions", {
  sessionId: text("session_id").primaryKey(),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
});

export const conversations = sqliteTable(
  "conversations",
  {
    conversationId: text("conversation_id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.sessionId),
    title: text("title").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    index("idx_conversations_session").on(
      table.sessionId,
      table.deletedAt,
      table.expiresAt,
    ),
  ],
);

export const messages = sqliteTable(
  "messages",
  {
    messageId: text("message_id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.conversationId),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: text("created_at").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [
    index("idx_messages_conversation").on(
      table.conversationId,
      table.position,
    ),
  ],
);
