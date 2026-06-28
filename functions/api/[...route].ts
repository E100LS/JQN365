import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { D1Database } from '@cloudflare/workers-types';

// TypeScript type for the binding
type Bindings = {
  DB: D1Database;
};

// Initialize Hono app
const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', cors());

// ============ Posts API ============

// GET /api/posts - List all posts
app.get('/api/posts', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const result = await db.prepare('SELECT * FROM posts ORDER BY date DESC').all();
    const rows = result.results || [];
    
    const posts = rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      tags: row.tags ? JSON.parse(row.tags) : [],
      excerpt: row.excerpt || '',
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return c.json(posts, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/posts/:id - Get single post
app.get('/api/posts/:id', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const id = c.req.param('id');
    const result = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
    
    if (!result) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({
      id: result.id,
      title: result.title,
      date: result.date,
      tags: result.tags ? JSON.parse(result.tags) : [],
      excerpt: result.excerpt || '',
      content: result.content,
      created_at: result.created_at,
      updated_at: result.updated_at,
    }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/posts - Create new post
app.post('/api/posts', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const body = await c.req.json();
    
    const id = `post_${Date.now()}`;
    const now = new Date().toISOString();
    const tags = JSON.stringify(body.tags || []);
    
    await db.prepare(
      'INSERT INTO posts (id, title, date, tags, excerpt, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, body.title, body.date || now, tags, body.excerpt || '', body.content, now, now).run();
    
    return c.json({ id, title: body.title, date: body.date || now, tags: body.tags || [], excerpt: body.excerpt || '', content: body.content, created_at: now, updated_at: now }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// PUT /api/posts/:id - Update post
app.put('/api/posts/:id', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const id = c.req.param('id');
    const body = await c.req.json();
    const now = new Date().toISOString();
    const tags = JSON.stringify(body.tags || []);
    
    await db.prepare(
      'UPDATE posts SET title = ?, date = ?, tags = ?, excerpt = ?, content = ?, updated_at = ? WHERE id = ?'
    ).bind(body.title, body.date || now, tags, body.excerpt || '', body.content, now, id).run();
    
    return c.json({ id, title: body.title, date: body.date || now, tags: body.tags || [], excerpt: body.excerpt || '', content: body.content, updated_at: now }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// DELETE /api/posts/:id - Delete post
app.delete('/api/posts/:id', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const id = c.req.param('id');
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return c.json({ success: true }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// GET /api/tags - Get all tags
app.get('/api/tags', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const result = await db.prepare('SELECT tags FROM posts WHERE tags IS NOT NULL AND tags != "[]"').all();
    const rows = result.results || [];
    
    const tagSet = new Set<string>();
    for (const row of rows) {
      try {
        const tags = JSON.parse(row.tags);
        if (Array.isArray(tags)) {
          tags.forEach((tag: string) => tagSet.add(tag));
        }
      } catch (e) {
        // skip invalid JSON
      }
    }
    
    return c.json(Array.from(tagSet).sort(), 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ Auth API ============

// POST /api/login - Login
app.post('/api/login', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const body = await c.req.json();
    const result = await db.prepare('SELECT * FROM users WHERE username = ?').bind(body.username).first();
    
    if (!result) {
      return c.json({ error: '用户名不存在' }, 401);
    }
    
    if (result.password !== body.password) {
      return c.json({ error: '密码错误' }, 401);
    }
    
    return c.json({ token: 'mock_token', user: { username: result.username } }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// POST /api/register - Register
app.post('/api/register', async (c: any) => {
  try {
    const db = c.env.DB as D1Database;
    const body = await c.req.json();
    
    const existing = await db.prepare('SELECT * FROM users WHERE username = ?').bind(body.username).first();
    if (existing) {
      return c.json({ error: '用户名已存在' }, 409);
    }
    
    const id = `user_${Date.now()}`;
    await db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').bind(id, body.username, body.password).run();
    
    return c.json({ id, username: body.username }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
