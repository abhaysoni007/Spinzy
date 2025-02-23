import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export type UserProfile = {
  id: string;
  username: string;
  avatar_url?: string;
  total_games: number;
  total_dares: number;
  total_truths: number;
  created_at: string;
  updated_at: string;
};

// Helper function to ensure profile exists
export async function ensureProfileExists(userId: string, email?: string): Promise<UserProfile> {
  try {
    // First, try to get existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      return profile;
    }

    // If no profile exists, create one
    const username = email ? email.split('@')[0] : `user_${userId.slice(0, 8)}`;
    const newProfile = {
      id: userId,
      username,
      total_games: 0,
      total_dares: 0,
      total_truths: 0,
      updated_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile]);

    if (insertError) {
      throw insertError;
    }

    // Wait a moment for the database to process the insert
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fetch the newly created profile
    const { data: createdProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !createdProfile) {
      throw new Error('Failed to fetch created profile');
    }

    return createdProfile;
  } catch (error) {
    console.error('Error in ensureProfileExists:', error);
    throw error;
  }
}