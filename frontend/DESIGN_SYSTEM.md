# Notion-Inspired Design System Implementation

This document describes how the Notion-inspired design system has been implemented in the CredMatrix frontend.

## Overview

The design system follows Notion's philosophy of warm minimalism with ultra-thin borders, multi-layer shadows, and a warm neutral color palette.

## Color System

### Primary Colors
- **Notion Blue**: `#0075de` - Primary CTA and interactive elements
- **Pure White**: `#ffffff` - Page background
- **Near Black**: `rgba(0,0,0,0.95)` - Primary text

### Warm Neutrals
- **Warm White**: `#f6f5f4` - Alternate section backgrounds
- **Warm Dark**: `#31302e` - Dark mode backgrounds
- **Warm Gray 500**: `#615d59` - Secondary text
- **Warm Gray 300**: `#a39e98` - Placeholder text

### Semantic Colors
- **Teal**: `#2a9d99` - Success states
- **Green**: `#1aae39` - Confirmation
- **Orange**: `#dd5b00` - Warning/destructive
- **Pink**: `#ff64c8` - Decorative accent
- **Purple**: `#391c57` - Premium features
- **Brown**: `#523410` - Earthy accent

## Typography

### Font Family
- Primary: Inter (NotionInter equivalent)
- All weights: 400 (body), 500 (UI), 600 (emphasis), 700 (headings)

### Typography Scale

| Class | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-display-hero` | 64px | 700 | 1.00 | -2.125px | Hero headlines |
| `text-display-secondary` | 54px | 700 | 1.04 | -1.875px | Secondary hero |
| `text-section-heading` | 48px | 700 | 1.00 | -1.5px | Section titles |
| `text-subheading-large` | 40px | 700 | 1.50 | normal | Large subheadings |
| `text-subheading` | 26px | 700 | 1.23 | -0.625px | Subheadings |
| `text-card-title` | 22px | 700 | 1.27 | -0.25px | Card titles |
| `text-body-large` | 20px | 600 | 1.40 | -0.125px | Large body text |
| `text-body` | 16px | 400 | 1.50 | normal | Standard body |
| `text-body-medium` | 16px | 500 | 1.50 | normal | Medium emphasis |
| `text-body-semibold` | 16px | 600 | 1.50 | normal | Strong labels |
| `text-nav` | 15px | 600 | 1.33 | normal | Navigation |
| `text-caption` | 14px | 500 | 1.43 | normal | Captions |
| `text-badge` | 12px | 600 | 1.33 | 0.125px | Badges |

### Responsive Typography
- Display hero scales from 64px → 40px → 26px on smaller screens
- Letter spacing adjusts proportionally

## Components

### Buttons

#### Primary Button (default)
```tsx
<Button>Get Started</Button>
```
- Background: Notion Blue (#0075de)
- Text: White
- Hover: Darker blue (#005bab)
- Active: scale(0.98)
- Border radius: 4px (micro)

#### Secondary Button
```tsx
<Button variant="secondary">Learn More</Button>
```
- Background: rgba(0,0,0,0.05)
- Text: Near black
- Hover: scale(1.02)
- Active: scale(0.98)

#### Ghost Button
```tsx
<Button variant="ghost">Cancel</Button>
```
- Background: Transparent
- Text: Near black
- Hover: Underline

#### Pill Badge Button
```tsx
<Button variant="pill">New</Button>
```
- Background: #f2f9ff (tinted blue)
- Text: #097fe8
- Border radius: 9999px (full pill)

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

Features:
- White background
- Whisper border: 1px solid rgba(0,0,0,0.1)
- Border radius: 12px
- Multi-layer shadow (Notion card shadow)
- Hover: Deeper shadow elevation

### Inputs

```tsx
<Input placeholder="Enter text..." />
```

Features:
- White background
- Border: #dddddd
- Border radius: 4px (micro)
- Focus: Blue ring with Notion blue
- Placeholder: Warm gray 300

### Badges

```tsx
<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
```

Features:
- Full pill shape (9999px radius)
- 12px font size with 0.125px letter spacing
- Various semantic color variants

## Shadows

### Card Shadow (shadow-notion-card)
Multi-layer shadow with cumulative opacity < 0.05:
```css
box-shadow:
  0px 4px 18px rgba(0, 0, 0, 0.04),
  0px 2.025px 7.84688px rgba(0, 0, 0, 0.027),
  0px 0.8px 2.925px rgba(0, 0, 0, 0.02),
  0px 0.175px 1.04062px rgba(0, 0, 0, 0.01);
