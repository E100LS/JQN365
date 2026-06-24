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
  const postId = id ? parseInt(id, 10) : NaN;
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 优先从 localStorage 加载，没有则使用 posts.json
  useEffect(() => {
    try {
      const stored = loadPosts();
      if (stored && stored.length > 0) {
        // localStorage 有文章数据，使用它
        setAllPosts(stored);
      } else {
        // localStorage 为空，使用 JSON 默认数据
        setAllPosts(JSON_POSTS);
      }
    } catch (e) {
      setAllPosts(JSON_POSTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // 根据 URL 参数查找文章
  const post = allPosts.find(p => p.id === postId);

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
        {postId && (
          <p className="text-sm text-gray-400 mt-4">
            当前文章 ID: {postId}，共有 {allPosts.length} 篇文章
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

      {/* Navigation */}
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

      {/* Manage Buttons */}
      <div className="mt-8 flex gap-4">
        <Link
          to={`/admin/edit/${post.id}`}
          className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          编辑此文章
        </Link>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.896.103 1.754.103 2.652 0 1.543-.94 3.31.826 2.37 2.37.103.896.103 1.754 0 2.652" />
          </svg>
          返回管理后台
        </button>
      </div>
    </article>
  );
}