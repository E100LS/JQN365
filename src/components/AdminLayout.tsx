import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jqn365_token');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <span className="text-amber-500 text-lg font-bold">⚙️ 后台管理</span>
              <Link 
                to="/" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                返回前台 →
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
