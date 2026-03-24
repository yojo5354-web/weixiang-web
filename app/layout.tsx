import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: '味享 - AI 驱动的美食内容社区',
  description: '拍照生成食谱、语音调整内容，AI 让美食创作更简单',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
