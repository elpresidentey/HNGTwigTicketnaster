# Landing Page Redesign - Design Document

## Overview

This design document outlines the technical implementation approach for redesigning the landing page with modern UI elements, wavy backgrounds, decorative circles, and responsive box sections. The design emphasizes visual appeal while maintaining excellent performance and accessibility across all devices.

## Architecture

### Layout Structure
```
Landing Page
├── Header/Navigation (existing)
├── Hero Section (redesigned)
│   ├── Wavy Background (SVG/CSS)
│   ├── Decorative Circles
│   ├── Content Container (max-width: 1440px)
│   ├── App Name & Description
│   └── CTA Buttons (Login/Get Started)
├── Features Section (box-based layout)
├── Additional Content Sections
└── Footer Section (consistent across pages)
```

### Visual Design System

#### Color Palette
- Primary: #3B82F6 (Blue)
- Secondary: #10B981 (Green) 
- Accent: #F59E0B (Amber)
- Neutral: #6B7280 (Gray)
- Background: #F8FAFC (Light Gray)
- White: #FFFFFF

#### Typography Scale
- Hero Title: 3.5rem (desktop) / 2.5rem (mobile)
- Section Headings: 2.25rem (desktop) / 1.875rem (mobile)
- Body Text: 1.125rem (desktop) / 1rem (mobile)
- Button Text: 1rem

## Components and Interfaces

### 1. Hero Section with Wavy Background

#### Wavy Background Implementation
**Option A: CSS Clip-Path (Recommended)**
```css
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 100px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' fill='%23ffffff'%3E%3C/path%3E%3C/svg%3E") no-repeat;
  background-size: cover;
}
```

**Option B: SVG Wave (Alternative)**
```html
<svg class="hero-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
  <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff"></path>
</svg>
```

#### Decorative Circles
```css
.decorative-circles {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 { width: 200px; height: 200px; top: 10%; right: 15%; }
.circle-2 { width: 150px; height: 150px; top: 60%; left: 10%; }
.circle-3 { width: 100px; height: 100px; top: 30%; left: 70%; }
```

### 2. Content Container System

#### Max-Width Container
```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
}
```

### 3. Box Sections with Shadows

#### Feature Box Design
```css
.feature-box {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### 4. Call-to-Action Buttons

#### Button Styles
```css
.cta-primary {
  background: linear-gradient(135deg, #3B82F6, #1D4ED8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.cta-secondary {
  background: transparent;
  color: #3B82F6;
  border: 2px solid #3B82F6;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}
```

### 5. Footer Section

#### Consistent Footer Design
```css
.footer {
  background: #1F2937;
  color: #D1D5DB;
  padding: 3rem 0 2rem;
  margin-top: 4rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 2rem;
}
```

## Data Models

### CSS Custom Properties (Design Tokens)
```css
:root {
  /* Colors */
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-accent: #F59E0B;
  --color-neutral: #6B7280;
  --color-background: #F8FAFC;
  --color-white: #FFFFFF;
  
  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4rem;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 25px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.15);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

## Responsive Design Strategy

### Breakpoint System
```css
/* Mobile First Approach */
/* Base styles: 320px+ */

@media (min-width: 640px) {
  /* Small tablets and large phones */
}

@media (min-width: 768px) {
  /* Tablets */
}

@media (min-width: 1024px) {
  /* Small desktops */
}

@media (min-width: 1280px) {
  /* Large desktops */
}

@media (min-width: 1440px) {
  /* Extra large screens - max content width */
}
```

### Mobile Adaptations
- Hero section: Stack content vertically, reduce font sizes
- Feature boxes: Single column layout
- CTA buttons: Full width on mobile
- Decorative circles: Reduce size and reposition
- Wavy background: Maintain but adjust curve intensity

### Tablet Adaptations
- Hero section: Two-column layout with adjusted proportions
- Feature boxes: Two-column grid
- Maintain desktop-like spacing with slight reductions

## Error Handling

### Progressive Enhancement
1. **Base Experience**: Functional layout without advanced CSS features
2. **Enhanced Experience**: Add wavy backgrounds, shadows, and animations
3. **Fallbacks**: Provide solid colors for gradient backgrounds, simple borders for shadows

### Browser Compatibility
```css
/* Fallback for clip-path */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@supports (clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)) {
  .hero-section {
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  }
}

/* Fallback for backdrop-filter */
.circle {
  background: rgba(255, 255, 255, 0.2);
}

@supports (backdrop-filter: blur(10px)) {
  .circle {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
}
```

## Testing Strategy

### Visual Testing
1. **Cross-browser testing**: Chrome, Firefox, Safari, Edge
2. **Device testing**: iPhone, Android, iPad, various desktop sizes
3. **Accessibility testing**: Screen readers, keyboard navigation
4. **Performance testing**: Lighthouse scores, Core Web Vitals

### Responsive Testing Points
- 320px (small mobile)
- 375px (iPhone)
- 768px (tablet)
- 1024px (small desktop)
- 1440px (large desktop)
- 1920px (extra large)

### Performance Considerations
1. **Optimize SVG**: Minimize path complexity for wavy backgrounds
2. **CSS optimization**: Use transform and opacity for animations
3. **Image optimization**: Compress any background images
4. **Critical CSS**: Inline above-the-fold styles
5. **Lazy loading**: Defer non-critical decorative elements

## Implementation Notes

### File Structure
```
public/assets/css/
├── landing-redesign.css (new styles)
├── responsive.css (responsive utilities)
└── components.css (reusable components)

templates/
├── landing.twig (updated template)
└── components/
    ├── hero-section.twig
    ├── feature-boxes.twig
    └── footer.twig
```

### Integration with Existing Styles
- Extend current CSS architecture
- Maintain existing utility classes
- Override specific landing page styles
- Ensure no conflicts with dashboard/ticket pages