'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CollapsibleSidebar } from '@/components/navigation/collapsible-sidebar';
import { MobileAdminSidebar } from '@/components/navigation/mobile-admin-sidebar';

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
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <CollapsibleSidebar role="admin" />
      
      {/* Mobile Sidebar - Only visible on mobile */}
      <MobileAdminSidebar userName={user.name} userEmail={user.email} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Add top padding on mobile to account for hamburger button */}
        <div className="md:pt-0 pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
