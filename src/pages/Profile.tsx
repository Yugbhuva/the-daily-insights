import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield, Settings, Bell, ShieldCheck } from 'lucide-react';
import { formatDate } from '../lib/utils';
import SEO from '../components/SEO';

export default function Profile() {
  const { profile, user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <SEO title="Profile" description="View and manage your profile on The Daily Insights." />
        <p className="text-zinc-500">Please login to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <SEO title={`${profile?.name || 'Profile'}`} description="Manage your account settings and preferences on The Daily Insights." />
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4">Account Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage your profile and preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-2">
            {[
              { icon: User, label: 'Profile Info', active: true },
              { icon: Bell, label: 'Notifications', active: false },
              { icon: Shield, label: 'Security', active: false },
              { icon: Settings, label: 'Preferences', active: false },
            ].map((item) => (
              <button 
                key={item.label}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  item.active 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg' 
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}
