/**
 * Learning Resources Data & Parser Module
 * 0xTamil Systems & Engineering Learning Resources
 *
 * Dynamically fetches and parses README.md from:
 * https://raw.githubusercontent.com/0xTamil/awesome-low-level/main/README.md
 * or local README.md file path.
 */

// GitHub Raw URL derived from repository URL: https://github.com/0xTamil/awesome-low-level/edit/main/README.md
const PRIMARY_README_URL = 'https://raw.githubusercontent.com/0xTamil/awesome-low-level/main/README.md';
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

    // Skip horizontal rules (---, ***, ___)
    if (/^[-*_]{3,}$/.test(line)) continue;

    // Skip H1 headers (page title)
    if (line.startsWith('# ') && !line.startsWith('## ')) continue;

    if (line.startsWith('## ')) {
      const catTitle = line.replace('## ', '').trim();
      if (catTitle === 'License') {
        currentCategory = null;
        currentSubcategory = null;
        continue;
      }

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
      // Strip leading number prefix (e.g., "1. Embedded Systems" → "Embedded Systems")
      const subTitle = line.replace('### ', '').trim().replace(/^\d+\.\s*/, '');
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

        const resType = detectResourceType(url, title, description);
        const resTags = extractTags(title, description, currentCategory ? currentCategory.title : '', currentSubcategory ? currentSubcategory.title : '');
        if (resType.type && !resTags.includes(resType.type)) {
          resTags.push(resType.type);
        }

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
          type: resType.type,
          typeLabel: resType.label,
          tags: resTags
        };

        if (currentSubcategory) {
          currentSubcategory.resources.push(resource);
        } else if (currentCategory) {
          currentCategory.resources.push(resource);
        }
      }
    } else if (currentCategory || currentSubcategory) {
      // Plain text or blockquote line — treat as category/subcategory description
      let descLine = line;

      // Strip blockquote markers (e.g., "> Overview text...")
      if (descLine.startsWith('>')) {
        descLine = descLine.replace(/^>\s*/, '').trim();
      }
      if (!descLine) continue;

      // Strip bold "Overview:" prefix from blockquote descriptions
      descLine = descLine.replace(/^\*\*Overview:\*\*\s*/, '').trim();
      if (!descLine) continue;

      if (currentSubcategory) {
        currentSubcategory.description += (currentSubcategory.description ? ' ' : '') + descLine;
      } else if (currentCategory) {
        currentCategory.description += (currentCategory.description ? ' ' : '') + descLine;
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

function detectResourceType(url, title = '', description = '') {
  const u = (url || '').toLowerCase();
  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();

  // YouTube / Video
  if (u.includes('youtube.com') || u.includes('youtu.be')) {
    return { type: 'youtube', label: 'YouTube' };
  }

  // GitHub Repos & Awesome Lists
  if (u.includes('github.com') || u.includes('codeberg.org') || u.includes('gitlab.com')) {
    if (u.includes('awesome-')) {
      return { type: 'awesome-list', label: 'Awesome List' };
    }
    return { type: 'github', label: 'Repository' };
  }

  // University Courses / OCW / Lectures
  if (u.includes('ocw.mit.edu') || u.includes('csail.mit.edu') || u.includes('cs.brown.edu') ||
      u.includes('harvard.edu') || u.includes('csapp.cs.cmu.edu') || t.includes('mit ') ||
      t.includes('cs50') || t.includes('course') || t.includes('lectures')) {
    return { type: 'course', label: 'Course' };
  }

  // Interactive / Playground / Tool / Quizzes / Exercises
  if (u.includes('learn-c.org') || u.includes('visualgo.net') || u.includes('algorithm-visualizer.org') ||
      u.includes('shadertoy.com') || u.includes('ziglings') || u.includes('rustlings') ||
      u.includes('cppquiz.org') || u.includes('projecteuler.net') || u.includes('w3resource.com') ||
      u.includes('w3schools.com') || u.includes('webgpufundamentals.org')) {
    return { type: 'interactive', label: 'Interactive' };
  }

  // Documentation / Wikis / Reference Specs / FAQs
  if (u.includes('wiki.osdev.org') || u.includes('forum.osdev.org') || u.includes('doc.rust-lang.org') ||
      u.includes('cppreference.com') || u.includes('man7.org') || u.includes('ziglang.org/documentation') ||
      u.includes('wikipedia.org') || u.includes('kernel.org') || u.includes('odin-lang.org/docs') ||
      t.includes('reference') || t.includes('faq')) {
    return { type: 'docs', label: 'Docs' };
  }

  // Books / Textbooks / eBooks / PDF Guides
  if (u.endsWith('.pdf') || u.includes('pdf') || u.includes('knking.com') || u.includes('apuebook.com') ||
      u.includes('interpreterbook.com') || u.includes('compilerbook.com') || u.includes('odinbook.com') ||
      u.includes('dataintensive.net') || u.includes('distributed-systems.net') || u.includes('systemsapproach.org') ||
      u.includes('nostarch.com') || u.includes('beginners.re') || u.includes('beej.us/guide') ||
      t.includes('book') || t.includes('guide') || t.includes('textbook') || t.includes('manual') ||
      t.includes('ostep') || t.includes('(k&r)') || t.includes('cs:app') || t.includes('dragon book')) {
    return { type: 'book', label: 'Book' };
  }

  return { type: 'article', label: 'Article' };
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractTags(title, description, category, subcategory) {
  const combined = `${title} ${description} ${category} ${subcategory}`.toLowerCase();
  const candidates = [
    'c', 'c++', 'rust', 'zig', 'odin', 'assembly', 'asm',
    'opengl', 'vulkan', 'webgpu', 'directx', 'metal', 'shaders', 'rendering',
    'game-engine', 'physics', 'graphics',
    'kernel', 'os', 'bootloader', 'drivers', 'x86', 'x86_64', 'arm', 'risc-v', 'bare-metal',
    'compiler', 'interpreter', 'llvm', 'bytecode', 'ast', 'parser',
    'networking', 'sockets', 'tcp', 'http', 'async',
    'database', 'distributed', 'algorithms', 'data-structures', 'dsa',
    'embedded', 'fpga', 'verilog', 'vhdl', 'microcontroller', 'hardware',
    'gpgpu', 'cuda', 'opencl', 'simd', 'parallel',
    'reverse-engineering', 'malware', 'memory', 'concurrency', 'multithreading',
    'virtualization', 'posix', 'linux', 'unix'
  ];

  const matched = new Set();
  candidates.forEach(tag => {
    const escaped = escapeRegExp(tag);
    const regex = new RegExp(`(?:^|[\\s,;:()\\[\\]/.-])${escaped}(?:$|[\\s,;:()\\[\\]/.-])`, 'i');
    if (regex.test(` ${combined} `)) {
      matched.add(tag);
    }
  });

  // Structural Category & Subcategory Tag Inferences
  const cat = (category || '').toLowerCase();
  const sub = (subcategory || '').toLowerCase();

  if (sub.includes('embedded')) matched.add('embedded');
  if (sub.includes('fpga')) { matched.add('fpga'); matched.add('hardware'); }
  if (sub.includes('compiler')) matched.add('compiler');
  if (sub.includes('operating systems') || sub.includes('os')) { matched.add('os'); matched.add('kernel'); }
  if (sub.includes('gpgpu') || sub.includes('parallel')) { matched.add('gpgpu'); matched.add('parallel'); }
  if (sub.includes('graphics')) matched.add('graphics');
  if (sub.includes('game engine')) { matched.add('game-engine'); matched.add('graphics'); }
  if (sub.includes('network')) { matched.add('networking'); matched.add('sockets'); }
  if (sub.includes('data structures') || sub.includes('algorithms')) matched.add('algorithms');
  if (sub.includes('c programming')) matched.add('c');
  if (sub.includes('c++')) matched.add('c++');
  if (sub.includes('rust')) matched.add('rust');
  if (sub.includes('zig')) matched.add('zig');
  if (sub.includes('odin')) matched.add('odin');
  if (cat.includes('creators')) matched.add('creators');

  // If 'c++' matched, don't also add 'c' unless C appears standalone or in 'c programming'
  if (matched.has('c++') && matched.has('c')) {
    const withoutCpp = combined.replace(/c\+\+/g, '');
    const cRegex = new RegExp(`(?:^|[\\s,;:()\\[\\]/.-])c(?:$|[\\s,;:()\\[\\]/.-])`, 'i');
    if (!cRegex.test(` ${withoutCpp} `) && !sub.includes('c programming')) {
      matched.delete('c');
    }
  }

  return Array.from(matched);
}

function parseRoadmap(markdownText) {
  if (!markdownText) return { intro: '', steps: [] };
  const lines = markdownText.split('\n');
  let inRoadmap = false;
  let intro = '';
  const steps = [];
  let currentStep = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      const headerText = line.replace('## ', '').trim();
      if (headerText.toLowerCase() === 'roadmap') {
        inRoadmap = true;
        continue;
      } else if (inRoadmap) {
        break; // End of Roadmap section
      }
    }

    if (!inRoadmap) continue;
    if (/^[-*_]{3,}$/.test(line)) continue;

    // Check for step title: '1. **Learn Computer Fundamentals**'
    const stepMatch = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*/);
    if (stepMatch) {
      currentStep = {
        number: parseInt(stepMatch[1], 10),
        title: stepMatch[2].trim(),
        whatToDo: '',
        whyItMatters: ''
      };
      steps.push(currentStep);
      continue;
    }

    // Check for bullet details
    if (currentStep) {
      if (line.includes('**What to do:**')) {
        currentStep.whatToDo = line.replace(/^[*\-\s]*\*\*What to do:\*\*\s*/, '').trim();
      } else if (line.includes('**Why it matters:**')) {
        currentStep.whyItMatters = line.replace(/^[*\-\s]*\*\*Why it matters:\*\*\s*/, '').trim();
      }
    } else {
      intro += (intro ? ' ' : '') + line;
    }
  }

  return { intro, steps };
}

