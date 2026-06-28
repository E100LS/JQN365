export async function onRequest(context) {
  const { request, env } = context;
  const id = context.params.id;

  // GET /api/posts/:id
  if (request.method === 'GET') {
    try {
      const result = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      if (!result) {
        return new Response(JSON.stringify({ error: 'Post not found' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      return new Response(JSON.stringify({
        id: result.id,
        title: result.title,
        date: result.date,
        tags: result.tags ? JSON.parse(result.tags) : [],
        excerpt: result.excerpt || '',
        content: result.content,
        created_at: result.created_at,
        updated_at: result.updated_at,
      }), {
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

  // PUT /api/posts/:id
  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const now = new Date().toISOString();
      const tags = JSON.stringify(body.tags || []);
      await env.DB.prepare(
        'UPDATE posts SET title = ?, date = ?, tags = ?, excerpt = ?, content = ?, updated_at = ? WHERE id = ?'
      ).bind(body.title, body.date || now, tags, body.excerpt || '', body.content, now, id).run();
      return new Response(JSON.stringify({ id, title: body.title, date: body.date || now, tags: body.tags || [], excerpt: body.excerpt || '', content: body.content, updated_at: now }), {
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

  // DELETE /api/posts/:id
  if (request.method === 'DELETE') {
    try {
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({ success: true }), {
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
