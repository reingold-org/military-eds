# Modular USWDS Integration for Edge Delivery Services

This guide explains how to use USWDS components in a modular, on-demand way that aligns with Edge Delivery Services' block-based architecture.

## 🎯 The Problem

**Edge Delivery Services Pattern:**
- Small, modular block files (`blocks/button/button.css`)
- Loaded on-demand (only when block is used)
- Optimized for performance

**USWDS Default Pattern:**
- Single monolithic CSS file (445KB)
- All components loaded upfront
- Not aligned with on-demand loading

## ✅ The Solution: Three Approaches

---

## **Approach 1: Modular USWDS Blocks** ⭐ Recommended

Create individual Edge Delivery blocks that wrap USWDS components. Each block imports only its needed USWDS packages.

### Structure

```
blocks/
├── uswds-button/
│   ├── uswds-button.scss    # Imports only usa-button package
│   ├── uswds-button.css     # Compiled (small!)
│   └── uswds-button.js      # Edge Delivery block JS
├── uswds-card/
│   ├── uswds-card.scss      # Imports only usa-card package
│   ├── uswds-card.css       # Compiled (small!)
│   └── uswds-card.js        # Edge Delivery block JS
├── uswds-grid/
│   ├── uswds-grid.scss      # Imports only grid package
│   ├── uswds-grid.css       # Compiled (small!)
│   └── uswds-grid.js        # Edge Delivery block JS
```

### Example: USWDS Button Block

**blocks/uswds-button/uswds-button.scss:**
```scss
// Import shared settings
@import "../../styles/uswds/uswds-theme-settings";

// Import only what's needed for buttons
@import "packages/required";
@import "packages/usa-button";
```

**blocks/uswds-button/uswds-button.js:**
```javascript
export default function decorate(block) {
  const links = block.querySelectorAll('a');
  links.forEach((link) => {
    link.classList.add('usa-button');
  });
}
```

### Building Modular Blocks

```bash
# Build all USWDS blocks
npm run build:uswds-blocks

# Watch for changes during development
npm run watch:uswds-blocks
```

### Usage in Content

Use the block name in your Edge Delivery content:

```
| Button |
| --- |
| [Click Me](https://example.com) |
```

Edge Delivery will:
1. Load `blocks/uswds-button/uswds-button.css` (only ~5-10KB!)
2. Load `blocks/uswds-button/uswds-button.js`
3. Apply USWDS button styling

### ✅ Advantages

- **Truly on-demand**: Only loads CSS for blocks actually used
- **Small files**: Each block CSS is 5-50KB vs 445KB monolith
- **Edge Delivery native**: Follows existing patterns perfectly
- **Easy updates**: `npm update uswds` + rebuild still works
- **Developer friendly**: Clear what each block needs

### ❌ Disadvantages

- **More build steps**: Need to compile each block's SCSS
- **Setup time**: Need to create wrapper blocks for each USWDS component
- **Some duplication**: Core USWDS code included in each block

---

## **Approach 2: Utilities Base + Component Blocks** 

Use USWDS utilities globally (lightweight base) + individual component blocks.

### Structure

```
styles/
└── uswds-utilities.css       # ~50-100KB (utilities only)

blocks/
├── uswds-button/             # Inherits utilities, adds button CSS
├── uswds-card/               # Inherits utilities, adds card CSS
└── uswds-grid/               # Inherits utilities, adds grid CSS
```

### Setup

**1. Build utilities-only base:**

```bash
npm run build:uswds-utilities
```

**2. Include in `head.html`:**

```html
<link rel="stylesheet" href="/styles/uswds-utilities.css">
```

**3. Use utilities everywhere:**

```html
<div class="padding-4 margin-y-2 bg-primary text-white">
  Styled with USWDS utilities
</div>
```

**4. Build component blocks as needed:**

Each block imports only its component package (not utilities, since those are already loaded globally).

### ✅ Advantages

- **Utilities available everywhere**: Use spacing, colors, typography globally
- **Smaller component blocks**: Don't need to include utilities in each
- **Balance**: Some global, some modular
- **Practical**: Best of both worlds

### ❌ Disadvantages

- **Not pure on-demand**: Utilities loaded upfront (~50-100KB)
- **More complex**: Two systems to manage

---

## **Approach 3: Hybrid - Monolith + Selective Blocks**

Keep monolithic USWDS for prototyping, create custom blocks for production.

### Use Case

- **Development**: Use full USWDS (`styles/uswds-compiled.css`)
- **Production**: Switch to modular blocks for optimized loading

### Process

1. **Prototype** with full USWDS
2. **Identify** which components you actually use
3. **Create** Edge Delivery blocks for those components
4. **Remove** monolithic file

---

## 📊 Performance Comparison

| Approach | Initial Load | Per Block | Total (3 blocks) |
|----------|-------------|-----------|------------------|
| **Monolithic** | 445KB | 0KB | 445KB |
| **Modular Blocks** | 0KB | 5-50KB | 15-150KB |
| **Utilities + Blocks** | 50-100KB | 5-20KB | 65-160KB |

---

## 🛠️ Build Commands

```bash
# Approach 1: Modular blocks only
npm run build:uswds-blocks        # Build all USWDS blocks
npm run watch:uswds-blocks        # Watch during development

# Approach 2: Utilities + blocks
npm run build:uswds-utilities     # Build utilities base
npm run build:uswds-blocks        # Build component blocks

# Legacy: Monolithic (for comparison)
npm run build:uswds               # Build full USWDS file
```

---

## 📚 Available USWDS Packages for Modular Import

