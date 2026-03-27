import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, LayoutDashboard, Bookmark, Sun, Moon, ChevronDown, TrendingUp, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import AdBlock from './AdBlock';

const categories = [
  'Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'World'
];

const trendingTopics = [
  '#GlobalEconomy', '#AIRevolution', '#ClimateAction', '#TechNews', '#HealthTips'
];

export default function Navbar({ isDarkMode, setIsDarkMode }: { isDarkMode: boolean; setIsDarkMode: (val: boolean) => void }) {
  const { user, profile, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentUrl
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error (forcing manual clear):", error);
    } finally {
      // Force clear all Supabase auth tokens from localStorage regardless of lock state
      Object.keys(localStorage)
        .filter(key => key.startsWith('sb-'))
        .forEach(key => localStorage.removeItem(key));
      // Hard reload so auth state resets cleanly
      window.location.href = '/';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      <AdBlock placement="header" className="container mx-auto px-4 py-2 border-b border-zinc-100 dark:border-zinc-900" />
      {/* Top Bar */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg lg:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
            THE DAILY INSIGHTS<span className="text-red-600">.</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {categories.slice(0, 5).map((cat) => (
            <Link 
              key={cat}
              to={`/category/${cat.toLowerCase()}`}
              className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors"
            >
              {cat}
            </Link>
          ))}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors">
              More <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {categories.slice(5).map((cat) => (
                  <Link 
                    key={cat}
                    to={`/category/${cat.toLowerCase()}`}
                    className="block px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400"
          >
            <Search size={20} />
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link
            to="/"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-600 dark:text-zinc-400"
            title="Home"
          >
            <Home size={20} />
          </Link>
          
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 pl-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
                <span className="hidden sm:inline text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {profile?.name?.split(' ')[0]}
                </span>
                <img 
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.name}`} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                      <LayoutDashboard size={16} /> Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/bookmarks" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                    <Bookmark size={16} /> Bookmarks
                  </Link>
                  <hr className="my-2 border-zinc-200 dark:border-zinc-800" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-zinc-950 flex items-center px-4 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto flex items-center gap-4">
            <Search className="text-zinc-400" size={24} />
            <form onSubmit={handleSearch} className="flex-1">
              <input 
                autoFocus
                type="text" 
                placeholder="Search for articles, topics, or authors..."
                className="w-full bg-transparent border-none text-xl font-bold focus:ring-0 placeholder:text-zinc-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-sm h-full border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
            <div className="container mx-auto p-8">
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Categories</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {categories.map((cat) => (
                      <Link 
                        key={cat}
                        to={`/category/${cat.toLowerCase()}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-lg font-bold hover:text-red-600 transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Trending
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic) => (
                      <Link 
                        key={topic}
                        to={`/search?q=${encodeURIComponent(topic)}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
                      >
                        {topic}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
}
