'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacySettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    privateAccount: false,
    showFollowers: true,
    showLikes: true,
    allowComment: true,
    allowMessage: true,
    allowSearch: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: 'privateAccount', label: '私密账号', desc: '开启后仅关注者可见你的内容' },
    { key: 'showFollowers', label: '展示粉丝', desc: '是否在主页显示粉丝数量' },
    { key: 'showLikes', label: '展示获赞', desc: '是否在主页显示获赞数量' },
    { key: 'allowComment', label: '允许评论', desc: '是否允许他人评论你的内容' },
    { key: 'allowMessage', label: '允许私信', desc: '是否允许陌生人发送私信' },
    { key: 'allowSearch', label: '允许被搜索', desc: '是否可以通过昵称被搜索到' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="text-gray-600 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">隐私设置</h1>
        </div>
      </header>

      <div className="bg-white mt-2">
        {items.map((item, index) => (
          <div key={item.key} className={`flex items-center justify-between px-4 py-4 ${index < items.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div>
              <div className="text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
            </div>
            <button
              onClick={() => toggle(item.key as keyof typeof settings)}
              className={`relative w-12 h-6 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-pink-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
