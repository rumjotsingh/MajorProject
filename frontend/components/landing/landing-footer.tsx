import Link from "next/link";
import { Award } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Help Center", href: "/help" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative border-t border-whisper bg-warm-white">
      <div className="container relative py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="p-1.5 rounded-standard bg-notion-blue text-white">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-body-large font-bold text-near-black">CredMatrix</span>
            </Link>
            <p className="text-body text-warm-gray-500 leading-relaxed max-w-xs">
              The modern credential management platform. Aggregate, verify, and showcase your skills in one beautiful portfolio.
            </p>
          </div>

          {/* Link Columns */}
          {[
            { title: "Product", links: footerLinks.product },
            { title: "Company", links: footerLinks.company },
            { title: "Resources", links: footerLinks.resources },
            { title: "Legal", links: footerLinks.legal },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-body-semibold mb-4 text-near-black">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-warm-gray-500 hover:text-notion-blue transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-caption text-warm-gray-500">
            &copy; {new Date().getFullYear()} CredMatrix. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-caption text-warm-gray-500">
            <span>Crafted with</span>
            <span className="text-notion-blue">♥</span>
            <span>for learners worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
