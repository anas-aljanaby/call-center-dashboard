'use client';

import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthComponent from './components/Auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        router.push('/analyze');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        router.push('/analyze');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  // Only show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Call Center Dashboard
          </h1>
          <AuthComponent />
        </div>
      </div>
    );
  }

  // This will only show briefly during redirect
  return <div>Redirecting...</div>;
}
