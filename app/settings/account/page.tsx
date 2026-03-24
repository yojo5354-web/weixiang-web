'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function AccountSettings() {
  const router = useRouter();
  const { user } = useAppStore();
  const [phoneVisible, setPhoneVisible] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="text-gray-600 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">账号与安全</h1>
        </div>
      </header>

      <div className="bg-white mt-2">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="text-gray-900">手机号</span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{phoneVisible ? user?.phone : user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
            <button onClick={() => setPhoneVisible(!phoneVisible)} className="text-pink-500">
              {phoneVisible ? '隐藏' : '显示'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="text-gray-900">微信绑定</span>
          <span className="text-sm text-gray-400">未绑定</span>
        </div>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="text-gray-900">修改密码</span>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-gray-900">登录设备管理</span>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="mt-4 px-4">
        <button
          onClick={() => toast.error('注销账号需联系客服')}
          className="w-full py-3 text-red-500 text-sm"
        >
          申请注销账号
        </button>
      </div>
    </div>
  );
}
