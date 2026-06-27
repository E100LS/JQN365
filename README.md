# 解千牛博客 - Cloudflare Pages + D1 部署指南

## 项目说明
这是一个基于 React + Vite + Cloudflare Pages + D1 的个人博客系统。
- 前台：文章列表、详情页、搜索、标签筛选、AI 智能助手横幅
- 后台：文章管理（增删改查）、Markdown 文件导入、智能标签推荐
- 数据层：Cloudflare D1 数据库，支持全球分布式访问

## 技术栈
- React 18.2 + TypeScript + Vite 5
- TailwindCSS 3.3
- Cloudflare Pages + D1 (SQLite) + Hono (API)
- 部署：Cloudflare Pages (free tier)

## 管理员凭据
- 用户名: JQN365
- 密码: bl0596cn
（数据库初始化时会自动创建）

## 本地开发
```bash
npm install
npm run dev
```

## 部署到 Cloudflare Pages

### 前提条件
1. 注册 Cloudflare 账号（免费）
2. 已连接 GitHub 仓库到 Cloudflare Pages
3. 创建了 D1 数据库并绑定了 database_name 和 database_id

### 详细步骤

#### 第 1 步：创建 D1 数据库
1. 登录 https://dash.cloudflare.com
2. 左侧菜单 → **Workers & Pages** → **D1**
3. 点击 **Create database**
4. 填写：
   - **Database name**: `jqn365-blog-db`
   - **Location timezone**: Asia/Shanghai
5. 点击 **Create**

#### 第 2 步：获取 Database ID
1. 创建完成后，在 D1 数据库中点击 `jqn365-blog-db`
2. 复制 **Database ID**（类似 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

#### 第 3 步：更新 wrangler.toml
打开 `wrangler.toml`，将 database_id 填入：

```toml
[[d1_databases]]
binding = "DB"
database_name = "jqn365-blog-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换为你的 Database ID
migrations_dir = "migrations"
```

#### 第 4 步：运行迁移（可选）
本地执行迁移：
```bash
npx wrangler d1 execute jqn365-blog-db --file=migrations/0001_initial.sql
```

#### 第 5 步：构建部署
```bash
npm run build
```

#### 第 6 步：推送到 GitHub
```bash
git add -A
git commit -m "add D1 config with database ID"
git push origin main
```

#### 第 7 步：触发 Cloudflare Pages 构建
- Cloudflare Pages 会自动检测到 `main` 分支的更新
- 自动构建并部署
- 完成后会给你一个 `*.pages.dev` 域名

### 环境变量（可选）
如果需要自定义 API 地址或其他配置，可以在 Cloudflare Pages 中添加环境变量。

## 文件结构
```
stock-blog/
├── functions/
│   └── api/
│       └── [...route].ts   # Hono API 路由
├── migrations/
│   └── 0001_initial.sql    # D1 数据库迁移脚本
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── AdminPostList.tsx
│   │   ├── AdminNewPost.tsx
│   │   └── AdminEditPost.tsx
│   ├── utils/
│   │   ├── apiClient.ts    # D1 API 客户端
│   │   └── postStorage.ts  # 文章存储（兼容本地/D1）
│   ├── App.tsx
│   └── main.tsx
├── dist/                   # 构建输出
├── wrangler.toml           # Cloudflare 配置
└── package.json
```

## 常见问题

### Q: 前台看不到新文章？
A: 确认：
1. 代码已推送到 GitHub
2. Cloudflare Pages 部署成功
3. D1 数据库已创建并绑定
4. 查看 Cloudflare Pages 构建日志是否有错误

### Q: 后台登录后看不到文章列表？
A: 检查浏览器控制台是否有 API 错误。如果是 CORS 问题，确认 API 路由配置正确。

### Q: 如何重置管理员密码？
A: 直接在 D1 数据库中更新 users 表的 password 字段即可。

```sql
UPDATE users SET password = '新密码' WHERE username = 'JQN365';
```

### Q: 开发环境下如何使用本地存储？
A: 开发环境（`npm run dev`）自动使用 localStorage，生产环境自动切换到 D1 API。