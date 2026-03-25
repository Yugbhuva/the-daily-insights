import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import NewsCard from '../components/NewsCard';
import SEO from '../components/SEO';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  const fetchArticles = async () => {
    if (!category) return;
    
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', categoryName)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching category articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();

    const channel = supabase
      .channel(`public:articles:${categoryName}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'articles',
        filter: `category=eq.${categoryName}`
      }, () => {
        fetchArticles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, categoryName]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO 
        title={categoryName}
        description={`The latest stories, analysis, and breaking news in ${categoryName} from around the world.`}
      />
      <header className="mb-12 border-b-4 border-zinc-900 dark:border-white pb-6">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
          {category}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-4 max-w-2xl">
          The latest stories, analysis, and breaking news in {category} from around the world.
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">No articles found in this category yet.</p>
        </div>
      )}
    </div>
  );
}
