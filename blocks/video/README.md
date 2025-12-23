# Video Block

This block displays videos from various sources including YouTube, Vimeo, DVIDS, and self-hosted MP4 files.

Based on the [AEM Block Collection Video](https://www.hlx.live/developer/block-collection/video).

## Usage

### Basic Video (MP4)

```
| Video |
| --- |
| https://example.com/video.mp4 |
```

### YouTube Video

```
| Video |
| --- |
| https://www.youtube.com/watch?v=VIDEO_ID |
```

### Vimeo Video

```
| Video |
| --- |
| https://vimeo.com/VIDEO_ID |
```

### DVIDS Video

```
| Video |
| --- |
| https://www.dvidshub.net/video/123456/video-title |
```

DVIDS (Defense Visual Information Distribution Service) videos are automatically detected and embedded using the DVIDS player.

## With Poster/Placeholder Image

Add an image to show as a placeholder before the video plays:

```
| Video |
| --- |
| ![Poster](poster-image.jpg) |
| https://www.youtube.com/watch?v=VIDEO_ID |
```

When a poster image is present, a play button overlay appears. Clicking it loads and plays the video.

## Variants

### Autoplay

Add the `autoplay` variant to automatically play the video when it comes into view:

```
| Video (autoplay) |
| --- |
| https://www.youtube.com/watch?v=VIDEO_ID |
```

**Note:** Autoplay respects the user's `prefers-reduced-motion` setting.

## Features

- **Multi-source support**: YouTube, Vimeo, DVIDS, and MP4/WebM files
- **Lazy loading**: Videos load only when scrolled into view
- **Poster images**: Optional thumbnail placeholders
- **Accessibility**: Proper ARIA labels and keyboard support
- **Reduced motion**: Respects user preferences for reduced motion
- **Aspect ratio**: Maintains 16:9 aspect ratio to prevent layout shifts

## Supported Video Sources

| Source | URL Format |
| --- | --- |
| YouTube | `youtube.com/watch?v=ID` or `youtu.be/ID` |
| Vimeo | `vimeo.com/ID` |
| DVIDS | `dvidshub.net/video/ID`, `dvidshub.net/video/ID/title`, or `dvidshub.net/video/video:ID` |
| MP4 | Any URL ending in `.mp4` |
| WebM | Any URL ending in `.webm` |

## Customization

Edit `video.css` to customize styling such as:
- Maximum width
- Margins
- Play button appearance
- Focus states

