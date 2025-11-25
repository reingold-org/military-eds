# Grid Block (USWDS)

This block creates USWDS grid layouts from your content.

## Usage

### Equal Columns

```
| Grid |
| --- |
| Column 1 | Column 2 | Column 3 |
```

Creates three equal-width columns on tablet and above.

### Custom Column Widths

```
| Grid |
| --- |
| 8-4 |
| Wide column (8/12) | Narrow column (4/12) |
```

First cell can specify custom widths using USWDS 12-column grid notation.

### Common Layouts

**Two Columns (50/50):**
```
| Grid |
| --- |
| Left half | Right half |
```

**Sidebar Layout (8/4):**
```
| Grid |
| --- |
| 8-4 |
| Main content | Sidebar |
```

**Three Columns (4/4/4):**
```
| Grid |
| --- |
| Column 1 | Column 2 | Column 3 |
```

## Features

- **Modular**: Only 28KB CSS loaded on-demand
- **USWDS Grid System**: Uses official 12-column grid
- **Responsive**: Automatically stacks on mobile
- **Flexible**: Supports custom column widths

## Customization

Edit `grid.scss` to customize grid behavior or add breakpoint variants.

## Build

```bash
npm run build:uswds-blocks
```

