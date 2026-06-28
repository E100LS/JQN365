-- D1 Migration: Initial schema for JQN365 blog

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  tags TEXT DEFAULT '[]',
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed default user (JQN365 / bl0596cn)
INSERT OR IGNORE INTO users (id, username, password) VALUES ('admin_1', 'JQN365', 'bl0596cn');

-- Seed default sample posts
INSERT OR IGNORE INTO posts (id, title, date, tags, excerpt, content, created_at, updated_at) VALUES
('sample_1', '买股前必须思考的五个问题', '2026-06-20', '["心态修炼","投资基础"]',
 '买股前必须思考的五个问题：这笔钱急不急用？能忍受多大的亏损？买股票的逻辑是什么？',
 '# 买股前必须思考的五个问题

## 一、这笔钱急不急用？

**切记：投资只能用闲钱！**

如果你下个月要还房贷、交房租、孩子的学费，这些钱绝对不能用来炒股。

## 二、能忍受多大的亏损？

买股票前，一定要想清楚一个问题：**如果这笔钱全亏光了，我会怎么样？**

## 三、买这个股票的逻辑是什么？

当你决定买入某只股票时，请先回答：**我为什么买它？**

## 四、我的操作策略是什么？

很多人买股票前根本没有计划，买了之后也不知道怎么办。

## 五、我愿意投入多少时间研究？

投资需要学习和研究，不是无脑买入就能赚钱的。

---

**—— 解千牛**',
 '2026-06-20T10:00:00Z', '2026-06-20T10:00:00Z');

INSERT OR IGNORE INTO posts (id, title, date, tags, excerpt, content, created_at, updated_at) VALUES
('sample_2', '技术分析的三个核心指标', '2026-06-18', '["技术分析"]',
 '技术分析的三个核心指标：均线、MACD、成交量。学会这些，你的技术分析水平会提升一个层次。',
 '# 技术分析的三个核心指标

## 一、均线（MA）

均线是最基础也是最重要的技术指标。

### 5 日均线（MA5）
- 反映短期走势

### 20 日均线（MA20）
- 反映中期趋势

## 二、MACD

MACD 被称为"指标之王"。

## 三、成交量

"量在价先"，成交量是价格变化的先行指标。

---

**—— 解千牛**',
 '2026-06-18T15:30:00Z', '2026-06-18T15:30:00Z');

INSERT OR IGNORE INTO posts (id, title, date, tags, excerpt, content, created_at, updated_at) VALUES
('sample_3', '复盘的意义和方法', '2026-06-15', '["心态修炼","复盘总结"]',
 '复盘是投资者的必修课。每天花 30 分钟复盘，一年后投资水平会有质的飞跃。',
 '# 复盘的意义和方法

## 为什么要复盘？

复盘，是指每天收盘后回顾当天的操作和市场的表现。

### 复盘的好处
1. 发现自己操作中的问题
2. 学习市场的规律
3. 提升投资判断能力
4. 减少情绪化交易

## 如何复盘？

### 第一步：回顾当天操作
### 第二步：分析市场表现
### 第三步：写下来
### 第四步：定期总结

---

**—— 解千牛**',
 '2026-06-15T09:00:00Z', '2026-06-15T09:00:00Z');
