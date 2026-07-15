export const CONTENT_HEADERS = {
  "Cache-Control": "public, max-age=300",
};

export function json(data: unknown, init: ResponseInit = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      ...CONTENT_HEADERS,
      ...init.headers,
    },
  });
}
