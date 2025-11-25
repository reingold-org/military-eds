# USWDS Integration Guide

This directory contains the U.S. Web Design System (USWDS) integration for the Military EDS project.

## 📁 Directory Structure

```
styles/uswds/
├── README.md                    # This file
├── uswds-theme-settings.scss    # USWDS theme configuration
├── uswds-theme-custom.scss      # Custom styles and overrides
└── uswds.scss                   # Main USWDS import file
```

## 🚀 Quick Start

### 1. Build USWDS CSS

Compile the USWDS Sass files to CSS:

```bash
npm run build:uswds
```

This will create `styles/uswds-compiled.css` which you can include in your project.

### 2. Watch for Changes (Development)

During development, automatically recompile when Sass files change:

```bash
npm run watch:uswds
```

### 3. Include USWDS in Your Project

Add the compiled CSS to your HTML `<head>` section. In AEM Edge Delivery, you can do this by:

#### Option A: Add to `head.html`

Edit `/head.html` and add:

```html
<link rel="stylesheet" href="/styles/uswds-compiled.css">
```

#### Option B: Import in existing CSS

In your `styles/styles.css`, add at the top:

```css
@import url('uswds-compiled.css');
```

## ⚙️ Configuration

### Theme Settings (`uswds-theme-settings.scss`)

This file contains all USWDS theme customization options. Key settings include:

- **Typography**: Font families, sizes, and weights
- **Colors**: Primary, secondary, and base color palettes
- **Components**: Individual component settings
- **Layout**: Grid, spacing, and breakpoints

**To customize colors for different military branches**, the theme colors are already mapped to work with your existing body classes (`.army`, `.navy`, `.airforce`, etc.).

### Custom Styles (`uswds-theme-custom.scss`)

Add your custom CSS overrides here. This file:

- Extends USWDS with your military branch themes
- Maintains compatibility with existing AEM Edge Delivery blocks
- Preserves custom styling like heading accent bars

### Main Import (`uswds.scss`)

This is the entry point for compilation. By default, it imports the full USWDS framework.

#### Selective Import for Smaller File Size

If you want to reduce the compiled CSS size, edit `uswds.scss` and:

1. Comment out the full USWDS import:
   ```scss
   // @forward "uswds";
   ```

2. Uncomment the selective imports section and choose only the packages you need:
   ```scss
   @forward "packages/usa-button";
   @forward "packages/usa-card";
   // ... only what you need
   ```

## 🔄 Updating USWDS

To update to the latest version of USWDS:

```bash
npm update uswds
```

After updating:

1. **Review the changelog**: Check [USWDS releases](https://github.com/uswds/uswds/releases) for breaking changes
2. **Rebuild**: Run `npm run build:uswds`
3. **Test**: Verify your site still looks and functions correctly
4. **Adjust**: Update theme settings if needed

## 🎨 Using USWDS Components

### HTML Components

USWDS provides HTML component templates. Use them in your AEM blocks or content:

```html
<!-- Example: USWDS Button -->
<button class="usa-button">Default Button</button>
<button class="usa-button usa-button--secondary">Secondary Button</button>

<!-- Example: USWDS Card -->
<div class="usa-card">
  <div class="usa-card__container">
    <header class="usa-card__header">
      <h2 class="usa-card__heading">Card Title</h2>
    </header>
    <div class="usa-card__body">
      <p>Card content goes here.</p>
    </div>
  </div>
</div>
```

### Utility Classes

USWDS includes powerful utility classes for spacing, typography, colors, and more:

```html
<!-- Spacing utilities -->
<div class="padding-4 margin-bottom-2">...</div>

<!-- Typography utilities -->
<p class="font-sans-lg text-bold">...</p>

<!-- Color utilities -->
<div class="bg-primary text-white">...</div>
```

[Full utility class reference](https://designsystem.digital.gov/utilities/)

## 🏗️ Integration with AEM Edge Delivery

### Using USWDS with Your Existing Blocks

Your existing blocks can use USWDS classes alongside your custom styles:

```javascript
// In a block's JavaScript file
export default function decorate(block) {
  // Add USWDS classes to elements
  const button = block.querySelector('a');
  button.classList.add('usa-button', 'usa-button--big');
  
  const container = block.querySelector('.container');
  container.classList.add('grid-container');
}
```

### Creating New Blocks with USWDS

When creating new blocks, you can use USWDS components as a foundation:

```javascript
// blocks/my-component/my-component.js
export default function decorate(block) {
  const card = document.createElement('div');
  card.className = 'usa-card';
  
  const cardContainer = document.createElement('div');
  cardContainer.className = 'usa-card__container';
  
  // ... build your component
  
  block.appendChild(card);
}
```

## 📚 USWDS Resources

- **Documentation**: https://designsystem.digital.gov/
- **Components**: https://designsystem.digital.gov/components/
- **Design Tokens**: https://designsystem.digital.gov/design-tokens/
- **GitHub**: https://github.com/uswds/uswds
- **Community**: https://designsystem.digital.gov/about/community/

## 🔧 Troubleshooting

### Build Errors

**Issue**: Sass compilation fails
```bash
Error: Can't find stylesheet to import.
```

**Solution**: Make sure USWDS is installed:
```bash
npm install
```

### Path Issues

**Issue**: Images or fonts not loading

**Solution**: Check the paths in `uswds-theme-settings.scss`:
```scss
$theme-image-path: "../node_modules/uswds/dist/img";
$theme-font-path: "../node_modules/uswds/dist/fonts";
```

### Styling Conflicts

**Issue**: USWDS styles override your custom styles

**Solution**: 
1. Increase specificity of your custom styles
2. Use `!important` sparingly for critical overrides
3. Consider selective imports to reduce conflicts

### Large File Size

**Issue**: Compiled CSS is too large

**Solution**: Use selective imports in `uswds.scss` to include only the components you need.

## 🎯 Best Practices

1. **Version Control**: Always commit your theme settings and custom styles
2. **Don't Edit Core**: Never edit USWDS source files in `node_modules`
3. **Test Updates**: Always test in a development environment before deploying USWDS updates
4. **Document Customizations**: Add comments to your theme settings explaining why you chose specific values
5. **Use Design Tokens**: Prefer USWDS design tokens over hard-coded values
6. **Accessibility First**: USWDS is built for accessibility - don't override accessibility features
7. **Performance**: Monitor your compiled CSS size and use selective imports if needed

## 📝 Additional Notes

### Military Branch Themes

The integration automatically supports your existing military branch themes (Army, Navy, Air Force, Marines, Coast Guard, Space Force, DoD). The color mappings are in `uswds-theme-custom.scss`.

### Design Tokens

USWDS uses a design token system for consistency. Common tokens include:

- **Colors**: `$theme-color-primary`, `$theme-color-base-*`
- **Spacing**: `$theme-spacing-*`
- **Typography**: `$theme-font-*`
- **Breakpoints**: `$theme-*-width`

### Production Deployment

For production:

1. Build the USWDS CSS: `npm run build:uswds`
2. The compiled CSS (`styles/uswds-compiled.css`) should be deployed with your site
3. Ensure fonts and images from USWDS are accessible (may need to copy from `node_modules/uswds/dist/`)

---

**Last Updated**: November 2025  
**USWDS Version**: Check `package.json` for current version  
**Maintainer**: Your Team

