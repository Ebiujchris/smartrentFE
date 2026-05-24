'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building2, DoorOpen, Users, CreditCard, Wrench, BarChart3, Bell, CreditCard as Subscription, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Properties', href: '/dashboard/properties', icon: Building2 },
  { name: 'Units', href: '/dashboard/units', icon: DoorOpen },
  { name: 'Tenants', href: '/dashboard/tenants', icon: Users },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

const bottomItems = [
  { name: 'Subscription', href: '/dashboard/subscription', icon: Subscription },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-md">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">SmartRentUG</span>
        </Link>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${active 
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-3 border-emerald-500' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 space-y-1 border-t border-slate-800">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${active 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-white w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center">
        © 2026 SmartRentUG
      </div>
    </aside>
  );
}
