# MicroCred - Micro-Credential Aggregator Platform

A production-grade frontend for aggregating learner credentials from universities, training providers, and edtech platforms into a unified digital skill portfolio.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** + **Radix UI**
- **Framer Motion** (animations)
- **Lucide Icons**
- **next-themes** (dark/light mode)
- **TanStack Query** (API data)
- **Axios** (API calls)
- **React Hook Form** + **Zod** (forms & validation)

## Design Philosophy

Apple-inspired, minimal, premium SaaS design with:
- Clean layouts with high spacing
- Typography-focused
- Elegant animations
- Black, white, grayscale with soft blue/indigo accents

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── dashboard/
├── credentials/
├── skill-map/
├── profile/
└── settings/

components/
├── ui/              # shadcn/ui components
├── navigation/      # Header, Sidebar, MobileNav
├── credential-card.tsx
├── loading-skeleton.tsx
└── confirmation-dialog.tsx

lib/
├── api.ts          # Axios instance
└── utils.ts        # Utility functions
```

## Features

### Implemented
- ✅ Landing page
- ✅ Authentication (Login/Signup)
- ✅ Dashboard with stats
- ✅ Credential management
- ✅ Upload credentials
- ✅ Mobile floating navigation
- ✅ Dark/light mode
- ✅ Loading skeletons
- ✅ Confirmation dialogs
- ✅ Toast notifications
- ✅ Responsive design

### To Be Implemented
- Skill graph visualization
- Career path recommendations
- Employer dashboard
- Issuer dashboard
- Admin dashboard
- Multilingual support (i18n)
- Command palette (Cmd+K)
- Profile sharing
- Advanced search & filters

## Mobile Navigation

The app features a premium floating bottom navigation bar for mobile:
- Glassmorphism blur effect
- Rounded pill style
- Smooth animations
- Centered icons with active states

## Accessibility

- Keyboard navigation
- ARIA labels
- High contrast support
- Screen reader friendly

## Build

```bash
npm run build
npm start
```

## License

MIT
