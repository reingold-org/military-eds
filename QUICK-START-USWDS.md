# USWDS Quick Start Guide

## ✅ Setup Complete!

USWDS has been successfully integrated into your project. Here's how to use it:

## 🚀 Step 1: Include USWDS CSS

Edit your `head.html` file and add:

```html
<link rel="stylesheet" href="/styles/uswds-compiled.css">
```

**Or** import it in your `styles/styles.css`:

```css
@import url('uswds-compiled.css');
```

## 🎨 Step 2: Start Using USWDS

### Example: USWDS Button

```html
<button class="usa-button">Primary Button</button>
<button class="usa-button usa-button--secondary">Secondary Button</button>
<button class="usa-button usa-button--outline">Outline Button</button>
```

### Example: USWDS Card

```html
<div class="usa-card">
  <div class="usa-card__container">
    <header class="usa-card__header">
      <h2 class="usa-card__heading">Card Title</h2>
    </header>
    <div class="usa-card__body">
      <p>Card content goes here.</p>
    </div>
    <div class="usa-card__footer">
      <button class="usa-button">Action</button>
    </div>
  </div>
</div>
```

### Example: USWDS Grid

```html
<div class="grid-container">
  <div class="grid-row">
    <div class="tablet:grid-col-6">
      <p>Left column</p>
    </div>
    <div class="tablet:grid-col-6">
      <p>Right column</p>
    </div>
  </div>
</div>
```

### Example: USWDS Utilities

```html
<!-- Spacing -->
<div class="padding-4 margin-bottom-2">...</div>

<!-- Typography -->
<p class="font-sans-lg text-bold">Large bold text</p>

<!-- Colors -->
<div class="bg-primary text-white padding-2">Colored box</div>

<!-- Display -->
<div class="display-flex flex-justify-center">Centered content</div>
```

## 🔄 Rebuilding After Changes

When you modify USWDS theme settings:

```bash
npm run build:uswds
```

During development, watch for changes:

```bash
npm run watch:uswds
```

## 📚 Resources

- **Components**: https://designsystem.digital.gov/components/
- **Utilities**: https://designsystem.digital.gov/utilities/
- **Design Tokens**: https://designsystem.digital.gov/design-tokens/
- **Full Documentation**: See `USWDS-INTEGRATION.md` and `styles/uswds/README.md`

## 🔧 Customization

### Theme Settings

Edit `styles/uswds/uswds-theme-settings.scss` to customize:
- Colors
- Typography
- Spacing
- Component settings

### Custom Styles

Edit `styles/uswds/uswds-theme-custom.scss` for:
- Custom component styles
- Military branch theme overrides
- Additional utilities

### After Changes

Always rebuild:

```bash
npm run build:uswds
```

## 📦 Updating USWDS

To update to the latest USWDS version:

```bash
npm update uswds
npm run build:uswds
```

## ⚡ Next Steps

1. Include the compiled CSS in your `head.html`
2. Explore the [component library](https://designsystem.digital.gov/components/)
3. Start using USWDS classes in your blocks
4. Customize theme settings as needed
5. Test and deploy!

---

**Need Help?** Check the detailed guides:
- **Integration Overview**: `USWDS-INTEGRATION.md`
- **Detailed Guide**: `styles/uswds/README.md`

