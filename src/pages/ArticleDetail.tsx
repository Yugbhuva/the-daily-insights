import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Article, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDate, cn } from '../lib/utils';
import { ThumbsUp, MessageSquare, Share2, Bookmark, Clock, User, ChevronRight, Send, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import NewsCard from '../components/NewsCard';
import AdBlock from '../components/AdBlock';
import SEO from '../components/SEO';

const AdComponent = () => (
  <div className="my-12 p-8 bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center relative overflow-hidden group not-prose">
    <div className="relative z-10">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Sponsored Content</span>
      <h3 className="text-xl font-black mb-4 text-zinc-900 dark:text-white">Upgrade to The Daily Insights Pro</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
        Get unlimited access to premium articles, ad-free experience, and exclusive newsletters.
      </p>
      <button className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:scale-105 transition-transform">
        Learn More
      </button>
    </div>
    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-red-600/5 rounded-full blur-3xl group-hover:bg-red-600/10 transition-colors"></div>
  </div>
);

const ScriptComponent = ({ children, src, ...props }: any) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous scripts if any
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    if (src) {
      script.src = src;
      script.async = true;
    }
    if (children) {
      script.textContent = children;
    }
    
    // Copy all other attributes
    Object.keys(props).forEach(key => {
      if (key !== 'node' && key !== 'children') {
        script.setAttribute(key, props[key]);
      }
    });
    
    containerRef.current.appendChild(script);
  }, [src, children, props]);

  return <div ref={containerRef} className="script-container" />;
};

const MarkdownComponents = {
  div: ({ node, className, children, ...props }: any) => {
    if (className === 'article-ad') {
      return <AdComponent />;
    }
    if (className === 'ad-placeholder') {
      const placement = props['data-placement'];
      return <AdBlock placement={placement} className="my-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800" />;
    }
    return <div className={className} {...props}>{children}</div>;
  },
  img: ({ node, ...props }: any) => (
    <figure className="my-12 not-prose">
      <img 
        {...props} 
        className="w-full rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800" 
        referrerPolicy="no-referrer"
      />
      {props.alt && (
        <figcaption className="mt-4 text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 italic">
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
  script: ScriptComponent
};

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArticle = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setArticle(data);
        
        // Increment views
        await supabase.rpc('increment_views', { row_id: id });

        // Fetch related articles
        const { data: relatedData } = await supabase
          .from('articles')
          .select('*')
          .eq('category', data.category)
          .eq('status', 'published')
          .neq('id', id)
          .limit(4);
        
        setRelatedArticles(relatedData || []);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', id)
      .order('created_at', { ascending: false });
    
    if (!error) {
      setComments(data || []);
    }
  };

  const checkLikeStatus = async () => {
    if (!user || !id) return;
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('article_id', id)
      .eq('user_id', user.id)
      .single();
    
    setIsLiked(!!data);
  };

  useEffect(() => {
    fetchArticle();
    fetchComments();
    checkLikeStatus();

    // Real-time comments
    const channel = supabase
      .channel(`comments:${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `article_id=eq.${id}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !article) return;

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', user.id);
        
        await supabase.rpc('decrement_likes', { row_id: article.id });
        setIsLiked(false);
        setArticle(prev => prev ? { ...prev, likes_count: prev.likes_count - 1 } : null);
      } else {
        await supabase
          .from('likes')
          .insert([{ article_id: article.id, user_id: user.id }]);
        
        await supabase.rpc('increment_likes', { row_id: article.id });
        setIsLiked(true);
        setArticle(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !article) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          article_id: article.id,
          user_id: user.id,
          user_name: profile?.name || 'Anonymous',
          user_avatar: profile?.avatar_url || '',
          content: newComment.trim()
        }]);

      if (error) throw error;
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
      fetchComments();
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };

  const renderContentWithAds = (content: string) => {
    const paragraphs = content.split('\n\n');
    const result = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      result.push(paragraphs[i]);
      
      if (i === 1) result.push('<div class="ad-placeholder" data-placement="post_para_1"></div>');
      if (i === 3) result.push('<div class="ad-placeholder" data-placement="post_para_2"></div>');
      if (i === 6) result.push('<div class="ad-placeholder" data-placement="post_para_3"></div>');
      if (i === 9) result.push('<div class="ad-placeholder" data-placement="post_para_4"></div>');
    }
    
    return result.join('\n\n');
  };

  if (loading || !article) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const newsSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [article.image_url],
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
    "author": [{
      "@type": "Person",
      "name": article.author_name,
      "url": `${window.location.origin}/profile` // Placeholder
    }],
    "publisher": {
      "@type": "Organization",
      "name": "The Daily Insights",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png` // Placeholder
      }
    },
    "description": article.excerpt
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO 
        title={article.title}
        description={article.excerpt}
        ogImage={article.image_url}
        ogType="article"
        schema={newsSchema}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-8">
        <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/category/${article.category.toLowerCase()}`} className="hover:text-red-600 transition-colors">{article.category}</Link>
        <ChevronRight size={12} />
        <span className="text-zinc-900 dark:text-white truncate max-w-[200px]">{article.title}</span>
      </nav>

      <header className="mb-12">
        <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-full mb-6 inline-block">
          {article.category}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white mb-8 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-zinc-900 dark:text-white">{article.author_name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Clock size={12} /> {formatDate(article.created_at)} • 6 min read
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLike}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200",
                isLiked 
                  ? "bg-red-600 border-red-600 text-white" 
                  : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-bold">{article.likes_count}</span>
            </button>
            <button className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <Share2 size={18} />
            </button>
            <button className="p-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">
              <Bookmark size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-12">
        <img 
          src={article.image_url} 
          alt={article.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
        <ReactMarkdown 
          rehypePlugins={[rehypeRaw]}
          components={MarkdownComponents}
        >
          {renderContentWithAds(article.content || '')}
        </ReactMarkdown>
      </div>

      {(article.tags ?? []).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-16">
          {(article.tags ?? []).map(tag => (
            <Link 
              key={tag} 
              to={`/search?q=${tag}`}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Related Articles */}
      <section className="mb-16">
        <h2 className="text-2xl font-black mb-8">Related Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {relatedArticles.map(art => (
            <NewsCard key={art.id} article={art} />
          ))}
        </div>
      </section>

      {/* Comments Section */}
      <section id="comments" className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <MessageSquare className="text-red-600" /> Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleAddComment} className="mb-12">
            <div className="flex gap-4">
              <img 
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-3">
                <textarea 
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-red-600 min-h-[100px] outline-none"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-red-600 text-white font-black rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  Post Comment <Send size={16} />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-xl text-center mb-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">Please login to join the conversation.</p>
            <button className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-lg">Login</button>
          </div>
        )}

        <div className="space-y-8">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-4 group">
              <img 
                src={comment.user_avatar || `https://ui-avatars.com/api/?name=${comment.user_name}`} 
                alt={comment.user_name} 
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">{comment.user_name}</h4>
                  <span className="text-[10px] text-zinc-400">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {comment.content}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-600">Reply</button>
                  {(user?.id === comment.user_id || profile?.role === 'admin') && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-zinc-400 text-sm py-8">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </section>
    </article>
  );
}
