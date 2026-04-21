'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollapsibleSidebar } from '@/components/navigation/collapsible-sidebar';
import { MobileAdminSidebar } from '@/components/navigation/mobile-admin-sidebar';
import { Header } from '@/components/navigation/header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop Sidebar - Hidden on mobile */}
      <CollapsibleSidebar role="admin" />
      
      {/* Mobile Sidebar - Only visible on mobile */}
      <MobileAdminSidebar userName={user.name} userEmail={user.email} />
      
      {/* Main Content with Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
