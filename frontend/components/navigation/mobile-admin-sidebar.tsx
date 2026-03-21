'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  CheckSquare,
  Briefcase,
  Award,
  Crown,
  FileCheck,
  Mail,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Layers,
} from 'lucide-react';

const adminNav = [
  { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: User, label: 'Users', href: '/admin/users' },
  { icon: CheckSquare, label: 'Issuers', href: '/admin/issuers' },
  { icon: Briefcase, label: 'Employers', href: '/admin/employers' },
  { icon: Award, label: 'Credentials', href: '/admin/credentials' },
  { icon: Crown, label: 'Subscriptions', href: '/admin/subscriptions' },
  { icon: FileCheck, label: 'Blog', href: '/admin/blog' },
  { icon: Mail, label: 'Contacts', href: '/admin/contacts' },
  { icon: Layers, label: 'NSQF', href: '/admin/nsqf' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface MobileAdminSidebarProps {
  userName?: string;
  userEmail?: string;
}

export function MobileAdminSidebar({ userName = 'Admin', userEmail = 'admin@example.com' }: MobileAdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Close sidebar when route changes
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Load unread notifications count
    const loadUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.filter((n: any) => !n.read).length);
        }
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };
    loadUnreadCount();
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      {/* Hamburger Button - Fixed Top Left */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Slides from Left */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-purple-600">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg">
                  Cred<span className="text-primary">Matrix</span>
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(userName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isNotifications = item.label === 'Notifications';

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {isNotifications && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span>{item.label}</span>
                      {isNotifications && unreadCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
