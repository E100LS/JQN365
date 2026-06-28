import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Post } from '../utils/postStorage';
import { 
  loadPosts, 
  deletePost, 
  addPost, 
  getTags,
  getPostById,
  updatePost,
  login,
  register,
  isAuthenticated,
  logout
} from '../utils/postStorage';
import { readMultipleFiles } from '../utils/fileUtils';
import AdminLoginForm from '../components/AdminLoginForm';

export default function AdminPostList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // 检查是否已登录
  useEffect(() => {
    async function checkAuth() {
      if (isAuthenticated()) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    }
    
    checkAuth();
  }, []);

  // 加载文章（仅已登录时）
  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }
    
    async function loadPostsData() {
      setLoading(true);
      setError(null);
      
      try {
        const loaded = await loadPosts();
        setPosts(loaded);
      } catch (e: any) {
        setError('加载文章失败: ' + e.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadPostsData();
  }, [authenticated]);

  // 未登录时显示登录框
  if (!authenticated) {
    return <AdminLoginForm onLogin={() => setAuthenticated(true)} />;
  }

  // 删除文章
  const handleDelete = async (id: string) => {
    try {
      const success = await deletePost(id);
      if (success) {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        alert('删除失败，请重试');
      }
    } catch (e: any) {
      alert('删除失败: ' + e.message);
    }
    setDeleteConfirm(null);
  };

  // 导入文件（调用 API）
  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      let imported = 0;

      for (const file of await readMultipleFiles(files)) {
        try {
          const content = file.content;
          const titleMatch = content.match(/^\s*---\s*\n.*?title:\s*(.+?)\s*\n/m);
          const title = titleMatch?.[1]?.trim() || file.name.replace(/\.[^.]+$/, '');
          const tagMatch = content.match(/tags:\s*\[([^\]]*)\]/);
          const tags = tagMatch
            ? tagMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')).filter(Boolean)
            : [];

          const excerpt = content.replace(/[#*>>\-\|]/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/\n{2,}/g, '\n')
            .trim()
            .substring(0, 150) + '...';

          const post = await addPost({
            title,
            date: new Date().toISOString().split('T')[0],
            tags,
            excerpt,
            content
          });

          if (post) {
            setPosts(prev => [post!, ...prev]);
            imported++;
          }
        } catch (e) {
          console.error('解析文件失败:', e);
        }
      }

      if (imported > 0) {
        setShowImport(false);
        alert(`成功导入 ${imported} 篇文章`);
      } else {
        setError('没有成功导入任何文章');
      }
    } catch (e: any) {
      setError('导入文件失败: ' + e.message);
    } finally {
      setImporting(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUsername(null);
  };

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

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顶部栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">文章管理</h1>
          <p className="mt-1 text-gray-600">
            欢迎，{username || '管理员'} · 
            <button 
              onClick={handleLogout}
              className="ml-2 text-sm text-gray-500 hover:text-primary underline"
            >
              退出登录
            </button>
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link
            to="/admin/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建文章
          </Link>
          
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            导入文件
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 导入弹窗 */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">导入文章</h2>
              <button
                onClick={() => setShowImport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">拖拽文件到此处，或点击上传</p>
                <p className="text-sm text-gray-500">支持 .md, .markdown, .txt 文件</p>
                <input
                  type="file"
                  multiple
                  accept=".md,.markdown,.txt,text/markdown,text/plain"
                  onChange={(e) => handleImport(e.target.files)}
                  className="hidden"
                  id="import-files"
                />
                <label htmlFor="import-files" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors">
                  选择文件
                </label>
              </div>

              {importing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">正在导入...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 文章统计 */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm text-gray-600">
          共 <span className="font-semibold text-gray-900">{posts.length}</span> 篇文章
        </span>
        
        {posts.length > 0 && (
          <div className="flex gap-2">
            {(getTags().slice(0, 5) as string[]).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 文章列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无文章</h3>
          <p className="text-gray-600 mb-6">开始创建你的第一篇文章吧！</p>
          <Link
            to="/admin/new"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
          >
            创建文章
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">标题</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">日期</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">标签</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-md">
                        {post.excerpt}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(post.date).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {post.tags?.map(tag => (
                        <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/post/${post.id}`}
                        className="text-gray-400 hover:text-primary transition-colors"
                        title="预览"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/admin/edit/${post.id}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="编辑"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      {deleteConfirm === post.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-600 hover:text-red-700"
                            title="确认删除"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 17" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-400 hover:text-gray-600"
                            title="取消"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(post.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 底部导航 */}
      <div className="mt-8 flex justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首页
        </Link>
      </div>
    </div>
  );
}