import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiCompass, FiPlusSquare, FiMessageCircle, FiUser } from 'react-icons/fi';
import { useAppStore } from '@/lib/store';

export default function BottomNav() {
  const pathname = usePathname();
  const { isLoggedIn, user } = useAppStore();

  const isActive = (path: string) => pathname === path;
  const profileLink = isLoggedIn && user?.id ? `/profile/${user.id}` : '/login';

  const navItems = [
    { href: '/', icon: FiHome, label: '首页' },
    { href: '/discover', icon: FiCompass, label: '发现' },
    { href: '/publish', icon: FiPlusSquare, label: '发布', isCenter: true },
    { href: '/messages', icon: FiMessageCircle, label: '消息' },
    { href: profileLink, icon: FiUser, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.isCenter) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex-1 flex flex-col items-center py-2 relative"
              >
                {/* AI 标签 */}
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-full font-bold tracking-wide">AI</span>
                </div>
                {/* 主按钮 */}
                <div className="w-12 h-12 -mt-4 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-200 hover:shadow-xl hover:scale-105 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 transition-colors ${
                active ? 'text-pink-500' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
