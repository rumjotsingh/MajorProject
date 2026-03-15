import Link from 'next/link'
import { Award, Shield, Users, TrendingUp, Target, Heart, Zap } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Container } from '@/components/container'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <main className="pt-32 pb-24">
        <Container>
          {/* Hero */}
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h1 className="text-6xl sm:text-7xl font-semibold text-black dark:text-white mb-8 leading-tight tracking-tight">
              Building the future of credentials.
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
              CredMatrix is a unified platform for managing, verifying, and showcasing 
              micro-credentials from institutions worldwide.
            </p>
          </div>

          {/* Mission */}
          <div className="max-w-5xl mx-auto mb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                  <Target className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Our Mission
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Empower learners with a unified, verified digital credential portfolio.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Our Values
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Trust, transparency, and security in every credential verification.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Our Vision
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  A world where credentials are instantly verifiable and universally recognized.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="max-w-5xl mx-auto mb-32 py-20 border-y border-slate-200 dark:border-slate-900">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              <div>
                <div className="text-5xl font-semibold text-black dark:text-white mb-2">50K+</div>
                <div className="text-slate-600 dark:text-slate-400">Active learners</div>
              </div>
              <div>
                <div className="text-5xl font-semibold text-black dark:text-white mb-2">100K+</div>
                <div className="text-slate-600 dark:text-slate-400">Verified credentials</div>
              </div>
              <div>
                <div className="text-5xl font-semibold text-black dark:text-white mb-2">500+</div>
                <div className="text-slate-600 dark:text-slate-400">Partner institutes</div>
              </div>
              <div>
                <div className="text-5xl font-semibold text-black dark:text-white mb-2">99.9%</div>
                <div className="text-slate-600 dark:text-slate-400">Verification rate</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-semibold text-black dark:text-white mb-16 text-center">
              What makes us different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Award className="w-10 h-10 text-black dark:text-white" />
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Unified Portfolio
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  All your credentials from multiple institutions in one place. No more scattered certificates.
                </p>
              </div>

              <div className="space-y-4">
                <Shield className="w-10 h-10 text-black dark:text-white" />
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Blockchain Verified
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tamper-proof records backed by blockchain technology that employers can trust instantly.
                </p>
              </div>

              <div className="space-y-4">
                <TrendingUp className="w-10 h-10 text-black dark:text-white" />
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  NSQ Aligned
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track your progress with National Skills Qualifications framework alignment.
                </p>
              </div>

              <div className="space-y-4">
                <Users className="w-10 h-10 text-black dark:text-white" />
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Global Network
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connect with employers and institutions worldwide through standardized credentials.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
