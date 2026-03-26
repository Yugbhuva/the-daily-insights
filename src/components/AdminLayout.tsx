import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Newspaper, Users, MessageSquare, Settings, LogOut, Plus, BarChart3, Megaphone } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

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
            THE DAILY INSIGHTS<span className="text-red-600">.</span> <span className="text-xs font-normal text-zinc-400">ADMIN</span>
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
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{title}</h1>
          <div className="flex items-center gap-3">
            <Link 
              to="/admin/articles/new"
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 dark:shadow-white/5"
            >
              <Plus size={20} /> New Article
            </Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
