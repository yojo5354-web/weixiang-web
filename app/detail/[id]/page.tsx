'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiMoreHorizontal, FiSend } from 'react-icons/fi';
import { FaHeart, FaRegHeart, FaRegComment, FaRegBookmark, FaShareAlt } from 'react-icons/fa';
import { contentAPI, socialAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  user: { id: string; nickname: string; avatar: string };
  likeCount: number;
  createdAt: string;
}

interface ContentDetail {
  id: string;
  title: string;
  content: string;
  images: string;
  user: { id: string; nickname: string; avatar: string };
  likeCount: number;
  commentCount: number;
  collectCount: number;
  viewCount: number;
  createdAt: string;
  comments: Comment[];
}

export default function ContentDetail() {
  const params = useParams();
  const id = params.id as string;
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user, isLoggedIn } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res: any = await contentAPI.getDetail(id);
      if (res.code === 'SUCCESS') {
        setContent(res.data);
        setComments(res.data.comments || []);
        setLiked(false);
        setCollected(false);
        setIsFollowing(false);
        // 如果已登录，加载关注状态
        if (isLoggedIn) {
          loadFollowStatus(res.data.user?.id);
        }
      }
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowStatus = async (authorId: string) => {
    if (!authorId || authorId === user?.id) return;
    try {
      const res: any = await socialAPI.getFollowing();
      if (res.code === 'SUCCESS') {
        setIsFollowing(res.data.some((u: any) => u.id === authorId));
      }
    } catch {
      // ignore
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    
    try {
      const res: any = await socialAPI.like(id);
      setLiked(res.data.liked);
      setContent(prev => prev ? {
        ...prev,
        likeCount: prev.likeCount + (res.data.liked ? 1 : -1)
      } : null);
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleCollect = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    
    try {
      const res: any = await socialAPI.collect(id);
      setCollected(res.data.collected);
      setContent(prev => prev ? {
        ...prev,
        collectCount: prev.collectCount + (res.data.collected ? 1 : -1)
      } : null);
      toast.success(res.data.collected ? '已收藏' : '已取消收藏');
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title,
        text: content?.content?.slice(0, 100),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制');
    }
  };

  const handleFollow = async () => {
    if (!isLoggedIn || !content) {
      toast.error('请先登录');
      return;
    }
    
    try {
      const res: any = await socialAPI.follow(content.user.id);
      setIsFollowing(res.data.following);
      toast.success(res.data.following ? '关注成功' : '已取消关注');
    } catch (error) {
      toast.error('操作失败');
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    if (!isLoggedIn) {
      toast.error('请先登录');
      return;
    }
    
    setSubmitting(true);
    try {
      const res: any = await contentAPI.addComment(id, commentText.trim());
      if (res.code === 'SUCCESS') {
        setComments(prev => [res.data, ...prev]);
        setCommentText('');
        setContent(prev => prev ? {
          ...prev,
          commentCount: prev.commentCount + 1
        } : null);
        toast.success('评论成功');
      }
    } catch (error) {
      toast.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const parseImages = (images: string) => {
    try {
      return JSON.parse(images) || [];
    } catch {
      return [];
    }
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

  if (!content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">内容不存在</p>
          <button onClick={() => router.push('/')} className="mt-4 text-pink-500">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const images = parseImages(content.images);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-600">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="text-gray-600">
              <FaShareAlt className="w-5 h-5" />
            </button>
            <button onClick={() => toast.success('更多功能开发中')} className="text-gray-600">
              <FiMoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* 内容 */}
      <main className="max-w-2xl mx-auto">
        {/* 用户信息 */}
        <div className="flex items-center justify-between p-4">
          <Link href={`/profile/${content.user.id}`} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={content.user.avatar}
                alt={content.user.nickname}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{content.user.nickname}</div>
              <div className="text-xs text-gray-400">{formatTime(content.createdAt)}</div>
            </div>
          </Link>
          {user?.id !== content.user.id && (
            <button
              onClick={handleFollow}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isFollowing
                  ? 'border border-gray-200 text-gray-700'
                  : 'bg-pink-500 text-white'
              }`}
            >
              {isFollowing ? '已关注' : '+ 关注'}
            </button>
          )}
        </div>

        {/* 标题 */}
        <div className="px-4 pb-3">
          <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
        </div>

        {/* 图片 */}
        {images.length > 0 && (
          <div className="px-4 pb-4">
            <div className={`grid gap-2 ${
              images.length === 1 ? 'grid-cols-1' :
              images.length === 2 ? 'grid-cols-2' :
              'grid-cols-3'
            }`}>
              {images.map((img: string, i: number) => (
                <div 
                  key={i} 
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 正文 */}
        <div className="px-4 pb-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content.content}</p>
        </div>

        {/* 互动数据 */}
        <div className="px-4 pb-4 text-sm text-gray-400">
          阅读 {content.viewCount} · 点赞 {content.likeCount} · 评论 {content.commentCount}
        </div>

        {/* 互动按钮 */}
        <div className="flex items-center justify-around py-4 border-y border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              liked ? 'bg-red-50 text-red-500' : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <FaHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span>{content.likeCount}</span>
          </button>
          
          <button 
            onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 text-gray-600"
          >
            <FaRegComment className="w-5 h-5" />
            <span>{content.commentCount}</span>
          </button>
          
          <button
            onClick={handleCollect}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              collected ? 'bg-pink-50 text-pink-500' : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <FaRegBookmark className={`w-5 h-5 ${collected ? 'fill-current' : ''}`} />
            <span>{content.collectCount}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-50 text-gray-600"
          >
            <FaShareAlt className="w-5 h-5" />
          </button>
        </div>

        {/* 评论列表 */}
        <div id="comments" className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">评论 ({content.commentCount})</h2>
          
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>还没有评论，快来抢沙发</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/profile/${comment.user.id}`}>
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={comment.user.avatar}
                        alt={comment.user.nickname}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{comment.user.nickname}</span>
                      <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 评论输入框 */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            placeholder="写评论..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-100"
          />
          <button
            onClick={handleComment}
            disabled={!commentText.trim() || submitting}
            className="p-2.5 bg-pink-500 text-white rounded-full disabled:opacity-50"
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
