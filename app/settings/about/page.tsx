'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="text-gray-600 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">关于我们</h1>
        </div>
      </header>

      <div className="flex flex-col items-center py-12">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-3xl font-bold">味</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">味享</h2>
        <p className="text-gray-400 text-sm mb-1">版本 v1.0.0</p>
        <p className="text-gray-500 text-sm text-center px-8 mt-4">
          味享是一个 AI 驱动的美食内容社区，让每个人都能轻松分享美食、发现美味、享受烹饪乐趣。
        </p>
      </div>

      <div className="bg-white mx-4 rounded-xl overflow-hidden">
        <a href="mailto:contact@weixiang.com" className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="text-gray-900">联系我们</span>
          <span className="text-sm text-gray-400">contact@weixiang.com</span>
        </a>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="text-gray-900">官方微博</span>
          <span className="text-sm text-pink-500">@味享官方</span>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-gray-900">官方微信公众号</span>
          <span className="text-sm text-pink-500">味享美食社区</span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 mt-8">© 2026 味享 All Rights Reserved</p>
    </div>
  );
}
