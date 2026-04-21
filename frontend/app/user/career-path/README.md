# Career Studio

A simplified, beautiful interface for skill mapping and career path discovery.

## Features

### Skills Tab
- **Skill Web**: Interactive radar chart showing your top 6 skills
- **Skill Distribution**: Visual cards showing skill counts and proficiency levels
- **All Skills**: Tag cloud of all your declared skills
- **Recent Credentials**: Timeline of your latest credentials with mapped skills

### Paths Tab
- **Career Path Selector**: Dropdown to quickly analyze any career path
- **Career Cards**: Visual grid of available career paths with:
  - Demand levels (Low, Medium, High, Very High)
  - Required skills preview
  - Average salary ranges
  - Industry and experience level
- **Skill Gap Analysis**: Detailed breakdown of skills you need vs. what you have
- **Recommendations**:
  - Courses to take
  - Projects to build
  - Jobs that match
  - Certifications to pursue

## Design Principles

1. **Simple & Clean**: Removed clutter, focused on essential information
2. **Visual First**: Canvas-based skill web, gradient colors, clear badges
3. **Mobile Friendly**: Responsive grid layouts, touch-friendly controls
4. **Fast**: Parallel API calls, optimized rendering
5. **Accessible**: Clear labels, good contrast, semantic HTML

## Enhanced Data Model

Career paths now include:
- Demand levels and job opening counts
- Education and certification requirements
- Career progression paths
- Work environment descriptions
- Key responsibilities
- Required tools
- Related roles
- Color themes for UI

## Navigation

Accessible from:
- Dashboard → "Career Studio" link
- Sidebar → "Career Studio"
- Mobile nav → "Career" tab
- Global search → "Career Studio"

## Tech Stack

- React 18 with TypeScript
- Canvas API for skill web visualization
- Tailwind CSS for styling
- Shadcn UI components
- Parallel API requests for performance
