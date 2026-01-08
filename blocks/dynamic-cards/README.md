# Dynamic Cards Block

Displays news articles in a responsive card grid with automatic fetching from the news feed.

## Usage

In your AEM document, create a block with configuration options:

### Basic Example (Uses Defaults)

```
| Dynamic Cards |
```

**Default behavior:**
- Displays **6 articles**
- Sorted by release date (newest first)
- Shows all articles (not filtered)

### Custom Configuration

```
| Dynamic Cards         |
| limit      | 9        |
| featured   | true     |
```

```
| Dynamic Cards         |
| limit      | 12       |
| category   | news     |
```

```
| Dynamic Cards         |
| limit      | 8        |
| tag        | navy     |
```

---

## Tiles Variant

The **tiles variant** displays cards in a Marines.mil-inspired layout with:
- Full-bleed background images
- Gradient overlay with text
- 1-2-3 grid pattern (1 large, 2 medium, then 3 per row)
- Accent bar and "Read More" link

### Usage

Add `(tiles)` after the block name:

```
| Dynamic Cards (tiles) |
| limit      | 6        |
```

### Tiles Variant Layout

- **Row 1:** 1 large card (full width)
- **Row 2:** 2 medium cards (half width each)
- **Row 3+:** 3 small cards per row (third width each)

### Example with Options

```
| Dynamic Cards (tiles) |
| limit      | 9        |
| featured   | true     |
```

---

## Configuration Options

| Option     | Type    | Default | Description                                    |
|------------|---------|---------|------------------------------------------------|
| `limit`    | number  | 6       | Number of articles to display                  |
| `featured` | boolean | false   | Show only featured articles (`true`/`false`)   |
| `category` | string  | -       | Filter by specific category                    |
| `tag`      | string  | -       | Filter by specific tag                         |
| `source`   | URL     | `/news/query-index.json` | Index source URL (multiple allowed) |

### Multiple Sources

You can specify one or more index sources. Articles from all sources are merged and sorted together by release date.

```
| Dynamic Cards         |
| source     | /news/query-index.json |
| source     | https://other-site.mil/articles/query-index.json |
| limit      | 6 |
```

**Notes:**
- If no `source` is specified, defaults to `/news/query-index.json`
- Multiple `source` rows are supported - all sources are fetched in parallel
- Sources can be relative paths or full URLs with domain
- Cross-domain sources require proper CORS headers on the remote server
- If a source fails to load, articles from other sources will still display

## Variants

| Variant   | Description                                                      |
|-----------|------------------------------------------------------------------|
| (default) | Standard card grid with image, title, description, and button    |
| `tiles`   | Full-bleed background images with overlay text (1-2-3 layout)    |

## Features

- ✅ Responsive grid layout (auto-adjusts columns based on screen size)
- ✅ Automatic image optimization
- ✅ Hover effects on cards
- ✅ Clean, modern design
- ✅ Mobile-friendly
- ✅ **Tiles variant** for immersive photo-centric layouts

## Layout

### Default Variant
- **Mobile:** 1 column
- **Tablet:** 2-3 columns (depends on screen width)
- **Desktop:** 3-4 columns (depends on screen width and card count)

### Tiles Variant
- **Mobile:** 1 column (all cards stacked)
- **Tablet:** 2 columns (large spans full, others 1 each)
- **Desktop:** 6-column grid (large=6, medium=3, small=2)

## Notes

- Articles are automatically sorted by release date (newest first)
- If no articles match the criteria, a message will be displayed
- Images are optimized for different screen sizes and formats (WebP, JPEG)
- All cards have consistent heights for a clean grid appearance
- **Automatic Deduplication:** If a Dynamic Hero block appears on the same page, the cards will automatically exclude the hero's article to prevent duplicates. This also works between multiple dynamic blocks on the same page.
- The **tiles variant** uses the branch's accent color for the accent bar and link icon

