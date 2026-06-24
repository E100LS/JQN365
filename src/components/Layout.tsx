import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <img 
                src="/logo.jpg" 
                alt="解千牛" 
                className="h-10 w-auto"
              />
              <span className="text-white text-2xl font-bold">解千牛</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-white border-b-2 border-accent-light' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                首页
              </Link>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/about' 
                    ? 'text-white border-b-2 border-accent-light' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                关于
              </Link>
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-amber-400 border-b-2 border-amber-400' 
                    : 'text-amber-300/70 hover:text-amber-300'
                }`}
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.896.103 1.754.103 2.652 0 1.543-.94 3.31.826 2.37 2.37.103.896.103 1.754 0 2.652" />
                </svg>
                后台
              </Link>
            </nav>
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">解千牛</h3>
              <p className="text-sm text-gray-400">
                记录投资成长路上的思考与感悟，分享实战经验与教训。
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">标签分类</h3>
              <div className="flex flex-wrap gap-2">
                {['技术分析', '基本面分析', '心态修炼', '资金管理', '复盘总结'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${tag}`}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">联系方式</h3>
              <p className="text-sm text-gray-400">
                投资有风险，入市需谨慎<br />
                本文仅供参考，不构成投资建议
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            © 2026 解千牛. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
