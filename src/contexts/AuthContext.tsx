import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
    updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Supabase is not configured, skip auth check and allow demo mode
        if (!isSupabaseConfigured) {
            console.log('Running in demo mode - Supabase not configured');
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        }).catch((error) => {
            console.error('Error getting session:', error);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            console.error('Error signing in with Google:', error.message);
            throw error;
        }
    }, []);

    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `https://spendr-ecru.vercel.app/auth/callback`,
            },
        });

        if (error) {
            return { error: error.message, needsConfirmation: false };
        }

        // Check if email confirmation is required
        // If user exists but identities is empty, confirmation is needed
        const needsConfirmation = data.user && data.user.identities?.length === 0
            ? false  // User already exists
            : !data.session; // No session means confirmation is needed

        return { error: null, needsConfirmation };
    }, []);

    const signInWithEmail = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error: error.message };
        }

        return { error: null };
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
            throw error;
        }
    }, []);

    const updateProfile = useCallback(async (data: { full_name?: string; avatar_url?: string }) => {
        const { error } = await supabase.auth.updateUser({
            data: data,
        });

        if (error) {
            return { error: error.message };
        }

        // Refresh the user data
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        if (updatedUser) {
            setUser(updatedUser);
        }

        return { error: null };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                signInWithGoogle,
                signUpWithEmail,
                signInWithEmail,
                updateProfile,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

