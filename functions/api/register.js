export async function onRequest(context) {
  const { request, env } = context;

  // POST /api/register
  try {
    const body = await request.json();
    const existing = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(body.username).first();
    if (existing) {
      return new Response(JSON.stringify({ error: '用户名已存在' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 409,
      });
    }
    const id = `user_${Date.now()}`;
    await env.DB.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').bind(id, body.username, body.password).run();
    return new Response(JSON.stringify({ id, username: body.username }), {
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