```

### Deep Shadow (shadow-notion-deep)
Five-layer shadow for modals and featured content:
```css
box-shadow:
  0px 1px 3px rgba(0, 0, 0, 0.01),
  0px 3px 7px rgba(0, 0, 0, 0.02),
  0px 7px 15px rgba(0, 0, 0, 0.02),
  0px 14px 28px rgba(0, 0, 0, 0.04),
  0px 23px 52px rgba(0, 0, 0, 0.05);
```

## Border Radius Scale

- **micro** (4px): Buttons, inputs
- **subtle** (5px): Links, list items
- **standard** (8px): Small cards
- **comfortable** (12px): Standard cards
- **large** (16px): Hero cards
- **pill** (9999px): Badges, pills

## Spacing System

Based on 8px unit with organic scale:
- 2px, 3px, 4px, 5px, 6px, 7px, 8px, 11px, 12px, 14px, 16px, 24px, 32px

### Section Spacing
Use `section-spacing` class for generous vertical rhythm:
- Mobile: 64px (4rem)
- Tablet: 80px (5rem)
- Desktop: 120px (7.5rem)

## Utility Classes

### Backgrounds
- `bg-warm-white` - Warm white background (#f6f5f4)
- `bg-warm-dark` - Warm dark background (#31302e)

### Borders
- `border-whisper` - Ultra-thin border: 1px solid rgba(0,0,0,0.1)

### Cards
- `card-notion` - Complete Notion card styling
- `hover-notion-lift` - Hover effect with shadow elevation

### Animations
- `animate-fade-in` - Fade in animation
- `animate-slide-up` - Slide up animation
- `animate-scale-in` - Scale in animation

## Layout Principles

### Container
- Max width: 1200px (xl breakpoint)
- Centered with generous padding
- Responsive padding scales with screen size

### Section Alternation
Alternate between white and warm white backgrounds:
```tsx
<section className="bg-white section-spacing">
  {/* Content */}
</section>
<section className="bg-warm-white section-spacing">
  {/* Content */}
</section>
```

### Whitespace
- Generous vertical rhythm (64-120px between sections)
- Content-first density with ample margins
- Warm alternation for visual rhythm

## Best Practices

1. **Use warm neutrals** - Never use blue-gray, always use warm grays
2. **Whisper borders** - Keep borders at 1px solid rgba(0,0,0,0.1)
3. **Multi-layer shadows** - Use provided shadow utilities
4. **Letter spacing scales** - Negative at large sizes, normal at body, positive at badge size
5. **Four-weight system** - 400 (read), 500 (interact), 600 (emphasize), 700 (announce)
6. **Notion Blue sparingly** - Only for CTAs and interactive elements
7. **Section alternation** - Use warm white for visual rhythm
8. **Pill badges** - Use 9999px radius for status/tags

## Responsive Behavior

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1440px

### Typography Scaling
Headlines automatically scale down on mobile devices while maintaining proportional letter spacing.

### Touch Targets
All interactive elements have comfortable padding for mobile touch (minimum 44px height).

## Dark Mode

Dark mode uses warm dark backgrounds (#31302e) instead of pure black, maintaining the warm aesthetic.

## Accessibility

- High contrast text: near-black on white exceeds WCAG AAA
- Focus indicators on all interactive elements
- Keyboard navigation supported
- Semantic HTML structure
