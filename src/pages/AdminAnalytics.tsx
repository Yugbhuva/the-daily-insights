import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

type TrendPoint = { name: string; views: number; comments: number };
type TopArticle = { id: string; title: string; views: number; comments: number };

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLast7Days = (): TrendPoint[] => {
  const today = new Date();
  const points: TrendPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    points.push({ name: WEEKDAY[d.getDay()], views: 0, comments: 0 });
  }
  return points;
};

export default function AdminAnalytics() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [trendData, setTrendData] = useState<TrendPoint[]>(getLast7Days());
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);

  const aggregateData = async () => {
    setLoading(true);
    try {
      const { data: articles, error: articleError } = await supabase
        .from('articles')
        .select('id,title,views,created_at')
        .order('views', { ascending: false });

      if (articleError) throw articleError;

      const { data: comments, error: commentError } = await supabase
        .from('comments')
        .select('id,article_id,created_at');

      if (commentError) throw commentError;

      const articleList = articles || [];
      const commentList = comments || [];

      const byArticleComments = commentList.reduce((acc: Record<string, number>, c) => {
        if (c.article_id) acc[c.article_id] = (acc[c.article_id] || 0) + 1;
        return acc;
      }, {});

      setTotalArticles(articleList.length);
      setTotalViews(articleList.reduce((sum, a) => sum + (a.views ?? 0), 0));
      setTotalComments(commentList.length);

      const emerging = articleList
        .map((a) => ({
          id: a.id,
          title: a.title || 'Untitled',
          views: a.views || 0,
          comments: byArticleComments[a.id] || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 8);

      setTopArticles(emerging);

      const trend = getLast7Days();

      const dayIdx = trend.reduce((acc, day, idx) => {
        acc[day.name] = idx;
        return acc;
      }, {} as Record<string, number>);

      articleList.forEach((a) => {
        if (!a.created_at) return;
        const d = new Date(a.created_at);
        const diffDays = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const name = WEEKDAY[d.getDay()];
          const idx = dayIdx[name];
          if (idx !== undefined) trend[idx].views += a.views || 0;
        }
      });

      commentList.forEach((c) => {
        if (!c.created_at) return;
        const d = new Date(c.created_at);
        const diffDays = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          const name = WEEKDAY[d.getDay()];
          const idx = dayIdx[name];
          if (idx !== undefined) trend[idx].comments += 1;
        }
      });

      setTrendData(trend);
    } catch (error) {
      console.error('Admin analytics aggregation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    aggregateData();

    const articlesChannel = supabase
      .channel('realtime:admin:analytics:articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, aggregateData)
      .subscribe();

    const commentsChannel = supabase
      .channel('realtime:admin:analytics:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, aggregateData)
      .subscribe();

    return () => {
      supabase.removeChannel(articlesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AdminLayout title="Analytics & Insights">
        <div className="p-20 text-center">Access denied.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics & Insights">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black">Article Analytics</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Live data from Supabase, updated in real time.</p>
        </div>
        <button
          onClick={aggregateData}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          Reset & Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Articles</h3>
            <p className="text-3xl font-black text-zinc-900 dark:text-white">{totalArticles}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Total Views</h3>
            <p className="text-3xl font-black text-zinc-900 dark:text-white">{totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Comments</h3>
            <p className="text-3xl font-black text-zinc-900 dark:text-white">{totalComments.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-black mb-6">Activity Trend (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Line type="monotone" dataKey="comments" stroke="#2563eb" strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-black mb-6">Top Articles by Views</h3>
          <div className="space-y-2">
            {topArticles.map((article) => (
              <div key={article.id} className="flex justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                <span className="text-sm font-bold truncate max-w-[240px]">{article.title}</span>
                <span className="text-sm font-black text-zinc-700 dark:text-zinc-200">{article.views.toLocaleString()} views</span>
              </div>
            ))}
            {topArticles.length === 0 && <p className="text-zinc-500 dark:text-zinc-400">No article data available.</p>}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
