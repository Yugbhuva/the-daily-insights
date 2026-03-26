import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  bookmarks: string[];
  loading: boolean;
  isAdmin: boolean;
  refreshBookmarks: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  bookmarks: [],
  loading: true,
  isAdmin: false,
  refreshBookmarks: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ADMIN_EMAIL = 'ybhuva817@gmail.com';
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', userId);
    
    if (!error && data) {
      setBookmarks(data.map(b => b.article_id));
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id, currentUser.email || undefined);
        fetchBookmarks(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id, currentUser.email || undefined);
        await fetchBookmarks(currentUser.id);
      } else {
        setProfile(null);
        setBookmarks([]);
        setLoading(false);
      }
    });

    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout reached, continuing without auth');
      setLoading(false);
    }, 20000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const refreshBookmarks = async () => {
    if (user) {
      await fetchBookmarks(user.id);
    }
  };

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && (error.code === 'PGRST116' || error.details?.includes('No rows found'))) {
        // Profile doesn't exist, create it
        const { data: userData } = await supabase.auth.getUser();
        const signedInUser = userData.user;

        const newProfile = {
          id: userId,
          email: signedInUser?.email || userEmail || '',
          name: signedInUser?.user_metadata?.full_name || 'Anonymous',
          avatar_url: signedInUser?.user_metadata?.avatar_url || '',
          role: (signedInUser?.email || userEmail) === ADMIN_EMAIL ? 'admin' : 'user',
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      } else if (error) {
        throw error;
      } else {
        if ((userEmail || user?.email) === ADMIN_EMAIL && data.role !== 'admin') {
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
            .select()
            .single();

          if (!updateError) {
            setProfile(updatedProfile);
          } else {
            setProfile(data);
          }
        } else {
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    bookmarks,
    loading,
    isAdmin: profile?.role === 'admin' || (user?.email === ADMIN_EMAIL),
    refreshBookmarks,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
