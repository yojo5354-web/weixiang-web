'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';
import { FaFire, FaClock } from 'react-icons/fa';
import { contentAPI } from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import toast from 'react-hot-toast';

interface Topic {
  id: string;
  name: string;
  description?: string;
  postCount: number;
  isHot: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  coverImage?: string;
  images: string;
  user: { id: string; nickname: string; avatar: string };
  likeCount: number;
  commentCount: number;
}

export default function Discover() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [searchType, setSearchType] = useState<'content' | 'user'>('content');
  const [activeTab, setActiveTab] = useState<'hot' | 'new'>('hot');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hotContents, setHotContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // 热门搜索词
  const hotSearches = ['家常菜', '快手早餐', '减脂餐', '甜品', '下饭菜', '懒人食谱', '一人食', '宝宝辅食', '素菜', '硬菜'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [topicsRes, feedRes]: any[] = await Promise.all([
        contentAPI.getTopics(),
        contentAPI.getFeed(1, 20)
      ]);
      if (topicsRes.code === 'SUCCESS') setTopics(topicsRes.data || []);
      if (feedRes.code === 'SUCCESS') setHotContents(feedRes.data.list || []);
    } catch {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword?: string) => {
    const q = (keyword ?? searchText).trim();
    if (!q) return;
    setSearchText(q);
    setIsSearching(true);
    setSearchLoading(true);
    try {
      const res: any = await contentAPI.search(q, searchType);
      if (res.code === 'SUCCESS') {
        setSearchResults(res.data.list || []);
      }
    } catch {
      toast.error('搜索失败');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const parseImages = (images: string) => {
    try { return JSON.parse(images) || []; } catch { return []; }
  };

  const formatCount = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部搜索栏 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-gray-400 flex-shrink-0">
            <FiArrowLeft className="w-6 h-6" />
          </Link>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2"
          >
            <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索美食、博主、话题..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
              autoFocus={false}
            />
            {searchText && (
              <button type="button" onClick={handleClearSearch}>
                <FiX className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </form>
          {searchText && (
            <button
              onClick={() => handleSearch()}
              className="text-pink-500 text-sm font-medium flex-shrink-0"
            >
              搜索
            </button>
          )}
        </div>

        {/* 搜索类型切换（搜索状态才显示） */}
        {isSearching && (
          <div className="flex border-b border-gray-100 max-w-2xl mx-auto">
            {(['content', 'user'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setSearchType(t); handleSearch(); }}
                className={`flex-1 py-2.5 text-sm font-medium border-b-2 ${
                  searchType === t ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-400'
                }`}
              >
                {t === 'content' ? '内容' : '用户'}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto">
        {/* 搜索结果 */}
        {isSearching ? (
          <div>
            {searchLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🔍</div>
                <p>没有找到相关内容</p>
                <p className="text-sm mt-1">换个关键词试试</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                {searchResults.map((item, index) => {
                  const images = parseImages(item.images);
                  const cover = item.coverImage || images[0];
                  return (
                    <Link
                      key={item.id}
                      href={`/detail/${item.id}`}
                      className="bg-white rounded-lg overflow-hidden"
                    >
                      {cover && (
                        <div className="relative aspect-[4/5] bg-gray-100">
                          <Image src={cover} alt={item.title} fill className="object-cover" sizes="50vw" />
                        </div>
                      )}
                      <div className="p-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100">
                            <Image src={item.user.avatar} alt="" width={20} height={20} className="object-cover" />
                          </div>
                          <span className="text-xs text-gray-400 truncate">{item.user.nickname}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 热门搜索词 */}
            <section className="p-4 bg-white mb-2">
              <div className="flex items-center gap-2 mb-3">
                <FaFire className="w-4 h-4 text-pink-500" />
                <h2 className="font-semibold text-gray-900">热门搜索</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotSearches.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(item)}
                    className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            {/* 热门话题 */}
            {topics.length > 0 && (
              <section className="p-4 bg-white mb-2">
                <h2 className="font-semibold text-gray-900 mb-3">热门话题</h2>
                <div className="space-y-3">
                  {topics.slice(0, 5).map(topic => (
                    <div key={topic.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                          <span className="text-pink-600 font-bold text-lg">#</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{topic.name}</div>
                          <div className="text-xs text-gray-400">{formatCount(topic.postCount)} 浏览</div>
                        </div>
                      </div>
                      {topic.isHot && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full">热</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tab 切换 */}
            <div className="sticky top-14 z-40 bg-white border-b border-gray-100">
              <div className="max-w-2xl mx-auto flex">
                {[
                  { key: 'hot', label: '热门', icon: <FaFire className="w-3.5 h-3.5" /> },
                  { key: 'new', label: '最新', icon: <FaClock className="w-3.5 h-3.5" /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 ${
                      activeTab === tab.key ? 'border-pink-500 text-pink-500' : 'border-transparent text-gray-400'
                    }`}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容瀑布流 */}
            <div className="p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {hotContents.map((item, index) => {
                    const images = parseImages(item.images);
                    const cover = item.coverImage || images[0];
                    return (
                      <Link
                        key={item.id}
                        href={`/detail/${item.id}`}
                        className="bg-white rounded-lg overflow-hidden animate-fadeIn"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {cover && (
                          <div className="relative aspect-[4/5] bg-gray-100">
                            <Image
                              src={cover}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="50vw"
                            />
                          </div>
                        )}
                        <div className="p-2">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{item.title}</h3>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100">
                              <Image src={item.user.avatar} alt="" width={20} height={20} className="object-cover" />
                            </div>
                            <span className="text-xs text-gray-400 truncate">{item.user.nickname}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
