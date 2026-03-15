import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Container } from '@/components/container'

export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using CredMatrix, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
    },
    {
      title: 'User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information and keep it updated. You are responsible for all activities under your account.'
    },
    {
      title: 'Credential Verification',
      content: 'We provide a platform for credential verification but do not guarantee the accuracy of credentials submitted by users. Institutions are responsible for verifying credentials they issue.'
    },
    {
      title: 'User Responsibilities',
      content: 'You agree to use our services only for lawful purposes. You must not upload false credentials, impersonate others, or attempt to compromise the security of our platform.'
    },
    {
      title: 'Intellectual Property',
      content: 'All content, features, and functionality of CredMatrix are owned by us and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without permission.'
    },
    {
      title: 'Service Availability',
      content: 'We strive to provide reliable service but do not guarantee uninterrupted access. We may modify, suspend, or discontinue services at any time without notice.'
    },
    {
      title: 'Limitation of Liability',
      content: 'CredMatrix is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services.'
    },
    {
      title: 'Termination',
      content: 'We reserve the right to suspend or terminate your account for violation of these terms. You may close your account at any time through account settings.'
    },
    {
      title: 'Governing Law',
      content: 'These terms are governed by the laws of India. Any disputes shall be resolved in the courts of New Delhi, India.'
    },
    {
      title: 'Changes to Terms',
      content: 'We may modify these terms at any time. We will notify you of material changes via email or platform notification. Continued use after changes constitutes acceptance.'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <main className="pt-32 pb-24">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="mb-16">
              <h1 className="text-5xl font-semibold text-black dark:text-white mb-4 tracking-tight">
                Terms of Service
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Last updated: March 14, 2026
              </p>
            </div>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-black dark:text-white">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}

              <div className="pt-12 border-t border-slate-200 dark:border-slate-900">
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Questions?
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  If you have questions about these terms, contact us at{' '}
                  <a href="mailto:legal@credmatrix.com" className="text-black dark:text-white font-medium hover:underline">
                    legal@credmatrix.com
                  </a>
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
