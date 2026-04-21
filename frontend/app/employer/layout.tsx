'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollapsibleSidebar } from '@/components/navigation/collapsible-sidebar';
import { MobileEmployerSidebar } from '@/components/navigation/mobile-employer-sidebar';
import { Header } from '@/components/navigation/header';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
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
    if (parsedUser.role !== 'Employer') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <CollapsibleSidebar role="employer" />
      
      {/* Mobile Sidebar */}
      <MobileEmployerSidebar userName={user.name} userEmail={user.email} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Global Search & Notifications */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
