'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authAPI } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import toast from 'react-hot-toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isRegister, setIsRegister] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'wechat'>('phone');
  const [showWxModal, setShowWxModal] = useState(false);
  const [wxQrcode, setWxQrcode] = useState('');
  const [wxSessionId, setWxSessionId] = useState('');
  const [wxStatus, setWxStatus] = useState<'loading' | 'pending' | 'scanned' | 'confirmed' | 'expired'>('loading');
  
  const router = useRouter();
  const { login } = useAppStore();

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入正确的手机号');
      return;
    }

    setSendingCode(true);
    try {
      const res: any = await authAPI.sendCode(phone);
      if (res.code === 'SUCCESS') {
        // 如果是演示模式，显示验证码
        if (res.data.demoCode) {
          toast.success(`验证码: ${res.data.demoCode}（演示模式）`);
        } else {
          toast.success('验证码已发送，请查收短信');
        }
        setCountdown(60);
      } else {
        toast.error(res.message || '发送失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error('请输入手机号');
      return;
    }

    // 验证码登录必须有验证码
    if (code) {
      // 验证码登录模式
      setLoading(true);
      try {
        const res: any = await authAPI.loginByCode(phone, code);
        if (res.code === 'SUCCESS') {
          login(res.data.user, res.data.token);
          toast.success('登录成功');
          router.push('/');
        } else {
          toast.error(res.message || '登录失败');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || '登录失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 如果是注册模式
    if (isRegister) {
      if (!nickname) {
        toast.error('请输入昵称');
        return;
      }
      setLoading(true);
      try {
        const res: any = await authAPI.register(phone, nickname);
        if (res.code === 'SUCCESS') {
          login(res.data.user, res.data.token);
          toast.success('注册成功');
          router.push('/');
        } else {
          toast.error(res.message || '注册失败');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || '注册失败');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 手机号直接登录（演示模式）
    setLoading(true);
    try {
      const res: any = await authAPI.login(phone);
      if (res.code === 'SUCCESS') {
        login(res.data.user, res.data.token);
        toast.success('登录成功');
        router.push('/');
      } else {
        toast.error(res.message || '登录失败');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 微信登录
  const handleWechatLogin = async () => {
    setShowWxModal(true);
    setWxStatus('loading');
    
    try {
      const res: any = await authAPI.getWxQrcode();
      if (res.code === 'SUCCESS') {
        setWxQrcode(res.data.demoUrl);
        setWxSessionId(res.data.sessionId);
        setWxStatus('pending');
        
        // 开始轮询
        pollWxStatus(res.data.sessionId);
      }
    } catch (error) {
      toast.error('获取二维码失败');
      setShowWxModal(false);
    }
  };

  // 轮询微信登录状态
  const pollWxStatus = (sessionId: string) => {
    const poll = async () => {
      try {
        const res: any = await authAPI.pollWxLogin(sessionId);
        if (res.code === 'SUCCESS') {
          const status = res.data.status;
          
          if (status === 'confirmed') {
            // 登录成功
            login(res.data.user, res.data.token);
            toast.success('登录成功');
            setShowWxModal(false);
            router.push('/');
            return;
          }
          
          if (status === 'expired') {
            setWxStatus('expired');
            return;
          }
          
          if (status === 'scanned') {
            setWxStatus('scanned');
          }
          
          // 继续轮询
          if (status === 'pending' || status === 'scanned') {
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error('轮询失败');
      }
    };
    
    setTimeout(poll, 2000);
  };

  // 模拟扫码确认（演示用）
  const handleWxDemoScan = async (action: 'scan' | 'confirm') => {
    if (!wxSessionId || !phone) {
      toast.error('请先输入手机号');
      return;
    }
    
    try {
      await authAPI.wxScanDemo(wxSessionId, phone, action);
      if (action === 'scan') {
        toast.success('已扫码，请在手机确认');
      } else {
        toast.success('已确认');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 顶部 */}
      <div className="p-4">
        <Link href="/" className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center px-8 pt-8 pb-8">
        <h1 className="text-3xl font-bold text-pink-500 mb-2">味享</h1>
        <p className="text-gray-500">AI 驱动的美食内容社区</p>
      </div>

      {/* 登录方式切换 */}
      <div className="px-8 mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              loginMethod === 'phone' ? 'bg-white text-pink-500 shadow' : 'text-gray-500'
            }`}
          >
            手机登录
          </button>
          <button
            onClick={() => setLoginMethod('wechat')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              loginMethod === 'wechat' ? 'bg-white text-pink-500 shadow' : 'text-gray-500'
            }`}
          >
            微信登录
          </button>
        </div>
      </div>

      {/* 手机登录表单 */}
      {loginMethod === 'phone' && (
        <form onSubmit={handleSubmit} className="flex-1 px-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="请输入手机号"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                  maxLength={11}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0}
                  className="px-4 py-3 bg-pink-50 text-pink-500 rounded-xl text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* 验证码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">验证码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="请输入验证码"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                maxLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                {code ? '验证码登录模式' : '不填验证码则使用直接登录（演示）'}
              </p>
            </div>

            {/* 昵称（注册时显示） */}
            {isRegister && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入昵称"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setCode('');
              }}
              className="text-sm text-pink-500"
            >
              {isRegister ? '已有账号？登录' : '没有账号？注册'}
            </button>
          </div>

          {/* 提示 */}
          <div className="mt-6 p-4 bg-pink-50 rounded-xl">
            <p className="text-sm text-pink-600">
              <span className="font-medium">演示说明：</span>
              <br/>1. 输入手机号 → 直接登录
              <br/>2. 输入手机号 + 验证码 → 验证码登录
              <br/>3. 没有收到验证码？控制台有打印
            </p>
          </div>
        </form>
      )}

      {/* 微信登录 */}
      {loginMethod === 'wechat' && (
        <div className="flex-1 px-8 flex flex-col items-center">
          <button
            onClick={handleWechatLogin}
            className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
            </svg>
            点击使用微信扫码登录
          </button>
          
          <p className="mt-6 text-sm text-gray-500 text-center">
            微信登录需要在微信中确认<br/>
            请使用与味享账号绑定的微信扫码
          </p>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl w-full">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">演示说明：</span><br/>
              1. 点击上方按钮获取二维码<br/>
              2. 输入已注册的手机号<br/>
              3. 点击「模拟扫码」和「确认登录」<br/>
              4. 完成演示登录流程
            </p>
          </div>
        </div>
      )}

      {/* 底部协议 */}
      <div className="p-8 text-center text-xs text-gray-400">
        登录即表示同意
        <button onClick={() => toast.success('用户协议')} className="text-pink-500">《用户协议》</button>
        和
        <button onClick={() => toast.success('隐私政策')} className="text-pink-500">《隐私政策》</button>
      </div>

      {/* 微信扫码弹窗 */}
      {showWxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">微信扫码登录</h3>
              <button onClick={() => setShowWxModal(false)} className="text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 二维码 */}
            <div className="flex justify-center mb-4">
              {wxQrcode ? (
                <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={wxQrcode} alt="二维码" fill className="object-contain" unoptimized />
                  {wxStatus === 'scanned' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">已扫码</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">加载中...</span>
                </div>
              )}
            </div>
            
            {/* 状态提示 */}
            <p className="text-center text-sm text-gray-500 mb-4">
              {wxStatus === 'pending' && '请使用微信扫描二维码'}
              {wxStatus === 'scanned' && '请在手机微信中点击确认'}
              {wxStatus === 'confirmed' && '登录成功，跳转中...'}
              {wxStatus === 'expired' && '二维码已过期，请重新获取'}
              {wxStatus === 'loading' && '正在生成二维码...'}
            </p>
            
            {/* 演示操作 */}
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-gray-500 mb-2">演示操作：</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="输入手机号"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  maxLength={11}
                  inputMode="numeric"
                />
                <button
                  onClick={() => handleWxDemoScan('scan')}
                  className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg"
                >
                  模拟扫码
                </button>
                <button
                  onClick={() => handleWxDemoScan('confirm')}
                  className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg"
                >
                  确认登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部导航（登录后可见） */}
      <BottomNav />
    </div>
  );
}
