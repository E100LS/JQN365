export async function onRequest(context) {
  const { request, env } = context;

  // GET /api/tags
  if (request.method === 'GET') {
    try {
      const result = await env.DB.prepare('SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != "[]"').all();
      const rows = result.results || [];
      const tagSet = new Set();
      for (const row of rows) {
        try {
          const tags = JSON.parse(row.tags);
          if (Array.isArray(tags)) {
            tags.forEach((tag) => tagSet.add(tag));
          }
        } catch (e) {
          // skip
        }
      }
      return new Response(JSON.stringify(Array.from(tagSet).sort()), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 405,
  });
}
