# USWDS Integration for Military EDS

This document provides a high-level overview of the U.S. Web Design System (USWDS) integration in this project.

## 🎯 Overview

The U.S. Web Design System (USWDS) is now integrated into this project, providing:

- **Federal Compliance**: USWDS is required for many federal websites (21st Century IDEA)
- **Accessibility**: WCAG 2.1 AA compliant components
- **Responsive Design**: Mobile-first, responsive components
- **Design Consistency**: Unified design language across federal digital services
- **Easy Updates**: Managed via npm for simple version updates

## 📦 What's Been Set Up

### 1. Dependencies

USWDS and Sass compiler have been added to `package.json`:
- `uswds` - The US Web Design System
- `sass` - Sass compiler for building USWDS CSS

### 2. File Structure

```
styles/uswds/
├── README.md                    # Detailed integration guide
├── uswds-theme-settings.scss    # USWDS theme configuration
├── uswds-theme-custom.scss      # Custom styles and branch themes
└── uswds.scss                   # Main USWDS import file

styles/
└── uswds-compiled.css           # Compiled output (gitignored)
```

### 3. Build Scripts

New npm scripts in `package.json`:

```bash
# Build USWDS CSS (run once)
npm run build:uswds

# Watch for changes (during development)
npm run watch:uswds

# Build all assets
npm run build
```

### 4. Theme Configuration

The integration preserves your existing military branch themes:
- Army (`.army`)
- Navy (`.navy`)
- Air Force (`.airforce`)
- Marines (`.marines`)
- Coast Guard (`.coastguard`)
- Space Force (`.spaceforce`)
- Department of Defense (`.dod`)

## 🚀 Getting Started

### Step 1: Build USWDS

```bash
npm run build:uswds
```

This compiles the USWDS Sass files into `styles/uswds-compiled.css`.

### Step 2: Include in Your Project

Add the compiled CSS to your project by editing `head.html`:

```html
<link rel="stylesheet" href="/styles/uswds-compiled.css">
```

Or import it in your existing `styles.css`:

```css
@import url('uswds-compiled.css');
```

### Step 3: Start Using USWDS

You can now use USWDS components and utilities in your HTML and blocks!

```html
<!-- USWDS Button -->
<button class="usa-button">Click Me</button>

<!-- USWDS Card -->
<div class="usa-card">
  <div class="usa-card__container">
    <div class="usa-card__body">
      <p>Content here</p>
    </div>
  </div>
</div>

<!-- USWDS Utilities -->
<div class="padding-4 bg-primary text-white">
  Styled with USWDS utilities
</div>
```

## 🔄 Keeping USWDS Updated

One of the key benefits of this integration is easy updates:

### Check for Updates

```bash
npm outdated
```

### Update USWDS

```bash
npm update uswds
```

### After Updating

