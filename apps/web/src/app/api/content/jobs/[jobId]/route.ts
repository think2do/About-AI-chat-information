import { getJob } from "@/server/content";
import { json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  const job = getJob(jobId);
  if (!job) return json({ detail: "题目不存在" }, { status: 404 });
  return json(job);
}
