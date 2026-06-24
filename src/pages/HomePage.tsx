import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// 文章数据类型
interface Post {
  id: number;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
}

// 初始文章数据
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    title: "初入股市：我的第一笔交易反思",
    date: "2026-01-15",
    tags: ["复盘总结", "心态修炼"],
    excerpt: "回顾人生中第一次买卖股票的经历，那份激动与紧张至今难忘...",
    content: "# 初入股市：我的第一笔交易反思\n\n## 背景\n\n2025年夏天，我终于打开了证券账户，用积攒已久的2万元开启了投资之旅。\n\n## 第一次交易\n\n我选了一只看似稳健的蓝筹股，价格30元左右。下单那一刻，心跳加速，手心冒汗。"
  },
  {
    id: 2,
    title: "技术指标的实战应用：MACD与KDJ结合",
    date: "2026-02-03",
    tags: ["技术分析"],
    excerpt: "MACD和KDJ是常用的技术指标，如何将它们结合使用提高交易胜率？...",
    content: "# 技术指标的实战应用：MACD与KDJ结合\n\n## 技术指标概述\n\n### MACD（平滑异同移动平均线）\n- 长期趋势跟踪指标\n- 金叉买入，死叉卖出\n- 适合中长线操作"
  },
  {
    id: 3,
    title: "仓位管理：永不押注全部筹码",
    date: "2026-03-12",
    tags: ["资金管理", "心态修炼"],
    excerpt: "仓位管理是投资成功的关键，如何合理分配资金，控制风险？...",
    content: "# 仓位管理：永不押注全部筹码\n\n## 仓位管理的重要性\n\n> \"会买的是徒弟，会卖的是师傅，会空仓的是祖师爷。\""
  },
  {
    id: 4,
    title: "基本面分析：如何阅读财报",
    date: "2026-04-20",
    tags: ["基本面分析"],
    excerpt: "财报是了解公司的窗口，如何从三大报表中提取关键信息？...",
    content: "# 基本面分析：如何阅读财报\n\n## 三大财务报表\n\n### 资产负债表\n- **资产** = 负债 + 所有者权益\n- 关注重点：流动资产、商誉、负债率"
  },
  {
    id: 5,
    title: "投资心态修炼：克服贪婪与恐惧",
    date: "2026-05-18",
    tags: ["心态修炼", "复盘总结"],
    excerpt: "投资中最大的敌人是自己。如何建立稳定的心态，避免情绪化交易？...",
    content: "# 投资心态修炼：克服贪婪与恐惧\n\n## 情绪是投资的大敌\n\n> \"在别人贪婪时恐惧，在别人恐惧时贪婪。\" — 巴菲特"
  },
  {
    id: 6,
    title: "年度复盘：从2025年学到的经验",
    date: "2026-06-10",
    tags: ["复盘总结", "资金管理"],
    excerpt: "回顾过去一年的投资历程，得失参半，收获颇丰。分享一些关键教训...",
    content: "# 年度复盘：从2025年学到的经验\n\n## 年度收益概览\n\n| 指标 | 数值 |\n|------|------|\n| 年初资金 | 10万元 |\n| 年末资金 | 12万元 |\n| 年化收益率 | 20% |"
  },
  {
    id: 7,
    title: "如何设置止损单：交易者的生存法则",
    date: "2026-06-25",
    tags: ["技术分析", "资金管理"],
    excerpt: "止损是交易者的生命线。本文详细介绍止损单的设置技巧、止损比例计算方法以及实战中的心理建设...",
    content: "# 如何设置止损单：交易者的生存法则\n\n## 为什么需要止损\n\n> \"会买的是徒弟，会卖的是师傅\"\n\n止损是控制风险最核心的手段。很多散户亏损的根本原因，就是不敢止损，越套越深。"
  }
];

const SITE_INFO = {
  title: "解千牛",
  subtitle: "记录投资成长路上的思考与感悟",
  author: "投资者",
  description: "一个记录炒股经验、投资心得和市场分析的个人博客",
  tags: ["技术分析", "基本面分析", "心态修炼", "资金管理", "复盘总结"]
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 从 localStorage 加载文章
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stock_blog_posts');
      if (stored) {
        const loaded = JSON.parse(stored);
        if (Array.isArray(loaded) && loaded.length > 0) {
          setPosts(loaded);
        }
      }
    } catch (e) {
      console.error('加载文章失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // 搜索 + 标签筛选
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 关键词搜索：匹配标题和内容
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
      );
    }

    // 标签筛选
    if (selectedTag) {
      result = result.filter(post => post.tags && post.tags.includes(selectedTag));
    }

    return result;
  }, [searchQuery, selectedTag, posts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section 
        className="rounded-2xl p-8 md:p-12 text-white"
        style={{ background: 'linear-gradient(to right, #1a365d, #2c5282)' }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{SITE_INFO.title}</h1>
        <p className="text-xl text-gray-200 mb-6">{SITE_INFO.subtitle}</p>
        <div className="flex flex-wrap gap-2">
          {SITE_INFO.tags.map((tag: string) => (
            <span
              key={tag}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索文章标题、内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results Summary */}
      {(searchQuery || selectedTag) && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-600">筛选结果：</span>
            {searchQuery && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                关键词: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-600">×</button>
              </span>
            )}
            {selectedTag && (
              <span className="text-white px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#c53030' }}>
                {selectedTag}
                <button onClick={() => setSelectedTag(null)} className="ml-1 hover:opacity-70">×</button>
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">
            共找到 {filteredPosts.length} 篇文章
          </span>
        </div>
      )}

      {/* Posts Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#1a365d' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          最新文章
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#f3f4f6'
              }}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {post.date}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3 hover:underline">
                  <Link to={`/post/${post.id}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags?.map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        tag === selectedTag
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={tag === selectedTag ? { backgroundColor: '#c53030' } : {}}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                
                <Link
                  to={`/post/${post.id}`}
                  className="inline-flex items-center hover:underline font-medium text-sm"
                  style={{ color: '#1a365d' }}
                >
                  阅读全文
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无相关文章</p>
            <button
              onClick={() => setSelectedTag(null)}
              className="mt-4 hover:underline font-medium"
              style={{ color: '#1a365d' }}
            >
              清除筛选
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
