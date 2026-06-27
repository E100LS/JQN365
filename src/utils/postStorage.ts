/**
 * 文章存储管理 - 兼容模式（本地 + D1 双写）
 * 开发时走 localStorage，生产环境走 D1 API
 */

import { Post } from './postStorage';
import apiClient from '../utils/apiClient';

// 检测运行环境
const isProduction = import.meta.env.PROD;

// 本地用户状态
const USER_KEY = 'jqn365_current_user';

export function getCurrentUser(): { username: string } | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: { username: string } | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function logout(): void {
  setCurrentUser(null);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * 加载文章列表
 */
export async function loadPosts(): Promise<Post[]> {
  if (isProduction) {
    // 生产环境：从 D1 API 获取
    return apiClient.getPosts().then((posts: any[]) => 
      posts.map((p: any) => ({
        ...p,
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
      }))
    );
  }
  // 开发环境：从 localStorage 获取
  const data = localStorage.getItem('jqn365_posts');
  return data ? JSON.parse(data) : [];
}

/**
 * 根据 ID 获取文章
 */
export async function getPostById(id: string): Promise<Post | null> {
  if (isProduction) {
    return apiClient.getPostById(id);
  }
  const data = localStorage.getItem('jqn365_posts');
  if (!data) return null;
  const posts: Post[] = JSON.parse(data);
  return posts.find(p => p.id === id) || null;
}

/**
 * 创建文章
 */
export async function addPost(postData: Omit<Post, 'id'>): Promise<Post> {
  const id = `post_${Date.now()}`;
  const now = new Date().toISOString();
  const newPost: Post = {
    id,
    ...postData,
    created_at: now,
    updated_at: now,
  };

  if (isProduction) {
    return apiClient.addPost(newPost);
  }
  // 本地模式：写入 localStorage
  const posts = await loadPosts();
  posts.unshift(newPost);
  setPosts(posts);
  return newPost;
}

/**
 * 更新文章
 */
export async function updatePost(id: string, postData: Omit<Post, 'id'>): Promise<void> {
  if (isProduction) {
    await apiClient.updatePost(id, postData);
    return;
  }
  const posts = await loadPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) throw new Error('文章不存在');
  posts[index] = { ...posts[index], ...postData, updated_at: new Date().toISOString() };
  setPosts(posts);
}

/**
 * 删除文章
 */
export async function deletePost(id: string): Promise<boolean> {
  if (isProduction) {
    await apiClient.deletePost(id);
    return true;
  }
  const posts = await loadPosts();
  const filtered = posts.filter(p => p.id !== id);
  setPosts(filtered);
  return true;
}

/**
 * 获取所有标签
 */
export function getTags(posts: Post[]): string[] {
  const tags = new Set<string>();
  posts.forEach(p => {
    p.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * 保存文章数组到 localStorage（仅开发环境）
 */
export function setPosts(posts: Post[]): void {
  localStorage.setItem('jqn365_posts', JSON.stringify(posts));
}

/**
 * 用户登录
 */
export async function login(username: string, password: string): Promise<{ token: string; user: { username: string } }> {
  const result = await apiClient.login(username, password);
  setCurrentUser({ username });
  return result;
}
