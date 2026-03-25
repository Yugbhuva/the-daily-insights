import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { Comment } from '../types';
import { Trash2, MessageSquare, User, ExternalLink, XCircle } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminComments() {
  const { isAdmin } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!isAdmin) return;
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Set up real-time subscription
    const channel = supabase
      .channel('admin:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <AdminLayout title="Moderate Comments">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Article</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={comment.user_avatar || `https://ui-avatars.com/api/?name=${comment.user_name}`} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{comment.user_name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{comment.user_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-md italic">"{comment.content}"</p>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/article/${comment.article_id}`} className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                      View Article <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {formatDate(comment.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {confirmDelete === comment.id ? (
                      <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                        <button 
                          onClick={() => handleDelete(comment.id)}
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
                        onClick={() => setConfirmDelete(comment.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {comments.length === 0 && !loading && (
          <div className="p-20 text-center">
            <MessageSquare size={48} className="mx-auto text-zinc-100 dark:text-zinc-800 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">No comments to moderate.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
