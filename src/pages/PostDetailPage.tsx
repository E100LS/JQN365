import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import postsData from '../data/posts.json';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { loadPosts } from '../utils/postStorage';

// 给 JSON 数据添加数字 ID，确保与 localStorage 数据格式一致
const JSON_POSTS = postsData.posts.map((p, index) => ({
  ...p,
  id: p.id || index + 1
}));

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 优先从 API/localStorage 加载，没有则使用 posts.json
  useEffect(() => {
    async function load() {
      try {
        const stored = await loadPosts();
        if (stored && stored.length > 0) {
          setAllPosts(stored);
        } else {
          setAllPosts(JSON_POSTS);
        }
      } catch (e) {
        setAllPosts(JSON_POSTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 根据 URL 参数查找文章（支持字符串ID和数字ID）
  const post = allPosts.find(p => String(p.id) === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">文章未找到</h1>
        <p className="text-gray-600 mb-6">抱歉，您查找的文章不存在</p>
        <Link to="/" className="text-primary hover:text-primary-light font-medium">
          ← 返回首页
        </Link>
        {id && (
          <p className="text-sm text-gray-400 mt-4">
            当前文章 ID: {id}，共有 {allPosts.length} 篇文章
          </p>
        )}
      </div>
    );
  }

  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        to="/"
        className="inline-flex items-center text-primary hover:text-primary-light mb-6 font-medium transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>

      {/* Post Header */}
      <header className="bg-white rounded-xl p-8 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {post.date}
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-sm bg-primary-light text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Post Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm markdown-content">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* 上下篇导航 */}
      <nav className="mt-8 flex justify-between">
        {prevPost ? (
          <Link
            to={`/post/${prevPost.id}`}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="text-sm">
              <span className="text-xs text-gray-400">上一篇</span>
              <div className="text-gray-800">{prevPost.title}</div>
            </div>
          </Link>
        ) : <div />}

        {nextPost && (
          <Link
            to={`/post/${nextPost.id}`}
            className="flex items-center text-gray-600 hover:text-primary transition-colors text-right"
          >
            <div className="text-sm">
              <span className="text-xs text-gray-400">下一篇</span>
              <div className="text-gray-800">{nextPost.title}</div>
            </div>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </nav>

      {/* 版权声明 */}
      <div className="mt-8 text-center text-sm text-gray-400">
        <p>© 2026 解千牛 · 内容仅供个人学习参考，不构成投资建议</p>
      </div>
    </article>
  );
}