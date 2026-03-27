import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AdConfig } from '../types';
import AdminLayout from '../components/AdminLayout';
import { Save, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLACEMENTS = [
  { id: 'header', label: 'Header Block' },
  { id: 'home_body_1', label: 'Home Page Body Block 1' },
  { id: 'home_body_2', label: 'Home Page Body Block 2' },
  { id: 'home_body_3', label: 'Home Page Body Block 3' },
  { id: 'post_para_1', label: 'Post Page Paragraph 1' },
  { id: 'post_para_2', label: 'Post Page Paragraph 2' },
  { id: 'post_para_3', label: 'Post Page Paragraph 3' },
  { id: 'post_para_4', label: 'Post Page Paragraph 4' },
  { id: 'footer', label: 'Footer Block' },
];

export default function AdminAds() {
  const { isAdmin } = useAuth();
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState(PLACEMENTS[0].id);
  const [adCode, setAdCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('fetchAds error:', error);
        throw error;
      }
      setAds(data || []);
    } catch (error: any) {
      console.error('Error fetching ads:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();

    // Set up real-time subscription
    const channel = supabase
      .channel('admin:ads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => {
        fetchAds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adCode.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      // Use fetch directly to bypass the Supabase client auth pipeline hang
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${supabaseUrl}/rest/v1/ads?on_conflict=id`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'apikey': supabaseKey,
          // Use the logged-in user's JWT so RLS can validate admin access.
          'Authorization': `Bearer ${accessToken || supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({
          id: selectedPlacement,
          code: adCode.trim(),
          updated_at: new Date().toISOString(),
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      setMessage({ type: 'success', text: 'Ad block updated successfully!' });
      setAdCode('');
      fetchAds(); // non-blocking refresh
    } catch (error: any) {
      const msg = error?.name === 'AbortError'
        ? 'Request timed out. Supabase may be unreachable.'
        : error?.message || 'Unknown error';
      console.error('Save ad error:', msg);
      setMessage({ type: 'error', text: `Failed to save: ${msg}` });
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad block?')) return;
    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('delete error:', error);
        throw error;
      }
      await fetchAds();
    } catch (error: any) {
      console.error('Delete ad error:', error?.message || error);
      setMessage({ type: 'error', text: `Failed to delete: ${error?.message || 'Unknown error'}` });
    }
  };

  const handleEdit = (ad: AdConfig) => {
    setSelectedPlacement(ad.id);
    setAdCode(ad.code);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout title="Ad Management">
      <div className="max-w-4xl space-y-8">
        {/* Add/Edit Form */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Plus className="text-red-600" /> Configure Ad Block
          </h2>
          
          <form onSubmit={handleSave} className="space-y-6">
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

            <div>
              <label className="block text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">
                Ad Code (HTML/Script)
              </label>
              <textarea 
                value={adCode}
                onChange={(e) => setAdCode(e.target.value)}
                placeholder="Paste your Google Ad Manager or AdSense code here..."
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-red-600 outline-none min-h-[200px]"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Supports &lt;script&gt;, &lt;ins&gt;, &lt;div&gt; and other HTML tags.
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={saving || !adCode.trim()}
              className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20"
            >
              <Save size={20} />
              {saving ? 'Updating...' : 'Save Ad Block'}
            </button>
          </form>
        </section>

        {/* Existing Ads List */}
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-black mb-6">Active Ad Blocks</h2>
          
          {loading ? (
            <div className="py-10 text-center text-zinc-400">Loading ads...</div>
          ) : ads.length === 0 ? (
            <div className="py-10 text-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
              No ad blocks configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map(ad => {
                const placement = PLACEMENTS.find(p => p.id === ad.id);
                return (
                  <div key={ad.id} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-between group">
                    <div>
                      <h3 className="font-black text-zinc-900 dark:text-white">{placement?.label || ad.id}</h3>
                      <p className="text-xs text-zinc-500 font-mono truncate max-w-[300px] mt-1">{ad.code}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(ad)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ad.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
