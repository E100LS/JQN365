import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Post } from '../utils/postStorage';
import { savePosts, updatePost, loadPosts } from '../utils/postStorage';

// 可用的标签
const AVAILABLE_TAGS = ['技术分析', '基本面分析', '心态修炼', '资金管理', '复盘总结'];

export default function AdminEditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const postId = id ? parseInt(id, 10) : null;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载文章
  useEffect(() => {
    if (!postId) return;
    
    try {
      const posts = loadPosts();
      const post = posts.find(p => p.id === postId);
      
      if (post) {
        setTitle(post.title);
        setDate(post.date);
        setTags(post.tags || []);
        setContent(post.content);
      } else {
        setError('文章不存在');
      }
    } catch (e) {
      setError('加载文章失败');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // 切换标签
  const toggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // 从文件导入
  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        
        // 提取标题（如果文件有 front-matter）
        const titleMatch = text.match(/^\s*---\s*\n.*?title:\s*(.+?)\s*\n/m);
        if (titleMatch) {
          setTitle(titleMatch[1].trim());
        }
      };
      reader.readAsText(files[0]);
    } catch (e) {
      setError('导入失败: ' + (e as Error).message);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 保存文章
  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }

    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }

    if (!postId) return;

    setSaving(true);
    setError(null);

    try {
      const posts = loadPosts();
      const updated: Post = {
        id: postId,
        title: title.trim(),
        date,
        tags,
        excerpt: content.replace(/[#*>>\-\|]/g, ' ')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\n{2,}/g, '\n')
          .trim()
          .substring(0, 150) + '...',
        content
      };

      savePosts(updatePost(posts, updated));
      navigate('/admin');
    } catch (e) {
      setError('保存失败: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
          <p className="mt-1 text-gray-600">修改已发布的文章内容</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setPreview(!preview)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {preview ? '编辑' : '预览'}
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                保存中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                保存修改
              </>
            )}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* 导入区域 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">导入覆盖</h2>
          <p className="text-sm text-gray-500">从本地文件导入内容覆盖当前文章</p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600">点击或拖拽文件到此处</p>
          <p className="text-sm text-gray-500 mt-1">支持 .md, .markdown, .txt 文件</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            onChange={(e) => handleImport(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* 表单区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 编辑区域 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-4">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入文章标题"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发布日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      tags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容 <span className="text-gray-400">(Markdown 格式)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"# 标题\n\n## 正文...\n\n> 引用\n\n- 列表项"}
                rows={16}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* 预览区域 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">实时预览</h2>
            {preview && (
              <span className="text-sm text-gray-500">显示 Markdown 渲染效果</span>
            )}
          </div>
          
          <div className="border border-gray-200 rounded-xl p-6 min-h-[600px] overflow-auto">
            {content.trim() ? (
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ 
                  __html: content
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-primary my-3">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-primary-light my-4">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-primary my-4">$1</h1>')
                    .replace(/^\[(.+?)\]\((.+?)\)/gim, '<a href="$2" class="text-primary hover:underline">$1</a>')
                    .replace(/\*\*(.+?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/gim, '<em>$1</em>')
                    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-accent pl-4 my-4 text-gray-600 italic bg-gray-50 p-4 rounded-r">$1</blockquote>')
                    .replace(/^- (.*$)/gim, '<li>$1</li>')
                    .replace(/\n\n/gim, '</li></ul><p></p>')
                    .replace(/\n/gim, '<br>')
                }} />
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p>开始编辑内容，预览将自动更新</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}