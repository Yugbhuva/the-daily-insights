import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Article } from '../types';
import { User, Mail, Calendar, Shield, Settings, Bell, ShieldCheck, Bookmark, ExternalLink } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NewsCard from '../components/NewsCard';

type Tab = 'profile' | 'saved';

export default function Profile() {
  const { profile, user, bookmarks } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'saved' || !bookmarks.length) {
      if (activeTab === 'saved' && !bookmarks.length) setSavedArticles([]);
      return;
    }
    const fetchSaved = async () => {
      setSavedLoading(true);
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .in('id', bookmarks)
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        if (!error) setSavedArticles(data || []);
      } finally {
        setSavedLoading(false);
      }
    };
    fetchSaved();
  }, [activeTab, bookmarks]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <SEO title="Profile" description="View and manage your profile on The Daily Insights." />
        <p className="text-zinc-500">Please login to view your profile.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as Tab, icon: User,     label: 'Profile Info' },
    { id: 'saved'   as Tab, icon: Bookmark, label: 'Saved Articles', count: bookmarks.length },
    { id: 'notify'  as Tab, icon: Bell,     label: 'Notifications' },
    { id: 'security'as Tab, icon: Shield,   label: 'Security' },
    { id: 'prefs'   as Tab, icon: Settings, label: 'Preferences' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title={`${profile?.name || 'Profile'}`} description="Manage your account settings and preferences on The Daily Insights." />
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4">Account Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your profile and preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <item.icon size={20} />
                <span className="flex-1 text-left">{item.label}</span>
                {'count' in item && item.count > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white dark:text-zinc-900 dark:bg-zinc-900/20'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">

            {/* ── Profile Info ── */}
            {activeTab === 'profile' && (
              <>
                <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-6 mb-10">
                    <img
                      src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name}`}
                      alt="Avatar"
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-zinc-50 dark:border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{profile?.name}</h2>
                      <p className="text-zinc-500 flex items-center gap-2 mt-1">
                        <Mail size={14} /> {profile?.email}
                      </p>
                      {profile?.role === 'admin' && (
                        <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          <ShieldCheck size={12} /> Administrator
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Display Name</label>
                      <p className="text-zinc-900 dark:text-white font-bold">{profile?.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Email Address</label>
                      <p className="text-zinc-900 dark:text-white font-bold">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Member Since</label>
                      <p className="text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                        <Calendar size={16} className="text-zinc-400" /> {formatDate(profile?.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">User ID</label>
                      <p className="text-zinc-400 font-mono text-xs truncate">{profile?.id}</p>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-zinc-50 dark:border-zinc-800">
                    <button className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all">
                      Edit Profile
                    </button>
                  </div>
                </section>

                <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/20">
                  <h3 className="text-red-600 font-black mb-2">Danger Zone</h3>
                  <p className="text-red-600/70 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-6 py-2 border-2 border-red-600 text-red-600 font-black rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    Delete Account
                  </button>
                </section>
              </>
            )}

            {/* ── Saved Articles ── */}
            {activeTab === 'saved' && (
              <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <Bookmark className="text-red-600" size={24} />
                  <h2 className="text-2xl font-black">Saved Articles</h2>
                  {bookmarks.length > 0 && (
                    <span className="ml-auto text-xs font-black uppercase tracking-widest px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full">
                      {bookmarks.length} saved
                    </span>
                  )}
                </div>

                {savedLoading ? (
                  <div className="py-16 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600" />
                  </div>
                ) : savedArticles.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                    <Bookmark size={40} className="text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <p className="font-black text-zinc-500 text-lg">No saved articles yet.</p>
                    <p className="text-zinc-400 text-sm mt-2">Hit the <strong>Save</strong> button on any article to bookmark it here.</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Browse Articles <ExternalLink size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedArticles.map(article => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ── Other tabs (placeholder) ── */}
            {(activeTab === 'notify' || activeTab === 'security' || activeTab === 'prefs') && (
              <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="py-16 text-center">
                  <p className="text-zinc-400 font-bold">This section is coming soon.</p>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
