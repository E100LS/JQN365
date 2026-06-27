// D1 数据库 API 客户端
// 与 Cloudflare D1 通信，替代 localStorage

const API_BASE = '/api';

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API Error: ${res.status}`);
  return data;
}

export async function getPosts() {
  return request('/posts');
}

export async function getPostById(id: string) {
  return request(`/posts/${id}`);
}

export async function addPost(post: {
  title: string;
  date: string;
  tags: string[];
  content: string;
  excerpt: string;
}) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
}

export async function updatePost(id: string, post: {
  title: string;
  date: string;
  tags: string[];
  content: string;
  excerpt: string;
}) {
  return request(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(post),
  });
}

export async function deletePost(id: string) {
  return request(`/posts/${id}`, { method: 'DELETE' });
}

export async function login(username: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export default { getPosts, getPostById, addPost, updatePost, deletePost, login };
