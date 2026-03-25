import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, MessageSquare, Clock, Bookmark } from 'lucide-react';
import { Article } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface NewsCardProps {
  article: Article;
  variant?: 'large' | 'medium' | 'small' | 'horizontal';
}

export default function NewsCard({ article, variant = 'medium' }: NewsCardProps) {
  const { user, bookmarks, refreshBookmarks } = useAuth();
  const isBookmarked = bookmarks.includes(article.id);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', article.id);
      } else {
        await supabase
          .from('bookmarks')
          .insert([{ user_id: user.id, article_id: article.id }]);
      }
      await refreshBookmarks();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (variant === 'large') {
    return (
      <Link to={`/article/${article.id}`} className="group relative block overflow-hidden rounded-2xl bg-zinc-900 aspect-[16/9]">
        <img 
          src={article.image_url} 
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-full mb-4 inline-block">
            {article.category}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight group-hover:text-red-500 transition-colors">
            {article.title}
          </h2>
          <p className="text-zinc-300 text-lg mb-6 line-clamp-2 max-w-2xl">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-6 text-zinc-400 text-sm">
            <span className="flex items-center gap-2"><Clock size={16} /> {formatDate(article.created_at)}</span>
            <span className="flex items-center gap-2"><Eye size={16} /> {article.views}</span>
            <span className="flex items-center gap-2"><ThumbsUp size={16} /> {article.likes_count}</span>
          </div>
        </div>
        <button 
          onClick={toggleBookmark}
          className={cn(
            "absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all duration-200",
            isBookmarked ? "bg-red-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.id}`} className="group flex gap-4 items-start py-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0">
        <img 
          src={article.image_url} 
          alt={article.title}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover flex-shrink-0 group-hover:opacity-80 transition-opacity"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1 block">
            {article.category}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">
            <span>{formatDate(article.created_at)}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {article.views}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={article.image_url} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <span className="absolute top-4 left-4 px-2 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white rounded-lg">
          {article.category}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            <span className="flex items-center gap-1"><Clock size={14} /> {formatDate(article.created_at)}</span>
            <span className="flex items-center gap-1"><MessageSquare size={14} /> 12</span>
          </div>
          <button 
            onClick={toggleBookmark}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isBookmarked ? "text-red-600" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            )}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </Link>
  );
}
