import { getJargon } from "@/server/content";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(getJargon());
}
