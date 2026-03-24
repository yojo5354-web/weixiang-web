'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    system: true,
    push: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = [
    {
      title: '互动通知',
      items: [
        { key: 'likes', label: '点赞通知', desc: '当有人点赞你的内容时通知' },
        { key: 'comments', label: '评论通知', desc: '当有人评论你的内容时通知' },
        { key: 'follows', label: '关注通知', desc: '当有人关注你时通知' },
        { key: 'messages', label: '私信通知', desc: '当收到私信时通知' },
      ]
    },
    {
      title: '系统通知',
      items: [
        { key: 'system', label: '系统通知', desc: '平台公告及审核结果通知' },
        { key: 'push', label: '推送通知', desc: '允许 App 发送推送消息' },
      ]
    }
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
          <h1 className="text-lg font-semibold">通知设置</h1>
        </div>
      </header>

      {groups.map(group => (
        <div key={group.title} className="mt-4">
          <div className="px-4 py-2 text-xs text-gray-400">{group.title}</div>
          <div className="bg-white">
            {group.items.map((item, index) => (
              <div key={item.key} className={`flex items-center justify-between px-4 py-4 ${index < group.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
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
      ))}
    </div>
  );
}
