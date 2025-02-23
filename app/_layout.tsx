import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase, ensureProfileExists } from './utils/supabase';
import { router } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !window.location.pathname.includes('/auth/')) {
        router.replace('/auth/sign-in');
      } else if (session) {
        // Ensure profile exists
        ensureProfileExists(session.user.id, session.user.email)
          .catch(() => {
            // If profile creation fails, sign out
            supabase.auth.signOut().then(() => {
              router.replace('/auth/sign-in');
            });
          });
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_OUT' || !session) && !window.location.pathname.includes('/auth/')) {
        router.replace('/auth/sign-in');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!session) return;
        
        try {
          await ensureProfileExists(session.user.id, session.user.email);
          if (window.location.pathname.includes('/auth/')) {
            router.replace('/(tabs)');
          }
        } catch (error) {
          // If profile creation fails, sign out
          await supabase.auth.signOut();
          router.replace('/auth/sign-in');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game/[mode]" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}