# Card Block (USWDS)

This block creates USWDS-styled cards from your content.

## Usage

```
| Card |
| --- |
| Card Title |
| This is the card body content with your description. |
| [Action Button](https://example.com) |
```

## Structure

Each row becomes a different part of the card:

1. **First row**: Card header (title)
2. **Second row**: Card body (content)
3. **Third row** (optional): Card footer (actions/links)

## With Image

If the first cell contains an image, it becomes card media:

```
| Card |
| --- |
| ![Alt text](image.jpg) |
| Card Title |
| Card body content. |
| [Action](https://example.com) |
```

## Features

- **Modular**: Only 20KB CSS loaded on-demand
- **USWDS Compliant**: Uses official USWDS card styles
- **Accessible**: WCAG 2.1 AA compliant
- **Flexible**: Supports various content combinations

## Customization

Edit `card.scss` to customize the card styles or layouts.

## Build

```bash
npm run build:uswds-blocks
```

