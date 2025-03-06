import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { LoginWall } from '@/components/login-wall';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DeepResearchView } from '@/components/deep-research-view';

import { auth } from '../(auth)/auth';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  const isLoggedIn = !!session?.user;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset>
          {isLoggedIn ? children : <LoginWall />}
        </SidebarInset>
        {isLoggedIn && <DeepResearchView />}
      </SidebarProvider>
    </>
  );
}
