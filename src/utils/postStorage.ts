/**
 * 文章存储管理 - 本地存储管理
 */

// 直接定义 Post 类型，避免 TypeScript 类型导出被 rolldown 误报
export interface Post {
  id: number;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
}

// 使用 localStorage 存储文章
const STORAGE_KEY = 'stock_blog_posts';

// 初始默认文章（空数组，从 HomePage 的默认数据加载）
const DEFAULT_POSTS: Post[] = [];

export function getInitialPosts(): Post[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('解析存储文章失败:', e);
    }
  }
  return DEFAULT_POSTS;
}

export function loadPosts(): Post[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载文章失败:', error);
  }
  return DEFAULT_POSTS;
}

export function savePosts(posts: Post[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('保存文章失败:', error);
  }
}

export function getUniqueId(posts: Post[]): number {
  if (posts.length === 0) return 1;
  return Math.max(...posts.map(p => p.id)) + 1;
}

export function addPost(posts: Post[], post: { title: string; date: string; tags: string[]; content: string; excerpt: string }): Post {
  const newPost: Post = {
    ...post,
    id: getUniqueId(posts)
  };
  return newPost;
}

export function deletePost(posts: Post[], id: number): Post[] {
  return posts.filter(p => p.id !== id);
}

export function updatePost(posts: Post[], updated: Post): Post[] {
  return posts.map(p => p.id === updated.id ? updated : p);
}

export function getTags(posts: Post[]): string[] {
  const tags = new Set<string>();
  posts.forEach(p => {
    p.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}