1. Review the [USWDS Changelog](https://github.com/uswds/uswds/releases)
2. Rebuild: `npm run build:uswds`
3. Test your site for any breaking changes
4. Deploy the updated CSS

## 🎨 Customization

### Theme Settings

Edit `styles/uswds/uswds-theme-settings.scss` to customize:

- Colors (primary, secondary, base)
- Typography (fonts, sizes)
- Spacing and layout
- Component-specific settings

### Custom Styles

Add your own styles in `styles/uswds/uswds-theme-custom.scss` to:

- Extend USWDS components
- Override specific styles
- Add custom components
- Maintain military branch themes

### Selective Imports

To reduce file size, edit `styles/uswds/uswds.scss` to import only the USWDS packages you need. Instructions are in the file comments.

## 📖 Documentation

- **Detailed Guide**: See `styles/uswds/README.md` for comprehensive documentation
- **USWDS Docs**: https://designsystem.digital.gov/
- **Component Library**: https://designsystem.digital.gov/components/
- **Utilities**: https://designsystem.digital.gov/utilities/

## 🔍 Key Features

### Components Available

USWDS provides 40+ accessible, responsive components:

- **Navigation**: Header, footer, navigation, breadcrumbs
- **Forms**: Inputs, buttons, checkboxes, radio buttons, date pickers
- **Content**: Cards, collections, typography, tables
- **Feedback**: Alerts, banners, modals, tooltips
- **Layout**: Grid system, sections, spacing utilities

### Utility Classes

USWDS includes comprehensive utility classes for:

- **Spacing**: Margins and padding
- **Typography**: Font sizes, weights, alignment
- **Colors**: Background and text colors
- **Layout**: Display, flexbox, grid
- **Borders**: Border utilities
- **And more**: Width, height, position, etc.

### Design Tokens

USWDS uses design tokens for consistency:

- **Colors**: Systematic color palette
- **Typography**: Type scale and font families
- **Spacing**: Consistent spacing units
- **Breakpoints**: Responsive breakpoints

## 🤝 Integration with AEM Edge Delivery

USWDS works seamlessly with AEM Edge Delivery Services:

### In Existing Blocks

Add USWDS classes to your block elements:

```javascript
export default function decorate(block) {
  const button = block.querySelector('a');
  button.classList.add('usa-button', 'usa-button--big');
}
```

### Creating New Blocks

Use USWDS components as building blocks:

```javascript
export default function decorate(block) {
  const card = document.createElement('div');
  card.className = 'usa-card usa-card--flag';
  // ... build component
  block.appendChild(card);
}
```

### With Existing Styles

USWDS and your existing styles coexist. The integration:
- Preserves your military branch themes
- Maintains your custom heading styles (with accent bars)
- Keeps your existing layout patterns
- Adds USWDS as an additional option

## 📊 Project Structure

```
military-eds/
├── blocks/                      # Your existing blocks
├── styles/
│   ├── uswds/                  # USWDS integration (new)
│   │   ├── README.md
│   │   ├── uswds.scss
│   │   ├── uswds-theme-settings.scss
│   │   └── uswds-theme-custom.scss
│   ├── styles.css              # Your existing styles
│   ├── fonts.css
│   ├── lazy-styles.css
│   └── uswds-compiled.css      # Generated (gitignored)
├── head.html                   # Include compiled CSS here
└── package.json                # Updated with USWDS & build scripts
```

## ⚡ Performance Considerations

### File Size

Full USWDS build is ~400KB (minified). To reduce:

1. Use selective imports (see `styles/uswds/uswds.scss`)
2. Import only needed components
3. Consider purging unused CSS in production

### Loading Strategy

- Load USWDS CSS early (in `<head>`)
- Consider async loading for non-critical components
- Use USWDS's built-in responsive loading

### Caching

- USWDS CSS is static and caches well
- Version the filename for cache busting
- Use CDN if available

## ✅ Best Practices

1. **Build Before Committing**: Always run `npm run build:uswds` before committing changes to USWDS files
2. **Don't Commit Compiled CSS**: The compiled CSS is gitignored - it should be built during deployment
3. **Test Cross-Browser**: USWDS supports IE11+, test your customizations
4. **Accessibility First**: Don't override USWDS accessibility features
5. **Use Design Tokens**: Prefer USWDS tokens over hard-coded values
6. **Document Changes**: Add comments when customizing theme settings
7. **Version Control**: Pin USWDS version in `package.json` for stability

## 🛠️ Troubleshooting

### Build Fails

If `npm run build:uswds` fails:

1. Check that dependencies are installed: `npm install`
2. Verify Sass is installed: `npm list sass`
3. Check for syntax errors in `.scss` files

### Styles Not Applying

If USWDS styles aren't showing:

1. Verify compiled CSS is generated: Check for `styles/uswds-compiled.css`
2. Confirm CSS is linked in `head.html`
3. Check browser console for 404 errors
4. Clear browser cache

### Conflicts with Existing Styles

If USWDS conflicts with your styles:

1. Use more specific selectors
2. Adjust load order (USWDS first, then your styles)
3. Use selective imports to reduce conflicts
4. Consider CSS layers/cascade layers

## 📞 Support and Resources

- **USWDS Documentation**: https://designsystem.digital.gov/
- **GitHub Issues**: https://github.com/uswds/uswds/issues
- **USWDS Slack**: https://chat.designsystem.digital.gov/
- **Project README**: `styles/uswds/README.md`

## 🎓 Next Steps

1. ✅ **Learn USWDS**: Explore the [component library](https://designsystem.digital.gov/components/)
2. ✅ **Customize Theme**: Edit theme settings to match your brand
3. ✅ **Integrate Components**: Start using USWDS components in your blocks
4. ✅ **Optimize**: Use selective imports to reduce file size
5. ✅ **Test**: Verify accessibility and responsive behavior
6. ✅ **Deploy**: Build and deploy USWDS CSS with your site

---

**Installation Date**: November 2025  
**USWDS Version**: Check `package.json`  
**Integration Type**: Full Framework  
**Compilation**: Sass → CSS (npm scripts)

