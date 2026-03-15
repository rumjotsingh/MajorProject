import Link from 'next/link'
import { Container } from './container'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 dark:bg-slate-950">
      <Container>
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-4">Account</h3>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">Sign in</Link></li>
                <li><Link href="/register" className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-black dark:text-white mb-4">CredMatrix</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your trusted platform for digital credentials.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black dark:bg-white rounded-md flex items-center justify-center">
                <span className="text-white dark:text-black font-semibold text-xs">CM</span>
              </div>
              <span className="text-sm font-medium text-black dark:text-white">CredMatrix</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              © {currentYear} CredMatrix. All rights reserved.
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
