'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';
import BottomNav from '@/components/BottomNav';

export default function EditProfile() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState<number>(user?.gender || 0);
  const [location, setLocation] = useState(user?.location || '');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('图片大小不能超过5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      toast.error('请输入昵称');
      return;
    }

    setLoading(true);
    try {
      const res: any = await authAPI.updateUser({
        nickname: nickname.trim(),
        bio: bio.trim(),
        gender,
        location: location.trim(),
        avatar: avatarPreview,
      });
      
      if (res.code === 'SUCCESS') {
        setUser(res.data);
        toast.success('保存成功');
        router.push(`/profile/${user?.id}`);
      } else {
        toast.error(res.message || '保存失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先登录</p>
          <Link href="/login" className="text-pink-500">去登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link href={`/profile/${user.id}`} className="text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">编辑资料</h1>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="text-pink-500 font-medium disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 头像 */}
      <div className="bg-white mt-2 p-4 flex flex-col items-center">
        <div 
          className="relative w-24 h-24 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <img 
            src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/png?seed=${user.id}`}
            alt="头像"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-sm text-gray-500 mt-2">点击更换头像</p>
      </div>

      {/* 表单 */}
      <div className="bg-white mt-2">
        <div className="px-4 py-4 border-b border-gray-100">
          <label className="block text-sm text-gray-500 mb-2">昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
            className="w-full text-base"
            maxLength={20}
          />
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <label className="block text-sm text-gray-500 mb-2">个人简介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="介绍一下自己吧~"
            className="w-full text-base resize-none h-24"
            maxLength={200}
          />
          <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/200</p>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <label className="block text-sm text-gray-500 mb-2">性别</label>
          <div className="flex gap-4">
            <button
              onClick={() => setGender(1)}
              className={`px-6 py-2 rounded-full border ${
                gender === 1 ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200 text-gray-600'
              }`}
            >
              男
            </button>
            <button
              onClick={() => setGender(2)}
              className={`px-6 py-2 rounded-full border ${
                gender === 2 ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200 text-gray-600'
              }`}
            >
              女
            </button>
            <button
              onClick={() => setGender(0)}
              className={`px-6 py-2 rounded-full border ${
                gender === 0 ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-gray-200 text-gray-600'
              }`}
            >
              保密
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          <label className="block text-sm text-gray-500 mb-2">所在地</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="如：北京市"
            className="w-full text-base"
            maxLength={50}
          />
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
