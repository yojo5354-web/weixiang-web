'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { socialAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  user: { id: string; nickname: string; avatar: string };
  lastMessage?: { content: string; createdAt: string };
  unreadCount: number;
}

export default function Messages() {
  const [activeTab, setActiveTab] = useState<'chat' | 'notify'>('chat');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user } = useAppStore();

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
    setLoading(false);
  }, [isLoggedIn]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载通知
      const notifRes: any = await socialAPI.getNotifications();
      if (notifRes.code === 'SUCCESS') {
        setNotifications(notifRes.data || []);
      }
      
      // 加载聊天列表
      const chatRes: any = await socialAPI.getMessages();
      if (chatRes.code === 'SUCCESS') {
        setConversations(chatRes.data || []);
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await socialAPI.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('已全部标为已读');
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: number) => {
    switch (type) {
      case 1: return '❤️';
      case 2: return '💬';
      case 3: return '➕';
      default: return '🔔';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pb-20">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-gray-500 mb-4">登录后查看消息</p>
        <Link href="/login" className="px-6 py-2 bg-pink-500 text-white rounded-full">
          去登录
        </Link>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-gray-400">
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-semibold text-gray-900">消息</h1>
          <button className="text-gray-400">
            <FiSearch className="w-6 h-6" />
          </button>
        </div>

        {/* Tab */}
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'chat' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400'
            }`}
          >
            私信
          </button>
          <button
            onClick={() => setActiveTab('notify')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'notify' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400'
            }`}
          >
            通知
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* 私信列表 */}
        {activeTab === 'chat' && (
          <>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">💌</div>
                <p>暂无私信消息</p>
              </div>
            ) : (
              <div className="bg-white">
                {conversations.map((conv, index) => (
                  <Link
                    key={conv.user.id}
                    href={`/chat/${conv.user.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={conv.user.avatar}
                          alt={conv.user.nickname}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{conv.user.nickname}</span>
                        <span className="text-xs text-gray-400">
                          {formatTime(conv.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage?.content || '暂无消息'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* 通知列表 */}
        {activeTab === 'notify' && (
          <>
            {notifications.length > 0 && (
              <div className="p-4 bg-white mb-2">
                <button
                  onClick={markAllRead}
                  className="text-sm text-pink-500"
                >
                  全部标为已读
                </button>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔔</div>
                <p>暂无通知</p>
              </div>
            ) : (
              <div className="bg-white">
                {notifications.map((notif, index) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 ${
                      !notif.isRead ? 'bg-blue-50/50' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{notif.title}</span>
                        <span className="text-xs text-gray-400">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.content}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
