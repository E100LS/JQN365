import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPost, isAuthenticated, getTags, loadPosts, deletePost } from '../utils/postStorage';
import { readMultipleFiles } from '../utils/fileUtils';
import { suggestTags, analyzeTags } from '../utils/autoTag';

export default function AdminNewPost() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsStr, setTagsStr] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // 智能分析推荐标签
  const tagSuggestions = useMemo(() => {
    if (!title.trim() && !content.trim()) return [];
    return analyzeTags(title, content);
  }, [title, content]);

  const currentTags = useMemo(() => {
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  }, [tagsStr]);

  // 未被使用的推荐标签
  const pendingSuggestions = useMemo(() => {
    return tagSuggestions.filter(s => !currentTags.includes(s.tag));
  }, [tagSuggestions, currentTags]);

  // 应用某个推荐标签
  const applyTag = (tag: string) => {
    const existing = currentTags;
    if (!existing.includes(tag)) {
      existing.push(tag);
      setTagsStr(existing.join(', '));
    }
  };

  // 一键应用所有推荐标签
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

  // 移除某个标签
  const removeTag = (tag: string) => {
    const filtered = currentTags.filter(t => t !== tag);
    setTagsStr(filtered.join(', '));
  };

  const handleImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const fileContents = await readMultipleFiles(files);
      const file = fileContents[0];

      setContent(file.content);

      // 解析 front-matter：标题
      const titleMatch = file.content.match(/^\s*---\s*\n.*?title:\s*(.+?)\s*\n/m);
      let parsedTitle = '';
      if (titleMatch) {
        parsedTitle = titleMatch[1].trim();
        setTitle(parsedTitle);
      } else {
        parsedTitle = file.name.replace(/\.[^.]+$/, '');
        setTitle(parsedTitle);
      }

      // 解析 front-matter：标签
      const tagMatch = file.content.match(/tags:\s*\[([^\]]*)\]/);
      if (tagMatch) {
        const parsedTags = tagMatch[1]
          .split(',')
          .map((t: string) => t.trim().replace(/['"]/g, ''))
          .filter(Boolean);
        setTagsStr(parsedTags.join(', '));
      }

      // 解析 front-matter：日期
      const dateMatch = file.content.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        setDate(dateMatch[1]);
      }
    } catch (e: any) {
      setError('导入文件失败: ' + e.message);
    } finally {
      setImporting(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入文章标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入文章内容');
      return;
    }

    const tags = currentTags;

    const excerpt = content
      .replace(/[#*>\-\|]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{2,}/g, '\n')
      .trim()
      .substring(0, 150) + '...';

    await addPost({
      title: title.trim(),
      date,
      tags,
      excerpt,
      content
    });

    navigate('/admin');
  };

  // 根据匹配度返回星级显示
  const getScoreStars = (score: number) => {
    if (score >= 10) return '⭐⭐⭐';
    if (score >= 5) return '⭐⭐';
    if (score >= 2) return '⭐';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">新建文章</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-400 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors font-medium"
          >
            发布文章
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 快速导入区域 */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">快速导入 Markdown 文件</h2>
          {importing && (
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              导入中...
            </div>
          )}
        </div>
        <div
          className="border-2 border-dashed border-gray-600 rounded-lg p-5 text-center hover:border-amber-500 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-400 text-sm">点击选择或拖拽 Markdown 文件</p>
          <p className="text-gray-500 text-xs mt-1">自动解析标题、日期、标签和正文</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            onChange={(e) => handleImport(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* 编辑表单 */}
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

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">标签（逗号分隔）</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="技术分析, 心态修炼"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
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
