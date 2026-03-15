import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Container } from '@/components/container'

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, including your name, email address, credentials, and educational records. We also collect information about your use of our services.'
    },
    {
      title: 'How We Use Your Information',
      content: 'We use the information we collect to provide, maintain, and improve our services, to verify credentials, to communicate with you, and to protect the security and integrity of our platform.'
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell your personal information. We may share your information with institutions for verification purposes, with employers when you choose to share credentials, and with service providers who assist in our operations.'
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. Your credentials are stored using blockchain technology for tamper-proof verification.'
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can export your data, control sharing preferences, and withdraw consent at any time through your account settings.'
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings.'
    },
    {
      title: 'Data Retention',
      content: 'We retain your information for as long as your account is active or as needed to provide services. Credential records are maintained indefinitely for verification purposes unless you request deletion.'
    },
    {
      title: 'Changes to Privacy Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of any material changes by email or through our platform. Continued use of our services constitutes acceptance of the updated policy.'
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
                Privacy Policy
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Last updated: March 14, 2026
              </p>
            </div>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-black dark:text-white">
                    {section.title}
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}

              <div className="pt-12 border-t border-slate-200 dark:border-slate-900">
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
                  Contact Us
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  If you have questions about this privacy policy, please contact us at{' '}
                  <a href="mailto:privacy@credmatrix.com" className="text-black dark:text-white font-medium hover:underline">
                    privacy@credmatrix.com
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
