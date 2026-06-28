export async function onRequest(context) {
  const { request, env } = context;

  // POST /api/login
  try {
    const body = await request.json();
    const result = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(body.username).first();
    if (!result) {
      return new Response(JSON.stringify({ error: '用户名不存在' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    if (result.password !== body.password) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    return new Response(JSON.stringify({ token: 'mock_token', user: { username: result.username } }), {
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
