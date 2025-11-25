# USWDS Quick Reference Card

## 🚀 Build Commands

```bash
# Monolithic (448KB) - All USWDS upfront
npm run build:uswds

# Utilities Only (220KB) - Utilities upfront, no components
npm run build:uswds-utilities

# Modular Blocks (10-30KB each) - On-demand loading
npm run build:uswds-blocks
npm run watch:uswds-blocks  # During development

# Update USWDS
npm update uswds
```

---

## 📊 Which Approach?

| | Monolithic | Utilities + Blocks | Pure Modular |
|---|---|---|---|
| **Size** | 448KB | 220KB + 10-30KB/block | 10-30KB/block |
| **Loading** | All upfront | Utilities upfront, blocks on-demand | All on-demand |
| **Best for** | Prototyping | **Most projects** ⭐ | Maximum performance |
| **DX** | Simple | Great | Good |

**Recommendation**: Utilities + Blocks (Approach 2)

---

## 📁 File Sizes

```
Monolithic:        448KB  (everything)
Utilities:         220KB  (spacing, colors, typography, etc.)

Modular Blocks:
├── button:         12KB
├── card:           20KB
├── grid:           28KB
└── Total (3):      60KB  (88% smaller!)
```

---

## 🎨 Using Modular Blocks

### 1. Include Utilities (if using Approach 2)

**head.html:**
```html
<link rel="stylesheet" href="/styles/uswds-utilities.css">
```

### 2. Use Blocks in Content

**Button:**
```
| Button |
| --- |
| [Click Me](https://example.com) |
```

**Card:**
```
| Card |
| --- |
| Card Title |
| Card description goes here. |
| [Action Button](https://example.com) |
```

**Grid:**
```
| Grid |
| --- |
| Left Column Content | Right Column Content |
```

### 3. Use Utilities Anywhere

```html
<div class="padding-4 margin-y-2 bg-primary text-white">
  Styled with USWDS utilities
</div>
```

---

## 🛠️ Create New Modular Block

```bash
# 1. Create directory
mkdir -p blocks/alert

# 2. Create SCSS
cat > blocks/alert/alert.scss << 'EOF'
@import "../../styles/uswds/uswds-theme-settings";
@import "packages/required";
@import "packages/usa-alert";
EOF

# 3. Create JS
cat > blocks/alert/alert.js << 'EOF'
export default function decorate(block) {
  const alert = document.createElement('div');
  alert.className = 'usa-alert usa-alert--info';
  alert.innerHTML = block.innerHTML;
  block.replaceWith(alert);
}
EOF

# 4. Add to package.json build script
# Add: && sass ... blocks/alert/alert.scss blocks/alert/alert.css

# 5. Build
npm run build:uswds-blocks
```

---

## 🔄 Update USWDS

```bash
npm update uswds
npm run build:uswds-blocks
npm run build:uswds-utilities  # if using utilities
# Test, then deploy
```

---

## 📚 Common USWDS Packages

```scss
// Always required
@import "packages/required";

// Components
@import "packages/usa-accordion";
@import "packages/usa-alert";
@import "packages/usa-banner";
@import "packages/usa-button";
@import "packages/usa-card";
@import "packages/usa-footer";
@import "packages/usa-header";
@import "packages/usa-hero";
@import "packages/usa-modal";
@import "packages/usa-nav";
@import "packages/usa-table";

// Layout
@import "packages/layout-grid";
```

**Full list**: `ls node_modules/uswds/dist/scss/packages/`

---

## 💡 Utility Classes

### Spacing
```html
<div class="padding-4">4 units padding</div>
<div class="margin-y-2">2 units vertical margin</div>
<div class="padding-x-3">3 units horizontal padding</div>
```

### Typography
```html
<p class="font-sans-lg text-bold">Large bold text</p>
<p class="font-heading-xl">Extra large heading</p>
```

### Colors
```html
<div class="bg-primary text-white">Primary bg, white text</div>
<div class="bg-secondary text-base-darkest">Secondary bg</div>
```

### Layout
```html
<div class="display-flex flex-justify-center">Centered flex</div>
<div class="grid-container">Container</div>
<div class="grid-row grid-gap">
  <div class="tablet:grid-col-6">Half width</div>
  <div class="tablet:grid-col-6">Half width</div>
</div>
```

**Full reference**: https://designsystem.digital.gov/utilities/

---

## 📖 Documentation Hierarchy

1. **This card** - Quick reference
2. `QUICK-START-USWDS.md` - Getting started
3. `MODULAR-USWDS-SUMMARY.md` - Modular approach summary
4. `MODULAR-USWDS-GUIDE.md` - Complete modular guide
5. `USWDS-INTEGRATION.md` - Full integration overview
6. `styles/uswds/README.md` - Technical details

---

## 🆘 Troubleshooting

### Block CSS not loading
- Check file was generated: `ls blocks/uswds-*/uswds-*.css`
- Rebuild: `npm run build:uswds-blocks`
- Check browser Network tab

### Build fails
- Check import paths in `.scss` files
- Verify package names: `ls node_modules/uswds/dist/scss/packages/`
- Make sure settings import is correct: `@import "../../styles/uswds/uswds-theme-settings";`

### Styles not applying
- Verify block JS is decorating elements with correct classes
- Check that Edge Delivery is loading the block
- Inspect element in browser DevTools

---

## 🎯 Performance Tips

1. **Use Approach 2** (utilities + modular blocks) for best balance
2. **Only create blocks you need** - don't build every USWDS component
3. **Measure results** - use Chrome DevTools Network tab
4. **Test on slow connections** - use throttling to see real impact
5. **Consider code splitting** - load heavy components only on pages that need them

---

**USWDS Version**: 2.14.0  
**Last Updated**: November 2025  
**Pattern**: Modular, On-Demand, Edge Delivery Aligned ✨

