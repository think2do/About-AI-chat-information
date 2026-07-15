import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let schemaReady: Promise<void> | null = null;

export function getD1() {
  const binding = (env as typeof env & { DB?: D1Database }).DB;
  if (!binding) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB`.",
    );
  }
  return binding;
}

export function getDb() {
  return drizzle(getD1(), { schema });
}

export async function ensureConversationSchema() {
  if (!schemaReady) {
    const d1 = getD1();
    schemaReady = d1
      .batch([
        d1.prepare(`CREATE TABLE IF NOT EXISTS sessions (
          session_id TEXT PRIMARY KEY,
          created_at TEXT NOT NULL,
          last_seen_at TEXT NOT NULL
        )`),
        d1.prepare(`CREATE TABLE IF NOT EXISTS conversations (
          conversation_id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL REFERENCES sessions(session_id),
          title TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          deleted_at TEXT
        )`),
        d1.prepare(`CREATE INDEX IF NOT EXISTS idx_conversations_session
          ON conversations(session_id, deleted_at, expires_at)`),
        d1.prepare(`CREATE TABLE IF NOT EXISTS messages (
          message_id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES conversations(conversation_id),
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          position INTEGER NOT NULL
        )`),
        d1.prepare(`CREATE INDEX IF NOT EXISTS idx_messages_conversation
          ON messages(conversation_id, position)`),
      ])
      .then(() => undefined)
      .catch((error: unknown) => {
        schemaReady = null;
        throw error;
      });
  }
  return schemaReady;
}