/**
 * Main LearningResources API object
 */
const LearningResources = {
  rawMarkdown: '',
  categories: [],
  resources: [],
  roadmap: { intro: '', steps: [] },
  parseMarkdownResources: parseMarkdownResources,
  parseRoadmap: parseRoadmap,

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
            if (fetched && fetched.includes('## Roadmap')) {
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
    this.roadmap = parseRoadmap(markdownText);
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


const EMBEDDED_README_FALLBACK = "# Awesome Low Level\n\n## Roadmap\n\nIf you are new to low-level systems programming, follow these core steps:\n\n1. **Learn Computer Fundamentals**\n   * **What to do:** Understand how computers read data and execute instructions. Learn basic programming rules like variables, loops, logic, and how your code actually talks to hardware components like the CPU and RAM.\n   * **Why it matters:** Building a strong mental model of how computer memory and hardware work together makes learning any system language much easier later on.\n\n2. **Master C & Memory (The Core Foundation)**\n   * **What to do:** Learn the **C programming language** deeply. Focus on core low-level topics: managing memory manually, using pointers (variables that store memory addresses), doing pointer arithmetic, and allocation (`malloc` and `free`).\n   * **Why it matters:** C is the foundational language of systems programming. It strips away hidden abstractions and gives you direct control over memory, forcing you to understand exactly how software interacts with computer hardware.\n\n3. **Build Small Projects**\n   * **What to do:** Put your C knowledge to work by building tiny, practical command-line interface (CLI) tools. Build things like a custom file reader, a simple memory-logging tool, a text file parser, or a basic shell utility.\n   * **Why it matters:** Writing code from scratch is the fastest way to catch memory leaks, fix pointer bugs, and learn how real programs interact with the operating system.\n\n4. **Study Algorithms & Data Structures (DSA)**\n   * **What to do:** Learn standard ways to organize data (like linked lists, arrays, stacks, queues, and trees) and key techniques to process that data (like sorting, searching, and recursion).\n   * **Why it matters:** Hardware has limits. Choosing the right data structure and algorithm ensures your low-level code runs fast, uses minimal RAM, and handles big workloads cleanly.\n\n5. **Pick a Specialized Field**\n   * **What to do:** Decide what kind of low-level software you want to build. Pick one focused domain to explore next.\n   * **Why it matters:** Low-level programming is a massive field. Picking a specific path gives you a clear target and helps you choose the exact tools and projects to build next.\n\n6. **Learn Modern Systems Languages (Optional)**\n   * **What to do:** Expand your skills beyond C by exploring modern systems programming languages like **C++, Rust, Zig, or Odin** or choose to **stick with C**, as it remains fully powerful and relevant for almost all low-level domains.\n   * **Why it matters:** While C is all you strictly need, learning modern languages introduces extra toolsets like object-oriented design in C++, automatic memory safety in Rust, or streamlined syntax and memory control in Zig and Odin.\n\n---\n\n## Getting Started\n- **[The Hidden Language of Computer Hardware and Software](https://charlespetzold.com/code/)**\n- **[Exploring How Computers Work](https://www.youtube.com/watch?v=QZwneRb-zqA)**\n- **[A Crash Course in Computer Science](https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo)**\n- **[CS50: Introduction to Computer Science](https://pll.harvard.edu/course/cs50-introduction-computer-science)**\n- **[Teach Yourself CS](https://teachyourselfcs.com/)**\n- **[Beej's Guide to Learning Computer Science](https://beej.us/guide/bglcs/)**\n- **[Open Source Society University (OSSU)](https://github.com/ossu/computer-science)**\n\n---\n\n## Core Foundations\n\n### C Programming\n- **[Beej's Guide to C Programming](https://beej.us/guide/bgc/)**: A clear guide to practical C development and the standard library.\n- **[C Programming: A Modern Approach](https://knking.com/books/c2/)**: A detailed textbook widely considered the best standard reference for C beginners.\n- **[The C Book](http://knking.com/books/c2/index.html)**: A free reference book covering foundational C concepts.\n- **[The C Programming Language (K&R)](https://en.wikipedia.org/wiki/The_C_Programming_Language)**: The original, concise introduction to C written by its creators.\n- **[Learn C](https://learn-c.org/)**: Interactive browser-based tutorials for writing and testing C code.\n- **[C FAQ](https://c-faq.com/)**: Practical answers to common questions, tricky bugs, and pointer memory rules.\n- **[C Interfaces and Implementations](https://github.com/drh/cii)**: Learn how to design modular and reusable C libraries.\n\n### Data Structures & Algorithms\n- **[Data Structures and Algorithms Tutorial](https://www.w3schools.com/dsa/index.php)**: A beginner-friendly guide to organizing and processing data.\n- **[VisuAlgo](https://visualgo.net/)**: Animated visual tools showing how algorithms sort and search data.\n- **[MIT 6.006: Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)**: Free university lectures covering algorithmic design and efficiency.\n- **[Algorithm Visualizer](https://algorithm-visualizer.org/)**: An interactive platform that animates actual code execution step-by-step.\n- **[Algorithms (Sedgewick & Wayne)](https://algs4.cs.princeton.edu/home/)**: A detailed textbook covering classic algorithms and data structures.\n\n---\n\n## Other Systems Languages (Optional)\n\n### C++ Programming\n- **[How to Start C++ Development?](https://github.com/W4RH4WK/cpp-init)**: A practical guide to setting up compilers, build systems, and environments.\n- **[Learn C++](https://www.learncpp.com)**: Comprehensive step-by-step tutorials covering beginner to advanced C++.\n- **[Hacking C++](https://hackingcpp.com/index.html)**: Visual diagrams and cheat sheets for modern C++ standards.\n- **[C++ By Example](https://cppbyexample.com/)**: Concise code snippets demonstrating modern C++ syntax and features.\n- **[C++ Reference](https://en.cppreference.com/w/)**: The official standard dictionary for all C++ keywords and standard library modules.\n- **[Modern C++ Features](https://github.com/AnthonyCalandra/modern-cpp-features)**: A practical summary of features added in C++11 and newer versions.\n- **[C++ Programming Exercises](https://www.w3resource.com/cpp-exercises/)**: Coding challenges with worked solutions to test your understanding.\n- **[Project Euler](https://projecteuler.net/about)**: Logic and mathematics problems designed to be solved with code.\n- **[Cpp Quiz](https://cppquiz.org/)**: Multiple-choice quizzes testing your knowledge of exact C++ language rules.\n- **[Data-Oriented Design Resources](https://github.com/dbartolini/data-oriented-design)**: Resources on structuring memory layout for maximum CPU performance.\n- **[Bit Twiddling Hacks](https://graphics.stanford.edu/~seander/bithacks.html)**: A famous collection of fast bitwise math operations and low-level tricks.\n\n### Rust\n- **[The Rust Programming Language](https://doc.rust-lang.org/book/)**: The official book covering memory safety, ownership, and concurrency.\n- **[Rustlings](https://github.com/rust-lang/rustlings)**: Small hands-on programming exercises to practice Rust syntax.\n- **[Rust by Example](https://doc.rust-lang.org/rust-by-example/)**: Runnable code examples demonstrating how Rust features work.\n- **[Too Many Linked Lists](https://rust-unofficial.github.io/too-many-lists/)**: Learn advanced memory handling in Rust by building list structures.\n- **[The Rustonomicon](https://doc.rust-lang.org/nomicon/)**: An advanced guide to writing unsafe Rust and raw memory operations.\n- **[Awesome Rust](https://github.com/rust-unofficial/awesome-rust)**: A curated list of popular Rust libraries, frameworks, and tools.\n\n### Zig\n- **[Zig Learn](https://ziglearn.org/)**: A structured step-by-step guide to Zig syntax and manual memory control.\n- **[Zig Language Reference](https://ziglang.org/documentation/master/)**: The official specification covering Zig tools and language features.\n- **[Ziglings](https://codeberg.org/ziglings/exercises)**: Interactive broken-code exercises designed to teach you Zig syntax.\n- **[Learning Zig](https://pedropark99.github.io/zig-book/)**: A clear guide explaining low-level systems concepts using Zig.\n- **[Awesome Zig](https://github.com/zigcc/awesome-zig)**: A community repository of useful tools, engines, and starter projects.\n\n### Odin\n- **[Odin Overview](https://odin-lang.org/docs/overview/)**: A fast overview of Odin's syntax, design goals, and memory control.\n- **[Odin Demo Program](https://github.com/odin-lang/Odin/blob/master/examples/demo/demo.odin)**: A single code file demonstrating almost every feature in Odin.\n- **[Understanding the Odin Programming Language](https://odinbook.com/)**: A free introductory book on developing systems with Odin.\n- **[Learn Odin in Y Minutes](https://learnxinyminutes.com/odin/)**: A concise syntax cheat sheet for quick reference.\n- **[Awesome Odin](https://github.com/jakubtomsu/awesome-odin)**: A collection of game engines, libraries, and resources built with Odin.\n\n---\n\n## Specialized Fields\n\n### 1. Embedded Systems\n> **Overview:**  \n> Embedded programming means writing code that runs on tiny microcontrollers, sensors, and chips inside physical devices instead of standard PCs. You work directly with hardware interfaces to control microcontrollers inside things like smart appliances, cars, and medical devices.\n\n- **[Awesome Embedded](https://github.com/nhivp/Awesome-Embedded)**: Resources for bare-metal programming, microcontrollers, and low-level firmware.\n- **[Awesome Embedded Linux](https://github.com/fkromer/awesome-embedded-linux)**: Tools and guides for running custom Linux systems on small hardware chips.\n\n---\n\n### 2. FPGA Programming\n> **Overview:**  \n> FPGA programming means designing custom hardware circuits instead of writing normal software. Instead of giving steps to a CPU, you reconfigure physical chips to process massive amounts of data at the exact same time. It is used when normal processors are too slow, like in high-speed stock trading, defense hardware, and microchip design.\n\n- **[Awesome FPGA](https://github.com/Vitorian/awesome-fpga)**: A curated list of hardware development resources, FPGA tools, HDLs, and project tutorials.\n- **[Awesome FPGA Programming](https://github.com/emanueledelsozzo/awesome-fpga-programming)**: Guides, toolchains, and learning materials for developing and compiling custom logic circuits.\n\n---\n\n### 3. Compilers & Interpreters\n> **Overview:**  \n> Compiler development means building tools that read high-level code (like C, Rust, or Python) and turn it into binary code that computer hardware actually understands. You learn how programming languages process text, optimize performance, and turn instructions into CPU operations.\n\n- **[Awesome OS Compilers](https://github.com/aalhour/awesome-compilers)**: A collection of books, courses, frameworks, and projects for building compilers and runtime engines.\n\n---\n\n### 4. Operating Systems Development\n> **Overview:**  \n> OS development means building system software like Linux or Windows from zero. You write code that talks directly to the hardware to manage computer memory, control processor tasks, build file systems, and write drivers for keyboards, screens, and hard drives.\n\n- **[Awesome OS Dev](https://github.com/devse-org/awesome-osdev)**: Specifications, technical tutorials, and project repositories for building custom operating systems.\n\n---\n\n### 5. GPGPU & Parallel Computing\n> **Overview:**  \n> GPGPU means using graphics card hardware to handle massive mathematical problems instead of just rendering visuals. Because GPUs have thousands of small cores, you write code that runs thousands of calculations at once for artificial intelligence, 3D math, and heavy data science.\n\n- **[Awesome GPGPU](https://github.com/jslee02/awesome-gpgpu)**: Frameworks, technical guides, and libraries for general-purpose parallel computing on GPUs.\n- **[Awesome GPU](https://github.com/Jokeren/Awesome-GPU)**: A detailed collection of resources on GPU hardware architecture and parallel optimization.\n\n---\n\n### 6. Graphics Programming\n> **Overview:**  \n> Graphics programming means writing code that tells the graphics card how to draw 2D and 3D scenes on screen. You work with math, lighting models, texture shaders, and graphics software interfaces (like Vulkan or DirectX) to build real-time visual software.\n\n- **[Awesome Graphics Programming](https://gist.github.com/notnotrobby/ceef71527b4f15869133ba7b397912e9)**: Curated math tutorials, rendering guides, and engine development links.\n\n---\n\n### 7. Game Engine Development\n> **Overview:**  \n> Game engine development means building the underlying tool (like Unreal or Unity) that games run on. Instead of making a game directly, you write the low-level systems for 3D graphics, collision physics, sound, controller input, and file loading. It is all about squeezing every bit of speed out of the computer so games run smoothly without lagging.\n\n- **[Awesome Game Engine Dev](https://github.com/stevinz/awesome-game-engine-dev)**: A curated collection of books, tutorials, libraries, and resources for building custom game engines from scratch.\n- **[Awesome Game Engines](https://github.com/ChessMax/awesome-game-engines)**: An organized directory of open-source game engines, architecture designs, and reference implementations to study.\n\n---\n\n### 8. Network System Programming\n> **Overview:**  \n> Network systems programming involves writing software that sends raw data packets across networks at maximum speed. You work directly with network sockets, protocol stacks (TCP/UDP, HTTP), asynchronous IO, and custom packet processing. It is key for building high-performance web servers, routing software, and multiplayer game servers.\n\n- **[Awesome Networking](https://github.com/facyber/awesome-networking)**: A beginner-friendly collection of books, courses, protocols, and tutorials for learning general computer networking concepts.\n- **[Awesome Computer Networking](https://github.com/nyquist/awesome-networking)**: A detailed list of resources for designing, operating, and monitoring enterprise network systems.\n- **[Awesome Network Programmability](https://github.com/cisco-ie/awesome-network-programmability)**: A collection of libraries, and guides focused on automating network devices and writing network software.\n- **[Awesome Game Networking](https://github.com/rumaniel/Awesome-Game-Networking)**: A curated list of resources, libraries, and articles for building multiplayer network systems.\n\n---\n\n## Recommended Creators\n\nTechnical channels focusing on low-level systems engineering, software architecture, mathematics, and engine design:\n\n- **[TsodingDaily](https://www.youtube.com/@TsodingDaily)**\n- **[ThePrimeTimeagen](https://www.youtube.com/@ThePrimeTimeagen)**\n- **[CakeZ](https://www.youtube.com/@Cakez77)**\n- **[Artful Bytes](https://www.youtube.com/@artfulbytes)**\n- **[hoff._world](https://www.youtube.com/@hoff._world)**\n- **[tokyospliff](https://youtube.com/@tokyospliff)**\n- **[Sebastian Lague](https://youtube.com/@sebastianlague)**\n- **[javidx9](https://youtube.com/@javidx9)**\n- **[3Blue1Brown](https://youtube.com/@3blue1brown)**\n- **[Code Guild](https://youtube.com/@code-guild)**\n\n---\n\n## License\n[![CC0](http://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg)](https://creativecommons.org/publicdomain/zero/1.0/)";
