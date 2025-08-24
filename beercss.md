# Beer CSS Competency Reference

## Overview
Beer CSS is the first CSS framework based on Material Design 3. It's 10x smaller than other MD frameworks and requires no build steps, configurations, or dependencies.

**Core Philosophy**: "Try use helpers first, before any custom css"

**3 Ingredients**: Settings, Elements, Helpers

## Installation
```html
<link href="https://cdn.jsdelivr.net/npm/beercss@3.11.33/dist/cdn/beer.min.css" rel="stylesheet" />
<script type="module" src="https://cdn.jsdelivr.net/npm/beercss@3.11.33/dist/cdn/beer.min.js"></script>
<script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.2/dist/cdn/material-dynamic-colors.min.js"></script>
```

## Navigation Drawer Implementation

### Proper HTML Structure
```html
<!-- Navigation drawer must be placed BEFORE all other elements -->
<nav class="left drawer">
  <!-- Header section (optional) -->
  <header>
    <nav>
      <img src="logo.png" class="circle">
      <h6>App Name</h6>
    </nav>
  </header>
  
  <!-- Navigation items -->
  <a>
    <i>home</i>
    <div>Home</div>
  </a>
  <a>
    <i>search</i>
    <div>Search</div>
  </a>
  <a>
    <i>share</i>
    <div>Share</div>
  </a>
  
  <!-- Divider (optional) -->
  <div class="divider"></div>
  
  <!-- Section label (optional) -->
  <label>Section Label</label>
  
  <!-- More items -->
  <a>
    <i>widgets</i>
    <div>Widgets</div>
  </a>
</nav>
```

### Key Classes
- `nav.left` - Left-positioned navigation
- `nav.right` - Right-positioned navigation  
- `nav.drawer` - Adds drawer functionality
- `nav.l` - Large drawer variant
- `nav.m` - Medium drawer variant
- `nav.s` - Small drawer variant

### Navigation Item Structure
```html
<!-- Standard item -->
<a>
  <i>icon_name</i>  <!-- Material icon -->
  <div>Label Text</div>
</a>

<!-- With badge -->
<a>
  <i>icon_name</i>
  <div>Label Text</div>
  <span class="badge">99</span>
</a>
```

### ❌ Common Mistakes I Made
1. **Overriding with custom CSS instead of using helpers**
2. **Adding unnecessary wrapper divs and classes**
3. **Fighting Beer CSS with `!important` declarations**
4. **Not following the simple `<a><i><div>` structure**
5. **Adding margins/padding instead of using spacing helpers**

### ✅ Correct Approach
- Use semantic `<nav class="left drawer">` structure
- Follow `<a><i>icon</i><div>text</div></a>` pattern
- Let Beer CSS handle spacing and full-width behavior
- Use helpers for customization, not custom CSS

## Theme Toggle Switch

### Proper Switch Structure
```html
<label class="switch">
  <input type="checkbox">
  <span></span>
</label>

<!-- With icon -->
<label class="switch icon">
  <input type="checkbox">
  <span>
    <i>light_mode</i>
  </span>
</label>
```

### Dark Mode Implementation
```javascript
// Set theme programmatically
ui("mode", "dark");   // Dark mode
ui("mode", "light");  // Light mode  
ui("mode", "auto");   // System preference

// HTML attribute method
<html data-theme="dark">
<body class="dark">
```

### Theme Switching Function
```javascript
function toggleTheme() {
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  localStorage.setItem('theme', newTheme);
}
```

## Helper Classes

### Positioning
- `left`, `right` - Horizontal positioning
- `top`, `bottom` - Vertical positioning  
- `center-align`, `left-align`, `right-align` - Text alignment
- `middle-align`, `top-align`, `bottom-align` - Vertical alignment

### Spacing
- `margin`, `padding` - Standard spacing
- `no-margin`, `no-padding` - Remove spacing
- `small-margin`, `large-margin` - Size variants

### Colors
- `primary`, `secondary`, `tertiary` - Theme colors
- `primary-container`, `secondary-container` - Container variants
- `surface`, `surface-variant` - Surface colors
- `fill` - Fill with primary color

### Sizing
- `small`, `medium`, `large` - Size variants
- `max` - Maximum width/height
- `responsive` - Responsive behavior

## Component Best Practices

### Button
```html
<button class="fill">Primary Button</button>
<button class="border">Outlined Button</button>
<button class="transparent">Text Button</button>
```

### Card
```html
<article class="card">
  <div class="card-header">Header</div>
  <div class="card-content">Content</div>
</article>
```

### Grid
```html
<div class="grid">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Debugging Common Issues

### Navigation Items Not Full Width
**Problem**: Items appear narrow with wasted space
**Solution**: Don't override with custom CSS - Beer CSS handles this automatically with proper structure

### Theme Not Switching  
**Problem**: Theme toggle doesn't work
**Solution**: Use `document.documentElement.classList` to add/remove `dark` class, not custom attributes

### Spacing Issues
**Problem**: Too much or too little spacing
**Solution**: Use Beer CSS spacing helpers instead of custom margins/padding

### Icons Not Displaying
**Problem**: Material icons not showing
**Solution**: Ensure Material Icons font is loaded and use correct icon names

## Material Design 3 Compliance

Beer CSS follows MD3 principles:
- **Semantic HTML**: Use proper HTML elements
- **Accessible**: Built-in accessibility features
- **Responsive**: Mobile-first approach
- **Consistent**: Unified design system
- **Performant**: Minimal CSS footprint

## Performance Tips

1. **Use helpers first** - They're optimized and consistent
2. **Avoid custom CSS** - Unless absolutely necessary
3. **Follow semantic structure** - Don't fight the framework
4. **Use built-in components** - Don't reinvent the wheel
5. **Leverage theming system** - Use CSS custom properties

## Key Takeaways for Me

1. **STOP overriding with custom CSS** - Use helpers instead
2. **Follow the simple HTML patterns** - Don't add complexity
3. **Read the structure requirements** - Navigation drawer has specific needs
4. **Use semantic HTML** - Beer CSS is built around proper HTML
5. **Test with the framework, not against it** - Work with Beer CSS patterns

---

*This reference should prevent the trial-and-error approach that has wasted time and produced poor UI results. Always consult this before making Beer CSS modifications.*