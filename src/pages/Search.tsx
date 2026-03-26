import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import NewsCard from '../components/NewsCard';
import { Search as SearchIcon, Filter, SlidersHorizontal } from 'lucide-react';
import SEO from '../components/SEO';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(queryParam);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Fetch all published articles and filter client-side for better tag/content matching
        // In a real app with many articles, we would use Supabase full-text search or RPC
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const allArticles = data || [];
        
        const filtered = allArticles.filter(art => 
          art.title.toLowerCase().includes(queryParam.toLowerCase()) ||
          art.excerpt.toLowerCase().includes(queryParam.toLowerCase()) ||
          art.tags.some(t => t.toLowerCase().includes(queryParam.toLowerCase())) ||
          art.category.toLowerCase().includes(queryParam.toLowerCase())
        );
        
        setArticles(filtered);
      } catch (error) {
        console.error('Error searching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [queryParam]);

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO 
        title={queryParam ? `Search: ${queryParam}` : 'Search News'}
        description={queryParam ? `Search results for "${queryParam}" on The Daily Insights.` : 'Search for the latest news, articles, and topics on The Daily Insights.'}
      />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-8 flex items-center gap-4">
            <SearchIcon size={32} className="text-red-600" /> 
            {queryParam ? `Results for "${queryParam}"` : 'Search The Daily Insights'}
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Search for news, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/search?q=${encodeURIComponent(searchTerm)}`)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-lg focus:ring-2 focus:ring-red-600 outline-none shadow-sm"
              />
            </div>
            <button className="px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
              <SlidersHorizontal size={20} /> Filters
            </button>
          </div>
        </header>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-sm text-zinc-500 font-bold uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <span>{articles.length} Articles Found</span>
              <div className="flex items-center gap-4">
                <span>Sort by:</span>
                <select className="bg-transparent border-none focus:ring-0 outline-none cursor-pointer hover:text-red-600">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Most Viewed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {articles.map(article => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>

            {articles.length === 0 && (
              <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-4">No results found for your search.</p>
                <p className="text-zinc-400 text-sm">Try using different keywords or check your spelling.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
