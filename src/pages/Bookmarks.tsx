import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import { useAuth } from '../context/AuthContext';
import NewsCard from '../components/NewsCard';
import { Bookmark, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Bookmarks() {
  const { bookmarks, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!bookmarks?.length) {
        setArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .in('id', bookmarks)
          .eq('status', 'published');

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error("Fetch bookmarks error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchBookmarks();
    }
  }, [bookmarks, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title="My Bookmarks" description="Access your saved articles and read them at your convenience on The Daily Insights." />
      <header className="mb-12">
        <h1 className="text-4xl font-black mb-4 flex items-center gap-4">
          <Bookmark size={32} className="text-red-600" /> My Bookmarks
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Articles you've saved to read later.
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <Bookmark size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-6" />
          <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-8">You haven't bookmarked any articles yet.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
            Explore News <ArrowRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}
