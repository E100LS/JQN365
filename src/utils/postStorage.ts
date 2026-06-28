/**
 * 文章存储管理 - localStorage 持久化模式
 * 所有数据存在浏览器 localStorage 中，刷新不丢失
 *
 * 当前管理员账号：
 * - 用户名：JQN365
 * - 密码：bl0596cn
 */

export interface Post {
  id: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'jqn365_posts';
const USER_KEY = 'jqn365_current_user';

const DEFAULT_POSTS: Post[] = [
  {
    id: 'sample_1',
    title: '买股前必须思考的五个问题',
    date: '2026-06-20',
    tags: ['心态修炼', '投资基础'],
    excerpt: '买股前必须思考的五个问题：这笔钱急不急用？能忍受多大的亏损？买股票的逻辑是什么？',
    content: `# 买股前必须思考的五个问题

## 一、这笔钱急不急用？

**切记：投资只能用闲钱！**

如果你下个月要还房贷、交房租、孩子的学费，这些钱绝对不能用来炒股。

## 二、能忍受多大的亏损？

买股票前，一定要想清楚一个问题：**如果这笔钱全亏光了，我会怎么样？**

## 三、买这个股票的逻辑是什么？

当你决定买入某只股票时，请先回答：**我为什么买它？**

## 四、我的操作策略是什么？

很多人买股票前根本没有计划，买了之后也不知道怎么办。

## 五、我愿意投入多少时间研究？

投资需要学习和研究，不是无脑买入就能赚钱的。

---

**—— 解千牛**
`,
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'sample_2',
    title: '技术分析的三个核心指标',
    date: '2026-06-18',
    tags: ['技术分析'],
    excerpt: '技术分析的三个核心指标：均线、MACD、成交量。学会这些，你的技术分析水平会提升一个层次。',
    content: `# 技术分析的三个核心指标

## 一、均线（MA）

均线是最基础也是最重要的技术指标。

### 5 日均线（MA5）
- 反映短期走势

### 20 日均线（MA20）
- 反映中期趋势

## 二、MACD

MACD 被称为"指标之王"。

## 三、成交量

"量在价先"，成交量是价格变化的先行指标。

---

**—— 解千牛**
`,
    created_at: '2026-06-18T15:30:00Z',
    updated_at: '2026-06-18T15:30:00Z',
  },
  {
    id: 'sample_3',
    title: '复盘的意义和方法',
    date: '2026-06-15',
    tags: ['心态修炼', '复盘总结'],
    excerpt: '复盘是投资者的必修课。每天花 30 分钟复盘，一年后投资水平会有质的飞跃。',
    content: `# 复盘的意义和方法

## 为什么要复盘？

复盘，是指每天收盘后回顾当天的操作和市场的表现。

### 复盘的好处
1. 发现自己操作中的问题
2. 学习市场的规律
3. 提升投资判断能力
4. 减少情绪化交易

## 如何复盘？

### 第一步：回顾当天操作
### 第二步：分析市场表现
### 第三步：写下来
### 第四步：定期总结

---

**—— 解千牛**
`,
    created_at: '2026-06-15T09:00:00Z',
    updated_at: '2026-06-15T09:00:00Z',
  },
];

// 初始化：首次访问时写入默认数据
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
  }
  let users = JSON.parse(localStorage.getItem('jqn365_users') || '[]');
  if (users.length === 0) {
    users = [{ id: 'admin_1', username: 'JQN365', password: 'bl0596cn' }];
    localStorage.setItem('jqn365_users', JSON.stringify(users));
  }
  if (!localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(null));
  }
}

export function getPosts(): Post[] {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); }
    catch (e) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
      return DEFAULT_POSTS;
    }
  }
  return DEFAULT_POSTS;
}

export function setPosts(posts: Post[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

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

export function loadPosts(): Post[] {
  return getPosts();
}

export function getPostById(id: string): Post | null {
  return getPosts().find(p => p.id === id) || null;
}

export function addPost(postData: {
  title: string;
  date: string;
  tags: string[];
  content: string;
  excerpt: string;
}): Post {
  const posts = getPosts();
  const id = `post_${Date.now()}`;
  const now = new Date().toISOString();
  const newPost: Post = { id, ...postData, created_at: now, updated_at: now };
  posts.unshift(newPost);
  setPosts(posts);
  return newPost;
}

export function updatePost(id: string, postData: {
  title: string;
  date: string;
  tags: string[];
  content: string;
  excerpt: string;
}): Post {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) throw new Error('文章不存在');
  posts[index] = { ...posts[index], ...postData, updated_at: new Date().toISOString() };
  setPosts(posts);
  return posts[index];
}

export function deletePost(id: string): boolean {
  const posts = getPosts();
  setPosts(posts.filter(p => p.id !== id));
  return true;
}

export function getTags(): string[] {
  const posts = getPosts();
  const tags = new Set<string>();
  posts.forEach(p => { p.tags?.forEach(tag => tags.add(tag)); });
  return Array.from(tags).sort();
}

export async function login(username: string, password: string): Promise<{ token: string; user: { username: string } }> {
  let users = JSON.parse(localStorage.getItem('jqn365_users') || '[]');
  if (users.length === 0) {
    users = [{ id: 'admin_1', username: 'JQN365', password: 'bl0596cn' }];
    localStorage.setItem('jqn365_users', JSON.stringify(users));
  }
  const user = users.find((u: any) => u.username === username);
  if (!user) throw new Error('用户名不存在');
  if (user.password !== password) throw new Error('密码错误');
  setCurrentUser({ username: user.username });
  return { token: 'mock_token', user: { username: user.username } };
}

export async function register(username: string, password: string): Promise<{ id: string; username: string }> {
  const users = JSON.parse(localStorage.getItem('jqn365_users') || '[]');
  if (users.find((u: any) => u.username === username)) {
    throw new Error('用户名已存在');
  }
  const id = `user_${Date.now()}`;
  users.push({ id, username, password });
  localStorage.setItem('jqn365_users', JSON.stringify(users));
  setCurrentUser({ username });
  return { id, username };
}

export function logout(): void {
  setCurrentUser(null);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
