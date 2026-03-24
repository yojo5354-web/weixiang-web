'use client';

import { useRouter } from 'next/navigation';

export default function UserAgreementPage() {
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
          <h1 className="text-lg font-semibold">用户协议</h1>
        </div>
      </header>

      <div className="px-4 py-6 text-gray-700">
        <h2 className="text-base font-bold mb-3">味享用户服务协议</h2>
        <p className="text-xs text-gray-400 mb-4">更新日期：2026年3月22日</p>

        <h3 className="font-semibold mt-4 mb-2">一、服务说明</h3>
        <p className="text-sm">味享是一款面向美食爱好者的内容社区平台，提供美食内容发布、分享、发现等功能。</p>

        <h3 className="font-semibold mt-4 mb-2">二、用户注册</h3>
        <p className="text-sm">您需要注册账号才能使用完整功能。注册时请提供真实信息，一个手机号只能注册一个账号。</p>

        <h3 className="font-semibold mt-4 mb-2">三、用户行为规范</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm">
          <li>不得发布虚假、违法、侵权内容</li>
          <li>不得进行恶意刷量、骚扰他人等行为</li>
          <li>不得传播广告垃圾信息</li>
          <li>尊重他人知识产权，不得抄袭搬运</li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">四、内容所有权</h3>
        <p className="text-sm">您在味享发布的内容著作权归您所有，但您授权味享在平台内展示和传播该内容。</p>

        <h3 className="font-semibold mt-4 mb-2">五、违规处理</h3>
        <p className="text-sm">如违反本协议，味享有权限制、封禁账号，情节严重者将追究法律责任。</p>

        <h3 className="font-semibold mt-4 mb-2">六、免责声明</h3>
        <p className="text-sm">味享不对用户发布内容的准确性负责，用户需自行承担发布内容的法律责任。</p>
      </div>
    </div>
  );
}
