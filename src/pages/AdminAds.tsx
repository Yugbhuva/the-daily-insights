import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdConfig } from '../types';
import AdminLayout from '../components/AdminLayout';
import { Save, Trash2, Plus, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLACEMENTS = [
  { id: 'header',      label: 'Header Block' },
  { id: 'home_body_1', label: 'Home Page Body Block 1' },
  { id: 'home_body_2', label: 'Home Page Body Block 2' },
  { id: 'home_body_3', label: 'Home Page Body Block 3' },
  { id: 'post_para_1', label: 'Post Page Paragraph 1' },
  { id: 'post_para_2', label: 'Post Page Paragraph 2' },
  { id: 'post_para_3', label: 'Post Page Paragraph 3' },
  { id: 'post_para_4', label: 'Post Page Paragraph 4' },
  { id: 'footer',      label: 'Footer Block' },
];

export default function AdminAds() {
  const { isAdmin } = useAuth();

  const [ads, setAds] = useState<AdConfig[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState(PLACEMENTS[0].id);
  const [adCode, setAdCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ─── Fetch ───────────────────────────────────────────────────
  const fetchAds = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (err: any) {
      console.error('fetchAds error:', err);
      setFetchError(err?.message || 'Failed to load ads. Check your Supabase table and RLS policies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();

    const channel = supabase
      .channel('admin:ads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, fetchAds)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Save / Upsert ───────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adCode.trim()) return;
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Admin access required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const payload: AdConfig = {
        id: selectedPlacement,
        code: adCode.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ads')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      setMessage({ type: 'success', text: `Ad block "${PLACEMENTS.find(p => p.id === selectedPlacement)?.label}" saved!` });
      setAdCode('');
      setSelectedPlacement(PLACEMENTS[0].id);
      fetchAds();
    } catch (err: any) {
      console.error('handleSave error:', err);
      const msg = err?.message || 'Unknown error';
      // Friendly hint for common Supabase errors
      const hint = msg.includes('relation "ads" does not exist')
        ? ' — The "ads" table is missing. Run the SQL setup in Supabase.'
        : msg.includes('new row violates row-level security')
        ? ' — RLS policy blocking write. Add INSERT/UPDATE policy for admins.'
        : '';
      setMessage({ type: 'error', text: `Failed to save: ${msg}${hint}` });
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this ad block?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id);
      if (error) throw error;
      setAds(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('handleDelete error:', err);
      setMessage({ type: 'error', text: `Failed to delete: ${err?.message || 'Unknown error'}` });
    } finally {
      setDeletingId(null);
    }
  };

  // ─── UI ──────────────────────────────────────────────────────
  return (
    <AdminLayout title="Ad Management">
      <div className="max-w-4xl space-y-8">

        {/* ── Add / Edit Form ── */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Plus className="text-red-600" /> Add New Ad Block
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Placement selector — locked when editing */}
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">
                Placement Location
              </label>
              <select
                value={selectedPlacement}
                onChange={(e) => setSelectedPlacement(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none"
              >
                {PLACEMENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Ad code textarea */}
            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">
                Ad Code (HTML / Script)
              </label>
              <textarea
                value={adCode}
                onChange={(e) => setAdCode(e.target.value)}
                placeholder="Paste your Google AdSense or Ad Manager code here..."
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-red-600 outline-none min-h-[200px] resize-y"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Supports &lt;script&gt;, &lt;ins&gt;, &lt;div&gt; and any HTML tags.
              </p>
            </div>

            {/* Message banner */}
            {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-bold ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-900/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Buttons */}
            <button
              type="submit"
              disabled={saving || !adCode.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Ad Block'}
            </button>
          </form>
        </section>

        {/* ── Active Ads List ── */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black">Active Ad Blocks</h2>
            <button
              onClick={fetchAds}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Fetch error */}
          {fetchError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-3 text-sm text-red-600 dark:text-red-400 font-bold">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p>{fetchError}</p>
                <p className="mt-1 text-xs font-normal text-red-500">
                  Make sure the <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">ads</code> table exists in Supabase and has proper RLS SELECT policy.
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center text-zinc-400 flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin" /> Loading ads...
            </div>
          ) : !fetchError && ads.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
              <p className="text-zinc-500 font-bold">No ad blocks configured yet.</p>
              <p className="text-zinc-400 text-sm mt-1">Use the form above to add your first ad block.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ads.map(ad => {
                const placement = PLACEMENTS.find(p => p.id === ad.id);
                return (
                  <div
                    key={ad.id}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-black text-zinc-900 dark:text-white text-sm">
                          {placement?.label || ad.id}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono truncate max-w-[400px] mt-1">
                          {ad.code.substring(0, 80)}{ad.code.length > 80 ? '…' : ''}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          Updated: {new Date(ad.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        disabled={deletingId === ad.id}
                        className="p-2 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-40 shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={16} className={deletingId === ad.id ? 'animate-pulse' : ''} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Supabase Setup Hint ── */}
        <section className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3">
            Supabase Table Setup
          </h3>
          <p className="text-xs text-zinc-500 mb-3">
            If ads are not saving, run this SQL in your Supabase SQL editor to create the table and RLS policies:
          </p>
          <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl overflow-x-auto text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{`-- 1. Create ads table
create table if not exists public.ads (
  id          text primary key,
  code        text not null default '',
  updated_at  timestamptz not null default now()
);

-- 2. Enable RLS
alter table public.ads enable row level security;

-- 3. Everyone can read ads (needed for frontend rendering)
create policy "ads: public read"
  on public.ads for select
  using (true);

-- 4. Only admins can write (insert / update / delete)
create policy "ads: admin write"
  on public.ads for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );`}</pre>
        </section>

      </div>
    </AdminLayout>
  );
}
