import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import AdminPostList from './pages/AdminPostList';
import AdminNewPost from './pages/AdminNewPost';
import AdminEditPost from './pages/AdminEditPost';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tag/:name" element={<TagPage />} />
          {/* 后台管理路由 */}
          <Route path="/admin" element={<AdminPostList />} />
          <Route path="/admin/new" element={<AdminNewPost />} />
          <Route path="/admin/edit/:id" element={<AdminEditPost />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">关于本站</h1>
      
      <div className="bg-white rounded-xl p-8 shadow-sm border mb-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">关于作者</h2>
        <p className="text-gray-600 mb-4">
          你好！我是一名普通的投资者，在这里分享我多年的炒股经验和心得。
        </p>
        <p className="text-gray-600">
          投资是一场修行，既是对市场的认知，也是对自我的修炼。
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-900 p-6 rounded-r">
        <p className="text-blue-900 font-medium">
          ⚠️ 免责声明：本文所有内容仅供参考，不构成任何投资建议。
        </p>
      </div>
    </div>
  );
}

function TagPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-6">标签</h1>
      <p className="text-gray-600">选择标签筛选相关文章</p>
    </div>
  );
}

export default App;