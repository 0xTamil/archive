/**
 * Learning Resources Data & Parser Module
 * 0xTamil Systems & Engineering Learning Resources
 *
 * Dynamically fetches and parses README.md from:
 * https://raw.githubusercontent.com/0xTamil/archive/main/README.md
 * or local README.md file path.
 */

// GitHub Raw URL derived from repository URL: https://github.com/0xTamil/archive/edit/main/README.md
const PRIMARY_README_URL = 'https://raw.githubusercontent.com/0xTamil/archive/main/README.md';
const LOCAL_README_PATH = '../README.md';

/**
 * Parses markdown text following the resource pattern:
 * - H2 / H3 headers specify categories and subcategories
 * - Bullet items match: - **[Title](URL)** [(Author)]: Description.
 *
 * @param {string} markdownText - Raw markdown input string
 * @returns {Array} Structured list of category objects with nested resources
 */
function parseMarkdownResources(markdownText) {
  if (!markdownText) return [];

  const lines = markdownText.split('\n');
  const categories = [];
  let currentCategory = null;
  let currentSubcategory = null;
  let itemCounter = 0;

  // Regex pattern for matching resource items:
  // - **[Title](URL)** (Author): Description
  // or - **[Title](URL)**: Description
  // or - **[Title](URL)**  (no description)
  const itemRegex = /^-\s+\*\*\[(.*?)\]\((.*?)\)\*\*(?:\s+\((.*?)\))?(?::\s*(.*))?$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      const catTitle = line.replace('## ', '').trim();
      if (catTitle === 'License') continue;

      currentCategory = {
        id: slugify(catTitle),
        title: catTitle,
        description: '',
        subcategories: [],
        resources: []
      };
      currentSubcategory = null;
      categories.push(currentCategory);
    } else if (line.startsWith('### ')) {
      const subTitle = line.replace('### ', '').trim();
      currentSubcategory = {
        id: slugify(subTitle),
        title: subTitle,
        description: '',
        resources: []
      };
      if (currentCategory) {
        currentCategory.subcategories.push(currentSubcategory);
      }
    } else if (line.startsWith('- ')) {
      const match = line.match(itemRegex);
      if (match) {
        const title = match[1].trim();
        const url = match[2].trim();
        const author = match[3] ? match[3].trim() : null;
        const description = match[4] ? match[4].trim() : '';

        const resource = {
          id: slugify(title),
          addedIndex: itemCounter++,
          title: title,
          url: url,
          author: author,
          description: description,
          category: currentCategory ? currentCategory.title : 'General',
          categoryId: currentCategory ? currentCategory.id : 'general',
          subcategory: currentSubcategory ? currentSubcategory.title : null,
          subcategoryId: currentSubcategory ? currentSubcategory.id : null,
          tags: extractTags(title, description, currentCategory ? currentCategory.title : '', currentSubcategory ? currentSubcategory.title : '')
        };

        if (currentSubcategory) {
          currentSubcategory.resources.push(resource);
        } else if (currentCategory) {
          currentCategory.resources.push(resource);
        }
      }
    } else if (currentCategory || currentSubcategory) {
      // Plain text line (not a header, not a bullet) — treat as category/subcategory description
      if (currentSubcategory) {
        currentSubcategory.description += (currentSubcategory.description ? ' ' : '') + line;
      } else if (currentCategory) {
        currentCategory.description += (currentCategory.description ? ' ' : '') + line;
      }
    }
  }

  return categories;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\+\+/g, 'pp')       // c++ → cpp, not just c
    .replace(/c#/g, 'csharp')     // c# → csharp
    .replace(/\+/g, 'plus')       // remaining + signs
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractTags(title, description, category, subcategory) {
  const combined = `${title} ${description} ${category} ${subcategory}`.toLowerCase();
  const candidates = [
    'c', 'c++', 'rust', 'zig', 'odin', 'opengl', 'vulkan', 'webgpu', 'shaders',
    'kernel', 'os', 'x86', 'arm', 'risc-v', 'assembly', 'compiler',
    'interpreter', 'networking', 'database', 'distributed', 'algorithms',
    'graphics', 'reverse engineering', 'malware', 'memory', 'concurrency',
    'bytecode', 'garbage collection', 'sockets', 'linux', 'unix', 'raft',
    'b-trees', 'lsm-trees', 'virtualization'
  ];

  const matched = new Set();
  candidates.forEach(tag => {
    // Use word-boundary regex to avoid partial matches (e.g. 'c' matching 'concurrency')
    const escaped = escapeRegExp(tag);
    const regex = new RegExp(`(?:^|[\\s,;:()\\[\\]/])${escaped}(?:$|[\\s,;:()\\[\\]/])`, 'i');
    // Also check if the combined text starts or ends with the tag
    if (regex.test(` ${combined} `)) {
      matched.add(tag);
    }
  });

  // If 'c++' matched, don't also add 'c' from the same context
  if (matched.has('c++') && matched.has('c')) {
    // Only keep 'c' if it genuinely appears as standalone (not just from c++)
    const withoutCpp = combined.replace(/c\+\+/g, '');
    const cRegex = new RegExp(`(?:^|[\\s,;:()\\[\\]/])c(?:$|[\\s,;:()\\[\\]/])`, 'i');
    if (!cRegex.test(` ${withoutCpp} `)) {
      matched.delete('c');
    }
  }

  return Array.from(matched);
}

/**
 * Main LearningResources API object
 */
const LearningResources = {
  rawMarkdown: '',
  categories: [],
  resources: [],
  parseMarkdownResources: parseMarkdownResources,

  /**
   * Fetches README.md from remote GitHub raw URL or local README file,
   * then parses the text into categories and resources.
   *
   * @param {string} [customUrl] - Optional URL or path to fetch
   * @returns {Promise<Object>} Object containing parsed categories, resources, and stats
   */
  fetchData: async function (customUrl) {
    let markdownText = '';
    const fetchCandidates = [
      customUrl,
      PRIMARY_README_URL,
      LOCAL_README_PATH,
      './README.md',
      'README.md'
    ].filter(Boolean);

    // 1. Browser Fetch Attempt
    if (typeof fetch !== 'undefined') {
      for (const source of fetchCandidates) {
        try {
          const res = await fetch(source);
          if (res.ok) {
            const fetched = await res.text();
            if (fetched && fetched.includes('Learning Resources')) {
              markdownText = fetched;
              console.log(`Successfully fetched README data from: ${source}`);
              break;
            }
          }
        } catch (e) {
          // Try next source candidate
        }
      }
    }

    // 2. Node.js environment fallback
    if (!markdownText && typeof window === 'undefined' && typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        const localCandidates = [
          path.resolve(__dirname, '../README.md'),
          path.resolve(process.cwd(), 'README.md'),
          path.resolve(process.cwd(), '../README.md')
        ];
        for (const p of localCandidates) {
          if (fs.existsSync(p)) {
            markdownText = fs.readFileSync(p, 'utf8');
            console.log(`Successfully read README data from local path: ${p}`);
            break;
          }
        }
      } catch (err) {
        console.warn('Node.js fs read error:', err);
      }
    }

    if (!markdownText) {
      throw new Error('Unable to fetch or read README.md from remote or local sources.');
    }

    // Store raw text & parsed objects
    this.rawMarkdown = markdownText;
    this.categories = parseMarkdownResources(markdownText);
    this.resources = [];
    this.categories.forEach(cat => {
      // Add resources directly under the category (no subcategory)
      cat.resources.forEach(res => this.resources.push(res));
      // Add resources under each subcategory
      if (cat.subcategories) {
        cat.subcategories.forEach(sub => {
          sub.resources.forEach(res => this.resources.push(res));
        });
      }
    });

    return {
      categories: this.categories,
      resources: this.resources,
      stats: this.getStats()
    };
  },

  /**
   * Return list of all unique tags with resource counts
   */
  getAllTags: function () {
    const tagMap = {};
    this.resources.forEach(res => {
      if (res.tags) {
        res.tags.forEach(tag => {
          tagMap[tag] = (tagMap[tag] || 0) + 1;
        });
      }
    });
    return Object.keys(tagMap).sort().map(tag => ({
      tag: tag,
      count: tagMap[tag]
    }));
  },

  /**
   * Search resources across title, author, description, category, subcategory, and tags.
   */
  searchResources: function (query, categoryFilter = 'all', bookmarkedIds = [], selectedTags = [], sortOption = 'default') {
    const q = query ? query.toLowerCase().trim() : '';
    const tagsArray = Array.isArray(selectedTags) ? selectedTags : (selectedTags && selectedTags !== 'all' ? [selectedTags] : []);

    const filtered = this.resources.filter(res => {
      // Multi-tag filter check
      if (tagsArray.length > 0) {
        const resTags = res.tags ? res.tags.map(t => t.toLowerCase()) : [];
        const matchesAll = tagsArray.every(t => resTags.includes(t.toLowerCase()));
        if (!matchesAll) return false;
      }

      if (categoryFilter === 'bookmarks') {
        if (!bookmarkedIds.includes(res.id)) return false;
      } else if (categoryFilter !== 'all') {
        if (res.categoryId !== categoryFilter && res.subcategoryId !== categoryFilter) {
          return false;
        }
      }

      if (!q) return true;

      const titleMatch = res.title.toLowerCase().includes(q);
      const descMatch = res.description.toLowerCase().includes(q);
      const authorMatch = res.author && res.author.toLowerCase().includes(q);
      const catMatch = res.category.toLowerCase().includes(q);
      const subMatch = res.subcategory && res.subcategory.toLowerCase().includes(q);
      const tagMatch = res.tags.some(tag => tag.includes(q));

      return titleMatch || descMatch || authorMatch || catMatch || subMatch || tagMatch;
    });

    if (sortOption === 'alphabetical-az' || sortOption === 'alphabetical') {
      return filtered.slice().sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'alphabetical-za') {
      return filtered.slice().sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortOption === 'most-bookmarked') {
      return filtered.slice().sort((a, b) => {
        const aBookmarked = bookmarkedIds.includes(a.id) ? 1 : 0;
        const bBookmarked = bookmarkedIds.includes(b.id) ? 1 : 0;
        if (bBookmarked !== aBookmarked) return bBookmarked - aBookmarked;
        return (a.addedIndex ?? 0) - (b.addedIndex ?? 0);
      });
    }

    return filtered;
  },

  getResourcesByCategory: function (categoryId) {
    if (!categoryId || categoryId === 'all') return this.resources;
    return this.resources.filter(res => res.categoryId === categoryId || res.subcategoryId === categoryId);
  },

  getStats: function () {
    const authorsCount = new Set(this.resources.map(r => r.author).filter(Boolean)).size;
    let subcategoryCount = 0;
    this.categories.forEach(c => {
      subcategoryCount += c.subcategories.length;
    });

    return {
      totalCategories: this.categories.length,
      totalSubcategories: subcategoryCount,
      totalResources: this.resources.length,
      uniqueAuthors: authorsCount
    };
  },

  exportJSON: function () {
    return JSON.stringify({
      categories: this.categories,
      resources: this.resources,
      stats: this.getStats()
    }, null, 2);
  }
};

// Global export
if (typeof window !== 'undefined') {
  window.LearningResources = LearningResources;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LearningResources;
}
