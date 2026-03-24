'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiSend, FiMoreHorizontal } from 'react-icons/fi';
import { socialAPI, authAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: number;
  isRead: boolean;
  createdAt: string;
}

interface OtherUser {
  id: string;
  nickname: string;
  avatar: string;
}

export default function ChatPage() {
  const params = useParams();
  const otherId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user: currentUser, isLoggedIn } = useAppStore();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    loadData();
  }, [otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, msgRes]: any[] = await Promise.all([
        authAPI.getUserById(otherId),
        socialAPI.getChatMessages(otherId),
      ]);
      if (userRes.code === 'SUCCESS') setOtherUser(userRes.data);
      if (msgRes.code === 'SUCCESS') setMessages(msgRes.data || []);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    const text = inputText.trim();
    setInputText('');
    try {
      const res: any = await socialAPI.sendMessage(otherId, text);
      if (res.code === 'SUCCESS') {
        setMessages(prev => [...prev, res.data]);
      }
    } catch (error) {
      toast.error('发送失败');
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-600">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-900">{otherUser?.nickname || '私信'}</span>
          </div>
          <button className="text-gray-400">
            <FiMoreHorizontal className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 消息列表 */}
      <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-24">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <p>还没有消息，快发第一条吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine && otherUser && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={otherUser.avatar} alt={otherUser.nickname} width={32} height={32} className="object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-pink-500 text-white rounded-br-md'
                      : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                  }`}>
                    <p>{msg.content}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(msg.createdAt)}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* 输入框 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="发送消息..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-pink-500 text-white rounded-full disabled:opacity-50 transition-opacity"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
