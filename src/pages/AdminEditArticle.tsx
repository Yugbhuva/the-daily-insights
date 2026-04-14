import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import { Article } from '../types';
import { useAuth } from '../context/AuthContext';
import { Save, X, Image as ImageIcon, Tag, Layout, Upload, Loader2, Trash2, Zap, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

const categories = ['Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'World'];

export default function AdminEditArticle() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    content: '',
    excerpt: '',
    category: 'Politics',
    tags: [],
    image_url: '',
    status: 'draft',
    views: 0,
    likes_count: 0,
    is_breaking: false,
    is_trending: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [contentUploading, setContentUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contentUploadProgress, setContentUploadProgress] = useState(0);
  const [isImageUploadCancelled, setIsImageUploadCancelled] = useState(false);
  const [isContentUploadCancelled, setIsContentUploadCancelled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      const fetchArticle = async () => {
        try {
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          if (data) setFormData(data);
        } catch (error) {
          console.error('Error fetching article:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id]);

  const handleSaveArticle = async (targetStatus: 'draft' | 'published') => {
    if (!user) {
      setSaveMessage({ type: 'error', text: 'You must be logged in to save articles.' });
      return;
    }

    if (!formData.title?.trim() || !formData.content?.trim() || !formData.excerpt?.trim()) {
      setSaveMessage({ type: 'error', text: 'Title, excerpt, and content are all required.' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    // Strip label columns that don't exist in the DB schema yet.
    // ⚠️ To save is_breaking / is_trending, run in Supabase SQL editor first:
    //   alter table public.articles add column if not exists is_breaking boolean default false;
    //   alter table public.articles add column if not exists is_trending boolean default false;
    const { is_breaking: _ib, is_trending: _it, ...safeFormData } = formData;
    const articleData = {
      ...safeFormData,
      status: targetStatus,
      author_id: user.id,
      author_name: profile?.name || 'Admin',
      updated_at: new Date().toISOString(),
    };

    try {
      if (id) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([{ ...articleData, created_at: new Date().toISOString() }]);
        if (error) throw new Error(error.message);
      }

      // Navigate immediately — no alert() blocking the thread
      navigate('/admin/articles');
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error?.message || 'Unknown error. Check the browser console.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveArticle(formData.status === 'published' ? 'published' : 'draft');
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    console.log('Uploading file', { fileName, filePath, fileSize: file.size });

    // 20 second timeout — fail clearly instead of hanging forever
    const uploadPromise = supabase.storage
      .from('articles')
      .upload(filePath, file);

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(
        'Upload timed out. Please check: (1) the "articles" storage bucket exists in Supabase and is public, (2) you are signed in.'
      )), 20000)
    );

    const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (uploadError) {
      console.error('Supabase storage uploadError', uploadError);
      if (uploadError.message?.includes('Bucket not found') || uploadError.statusCode === '404') {
        throw new Error('Storage bucket "articles" not found. Please create it in Supabase Dashboard → Storage.');
      }
      if (uploadError.statusCode === '403' || uploadError.message?.includes('policy')) {
        throw new Error('Upload blocked by storage policy. Please sign out, sign back in, and try again.');
      }
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('articles')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Could not generate public URL after upload');
    }

    return data.publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file || !user) return;

    setIsImageUploadCancelled(false);
    setUploading(true);
    setUploadProgress(10);
    try {
      if (isImageUploadCancelled) throw new Error('Image upload cancelled');
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);
      setUploadProgress(40);

      // Smooth progress animation while upload happens
      let progress = 40;
      const ticker = setInterval(() => {
        progress = Math.min(progress + 2, 85);
        setUploadProgress(progress);
      }, 300);

      const url = await uploadFile(compressedFile, 'featured');
      clearInterval(ticker);
      if (!isImageUploadCancelled) {
        setUploadProgress(95);
        setFormData({ ...formData, image_url: url });
        setUploadProgress(100);
      }
    } catch (error: any) {
      if (error?.message === 'Image upload cancelled') {
        return;
      }
      console.error('Upload error:', error);
      setUploadProgress(0);
      setSaveMessage({ type: 'error', text: error?.message || 'Failed to upload image.' });
    } finally {
      if (!isImageUploadCancelled) setUploading(false);
      if (isImageUploadCancelled) {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const cancelImageUpload = () => {
    setIsImageUploadCancelled(true);
    setUploading(false);
    setUploadProgress(0);
  };

  const deleteFeaturedImage = async () => {
    setFormData({ ...formData, image_url: '' });
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file || !user) return;

    setIsContentUploadCancelled(false);
    setContentUploading(true);
    setContentUploadProgress(10);
    try {
      if (isContentUploadCancelled) throw new Error('Content upload cancelled');
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: true
      };

      const compressedFile = await imageCompression(file, options);
      setContentUploadProgress(40);
      setContentUploadProgress(60);

      const url = await uploadFile(compressedFile, 'content');
      if (!isContentUploadCancelled) {
        setContentUploadProgress(90);

        const markdownImage = `\n![${file.name}](${url})\n`;

        if (contentRef.current) {
          const textarea = contentRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const text = textarea.value;
          const before = text.substring(0, start);
          const after = text.substring(end);

          const newContent = before + markdownImage + after;
          setFormData({ ...formData, content: newContent });

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + markdownImage.length, start + markdownImage.length);
          }, 0);
        } else {
          setFormData({ ...formData, content: (formData.content || '') + markdownImage });
        }

        setContentUploadProgress(100);
      }
    } catch (error: any) {
      if (error?.message === 'Content upload cancelled') {
        return;
      }
      console.error('Content upload error:', error);
      setContentUploadProgress(0);
      setSaveMessage({ type: 'error', text: error?.message || 'Failed to upload content image.' });
    } finally {
      if (!isContentUploadCancelled) setContentUploading(false);
      if (isContentUploadCancelled) {
        setContentUploading(false);
        setContentUploadProgress(0);
      }
    }
  };

  const cancelContentUpload = () => {
    setIsContentUploadCancelled(true);
    setContentUploading(false);
    setContentUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleContentImageUpload(e);
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <AdminLayout title={id ? 'Edit Article' : 'Create New Article'}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Article Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter a compelling headline..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-2xl font-black bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Excerpt / Summary</label>
                <textarea 
                  required
                  placeholder="Brief summary for cards and search results..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none min-h-[100px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 block">Content (Markdown Supported)</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      {contentUploading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={14} />
                          <span>{Math.round(contentUploadProgress)}%</span>
                        </div>
                      ) : (
                        <><Upload size={14} /> <span>Insert Image</span></>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleContentImageUpload} disabled={contentUploading} />
                    </label>
                    {contentUploading && (
                      <button
                        type="button"
                        onClick={cancelContentUpload}
                        className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div 
                  className="relative"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <textarea 
                    ref={contentRef}
                    required
                    placeholder="Write your story here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={`w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none min-h-[400px] font-mono text-sm transition-all ${isDragging ? 'ring-4 ring-red-600/20 bg-red-50/10' : ''}`}
                  />
                  {isDragging && (
                    <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[2px] rounded-xl flex items-center justify-center border-2 border-dashed border-red-600 pointer-events-none">
                      <div className="bg-white dark:bg-zinc-900 px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
                        <Upload className="text-red-600 animate-bounce" size={20} />
                        <span className="font-black text-sm text-zinc-900 dark:text-white">Drop to upload image</span>
                      </div>
                    </div>
                  )}
                  {contentUploading && (
                    <div className="absolute bottom-4 left-4 right-4 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 transition-all duration-300" 
                        style={{ width: `${contentUploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Layout size={18} className="text-red-600" /> Publishing
            </h3>
            
            <div className="space-y-6">
              {id && (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Breaking News & Trending toggles */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 block">Labels</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_breaking: !formData.is_breaking })}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-black text-sm transition-all ${
                      formData.is_breaking
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                    }`}
                  >
                    <Zap size={16} className={formData.is_breaking ? 'fill-current' : ''} />
                    Breaking News
                    {formData.is_breaking && (
                      <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">ON</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_trending: !formData.is_trending })}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-black text-sm transition-all ${
                      formData.is_trending
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500'
                    }`}
                  >
                    <TrendingUp size={16} />
                    Trending Now
                    {formData.is_trending && (
                      <span className="ml-auto text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">ON</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                {/* Inline save message — no alert() popups */}
                {saveMessage && (
                  <div className={`flex items-start gap-2 p-3 rounded-xl text-sm font-bold ${
                    saveMessage.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                  }`}>
                    {saveMessage.type === 'success'
                      ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                      : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                    <span>{saveMessage.text}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => handleSaveArticle('draft')}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 font-black rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSaveArticle('published')}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {saving ? 'Saving...' : 'Publish'}
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => navigate('/admin/articles')}
                  className="w-full flex items-center justify-center px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <X size={20} /> Cancel
                </button>
              </div>

            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <ImageIcon size={18} className="text-red-600" /> Media
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Featured Image</label>
                <div className="flex flex-col gap-4">
                  <div 
                    className={`relative group border-2 border-dashed rounded-xl transition-all ${uploading ? 'border-red-600 bg-red-50/5' : 'border-transparent'}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleImageUpload(e); }}
                  >
                    <input 
                      type="url" 
                      placeholder="Paste image URL or drag image here... (optional)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <label className="p-2 bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg shadow-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors">
                        {uploading ? (
                          <div className="flex items-center gap-1">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                          </div>
                        ) : <Upload size={16} />}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                      {uploading && (
                        <button
                          type="button"
                          onClick={cancelImageUpload}
                          className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md text-xs font-bold hover:bg-zinc-300 dark:hover:bg-zinc-600"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {uploading && (
                      <div className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-600 transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {formData.image_url && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <button 
                        type="button"
                        onClick={deleteFeaturedImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <Tag size={18} className="text-red-600" /> Tags
            </h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-600 outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-bold">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </form>
    </AdminLayout>
  );
}
