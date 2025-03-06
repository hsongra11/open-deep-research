'use client';

import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from './error-boundary';
import { useState, useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use this to ensure we only render on the client
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Don't render anything until mounted on the client
  if (!isMounted) {
    return null;
  }
  
  return (
    <ErrorBoundary>
      <SessionProvider>{children}</SessionProvider>
    </ErrorBoundary>
  );
} 