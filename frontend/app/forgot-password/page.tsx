'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    toast.success('Email sent!', {
      description: 'Check your inbox for password reset instructions'
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 relative pb-32 md:pb-4">
      <div className="absolute inset-0 pattern-dots opacity-30" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">MC</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-slate-800 dark:text-white">Micro</span>
              <span className="text-gradient">Cred</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-xl rounded-3xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-center">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-center">
              {submitted ? 'Check your email' : 'Enter your email to reset your password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    We&apos;ve sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Didn&apos;t receive the email? Check your spam folder or try again.
                  </p>
                </div>
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-12 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25">
                  Send Reset Link
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Link href="/login" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
