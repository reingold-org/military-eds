# Dynamic Hero Block

A flexible hero banner that supports both **automatic** (dynamic) and **manual** (authored) content modes.

## Usage

### Mode 1: Dynamic (Automatic)

Simply create an empty block to automatically display the most recent featured article:

```
| Dynamic Hero |
```

**Behavior:**
- Displays the most recent featured article from the news feed
- Automatically filters for featured articles only
- Sorted by release date (newest first)
- No configuration needed

### Mode 2: Manual (Authored Content)

Create a block with your own content in four rows:

| Dynamic Hero |
|---|
| (Your image) |
| Your Headline |
| Your description text goes here |
| [Button Text](link-url) |

**Row breakdown:**
1. **Row 1 - Image**: Add a picture for the hero background
2. **Row 2 - Headline**: The main title text (can be plain text or heading)
3. **Row 3 - Description**: A brief description or tagline
4. **Row 4 - CTA (optional)**: A link that becomes the call-to-action button

## Features

- ✅ Large, eye-catching hero banner
- ✅ Automatic image optimization
- ✅ Text overlay with gradient background for readability
- ✅ Responsive design
- ✅ Call-to-action button
- ✅ Supports both dynamic and manual content

## Dynamic Mode Details

When no content is authored, the block will automatically:
1. Fetch all articles with `feature='true'`
2. Sort them by release date (newest first)
3. Display the most recent one

## Layout

- **Background:** Hero image (either from article or manually provided)
- **Content:** Title, description, and optional CTA button
- **Styling:** Text overlay with shadow for readability

## Notes

- If no featured articles are found in dynamic mode, a message will be displayed
- The hero image is loaded eagerly for best performance (above-the-fold content)
- Images are optimized for different screen sizes and formats (WebP, JPEG)
- The block automatically detects which mode to use based on whether content is provided

