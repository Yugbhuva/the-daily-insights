import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { Shield, User, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);



  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel('admin:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);



  return (
    <AdminLayout title="User Management">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.name}`} alt="" className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Mail size={14} className="text-zinc-400" /> {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                      u.role === 'admin' 
                        ? "bg-red-50 dark:bg-red-900/20 text-red-600" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                    )}>
                      {u.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-400" /> {formatDate(u.created_at)}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
