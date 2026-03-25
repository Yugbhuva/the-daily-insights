import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { Article, Comment } from '../types';
import { Newspaper, Users, MessageSquare, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalComments: 0,
    totalUsers: 0
  });
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);

  const fetchDashboardData = async () => {
    if (!isAdmin) return;

    try {
      // Fetch Counts
      const { count: articlesCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });
      
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch Total Views
      const { data: viewsData } = await supabase
        .from('articles')
        .select('views');
      
      const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

      setStats({
        totalArticles: articlesCount || 0,
        totalViews: totalViews,
        totalComments: commentsCount || 0,
        totalUsers: usersCount || 0
      });

      // Recent Articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentArticles(articlesData || []);

      // Recent Comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentComments(commentsData || []);

    } catch (error) {
      console.error("Dashboard data error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const articlesChannel = supabase
      .channel('admin:dashboard:articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const commentsChannel = supabase
      .channel('admin:dashboard:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin:dashboard:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(articlesChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [isAdmin]);

  const statCards = [
    { label: 'Total Articles', value: stats.totalArticles, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', trend: '+12%', up: true },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', trend: '+24%', up: true },
    { label: 'Total Comments', value: stats.totalComments, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', trend: '-5%', up: false },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', trend: '+8%', up: true },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-black", stat.up ? "text-green-600" : "text-red-600")}>
                {stat.trend} {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
            </div>
            <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-1">{stat.label}</h3>
            <p className="text-3xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Articles */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Newspaper className="text-red-600" /> Recent Articles
            </h2>
            <Link to="/admin/articles" className="text-sm font-bold text-red-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {recentArticles.map((article) => (
              <div key={article.id} className="flex items-center gap-4 group">
                <img src={article.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-zinc-500">{article.category} • {formatDate(article.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-zinc-900 dark:text-white">{article.views}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-black">Views</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Comments */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black flex items-center gap-2">
              <MessageSquare className="text-red-600" /> Recent Comments
            </h2>
            <Link to="/admin/comments" className="text-sm font-bold text-red-600 hover:underline">Moderate</Link>
          </div>
          <div className="space-y-6">
            {recentComments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <img src={comment.user_avatar || `https://ui-avatars.com/api/?name=${comment.user_name}`} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{comment.user_name}</h4>
                    <span className="text-[10px] text-zinc-400">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 italic">"{comment.content}"</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
