/**
 * 自动标签工具 - 根据文章内容（标题+正文）自动匹配推荐标签
 */

// 关键词-标签映射表
// 评分权重：标题匹配权重更高
const KEYWORD_TAGS: Record<string, { keywords: string[]; weight?: number }> = {
  '技术分析': {
    keywords: [
      '均线', 'MACD', 'KDJ', 'RSI', '成交量', '技术指标', 'K线', 'K线图',
      '支撑位', '压力位', '突破', '回调', '趋势线', '形态', '金叉', '死叉',
      '背离', '缠论', '波浪理论', '布林带', '筹码', '换手率', '量能',
      '分时图', '盘口', '挂单', '量价', '技术面', '短线', '中线', '长线',
      '买入点', '卖出点', '止损位', '止盈位', '趋势', '震荡', '反弹',
      '回踩', '箱体', '突破', '假突破', '缩量', '放量'
    ]
  },
  '基本面分析': {
    keywords: [
      'PE', 'PB', 'ROE', '市盈率', '市净率', '净资产收益率', '净利润',
      '营收', '毛利率', '净利率', '财报', '财务报表', '资产负债表',
      '利润表', '现金流量表', '估值', '护城河', '行业分析', '赛道',
      '龙头', '股息', '分红', '增长', '成长性', '负债率', '现金流',
      'ROA', 'EPS', '每股收益', '基本面', '价值投资', '白马股', '蓝筹',
      '业绩', '年报', '季报', '预增', '预亏'
    ]
  },
  '心态修炼': {
    keywords: [
      '心态', '贪婪', '恐惧', '耐心', '纪律', '情绪', '修行', '修炼',
      '心理', '认知', '知行合一', '欲望', '平常心', '后悔', '焦虑',
      '冲动', '理性', '自控', '人性', '弱点', '克服', '冷静', '坚持',
      '放弃', '放下', '心魔', '浮躁', '犹豫', '自信', '谦逊', '敬畏'
    ]
  },
  '资金管理': {
    keywords: [
      '仓位', '仓位管理', '资金管理', '风险控制', '分散', '配置',
      '杠杆', '本金', '闲钱', '回撤', '风控', '头寸', '满仓', '半仓',
      '空仓', '加仓', '减仓', '建仓', '轻仓', '重仓', '资金分配',
      '风险管理', '仓位控制', '分批', '底仓', '机动仓位'
    ]
  },
  '复盘总结': {
    keywords: [
      '复盘', '总结', '反思', '回顾', '教训', '经验', '笔记', '日记',
      '记录', '周记', '月记', '感悟', '学习', '进步', '成长', '检讨',
      '失误', '错误', '改进', '计划', '执行', '检查', '纠正', '复盘总结'
    ]
  },
  '投资基础': {
    keywords: [
      '开户', '选股', '入门', '基础', '常识', '规则', '交易', '手续费',
      '印花税', 'A股', '港股', '美股', 'ETF', '指数', '基金', '定投',
      '打新', '申购', '中签', 'T+1', '涨跌停', '集合竞价', '连续竞价',
      '股票', '证券', '账户', '券商', '银证转账'
    ]
  },
};

// 在标题中匹配时的额外加分权重
const TITLE_WEIGHT_MULTIPLIER = 2;

/**
 * 分析文本内容，返回推荐标签及匹配度评分
 */
export function analyzeTags(title: string, content: string): { tag: string; score: number }[] {
  const textToAnalyze = `${title} ${title} ${content}`; // 标题重复一次以提高权重
  const lowerText = textToAnalyze.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [tag, config] of Object.entries(KEYWORD_TAGS)) {
    let score = 0;

    for (const keyword of config.keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      // 在标题中匹配加分
      const titleMatches = (title.toLowerCase().match(new RegExp(lowerKeyword, 'g')) || []).length;
      score += titleMatches * TITLE_WEIGHT_MULTIPLIER;
      
      // 在全文内容中匹配
      const contentMatches = (lowerText.match(new RegExp(lowerKeyword, 'g')) || []).length;
      score += contentMatches;
    }

    if (score > 0) {
      scores[tag] = score;
    }
  }

  // 按评分从高到低排序
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, score]) => ({ tag, score }));
}

/**
 * 根据文章内容自动推荐标签（取评分最高的标签）
 */
export function suggestTags(title: string, content: string, maxTags: number = 3): string[] {
  if (!title && !content) return [];
  
  const results = analyzeTags(title, content);
  return results.slice(0, maxTags).map(r => r.tag);
}

export default KEYWORD_TAGS;
