'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Send } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Container } from '@/components/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle form submission
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <main className="pt-32 pb-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-6xl font-semibold text-black dark:text-white mb-6 tracking-tight">
                Get in touch
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Have questions? We'd love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                      Email
                    </h3>
                    <a href="mailto:support@credmatrix.com" className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                      support@credmatrix.com
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                      Support
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Available Monday to Friday
                      <br />
                      9:00 AM - 6:00 PM IST
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 rounded-lg">
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-black dark:text-white">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-black dark:text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-black dark:text-white">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="h-11 rounded-lg border-slate-300 dark:border-slate-700 focus:border-black dark:focus:border-white bg-white dark:bg-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-black dark:text-white">
                      Message
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Tell us more..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-black text-black dark:text-white resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 font-medium"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