When creating new blocks, you can import these packages individually:

### Components
- `packages/usa-accordion`
- `packages/usa-alert`
- `packages/usa-banner`
- `packages/usa-breadcrumb`
- `packages/usa-button`
- `packages/usa-button-group`
- `packages/usa-card`
- `packages/usa-checkbox`
- `packages/usa-collection`
- `packages/usa-combo-box`
- `packages/usa-date-picker`
- `packages/usa-file-input`
- `packages/usa-footer`
- `packages/usa-form`
- `packages/usa-header`
- `packages/usa-hero`
- `packages/usa-icon`
- `packages/usa-icon-list`
- `packages/usa-identifier`
- `packages/usa-input`
- `packages/usa-link`
- `packages/usa-list`
- `packages/usa-modal`
- `packages/usa-nav`
- `packages/usa-pagination`
- `packages/usa-radio`
- `packages/usa-search`
- `packages/usa-select`
- `packages/usa-sidenav`
- `packages/usa-site-alert`
- `packages/usa-step-indicator`
- `packages/usa-table`
- `packages/usa-tag`
- `packages/usa-textarea`
- `packages/usa-tooltip`

### Layout
- `packages/usa-layout-grid`

### Core (always needed)
- `packages/required` (always import first)

---

## 🎨 Creating a New Modular USWDS Block

### Step 1: Create Block Directory

```bash
mkdir -p blocks/uswds-alert
```

### Step 2: Create SCSS File

**blocks/uswds-alert/uswds-alert.scss:**

```scss
// Import shared settings
@import "../../styles/uswds/uswds-theme-settings";

// Import required packages
@import "packages/required";
@import "packages/usa-alert";

// Optional: Block-specific customizations
.uswds-alert {
  // Your custom styles
}
```

### Step 3: Create JS File

**blocks/uswds-alert/uswds-alert.js:**

```javascript
export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  
  rows.forEach((row) => {
    const alert = document.createElement('div');
    alert.className = 'usa-alert usa-alert--info';
    
    const alertBody = document.createElement('div');
    alertBody.className = 'usa-alert__body';
    alertBody.innerHTML = row.innerHTML;
    
    alert.appendChild(alertBody);
    row.replaceWith(alert);
  });
}
```

### Step 4: Add to Build Script

Update `package.json` build script to include your new block:

```json
"build:uswds-blocks": "sass ... && sass --load-path=node_modules/uswds/dist/scss blocks/uswds-alert/uswds-alert.scss blocks/uswds-alert/uswds-alert.css"
```

### Step 5: Build

```bash
npm run build:uswds-blocks
```

### Step 6: Use in Content

```
| USWDS Alert |
| --- |
| This is an important message! |
```

---

## 🔄 Updating USWDS (Still Easy!)

Even with modular blocks, updating is simple:

```bash
# 1. Update USWDS
npm update uswds

# 2. Rebuild your blocks
npm run build:uswds-blocks

# 3. Test
# 4. Deploy
```

---

## 💡 Best Practices

### 1. **Share Settings**
- Keep `uswds-theme-settings.scss` in one place
- Import it in each block
- All blocks use consistent theme

### 2. **Only Import What You Need**
- Each block should import only its required packages
- Don't import `uswds-utilities` in blocks if using Approach 2

### 3. **Follow Edge Delivery Conventions**
- Keep block naming consistent: `uswds-[component]`
- Use Edge Delivery's standard block structure
- Document block usage

### 4. **Measure Performance**
- Use browser DevTools to verify on-demand loading
- Compare before/after file sizes
- Test on slow connections

### 5. **Consider Your Use Case**
- **Few USWDS components**: Approach 1 (pure modular)
- **Heavy utility usage**: Approach 2 (utilities + blocks)
- **Prototyping**: Approach 3 (monolith first)

---

## 🎯 Recommendation

**For most Edge Delivery + USWDS projects:**

Use **Approach 2: Utilities Base + Component Blocks**

**Why?**
- ✅ USWDS utilities are incredibly useful (spacing, colors, typography)
- ✅ Utilities are small (~50-100KB) and worth loading globally
- ✅ Component blocks stay small (only component-specific CSS)
- ✅ Best balance of modularity and practicality
- ✅ Follows Edge Delivery patterns while leveraging USWDS strengths

---

## 📖 Further Reading

- **Edge Delivery Blocks**: [AEM Documentation](https://www.aem.live/developer/block-collection)
- **USWDS Packages**: Check `node_modules/uswds/dist/scss/packages/` for all available packages
- **Performance Guide**: Measure with Chrome DevTools Network tab

---

## 🆘 Troubleshooting

### Block CSS not compiling

**Problem**: SCSS compilation fails

**Solution**: Check that:
1. Path to settings is correct (`../../styles/uswds/uswds-theme-settings`)
2. Load path includes USWDS: `--load-path=node_modules/uswds/dist/scss`
3. Package name is correct (check `node_modules/uswds/dist/scss/packages/`)

### Styles not applying

**Problem**: USWDS classes don't work in block

**Solution**: Verify:
1. Block CSS file was generated (`.scss` → `.css`)
2. Edge Delivery is loading the CSS file (check Network tab)
3. Block JavaScript is decorating elements correctly

### Large file sizes

**Problem**: Block CSS files are still large

**Solution**:
1. Check you're only importing needed packages
2. Don't import utilities in each block (use Approach 2 instead)
3. Verify compression is enabled (`--style=compressed`)

---

**Last Updated**: November 2025  
**Recommended Approach**: Utilities Base + Component Blocks

