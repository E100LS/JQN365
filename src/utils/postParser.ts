/**
 * 文章解析工具 - 解析 Markdown 文件（含 front-matter）
 */

export interface PostMetaData {
  id: number;
  title: string;
  date: string;
  tags: string[];
  excerpt?: string;
}

export interface Post extends PostMetaData {
  content: string;
}

export function parsePost(markdown: string): Post {
  // 解析 front-matter
  const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontMatterMatch) {
    // 如果没有 front-matter，尝试解析纯 markdown
    return {
      id: Date.now(),
      title: '未命名文章',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      content: markdown,
      excerpt: ''
    };
  }
  
  const frontMatter = frontMatterMatch[1];
  const content = frontMatterMatch[2];
  
  // 解析 front-matter 字段
  const meta: Partial<PostMetaData> = {};
  
  // title
  const titleMatch = frontMatter.match(/title:\s*(.+)$/m);
  if (titleMatch) meta.title = titleMatch[1].trim();
  
  // date
  const dateMatch = frontMatter.match(/date:\s*(.+)$/m);
  if (dateMatch) meta.date = dateMatch[1].trim();
  
  // tags
  const tagsMatch = frontMatter.match(/tags:\s*\[([^\]]*)\]/m);
  if (tagsMatch) {
    meta.tags = tagsMatch[1]
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(Boolean);
  }
  
  // excerpt
  const excerptMatch = frontMatter.match(/excerpt:\s*(.+)$/m);
  if (excerptMatch) meta.excerpt = excerptMatch[1].trim();
  
  // id
  const idMatch = frontMatter.match(/id:\s*(\d+)$/m);
  if (idMatch) meta.id = parseInt(idMatch[1], 10);
  else meta.id = Date.now();
  
  // 自动提取 excerpt（如果没提供）
  if (!meta.excerpt) {
    meta.excerpt = extractExcerpt(content);
  }
  
  return {
    ...meta,
    content,
    excerpt: meta.excerpt
  };
}

function extractExcerpt(content: string): string {
  // 移除 markdown 格式，提取前 150 个字符
  const text = content
    .replace(/[#*>>\-\|]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();
  
  return text.length > 150 ? text.substring(0, 150) + '...' : text;
}

export function sanitizeContent(content: string): string {
  // 清理内容中的潜在问题
  return content.replace(/\r\n/g, '\n').trim();
}