'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="text-gray-600 mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">隐私政策</h1>
        </div>
      </header>

      <div className="px-4 py-6 prose prose-sm max-w-none text-gray-700">
        <h2 className="text-base font-bold mb-3">味享隐私政策</h2>
        <p className="text-xs text-gray-400 mb-4">更新日期：2026年3月22日</p>

        <h3 className="font-semibold mt-4 mb-2">一、我们收集哪些信息</h3>
        <p>为提供更好的服务，我们会收集以下信息：</p>
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>您主动提供的信息：手机号码、昵称、头像、个人简介等</li>
          <li>使用服务时产生的信息：发布的内容、评论、点赞、收藏记录</li>
          <li>设备信息：设备型号、操作系统版本、IP地址</li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">二、如何使用信息</h3>
        <p className="text-sm">我们使用收集的信息用于：提供、维护和改进服务；向您发送通知；防止欺诈和滥用；进行数据分析以改善用户体验。</p>

        <h3 className="font-semibold mt-4 mb-2">三、信息保护</h3>
        <p className="text-sm">我们采用业界标准的安全措施保护您的个人信息，包括加密传输、访问控制等技术手段。</p>

        <h3 className="font-semibold mt-4 mb-2">四、您的权利</h3>
        <p className="text-sm">您有权访问、更正、删除您的个人信息，也可以随时注销账号。如需操作，请通过设置页面或联系客服。</p>

        <h3 className="font-semibold mt-4 mb-2">五、联系我们</h3>
        <p className="text-sm">如有任何问题，请发送邮件至：privacy@weixiang.com</p>
      </div>
    </div>
  );
}
