export async function onRequest(context) {
  const { request, env } = context;

  // GET /api/posts - List all posts
  if (request.method === 'GET') {
    try {
      const result = await env.DB.prepare('SELECT * FROM posts ORDER BY date DESC').all();
      const posts = (result.results || []).map((row) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        tags: row.tags ? JSON.parse(row.tags) : [],
        excerpt: row.excerpt || '',
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
      return new Response(JSON.stringify(posts), {
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

  // POST /api/posts - Create new post
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const id = `post_${Date.now()}`;
      const now = new Date().toISOString();
      const tags = JSON.stringify(body.tags || []);
      await env.DB.prepare(
        'INSERT INTO posts (id, title, date, tags, excerpt, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, body.title, body.date || now, tags, body.excerpt || '', body.content, now, now).run();
      return new Response(JSON.stringify({ id, title: body.title, date: body.date || now, tags: body.tags || [], excerpt: body.excerpt || '', content: body.content, created_at: now, updated_at: now }), {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
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
