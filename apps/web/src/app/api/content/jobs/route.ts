import { listJobs } from "@/server/content";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return json(
    listJobs(
      url.searchParams.get("category"),
      url.searchParams.get("difficulty"),
    ),
  );
}
