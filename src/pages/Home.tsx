import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import NewsCard from '../components/NewsCard';
import { TrendingUp, ArrowRight, Newspaper, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdBlock from '../components/AdBlock';
import SEO from '../components/SEO';



export default function Home() {
  const { loading: authLoading } = useAuth();
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "The Daily Insights",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const fetchArticles = async () => {
    try {
      // Featured Article (most viewed published)
      const { data: featuredData, error: featuredError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (featuredError) {
        console.error('Error fetching featured article:', featuredError);
      }
      setFeaturedArticle(featuredData || null);

      // Latest Articles
      const { data: latestData, error: latestError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (latestError) {
        console.error('Error fetching latest articles:', latestError);
      }
      setLatestArticles(latestData || []);

      // Trending (most likes)
      const { data: trendingData, error: trendingError } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(5);

      if (trendingError) {
        console.error('Error fetching trending articles:', trendingError);
      }
      setTrendingArticles(trendingData || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch articles immediately — no need to wait for auth (articles are public)
    fetchArticles();

    // Real-time updates
    const channel = supabase
      .channel('public:articles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, fetchArticles)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO schema={websiteSchema} />
      
      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white px-4 py-3 rounded-xl mb-10 flex items-center gap-4 overflow-hidden shadow-lg shadow-red-600/20">
        <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest whitespace-nowrap bg-white/20 px-3 py-1 rounded-lg">
          <Zap size={14} className="fill-current" /> Breaking News
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Featured Headline */}
          {featuredArticle && (
            <section className="group relative overflow-hidden rounded-3xl bg-zinc-200 dark:bg-zinc-900 aspect-[16/9] shadow-2xl">
              <img 
                src={featuredArticle.image_url} 
                alt={featuredArticle.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/70 to-transparent dark:from-zinc-950 dark:via-zinc-950/40 dark:to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 lg:p-12 w-full">
                <Link 
                  to={`/category/${featuredArticle.category.toLowerCase()}`}
                  className="inline-block px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 hover:bg-red-700 transition-colors"
                >
                  {featuredArticle.category}
                </Link>
                <Link to={`/article/${featuredArticle.id}`}>
                  <h1 className="text-3xl lg:text-5xl font-black text-zinc-900 dark:text-white mb-4 leading-[1.1] hover:text-red-500 transition-colors">
                    {featuredArticle.title}
                  </h1>
                </Link>
                <p className="text-zinc-600 dark:text-zinc-300 text-lg line-clamp-2 mb-6 max-w-2xl font-medium">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm font-bold">
                  <span>{featuredArticle.author_name}</span>
                  <span className="w-1 h-1 bg-zinc-400 dark:bg-zinc-600 rounded-full"></span>
                  <span>{featuredArticle.views.toLocaleString()} views</span>
                </div>
              </div>
            </section>
          )}

          <AdBlock placement="home_body_1" className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800" />

          {/* Latest News Grid */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Newspaper className="text-red-600"/> Latest Headlines
              </h2>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 mx-6"></div>
              <button className="text-sm font-black text-red-600 hover:underline flex items-center gap-1">
                View All <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {latestArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          <AdBlock placement="home_body_2" className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800" />

          {/* Category Sections (Example: Technology) */}
          <section className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black tracking-tight">Technology</h2>
              <Link to="/category/technology" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors">
                Explore More
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.filter(a => a.category === 'Technology').slice(0, 3).map(article => (
                <NewsCard key={article.id} article={article} variant="small" />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Trending Now */}
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-black mb-8 flex items-center gap-2">
              <TrendingUp className="text-red-600" /> Trending Now
            </h2>
            <div className="space-y-8">
              {trendingArticles.map((article, index) => (
                <div key={article.id} className="flex gap-4 group">
                  <span className="text-4xl font-black text-zinc-100 dark:text-zinc-800 group-hover:text-red-600/20 transition-colors">
                    0{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/category/${article.category.toLowerCase()}`}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1 block"
                    >
                      {article.category}
                    </Link>
                    <Link to={`/article/${article.id}`}>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug hover:text-red-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter Widget */}
          <section className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white p-8 rounded-2xl overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-4">Stay Ahead of the Curve</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                Get the most important stories delivered to your inbox every morning.
              </p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="w-full bg-zinc-200 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
                <button className="w-full py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors">
                  Subscribe Now
                </button>
              </form>
            </div>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-red-600/10 rounded-full blur-3xl"></div>
          </section>

          <AdBlock placement="home_body_3" className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800" />
        </aside>
      </div>
    </div>
  );
}
