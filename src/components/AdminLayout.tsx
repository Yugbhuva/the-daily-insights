import React, { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Newspaper, Users, MessageSquare, LogOut, Plus, BarChart3, Megaphone, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [dbError, setDbError] = useState<string>('');

  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out after 8 seconds. Your Supabase project may be paused.')), 8000)
        );
        const queryPromise = supabase.from('articles').select('id').limit(1);
        const result = await Promise.race([queryPromise, timeoutPromise]) as any;
        if (result?.error) {
          setDbStatus('error');
          setDbError(`Supabase error: ${result.error.message} (code: ${result.error.code})`);
        } else {
          setDbStatus('ok');
        }
      } catch (err: any) {
        setDbStatus('error');
        setDbError(err?.message || 'Cannot reach Supabase.');
      }
    };
    checkDbConnection();
  }, []);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!isAdmin) return <Navigate to="/" />;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Newspaper, label: 'Articles', path: '/admin/articles' },
    { icon: MessageSquare, label: 'Comments', path: '/admin/comments' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Megaphone, label: 'Ads', path: '/admin/ads' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
        <div className="mb-10">
          <Link to="/" className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white">
            THE DAILY INSIGHTS<span className="text-red-600">.</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                location.pathname === item.path
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
            <LogOut size={20} /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{title}</h1>
          <div className="flex items-center gap-3">
            {dbStatus === 'checking' && (
              <span className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                <Loader2 size={14} className="animate-spin" /> Checking DB…
              </span>
            )}
            {dbStatus === 'ok' && (
              <span className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> DB Connected
              </span>
            )}
            <Link 
              to="/admin/articles/new"
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 dark:shadow-white/5"
            >
              <Plus size={20} /> New Article
            </Link>
          </div>
        </header>

        {dbStatus === 'error' && (
          <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-4">
            <WifiOff className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-black text-red-600 mb-1">⚠️ Supabase Database Unreachable</p>
              <p className="text-sm text-red-500 font-mono mb-2">{dbError}</p>
              <p className="text-xs text-red-400">
                Your Supabase project is likely <strong>paused</strong>. Go to{' '}
                <a href="https://supabase.com/dashboard/project/bviijmucwrzakskgtrrx" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                  supabase.com/dashboard
                </a>{' '}
                and click <strong>"Restore project"</strong>, then wait ~2 minutes and refresh this page.
              </p>
            </div>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
