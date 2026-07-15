export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "ai-teaching-tool",
    version: "0.2.0-sites",
  });
}
