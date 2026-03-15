import Link from 'next/link'
import { Award, Shield, TrendingUp, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Container } from '@/components/container'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Navbar />

      {/* Hero Section - Apple Style */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <Container className="relative py-32 text-center">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-semibold text-black dark:text-white mb-8 leading-[1.05] tracking-tight">
            Your credentials.
            <br />
            All in one place.
          </h1>

          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-normal">
            A unified digital wallet for all your micro-credentials. 
            Verified, secure, and ready to share.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link href="/register">
              <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 text-base px-8 h-12 rounded-full font-medium">
                Get started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="lg" className="text-base px-8 h-12 rounded-full font-medium text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-900">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <div className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Free forever
            </div>
            <div className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Instant verification
            </div>
            <div className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              NSQ aligned
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section - Minimal */}
      <section className="py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                  <Award className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Unified Portfolio
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  All your credentials from multiple institutions in one comprehensive digital portfolio.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  Verified & Secure
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Blockchain-backed authenticity ensures tamper-proof records employers can trust.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">
                  NSQ Pathways
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track your learning journey aligned with National Skills Qualifications framework.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section - Clean */}
      <section className="py-32 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-900">
        <Container>
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              <div>
                <div className="text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-2">
                  50K+
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-lg">
                  Active learners
                </div>
              </div>
              <div>
                <div className="text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-2">
                  100K+
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-lg">
                  Verified credentials
                </div>
              </div>
              <div>
                <div className="text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-2">
                  500+
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-lg">
                  Partner institutes
                </div>
              </div>
              <div>
                <div className="text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-2">
                  99.9%
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-lg">
                  Verification rate
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
        <Container className="max-w-4xl text-center">
          <h2 className="text-5xl lg:text-6xl font-semibold text-black dark:text-white mb-8 leading-tight">
            Ready to get started?
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Create your free account and start building your verified credential portfolio today.
          </p>
          
          <Link href="/register">
            <Button size="lg" className="bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 text-base px-10 h-12 rounded-full font-medium group">
              Create free account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </Container>
      </section>

      <Footer />
    </div>
  )
}
