import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPosts, setPosts } from '../utils/postStorage';
import { analyzeTags } from '../utils/autoTag';

export default function AdminEditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    if (post) {
      setTitle(post.title);
      setDate(post.date);
      setTagsStr((post.tags || []).join(', '));
      setContent(post.content);
    } else {
      setError('文章不存在');
    }
    setLoading(false);
  }, [id]);

  // 智能分析推荐标签
  const tagSuggestions = useMemo(() => {
    if (!title.trim() && !content.trim()) return [];
    return analyzeTags(title, content);
  }, [title, content]);

  const currentTags = useMemo(() => {
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  }, [tagsStr]);

  const pendingSuggestions = useMemo(() => {
    return tagSuggestions.filter(s => !currentTags.includes(s.tag));
  }, [tagSuggestions, currentTags]);

  const applyTag = (tag: string) => {
    const existing = currentTags;
    if (!existing.includes(tag)) {
      existing.push(tag);
      setTagsStr(existing.join(', '));
    }
  };

  const applyAllTags = () => {
    const existing = currentTags;
    const combined = [...existing];
    tagSuggestions.forEach(s => {
      if (!combined.includes(s.tag)) {
        combined.push(s.tag);
      }
    });
    setTagsStr(combined.join(', '));
  };

  const removeTag = (tag: string) => {
    const filtered = currentTags.filter(t => t !== tag);
    setTagsStr(filtered.join(', '));
  };

  const getScoreStars = (score: number) => {
    if (score >= 10) return '⭐⭐⭐';
    if (score >= 5) return '⭐⭐';
    if (score >= 2) return '⭐';
    return '';
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }
    if (!id) return;

    const tags = currentTags;

    const excerpt = content
      .replace(/[#*>\-\|]/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim()
      .substring(0, 150) + '...';

    const posts = getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      setError('文章不存在');
      return;
    }

    posts[index] = {
      ...posts[index],
      title: title.trim(),
      date,
      tags,
      excerpt,
      content,
      updated_at: new Date().toISOString(),
    };

    setPosts(posts);
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">编辑文章</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-400 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
          >
            保存修改
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">标签（逗号分隔）</label>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="技术分析, 心态修炼"
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500"
          />
        </div>

        {/* 已选标签 */}
        {currentTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">当前标签</label>
            <div className="flex flex-wrap gap-2">
              {currentTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600/30 text-amber-300 rounded-lg text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-amber-400 hover:text-amber-200"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 智能推荐标签 */}
        {tagSuggestions.length > 0 && (
          <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-medium text-gray-200">智能推荐标签</span>
                <span className="text-xs text-gray-500">根据标题和内容自动分析</span>
              </div>
              {pendingSuggestions.length > 0 && (
                <button
                  onClick={applyAllTags}
                  className="text-xs px-2.5 py-1 bg-amber-600/40 text-amber-300 rounded hover:bg-amber-600/60 transition-colors"
                >
                  一键应用全部
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.map(s => {
                const applied = currentTags.includes(s.tag);
                return (
                  <button
                    key={s.tag}
                    onClick={() => applied ? removeTag(s.tag) : applyTag(s.tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      applied
                        ? 'bg-emerald-700/40 text-emerald-300 border border-emerald-600/50'
                        : 'bg-gray-600/50 text-gray-300 border border-gray-500/30 hover:border-amber-500/50 hover:text-amber-300'
                    }`}
                  >
                    {getScoreStars(s.score)} {s.tag}
                    {applied ? ' ✓' : ' +'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">内容 (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            placeholder={"# 标题\n\n## 正文...\n\n> 引用\n\n- 列表项"}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm resize-none placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  );
}
