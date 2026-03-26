import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import { Edit2, Trash2, Eye, ExternalLink, Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminArticles() {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchArticles = async () => {
    if (!isAdmin) return;
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching admin articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();

    const channel = supabase
      .channel('admin:articles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'articles' 
      }, () => {
        fetchArticles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setConfirmDelete(null);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const publishArticle = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'published' })
        .eq('id', articleId);
      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error publishing article:', error);
    }
  };

  const toggleStatus = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: newStatus })
        .eq('id', article.id);
      
      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('Error updating article status:', error);
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Manage Articles">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-zinc-400" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-600 outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Articles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={article.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{article.title}</p>
                        <p className="text-xs text-zinc-500">{article.author_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                        article.status === 'published'
                          ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                          : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                      )}>
                      {article.status === 'published' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      <Eye size={14} className="text-zinc-400" /> {article.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/article/${article.id}`} 
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        title="View Live"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <Link 
                        to={`/admin/articles/edit/${article.id}`} 
                        className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </Link>

                      {article.status === 'draft' && (
                        <button
                          onClick={() => publishArticle(article.id)}
                          className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900"
                          title="Publish"
                        >
                          Publish
                        </button>
                      )}

                      {confirmDelete === article.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                          <button 
                            onClick={() => handleDelete(article.id)}
                            className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setConfirmDelete(null)}
                            className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDelete(article.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredArticles.length === 0 && !loading && (
          <div className="p-20 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No articles found matching your criteria.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
