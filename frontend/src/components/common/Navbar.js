'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LogOut, LayoutDashboard, MonitorPlay, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/queue', label: 'Live Queue', icon: MonitorPlay },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Branding */}
        <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-slate-50 font-extrabold text-2xl tracking-tight">
          <Activity className="h-6 w-6 text-teal-500 animate-pulse" />
          <span className="display-font">HAQMS</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/30 p-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Shield className="h-3 w-3" />
              {user.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all duration-300 focus:outline-none"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
