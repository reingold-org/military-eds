# USWDS Button Integration - Final Approach

## ✅ The Right Approach for Edge Delivery Services

After refining the integration, we've aligned USWDS with Edge Delivery Services' auto-block pattern for buttons.

---

## 🎯 The Problem (Solved)

**Initial Approach**: Created a `button` block  
**Issue**: In EDS, buttons are auto-styled and don't need blocks  
**Solution**: Integrate USWDS button styles globally in `styles.css`

---

## ✅ What Was Implemented

### 1. **Global USWDS Button Styles**

USWDS button styles are now included globally, following EDS patterns:

```
styles/
├── styles.css               ← Imports USWDS buttons
├── uswds-buttons.scss       ← Source for button-only styles
└── uswds-buttons.css        ← Compiled (10KB)
```

**In `styles.css`:**
```css
/* Import USWDS Button Styles */
@import url('uswds-buttons.css');
```

### 2. **Updated Block Styles**

Blocks that use buttons now reference USWDS classes:

- `blocks/dynamic-hero/dynamic-hero.css` - Uses `.usa-button`
- `blocks/dynamic-carousel/dynamic-carousel.css` - Uses `.usa-button`

### 3. **Updated Block JavaScript**

Blocks now add USWDS button classes:

**dynamic-hero.js:**
```javascript
`<a href="${article.path}" class="usa-button">Read More</a>`
```

**dynamic-carousel.js:**
```javascript
link.classList.add('usa-button');
```

### 4. **Removed Button Block**

The `blocks/button/` directory was removed since buttons don't need a block in EDS.

---

## 📊 File Sizes

| Component | Size | Loading |
|-----------|------|---------|
| **USWDS Buttons** | 10KB | Global (via styles.css) |
| **Card Block** | 20KB | On-demand |
| **Grid Block** | 24KB | On-demand |
| **Total** | 54KB | ✨ |

Compare to full monolithic USWDS: **448KB** → **88% reduction**

---

## 🚀 Usage

### For Authors

Authors don't need to do anything special! Buttons are automatically styled with USWDS:

**Standard Link** (becomes button):
```
[Click Me](https://example.com)
```

**In Dynamic Blocks:**
Dynamic blocks (hero, carousel) automatically apply USWDS button styling.

### For Developers

When creating new blocks with buttons, use the `.usa-button` class:

```javascript
const button = document.createElement('a');
button.classList.add('usa-button');
button.href = '/path';
button.textContent = 'Click Me';
```

**USWDS Button Variants:**
```javascript
button.classList.add('usa-button'); // Primary (default)
button.classList.add('usa-button', 'usa-button--secondary'); // Secondary
button.classList.add('usa-button', 'usa-button--outline'); // Outline
button.classList.add('usa-button', 'usa-button--big'); // Big
button.classList.add('usa-button', 'usa-button--unstyled'); // Unstyled
```

---

## 🏗️ Build Commands

```bash
# Build USWDS button styles
npm run build:uswds-buttons

# Build modular blocks (Card, Grid)
npm run build:uswds-blocks

# Build everything
npm run build
```

---

## 📁 Final Structure

```
styles/
├── styles.css                   ← Imports uswds-buttons.css
├── uswds-buttons.scss          ← USWDS button source
└── uswds-buttons.css           ← 10KB compiled (gitignored)

blocks/
├── card/                        ← USWDS card block (20KB)
│   ├── card.scss
│   ├── card.css
│   ├── card.js
│   └── README.md
│
├── grid/                        ← USWDS grid block (24KB)
│   ├── grid.scss
│   ├── grid.css
│   ├── grid.js
│   └── README.md
│
├── dynamic-hero/
│   ├── dynamic-hero.css        ← Uses .usa-button
│   └── dynamic-hero.js         ← Adds .usa-button class
│
└── dynamic-carousel/
    ├── dynamic-carousel.css    ← Uses .usa-button
    └── dynamic-carousel.js     ← Adds .usa-button class
```

---

## ✅ Benefits

1. **Follows EDS Patterns**: Buttons are auto-styled globally, not via blocks
2. **USWDS Compliant**: Uses official USWDS button styles
3. **Accessible**: WCAG 2.1 AA compliant buttons
4. **Consistent**: All buttons across the site use same USWDS styling
5. **Easy Updates**: `npm update uswds` + rebuild still works
6. **Modular Blocks**: Card and Grid remain as blocks (makes sense for those)

---

## 🎨 Available Button Styles

### Primary Button (Default)
```html
<a href="#" class="usa-button">Primary Action</a>
```

### Secondary Button
```html
<a href="#" class="usa-button usa-button--secondary">Secondary Action</a>
```

### Outline Button
```html
<a href="#" class="usa-button usa-button--outline">Outline Action</a>
```

### Big Button
```html
<a href="#" class="usa-button usa-button--big">Big Action</a>
```

### Accent Buttons
```html
<a href="#" class="usa-button usa-button--accent-warm">Warm Action</a>
<a href="#" class="usa-button usa-button--accent-cool">Cool Action</a>
```

### Disabled Button
```html
<button class="usa-button" disabled>Disabled Action</button>
```

---

## 🔄 Updating USWDS

The update process remains simple:

```bash
# 1. Update USWDS
npm update uswds

# 2. Rebuild button styles
npm run build:uswds-buttons

# 3. Rebuild blocks
npm run build:uswds-blocks

# 4. Test
# 5. Deploy
```

---

## 📖 Integration Summary

### What Changed

- ❌ **Removed**: `blocks/button/` directory (doesn't fit EDS pattern)
- ✅ **Added**: `styles/uswds-buttons.scss` and compiled `.css`
- ✅ **Updated**: `styles/styles.css` to import USWDS buttons
- ✅ **Updated**: `dynamic-hero.js` and `dynamic-carousel.js` to use `.usa-button`
- ✅ **Updated**: CSS files for dynamic blocks to reference USWDS classes
- ✅ **Kept**: `card` and `grid` blocks (these make sense as blocks)

### Why This Works

1. **Buttons are global in EDS**: They should be styled in `styles.css`, not as blocks
2. **USWDS buttons are modular**: Only 10KB for all button variants
3. **Easy to maintain**: Single source of truth for button styles
4. **Flexible**: Developers can use USWDS button variants as needed
5. **Author-friendly**: Authors don't need to think about button styling

---

## 🎯 Best Practices

1. **Always use `.usa-button` class** when creating buttons in JavaScript
2. **Choose appropriate variants** based on button hierarchy
3. **Test accessibility** - USWDS buttons have built-in a11y features
4. **Don't override core styles** - use USWDS variants instead
5. **Update regularly** - Keep USWDS current for security and features

---

**Integration Date**: November 24, 2025  
**Pattern**: Global Button Styles + Modular Component Blocks  
**Total Size**: 54KB (buttons + card + grid)  
**Savings vs Monolithic**: 88% (54KB vs 448KB)

