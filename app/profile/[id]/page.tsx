'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiSettings, FiGrid, FiHeart, FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import { FaStar, FaHeart } from 'react-icons/fa';
import { authAPI, contentAPI, socialAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  bio?: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isVip: boolean;
}

interface Content {
  id: string;
  title: string;
  coverImage?: string;
  images: string;
  likeCount: number;
  createdAt: string;
}

export default function Profile() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [collections, setCollections] = useState<Content[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'collections' | 'likes'>('posts');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser, isLoggedIn } = useAppStore();
  const router = useRouter();
  const isOwn = currentUser?.id === id;

  useEffect(() => {
    loadProfile();
    if (isLoggedIn && !isOwn) {
      loadFollowingStatus();
    }
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res: any = await authAPI.getUserById(id);
      if (res.code === 'SUCCESS') {
        setUser(res.data);
        
        // 加载内容
        const contentsRes: any = await contentAPI.getUserContents(id);
        if (contentsRes.code === 'SUCCESS') {
          setContents(contentsRes.data.list || []);
        }
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowingStatus = async () => {
    try {
      const res: any = await socialAPI.getFollowing();
      if (res.code === 'SUCCESS') {
        setIsFollowing(res.data.some((u: any) => u.id === id));
      }
    } catch (error) {
      // ignore
    }
  };

  const loadCollections = async () => {
    if (!isLoggedIn || !isOwn) return;
    setTabLoading(true);
    try {
      const res: any = await socialAPI.getCollections();
      if (res.code === 'SUCCESS') {
        setCollections(res.data || []);
      }
    } catch (error) {
      // ignore
    } finally {
      setTabLoading(false);
    }
  };

  const handleTabChange = (tab: 'posts' | 'collections' | 'likes') => {
    setActiveTab(tab);
    if (tab === 'collections' && collections.length === 0) {
      loadCollections();
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    try {
      const res: any = await socialAPI.follow(id);
      setIsFollowing(res.data.following);
      setUser(prev => prev ? {
        ...prev,
        followerCount: prev.followerCount + (res.data.following ? 1 : -1)
      } : null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">用户不存在</p>
          <button onClick={() => router.push('/')} className="mt-4 text-pink-500">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-600">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-900">{user.nickname}</span>
          <div className="flex items-center gap-3">
            {isOwn ? (
              <Link href="/settings" className="text-gray-600">
                <FiSettings className="w-6 h-6" />
              </Link>
            ) : (
              <button className="text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 用户信息 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={user.avatar}
                alt={user.nickname}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>
            {user.isVip && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <FaStar className="w-3 h-3 text-white fill-current" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{user.nickname}</h1>
            </div>
            {user.bio && (
              <p className="text-sm text-gray-500 mb-2">{user.bio}</p>
            )}
            <div className="flex gap-6 text-sm">
              <div className="text-center cursor-pointer" onClick={() => toast.success('粉丝列表开发中')}>
                <div className="font-bold text-gray-900">{user.postCount}</div>
                <div className="text-gray-400">发布</div>
              </div>
              <div className="text-center cursor-pointer" onClick={() => toast.success('粉丝列表开发中')}>
                <div className="font-bold text-gray-900">{user.followerCount}</div>
                <div className="text-gray-400">粉丝</div>
              </div>
              <div className="text-center cursor-pointer" onClick={() => toast.success('关注列表开发中')}>
                <div className="font-bold text-gray-900">{user.followingCount}</div>
                <div className="text-gray-400">关注</div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-4">
          {isOwn ? (
            <Link 
              href="/settings"
              className="flex-1 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 text-center"
            >
              编辑资料
            </Link>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 py-2 rounded-full text-sm font-medium ${
                  isFollowing 
                    ? 'border border-gray-200 text-gray-700' 
                    : 'bg-pink-500 text-white'
                }`}
              >
                {isFollowing ? '已关注' : '+ 关注'}
              </button>
              <button 
                onClick={() => toast.success('私信功能开发中')}
                className="px-6 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700"
              >
                私信
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => handleTabChange('posts')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'posts' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400'
            }`}
          >
            <FiGrid className="w-4 h-4" />
            笔记
          </button>
          <button
            onClick={() => handleTabChange('collections')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'collections' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400'
            }`}
          >
            <FiBookmark className="w-4 h-4" />
            收藏
          </button>
          <button
            onClick={() => handleTabChange('likes')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'likes' 
                ? 'border-pink-500 text-pink-500' 
                : 'border-transparent text-gray-400'
            }`}
          >
            <FiHeart className="w-4 h-4" />
            赞过
          </button>
        </div>
      </div>

      {/* 内容列表 */}
      <div className="max-w-2xl mx-auto p-4">
        {activeTab === 'posts' && (
          <>
            {contents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📝</div>
                <p>还没有发布笔记</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {contents.map(item => {
                  const images = parseImages(item.images);
                  const cover = item.coverImage || images[0] || 'https://picsum.photos/300/300';
                  return (
                    <Link 
                      key={item.id} 
                      href={`/detail/${item.id}`}
                      className="relative aspect-square bg-gray-100"
                    >
                      <Image
                        src={cover}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="33vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="flex items-center gap-1 text-white text-xs">
                          <FaHeart className="w-3 h-3 fill-current" />
                          <span>{item.likeCount}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'collections' && (
          <>
            {tabLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !isOwn ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔒</div>
                <p>收藏内容仅自己可见</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔖</div>
                <p>还没有收藏内容</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {collections.map(item => {
                  const images = parseImages(item.images);
                  const cover = item.coverImage || images[0] || 'https://picsum.photos/300/300';
                  return (
                    <Link
                      key={item.id}
                      href={`/detail/${item.id}`}
                      className="relative aspect-square bg-gray-100"
                    >
                      <Image src={cover} alt={item.title} fill className="object-cover" sizes="33vw" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="flex items-center gap-1 text-white text-xs">
                          <FaHeart className="w-3 h-3 fill-current" />
                          <span>{item.likeCount}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'likes' && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">❤️</div>
            <p>赞过的内容暂未开放</p>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
