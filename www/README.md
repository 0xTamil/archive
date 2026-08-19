# 0xTamil Systems Reference - Web Application

A modern Wikipedia Vector 2022-inspired web catalog for **0xTamil Systems Engineering Learning Resources**.

The web application dynamically fetches, parses, and indexes resources directly from the repository's root `README.md` file in real time.

## Contents

- [Quick Start (Running Locally)](#quick-start-running-locally)
- [Features & Usage Guide](#features--usage-guide)
  - [Search & Multi-Tag Filtering](#search--multi-tag-filtering)
  - [Sorting](#sorting)
  - [Appearance & Themes](#appearance--themes)
  - [Bookmarks](#bookmarks)
  - [Keyboard Navigation](#keyboard-navigation)
- [How to Add or Update Resources](#how-to-add-or-update-resources)
  - [Resource Syntax Standard](#1-resource-syntax-standard)
  - [Automatic Tag Extraction](#2-automatic-tag-extraction)
  - [Testing Your Changes](#3-testing-your-changes)
- [Architecture](#architecture)

---

## Quick Start (Running Locally)

You can serve the web interface using any standard HTTP web server:

### Option 1: Python HTTP Server (Recommended)
```bash
# From the repository root directory
python3 -m http.server 8000 --directory www
```
Open **`http://localhost:8000`** in your browser.

### Option 2: Node.js / npx serve
```bash
npx serve www
```

### Option 3: Direct File Opening
You can also open `www/index.html` directly in any web browser.

---

## Features & Usage Guide

### Search & Multi-Tag Filtering
- **Search Bar**: Search instantaneously across resource titles, author names, descriptions, categories, and tags.
- **Multi-Tag Selector**: Click **Tags: All** in the header toolbar to toggle multi-tag filters (e.g., filter by `c` AND `kernel` AND `memory`).
- **Category Navigation**: Click any category or subcategory in the left **Contents** sidebar to view targeted sections.
- **Clear Filters**: When any search query, category, or tag filter is active, click **[Clear Filters]** beside the resource count (or click **(Top)** / **Reference Page**) to restore all resources.

### Sorting
Use the **Sort by** dropdown menu on the main toolbar to reorder resources:
- **Default (Category Order)**: Standard section order matching `README.md`.
- **Alphabetical (A-Z)**: Sort all resources alphabetically by title.
- **Alphabetical (Z-A)**: Sort all resources in reverse alphabetical order.
- **Most Bookmarked**: Prioritize resources you have bookmarked.

### Appearance & Themes
Click the **Appearance** menu in the header toolbar (or use the right sidebar) to customize:
- **Text Size**: `Small` (13px), `Standard` (15px), `Large` (17px).
- **Page Width**: `Standard` (1050px) or `Wide` (1440px).
- **Color Theme**:
  - `Automatic`: Matches your system dark/light preference in real time (`matchMedia`).
  - `Light`: Classic Wikipedia Vector 2022 light theme.
  - `Dark`: High-contrast dark theme with soft sky-cyan (`#4fc3f7`) link legibility.

### Bookmarks
- Click **Bookmark** on any resource card to save it locally.
- Bookmarks are persisted in browser `localStorage`.
- When bookmarks exist, a **Bookmarked (N)** section appears in the left Contents sidebar.

### Keyboard Navigation
| Key | Action |
| --- | --- |
| <kbd>j</kbd> | Move focus to the **next** resource card |
| <kbd>k</kbd> | Move focus to the **previous** resource card |
| <kbd>/</kbd> | Focus the search bar |
| <kbd>Esc</kbd> | Clear search, close popovers, or deselect resource card |
| <kbd>Enter</kbd> | Open the currently focused resource link in a new tab |

---

## How to Add or Update Resources

The website requires **no build step** or database updates. All content is fetched and parsed from `README.md`.

### 1. Resource Syntax Standard
To add a new resource, open `README.md` and add a bullet point under the appropriate category (`## Category`) or subcategory (`### Subcategory`) following this exact format:

```markdown
- **[Resource Title](URL)** (Author Name): Concise description ending with a period.
```

#### Examples:
- **With Author**:
  ```markdown
  - **[Crafting Interpreters](https://craftinginterpreters.com/)** (Robert Nystrom): parsing, semantics, bytecode, and garbage collection.
  ```
- **Without Author**:
  ```markdown
  - **[Beej's Guide to C Programming](https://beej.us/guide/bgc/)**: C standard library reference with examples.
  ```
- **Without Description** (title-only link):
  ```markdown
  - **[Exploring how computer works](https://www.youtube.com/watch?v=QZwneRb-zqA)**
  ```

#### Category Description Paragraphs
You can add introductory text below any `## Category` or `### Subcategory` header. Plain text lines (not headers or bullet items) will be displayed as a description paragraph above the resource list:

```markdown
## Getting Started
Start here if you're new to systems programming and computer science.

- **[Teach Yourself CS](https://teachyourselfcs.com/)**
```

### 2. Automatic Tag Extraction
The parser automatically generates tags for resources based on keywords found in titles, descriptions, and category names. Tags are matched using **word-boundary detection** to avoid false positives (e.g., the tag `c` won't match words like "concurrency" or "c++"). Recognized keywords include:

`c`, `c++`, `rust`, `zig`, `odin`, `opengl`, `vulkan`, `webgpu`, `shaders`, `kernel`, `os`, `x86`, `arm`, `risc-v`, `assembly`, `compiler`, `interpreter`, `networking`, `database`, `distributed`, `algorithms`, `graphics`, `reverse engineering`, `malware`, `memory`, `concurrency`, `bytecode`, `garbage collection`, `sockets`, `linux`, `unix`, `raft`, `b-trees`, `lsm-trees`, `virtualization`.

### 3. Testing Your Changes
1. Edit `README.md`.
2. Refresh `www/index.html` in your browser.
3. The new resource will automatically appear with parsed metadata and tags.

---

## Architecture

- `www/index.html` - Semantic HTML5 Vector 2022 structure.
- `www/style.css` - Responsive Vanilla CSS design system with CSS custom properties for Light/Dark themes.
- `www/resourcesData.js` - Dynamic Markdown parser & search/sort data layer.
- `www/app.js` - UI controller, event management, theme engine, and keyboard navigation.
