'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Award,
  FileText,
  CreditCard,
  ArrowUpRight,
  CheckCircle,
  Clock,
  RefreshCcw,
  Shield,
  Sparkles,
  Activity,
} from 'lucide-react';
import adminApi from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  users: {
    total: number;
    learners: number;
    employers: number;
    issuers: number;
  };
  credentials: {
    total: number;
    verified: number;
    pending: number;
  };
  blogs: {
    total: number;
    published: number;
  };
  issuers: {
    pending: number;
    approved: number;
  };
}

const emptyStats: DashboardStats = {
  users: { total: 0, learners: 0, employers: 0, issuers: 0 },
  credentials: { total: 0, verified: 0, pending: 0 },
  blogs: { total: 0, published: 0 },
  issuers: { pending: 0, approved: 0 },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await adminApi.getStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (loadError) {
      console.error('Error fetching admin dashboard stats:', loadError);
      setError('Unable to load dashboard statistics right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => {
      loadStats(true);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const health = useMemo(() => {
    const verifiedRate = percent(stats.credentials.verified, stats.credentials.total);
    const issuerApprovalRate = percent(stats.issuers.approved, stats.issuers.approved + stats.issuers.pending);
    const blogPublishRate = percent(stats.blogs.published, stats.blogs.total);

    return [
      {
        label: 'Credential Verification',
        value: verifiedRate,
        detail: `${stats.credentials.verified} of ${stats.credentials.total} verified`,
      },
      {
        label: 'Issuer Approval',
        value: issuerApprovalRate,
        detail: `${stats.issuers.approved} approved, ${stats.issuers.pending} pending`,
      },
      {
        label: 'Blog Publishing',
        value: blogPublishRate,
        detail: `${stats.blogs.published} of ${stats.blogs.total} published`,
      },
    ];
  }, [stats]);

  const quickActions = [
    {
      title: 'Users',
      description: 'Manage learners and role distribution',
      icon: Users,
      href: '/admin/users',
      iconClass: 'text-sky-500',
      bgClass: 'bg-sky-500/10',
    },
    {
      title: 'Issuers',
      description: 'Approve and review institutions',
      icon: Building2,
      href: '/admin/issuers',
      iconClass: 'text-indigo-500',
      bgClass: 'bg-indigo-500/10',
    },
    {
      title: 'Credentials',
      description: 'Review pending verification requests',
      icon: Award,
      href: '/admin/credentials',
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
    },
    {
      title: 'Employers',
      description: 'Verify and maintain employer records',
      icon: Shield,
      href: '/admin/employers',
      iconClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
    },
    {
      title: 'Subscriptions',
      description: 'Track plans and revenue operations',
      icon: CreditCard,
      href: '/admin/subscriptions',
      iconClass: 'text-pink-500',
      bgClass: 'bg-pink-500/10',
    },
    {
      title: 'Blog CMS',
      description: 'Publish and manage platform content',
      icon: FileText,
      href: '/admin/blog',
      iconClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
    },
  ];

  const topCards = [
    {
      title: 'Total Users',
      value: formatCount(stats.users.total),
      subtitle: `${stats.users.learners} learners • ${stats.users.employers} employers`,
      icon: Users,
      iconClass: 'text-sky-500',
      bgClass: 'bg-sky-500/10',
    },
    {
      title: 'Credentials',
      value: formatCount(stats.credentials.total),
      subtitle: `${stats.credentials.pending} pending review`,
      icon: Award,
      iconClass: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10',
    },
    {
      title: 'Approved Issuers',
      value: formatCount(stats.issuers.approved),
      subtitle: `${stats.issuers.pending} waiting approval`,
      icon: Building2,
      iconClass: 'text-indigo-500',
      bgClass: 'bg-indigo-500/10',
    },
    {
      title: 'Published Blogs',
      value: formatCount(stats.blogs.published),
      subtitle: `${Math.max(stats.blogs.total - stats.blogs.published, 0)} drafts left`,
      icon: FileText,
      iconClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-5 md:p-8">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-4">
            <Skeleton className="h-9 w-52 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-7 w-24 rounded-lg" />
                <Skeleton className="h-4 w-36 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6 p-5 md:p-8">
      <motion.div custom={0} variants={fadeUp}>
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/10 via-cyan-500/10 to-emerald-500/10">
          <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
          <CardContent className="relative p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="rounded-full border border-primary/20 bg-background/80">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  System Overview
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Command Center</h1>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Real-time status of users, credentials, issuers, and content. Keep operations healthy with one view.
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Not available'}
                </p>
              </div>
              <Button
                onClick={() => loadStats(true)}
                variant="outline"
                className="rounded-full bg-background/80"
                disabled={refreshing}
              >
                <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {error && (
        <motion.div custom={1} variants={fadeUp}>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="destructive" size="sm" onClick={() => loadStats(true)}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} custom={index + 2} variants={fadeUp}>
              <Card className="hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl ${card.bgClass} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${card.iconClass}`} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{card.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <motion.div custom={7} variants={fadeUp} className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Platform Health
              </CardTitle>
              <CardDescription>Operational completion rates based on current data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {health.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500" style={{ width: `${item.value}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={8} variants={fadeUp} className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Breakdown</CardTitle>
              <CardDescription>Current distribution across critical admin queues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Credential Queue</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Verified</span>
                  <span className="font-semibold">{stats.credentials.verified}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-500" /> Pending</span>
                  <span className="font-semibold">{stats.credentials.pending}</span>
                </div>
              </div>
              <div className="rounded-xl border p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">User Roles</p>
                <div className="text-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>Learners</span>
                    <span className="font-semibold">{stats.users.learners}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Employers</span>
                    <span className="font-semibold">{stats.users.employers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Issuers</span>
                    <span className="font-semibold">{stats.users.issuers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div custom={9} variants={fadeUp}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Open key admin workstreams.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} className="group rounded-xl border p-4 transition-all hover:border-primary/20 hover:bg-muted/40">
                    <div className="flex items-center justify-between">
                      <div className={`h-9 w-9 rounded-lg ${action.bgClass} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${action.iconClass}`} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-semibold mt-3">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
