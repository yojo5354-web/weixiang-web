'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { contentAPI, socialAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import BottomNav from '@/components/BottomNav';

interface Content {
  id: string;
  title: string;
  content: string;
  images: string;
  coverImage?: string;
  user: { id: string; nickname: string; avatar: string };
  likeCount: number;
  commentCount: number;
  collectCount: number;
  viewCount: number;
  createdAt: string;
}

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user, isLoggedIn } = useAppStore();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async (p = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const res: any = await contentAPI.getFeed(p);
      const newContents = res.data.list || [];
      
      if (p === 1) {
        setContents(newContents);
      } else {
        setContents(prev => [...prev, ...newContents]);
      }
      
      setHasMore(res.data.hasMore);
      setPage(p);
    } catch (error: any) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, contentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    
    try {
      const res: any = await socialAPI.like(contentId);
      setLikedIds(prev => {
        const newSet = new Set(prev);
        if (res.data.liked) {
          newSet.add(contentId);
        } else {
          newSet.delete(contentId);
        }
        return newSet;
      });
      
      setContents(prev => prev.map(c => {
        if (c.id === contentId) {
          return {
            ...c,
            likeCount: c.likeCount + (res.data.liked ? 1 : -1)
          };
        }
        return c;
      }));
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleCollect = async (e: React.MouseEvent, contentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    
    try {
      const res: any = await socialAPI.collect(contentId);
      setCollectedIds(prev => {
        const newSet = new Set(prev);
        if (res.data.collected) {
          newSet.add(contentId);
        } else {
          newSet.delete(contentId);
        }
        return newSet;
      });
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const parseImages = (images: string) => {
    try {
      return JSON.parse(images) || [];
    } catch {
      return [];
    }
  };

  const formatCount = (num: number) => {
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatTime = (dateStr: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-500">味享</h1>
          <div className="flex items-center gap-4">
            <Link href="/discover" className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            {isLoggedIn ? (
              <Link href="/messages" className="text-gray-600 relative">
                <FiMessageCircle className="w-6 h-6" />
              </Link>
            ) : (
              <Link href="/login" className="text-primary-500 text-sm font-medium">
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 内容列表 */}
      <main className="max-w-2xl mx-auto">
        {contents.map((item, index) => (
          <article 
            key={item.id} 
            className="bg-white mb-2 animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* 用户信息 */}
            <div className="flex items-center justify-between p-4">
              <Link href={`/profile/${item.user.id}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={item.user.avatar}
                    alt={item.user.nickname}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.user.nickname}</div>
                  <div className="text-xs text-gray-400">{formatTime(item.createdAt)}</div>
                </div>
              </Link>
            </div>

            {/* 标题 */}
            <Link href={`/detail/${item.id}`}>
              <div className="px-4 pb-2">
                <h2 className="text-base font-semibold text-gray-900 line-clamp-2">{item.title}</h2>
              </div>

              {/* 图片 */}
              {parseImages(item.images).length > 0 && (
                <div className="px-4 pb-3">
                  <div className={`grid gap-1 ${
                    parseImages(item.images).length === 1 ? 'grid-cols-1' :
                    parseImages(item.images).length === 2 ? 'grid-cols-2' :
                    'grid-cols-3'
                  }`}>
                    {parseImages(item.images).slice(0, 9).map((img: string, i: number) => (
                      <div 
                        key={i} 
                        className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover"
                        />
                        {parseImages(item.images).length > 9 && i === 8 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                            +{parseImages(item.images).length - 9}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Link>

            {/* 互动按钮 */}
            <div className="flex items-center gap-6 px-4 pb-4">
              <button 
                onClick={(e) => handleLike(e, item.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  likedIds.has(item.id) ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {likedIds.has(item.id) ? (
                  <FaHeart className="w-5 h-5 fill-current" />
                ) : (
                  <FaRegHeart className="w-5 h-5" />
                )}
                <span>{formatCount(item.likeCount)}</span>
              </button>
              
              <Link 
                href={`/detail/${item.id}#comments`}
                className="flex items-center gap-1.5 text-sm text-gray-500"
              >
                <FaRegComment className="w-5 h-5" />
                <span>{formatCount(item.commentCount)}</span>
              </Link>
              
              <button 
                onClick={(e) => handleCollect(e, item.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  collectedIds.has(item.id) ? 'text-primary-500' : 'text-gray-500'
                }`}
              >
                <FaRegBookmark className={`w-5 h-5 ${collectedIds.has(item.id) ? 'fill-current' : ''}`} />
                <span>{formatCount(item.collectCount)}</span>
              </button>
              
              <button className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </article>
        ))}

        {/* 加载更多 */}
        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={() => loadFeed(page + 1)}
              disabled={loading}
              className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          </div>
        )}

        {!hasMore && contents.length > 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            - 已加载全部 -
          </div>
        )}

        {contents.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-4">🍽️</div>
            <p>还没有内容，快来发布第一条吧！</p>
          </div>
        )}
      </main>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
