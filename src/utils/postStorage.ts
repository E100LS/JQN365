/**
 * 文章存储管理 - 纯本地模式（直接操作 localStorage）
 * 用于本地测试体验，支持完整的增删改查功能
 * 
 * 注意：此文件已切换到本地模式！
 * 部署到 Cloudflare 时，需要：
 * 1. 恢复原来的 apiClient.ts 文件（使用 Cloudflare D1 数据库）
 * 2. 更新此文件为 API 调用模式
 * 
 * 当前本地模拟用户：
 * - 用户名：admin
 * - 密码：123456
 */

// 直接定义 Post 类型，使用字符串 ID
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

// 使用 localStorage 存储文章
const STORAGE_KEY = 'jqn365_posts';
const USER_KEY = 'jqn365_current_user';

// 初始默认文章
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

// 初始化数据
function initStorage() {
  // 确保文章存在
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
    console.log('初始化默认文章数据');
  }
  // 确保默认用户存在
  let users = JSON.parse(localStorage.getItem('jqn365_users') || '[]');
  if (users.length === 0) {
    users = [{ id: 'admin_1', username: 'admin', password: '123456' }];
    localStorage.setItem('jqn365_users', JSON.stringify(users));
    console.log('初始化默认用户数据');
  }
  // 确保当前用户未登录状态
  if (!localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, JSON.stringify(null));
  }
}

// 获取文章
export function getPosts(): Post[] {
  initStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      // 解析失败，重新初始化
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
      return DEFAULT_POSTS;
    }
  }
  return DEFAULT_POSTS;
}

// 保存文章
export function setPosts(posts: Post[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// 获取当前用户
export function getCurrentUser(): { username: string } | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

// 设置当前用户
export function setCurrentUser(user: { username: string } | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * 加载文章列表（带搜索和标签筛选）
 */
export function loadPosts(search?: string, tag?: string): Post[] {
  let posts = getPosts();

  if (search) {
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (tag) {
    posts = posts.filter(p => p.tags?.includes(tag));
  }

  return posts;
}

/**
 * 根据 ID 获取单篇文章
 */
export function getPostById(id: string): Post | null {
  const posts = getPosts();
  return posts.find(p => p.id === id) || null;
}

/**
 * 创建新文章
 */
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

  const newPost: Post = {
    id,
    ...postData,
    created_at: now,
    updated_at: now,
  };

  posts.unshift(newPost);
  setPosts(posts);

  return newPost;
}

/**
 * 更新文章
 */
export function updatePost(id: string, postData: {
  title: string;
  date: string;
  tags: string[];
  content: string;
  excerpt: string;
}): Post {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('文章不存在');
  }

  const now = new Date().toISOString();
  posts[index] = {
    ...posts[index],
    ...postData,
    updated_at: now,
  };

  setPosts(posts);
  return posts[index];
}

/**
 * 删除文章
 */
export function deletePost(id: string): boolean {
  let posts = getPosts();
  posts = posts.filter(p => p.id !== id);
  setPosts(posts);
  return true;
}

/**
 * 获取所有标签
 */
export function getTags(): string[] {
  const posts = getPosts();
  const tags = new Set<string>();

  posts.forEach(p => {
    p.tags?.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * 用户登录（模拟）
 */
export async function login(username: string, password: string): Promise<{ token: string; user: { username: string } }> {
  // 确保用户数据已初始化
  let users = JSON.parse(localStorage.getItem('jqn365_users') || '[]');
  if (users.length === 0) {
    // 初始化默认 admin 用户
    users = [{ id: 'admin_1', username: 'admin', password: '123456' }];
    localStorage.setItem('jqn365_users', JSON.stringify(users));
  }
  
  const user = users.find((u: any) => u.username === username);

  if (!user) {
    throw new Error('用户名不存在，请联系管理员创建账号');
  }

  if (user.password !== password) {
    throw new Error('密码错误，默认密码是 123456');
  }

  // 设置为当前用户
  setCurrentUser({ username: user.username });

  return { token: 'mock_token', user: { username: user.username } };
}

/**
 * 用户注册（模拟）
 */
export async function register(username: string, password: string): Promise<{ id: string; username: string }> {
  const users = JSON.parse(localStorage.getItem('jqn365_users') || '[]');

  if (users.find((u: any) => u.username === username)) {
    throw new Error('用户名已存在');
  }

  const id = `user_${Date.now()}`;
  users.push({ id, username, password });
  localStorage.setItem('jqn365_users', JSON.stringify(users));

  // 设置为当前用户
  setCurrentUser({ username });

  return { id, username };
}

/**
 * 退出登录
 */
export function logout(): void {
  setCurrentUser(null);
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  return user !== null;
}