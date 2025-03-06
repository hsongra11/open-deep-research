'use client';

import { AuthProvider } from '@/components/auth-provider';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
} 