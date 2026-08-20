/**
 * Learning Resources DOM Application Controller
 * Wikipedia Vector 2022 skin with Popover Dropdowns and Collapsible Sidebars.
 */

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.LearningResources === 'undefined') {
        console.error('LearningResources dataset module not found.');
        return;
    }

    const API = window.LearningResources;

    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchCount = document.getElementById('search-count');
    const categoryNavList = document.getElementById('category-nav-list');
    const popoverTocList = document.getElementById('popover-toc-list');
    const statsList = document.getElementById('stats-list');
    const jsonExportCode = document.getElementById('json-export');
    const appMain = document.getElementById('app');

    // Header Icon Buttons & Floating Popovers
    const vectorTocBtn = document.getElementById('vector-toc-menu-btn');
    const vectorTocPopover = document.getElementById('vector-toc-popover');
    const vectorAppearanceBtn = document.getElementById('vector-appearance-menu-btn');
    const vectorAppearancePopover = document.getElementById('vector-appearance-popover');
    const tocMoveToSidebarBtn = document.getElementById('toc-move-to-sidebar-btn');
    const appearanceMoveToSidebarBtn = document.getElementById('appearance-move-to-sidebar-btn');

    // Sidebar Containers & Hide Buttons
    const sidebarContents = document.getElementById('vector-sidebar-contents');
    const sidebarAppearance = document.getElementById('vector-sidebar-appearance');
    const tocHideBtn = document.getElementById('toc-hide-btn');
    const appearanceHideBtn = document.getElementById('appearance-hide-btn');

    const multiTagBtn = document.getElementById('multi-tag-btn');
    const multiTagBtnLabel = document.getElementById('multi-tag-btn-label');
    const multiTagPopover = document.getElementById('multi-tag-popover');
    const multiTagCloudList = document.getElementById('multi-tag-cloud-list');
    const clearAllTagsBtn = document.getElementById('clear-all-tags-btn');
    const sortSelect = document.getElementById('sort-select');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // State
    let currentCategoryFilter = 'all';
    let selectedTags = [];
    let currentSearchQuery = '';
    let currentSortOption = localStorage.getItem('mw_sort_option') || 'default';
    let bookmarkedResourceIds = loadBookmarks();
    let focusedResourceIndex = -1;

    // 1. Initialize Appearance Settings
    initAppearanceSettings();

    // 2. Loading State
    if (appMain) {
        appMain.innerHTML = '';
        const loadingP = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = 'Loading README.md reference data from repository...';
        loadingP.appendChild(em);
        appMain.appendChild(loadingP);
    }

    // 3. Fetch Dataset
    try {
        await API.fetchData('https://raw.githubusercontent.com/0xTamil/awesome-low-level/main/README.md');
    } catch (error) {
        console.error('Error fetching README data:', error);
        if (appMain) {
            appMain.innerHTML = '';
            const errSection = document.createElement('section');
            const h2 = document.createElement('h2');
            h2.textContent = 'Error Loading Dataset';
            const p = document.createElement('p');
            p.textContent = error.message || 'Unable to fetch README data.';
            errSection.appendChild(h2);
            errSection.appendChild(p);
            appMain.appendChild(errSection);
        }
        return;
    }

    // 4. Render UI
    initCategoryNav();
    initMultiTagContainer();
    renderStats();
    renderResources();

    // 6. Event Handlers
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value;
            renderResources();
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            renderResources();
        });
    }

    function resetAllFilters() {
        currentCategoryFilter = 'all';
        currentSearchQuery = '';
        selectedTags = [];
        if (searchInput) searchInput.value = '';
        renderMultiTagCloud();
        renderResources();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Header Brand & Sub-header Tab Navigation
    const tabMain = document.getElementById('tab-main');
    const tabRoadmap = document.getElementById('tab-roadmap');
    const firstHeading = document.getElementById('firstHeading');
    const resultsToolbar = document.querySelector('.vector-results-toolbar');

    let activeTab = 'main';

    if (tabMain) {
        tabMain.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('main');
        });
    }

    if (tabRoadmap) {
        tabRoadmap.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('roadmap');
        });
    }

    function switchTab(tabName) {
        activeTab = tabName;
        if (tabMain) tabMain.classList.toggle('active', tabName === 'main');
        if (tabRoadmap) tabRoadmap.classList.toggle('active', tabName === 'roadmap');

        if (tabName === 'roadmap') {
            if (firstHeading) firstHeading.textContent = 'Systems Programming Roadmap';
            if (resultsToolbar) resultsToolbar.style.display = 'none';
            renderRoadmap();
        } else {
            if (firstHeading) firstHeading.textContent = 'Learning Resources';
            if (resultsToolbar) resultsToolbar.style.display = 'flex';
            resetAllFilters();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const vectorBrand = document.querySelector('.vector-brand');
    if (vectorBrand) {
        vectorBrand.style.cursor = 'pointer';
        vectorBrand.addEventListener('click', () => switchTab('main'));
    }

    // Top Jump Link Filter Resets
    document.querySelectorAll('a[href="#firstHeading"]').forEach(topLink => {
        topLink.addEventListener('click', () => {
            currentCategoryFilter = 'all';
            currentSearchQuery = '';
            selectedTags = [];
            if (searchInput) searchInput.value = '';
            renderMultiTagCloud();
            renderResources();
        });
    });

    // Sort Options Selector Handler
    if (sortSelect) {
        sortSelect.value = currentSortOption;
        sortSelect.addEventListener('change', (e) => {
            currentSortOption = e.target.value;
            localStorage.setItem('mw_sort_option', currentSortOption);
            focusedResourceIndex = -1;
            renderResources();
        });
    }

    // Power-User Keyboard Navigation (j/k for next/prev resource, / for search, Esc to clear/close, Enter to open)
    document.addEventListener('keydown', (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || (document.activeElement && document.activeElement.isContentEditable);

        if (isInputActive) {
            if (e.key === 'Escape') {
                if (searchInput && document.activeElement === searchInput) {
                    searchInput.value = '';
                    currentSearchQuery = '';
                    renderResources();
                    searchInput.blur();
                }
            }
            return;
        }

        if (e.key === '/') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
            return;
        }

        if (e.key === 'Escape') {
            closeAllPopovers();
            clearKeyboardFocus();
            if (searchInput) searchInput.blur();
            return;
        }

        const articles = Array.from(document.querySelectorAll('article.mw-resource-article'));
        if (articles.length === 0) return;

        if (e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            focusedResourceIndex++;
            if (focusedResourceIndex >= articles.length) {
                focusedResourceIndex = articles.length - 1;
            }
            updateKeyboardFocus(articles);
        } else if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            focusedResourceIndex--;
            if (focusedResourceIndex < 0) {
                focusedResourceIndex = 0;
            }
            updateKeyboardFocus(articles);
        } else if (e.key === 'Enter') {
            if (focusedResourceIndex >= 0 && focusedResourceIndex < articles.length) {
                const currentArticle = articles[focusedResourceIndex];
                const mainLink = currentArticle.querySelector('h3 a');
                if (mainLink) {
                    e.preventDefault();
                    window.open(mainLink.href, '_blank', 'noopener,noreferrer');
                }
            }
        }
    });

    function updateKeyboardFocus(articles) {
        articles.forEach((art, idx) => {
            if (idx === focusedResourceIndex) {
                art.classList.add('kbd-focused');
                art.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                art.classList.remove('kbd-focused');
            }
        });
    }

    function clearKeyboardFocus() {
        focusedResourceIndex = -1;
        document.querySelectorAll('article.mw-resource-article.kbd-focused').forEach(art => {
            art.classList.remove('kbd-focused');
        });
    }

    // Popover Toggle: Multi-Tag Button
    if (multiTagBtn && multiTagPopover) {
        multiTagBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = multiTagPopover.classList.contains('visible');
            closeAllPopovers();
            if (!isVisible) {
                multiTagPopover.classList.add('visible');
                multiTagBtn.classList.add('active');
            }
        });
    }

    // Popover Toggle: TOC Icon Button
    if (vectorTocBtn && vectorTocPopover) {
        vectorTocBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = vectorTocPopover.classList.contains('visible');
            closeAllPopovers();
            if (!isVisible) {
                vectorTocPopover.classList.add('visible');
                vectorTocBtn.classList.add('active');
            }
        });
    }

    // Popover Toggle: Appearance Icon Button
    if (vectorAppearanceBtn && vectorAppearancePopover) {
        vectorAppearanceBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = vectorAppearancePopover.classList.contains('visible');
            closeAllPopovers();
            if (!isVisible) {
                vectorAppearancePopover.classList.add('visible');
                vectorAppearanceBtn.classList.add('active');
            }
        });
    }

    // Move to Sidebar Button inside TOC Popover
    if (tocMoveToSidebarBtn && sidebarContents) {
        tocMoveToSidebarBtn.addEventListener('click', () => {
            closeAllPopovers();
            sidebarContents.classList.remove('hidden');
            document.body.classList.remove('toc-collapsed');
        });
    }

    // Move to Sidebar Button inside Appearance Popover
    if (appearanceMoveToSidebarBtn && sidebarAppearance) {
        appearanceMoveToSidebarBtn.addEventListener('click', () => {
            closeAllPopovers();
            sidebarAppearance.classList.remove('hidden');
            document.body.classList.remove('appearance-collapsed');
        });
    }

    // Left Sidebar Hide Button
    if (tocHideBtn && sidebarContents) {
        tocHideBtn.addEventListener('click', () => {
            sidebarContents.classList.add('hidden');
            document.body.classList.add('toc-collapsed');
        });
    }

    // Right Sidebar Hide Button
    if (appearanceHideBtn && sidebarAppearance) {
        appearanceHideBtn.addEventListener('click', () => {
            sidebarAppearance.classList.add('hidden');
            document.body.classList.add('appearance-collapsed');
        });
    }

    // Auto-Hide Header on Scroll Down, Reveal on Scroll Up
    const headerElement = document.querySelector('.vector-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 70) {
            // Scrolling down -> Hide header
            if (headerElement) headerElement.classList.add('header-hidden');
            closeAllPopovers();
        } else if (currentScrollY < lastScrollY || currentScrollY <= 70) {
            // Scrolling up or at top -> Show header
            if (headerElement) headerElement.classList.remove('header-hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    // Close popovers on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.vector-popover') && !e.target.closest('.vector-icon-button') && !e.target.closest('.vector-multi-tag-btn')) {
            closeAllPopovers();
        }
    });

    function closeAllPopovers() {
        if (vectorTocPopover) vectorTocPopover.classList.remove('visible');
        if (vectorAppearancePopover) vectorAppearancePopover.classList.remove('visible');
        if (multiTagPopover) multiTagPopover.classList.remove('visible');
        if (vectorTocBtn) vectorTocBtn.classList.remove('active');
        if (vectorAppearanceBtn) vectorAppearanceBtn.classList.remove('active');
        if (multiTagBtn) multiTagBtn.classList.remove('active');
    }

    /**
     * Appearance Settings Synchronization
     */
    function initAppearanceSettings() {
        const textRadios = document.querySelectorAll('input[name="text-size"], input[name="popover-text-size"]');
        const widthRadios = document.querySelectorAll('input[name="page-width"], input[name="popover-page-width"]');
        const colorRadios = document.querySelectorAll('input[name="color-theme"], input[name="popover-color-theme"]');

        const savedText = localStorage.getItem('mw_text_size') || 'standard';
        const savedWidth = localStorage.getItem('mw_page_width') || 'standard';
        const savedColor = localStorage.getItem('mw_color_theme') || 'light';

        applyTextSize(savedText);
        applyWidth(savedWidth);
        applyColorTheme(savedColor);

        syncRadios(textRadios, savedText);
        syncRadios(widthRadios, savedWidth);
        syncRadios(colorRadios, savedColor);

        textRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = e.target.value;
                applyTextSize(val);
                syncRadios(textRadios, val);
                localStorage.setItem('mw_text_size', val);
            });
        });

        widthRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = e.target.value;
                applyWidth(val);
                syncRadios(widthRadios, val);
                localStorage.setItem('mw_page_width', val);
            });
        });

        colorRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const val = e.target.value;
                applyColorTheme(val);
                syncRadios(colorRadios, val);
                localStorage.setItem('mw_color_theme', val);
            });
        });

        // Real-time system theme change listener for Automatic theme preference
        const systemThemeMedia = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
        function handleSystemThemeChange() {
            const currentSavedColor = localStorage.getItem('mw_color_theme') || 'light';
            if (currentSavedColor === 'automatic') {
                applyColorTheme('automatic');
            }
        }
        if (systemThemeMedia) {
            if (systemThemeMedia.addEventListener) {
                systemThemeMedia.addEventListener('change', handleSystemThemeChange);
            } else if (systemThemeMedia.addListener) {
                systemThemeMedia.addListener(handleSystemThemeChange);
            }
        }
    }

    function syncRadios(radios, value) {
        radios.forEach(r => {
            if (r.value === value) r.checked = true;
        });
    }

    function applyTextSize(size) {
        document.body.classList.remove('font-small', 'font-standard', 'font-large');
        document.body.classList.add(`font-${size}`);
    }

    function applyWidth(width) {
        document.body.classList.remove('width-standard', 'width-wide');
        document.body.classList.add(`width-${width}`);
    }

    function applyColorTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        if (theme === 'automatic') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            document.body.classList.add(`theme-${theme}`);
        }
    }

    /**
     * Build TOC in both Left Sidebar and Popover Dropdown
     */
    function initCategoryNav() {
        const targets = [categoryNavList, popoverTocList].filter(Boolean);

        targets.forEach(target => {
            target.innerHTML = '';

            // Bookmarks Category Filter Option (hidden when 0 bookmarks)
            const bmxLi = document.createElement('li');
            const bmxA = document.createElement('a');
            bmxA.href = '#bookmarks';
            bmxA.dataset.category = 'bookmarks';
            bmxA.textContent = `★ Bookmarked (${bookmarkedResourceIds.length})`;
            bmxA.title = `View ${bookmarkedResourceIds.length} bookmarked resources`;

            bmxA.addEventListener('click', (e) => {
                e.preventDefault();
                currentCategoryFilter = 'bookmarks';
                closeAllPopovers();
                renderResources();
            });

            bmxLi.appendChild(bmxA);
            if (bookmarkedResourceIds.length > 0) {
                target.appendChild(bmxLi);
            }

            // Only include categories that have resources to display
            const categoriesWithContent = API.categories.filter(cat => {
                const hasDirectResources = cat.resources.length > 0;
                const hasSubResources = cat.subcategories && cat.subcategories.some(sub => sub.resources.length > 0);
                return hasDirectResources || hasSubResources;
            });

            categoriesWithContent.forEach(cat => {
                const li = document.createElement('li');
                const itemWrapper = document.createElement('div');
                itemWrapper.style.display = 'flex';
                itemWrapper.style.alignItems = 'center';

                const hasSubs = cat.subcategories && cat.subcategories.length > 0;

                if (hasSubs) {
                    const toggleIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    toggleIcon.setAttribute('class', 'toc-toggle-icon expanded');
                    toggleIcon.setAttribute('width', '10');
                    toggleIcon.setAttribute('height', '10');
                    toggleIcon.setAttribute('viewBox', '0 0 24 24');
                    toggleIcon.setAttribute('fill', 'none');
                    toggleIcon.setAttribute('stroke', 'currentColor');
                    toggleIcon.setAttribute('stroke-width', '3');
                    toggleIcon.setAttribute('stroke-linecap', 'round');
                    toggleIcon.setAttribute('stroke-linejoin', 'round');

                    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                    polyline.setAttribute('points', '9 18 15 12 9 6');
                    toggleIcon.appendChild(polyline);

                    toggleIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        toggleIcon.classList.toggle('expanded');
                        const subUl = li.querySelector('.vector-toc-sublist');
                        if (subUl) {
                            subUl.style.display = subUl.style.display === 'none' ? 'block' : 'none';
                        }
                    });

                    itemWrapper.appendChild(toggleIcon);
                }

                const a = document.createElement('a');
                a.href = `#${cat.id}`;
                a.textContent = cat.title;
                a.title = `Jump to section: ${cat.title}`;

                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentCategoryFilter = cat.id;
                    closeAllPopovers();
                    renderResources();
                    const targetElem = document.getElementById(cat.id);
                    if (targetElem) targetElem.scrollIntoView({ behavior: 'smooth' });
                });

                itemWrapper.appendChild(a);
                li.appendChild(itemWrapper);

                if (hasSubs) {
                    const subUl = document.createElement('ul');
                    subUl.className = 'vector-toc-sublist';

                    cat.subcategories.forEach(sub => {
                        const subLi = document.createElement('li');
                        const subA = document.createElement('a');
                        subA.href = `#${sub.id}`;
                        subA.textContent = sub.title;
                        subA.title = `Jump to subcategory: ${sub.title}`;

                        subA.addEventListener('click', (e) => {
                            e.preventDefault();
                            currentCategoryFilter = sub.id;
                            closeAllPopovers();
                            renderResources();
                            const targetElem = document.getElementById(sub.id);
                            if (targetElem) targetElem.scrollIntoView({ behavior: 'smooth' });
                        });

                        subLi.appendChild(subA);
                        subUl.appendChild(subLi);
                    });
                    li.appendChild(subUl);
                }

                target.appendChild(li);
            });
        });
    }

    /**
     * Populate Header Multi-Tag Container & Popover Panel
     */
    function initMultiTagContainer() {
        renderMultiTagCloud();

        if (clearAllTagsBtn) {
            clearAllTagsBtn.addEventListener('click', () => {
                selectedTags = [];
                renderMultiTagCloud();
                renderResources();
            });
        }
    }

    function renderMultiTagCloud() {
        if (!multiTagCloudList) return;
        multiTagCloudList.innerHTML = '';

        const allTags = API.getAllTags();

        const TAG_GROUPS = [
            {
                name: 'Languages',
                tags: ['c', 'c++', 'rust', 'zig', 'odin', 'assembly', 'asm']
            },
            {
                name: 'Topics & Concepts',
                tags: [
                    'algorithms', 'bare-metal', 'compiler', 'concurrency', 'embedded',
                    'fpga', 'game-engine', 'gpgpu', 'graphics', 'hardware', 'kernel',
                    'linux', 'memory', 'metal', 'networking', 'os', 'parallel',
                    'rendering', 'sockets'
                ]
            },
            {
                name: 'Formats & Media',
                tags: [
                    'article', 'awesome-list', 'book', 'course', 'creators', 'docs',
                    'github', 'interactive', 'youtube'
                ]
            }
        ];

        const mappedSet = new Set(TAG_GROUPS.flatMap(g => g.tags));
        const unmappedTags = allTags.filter(tObj => !mappedSet.has(tObj.tag));

        const groupsToRender = TAG_GROUPS.map(g => ({
            name: g.name,
            items: allTags.filter(tObj => g.tags.includes(tObj.tag))
        })).filter(g => g.items.length > 0);

        if (unmappedTags.length > 0) {
            groupsToRender.push({
                name: 'Other',
                items: unmappedTags
            });
        }

        groupsToRender.forEach((group, gIdx) => {
            const groupWrapper = document.createElement('div');
            groupWrapper.className = 'tag-group-wrapper';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'tag-group-title';
            titleDiv.textContent = group.name;
            groupWrapper.appendChild(titleDiv);

            const pillsDiv = document.createElement('div');
            pillsDiv.className = 'tag-group-pills';

            group.items.forEach(tObj => {
                const kbd = document.createElement('kbd');
                const isSelected = selectedTags.includes(tObj.tag);
                kbd.className = `tag-pill-btn${isSelected ? ' active-tag' : ''}`;
                kbd.title = `Toggle filter for tag: ${tObj.tag} (${tObj.count} resources)`;

                const labelText = document.createTextNode(`${tObj.tag} `);
                const countSpan = document.createElement('span');
                countSpan.className = 'tag-count';
                countSpan.textContent = `(${tObj.count})`;

                kbd.appendChild(labelText);
                kbd.appendChild(countSpan);

                kbd.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = selectedTags.indexOf(tObj.tag);
                    if (idx > -1) {
                        selectedTags.splice(idx, 1);
                    } else {
                        selectedTags.push(tObj.tag);
                    }
                    renderMultiTagCloud();
                    renderResources();
                });

                pillsDiv.appendChild(kbd);
            });

            groupWrapper.appendChild(pillsDiv);

            if (gIdx < groupsToRender.length - 1) {
                const hr = document.createElement('hr');
                hr.className = 'tag-group-divider';
                groupWrapper.appendChild(hr);
            }

            multiTagCloudList.appendChild(groupWrapper);
        });

        if (multiTagBtnLabel) {
            if (selectedTags.length === 0) {
                multiTagBtnLabel.textContent = 'Tags: All';
            } else if (selectedTags.length === 1) {
                multiTagBtnLabel.textContent = `Tag: ${selectedTags[0]}`;
            } else {
                multiTagBtnLabel.textContent = `Tags (${selectedTags.length}): ${selectedTags.slice(0, 2).join(', ')}${selectedTags.length > 2 ? '...' : ''}`;
            }
        }
    }



    function renderStats() {
        if (!statsList) return;
        statsList.innerHTML = '';

        const stats = API.getStats();

        const statsData = [
            { label: 'Total Categories', value: stats.totalCategories },
            { label: 'Total Subcategories', value: stats.totalSubcategories },
            { label: 'Total Curated Resources', value: stats.totalResources },
            { label: 'Documented Authors', value: stats.uniqueAuthors },
            { label: 'Bookmarked Resources', value: bookmarkedResourceIds.length }
        ];

        statsData.forEach(item => {
            if (item.value === 0) return;

            const dt = document.createElement('dt');
            dt.textContent = item.label;

            const dd = document.createElement('dd');
            const dataElem = document.createElement('data');
            dataElem.value = item.value;
            dataElem.textContent = item.value;
            dd.appendChild(dataElem);

            statsList.appendChild(dt);
            statsList.appendChild(dd);
        });
    }

    function renderRawJSON() {
        if (jsonExportCode) {
            jsonExportCode.textContent = API.exportJSON();
        }
    }

    function renderResources() {
        if (!appMain) return;

        focusedResourceIndex = -1;
        const results = API.searchResources(currentSearchQuery, currentCategoryFilter, bookmarkedResourceIds, selectedTags, currentSortOption);

        const isFiltered = currentCategoryFilter !== 'all' || (currentSearchQuery && currentSearchQuery.trim() !== '') || selectedTags.length > 0;

        if (searchCount) {
            searchCount.textContent = `Showing ${results.length} of ${API.resources.length} resources`;
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.style.display = isFiltered ? 'inline-block' : 'none';
        }

        appMain.innerHTML = '';

        if (results.length === 0) {
            const noResultsSection = document.createElement('section');
            const h2 = document.createElement('h2');
            h2.textContent = 'No matching resources found';
            const p = document.createElement('p');
            p.textContent = 'Try adjusting your search query or category filters.';
            noResultsSection.appendChild(h2);
            noResultsSection.appendChild(p);
            appMain.appendChild(noResultsSection);
            return;
        }

        const grouped = groupResourcesByCategory(results);

        grouped.forEach((group, catIdx) => {
            const catNum = catIdx + 1;
            const section = document.createElement('section');
            section.id = group.id;

            const h2 = document.createElement('h2');
            h2.id = `heading-${group.id}`;

            const numSpan = document.createElement('span');
            numSpan.className = 'mw-headline-number';
            numSpan.textContent = `${catNum}`;

            const textSpan = document.createElement('span');
            textSpan.className = 'mw-headline-text';
            textSpan.textContent = group.title;

            h2.appendChild(numSpan);
            h2.appendChild(textSpan);
            section.appendChild(h2);

            // Render category description paragraph if present
            if (group.description) {
                const descP = document.createElement('p');
                descP.className = 'mw-category-description';
                descP.textContent = group.description;
                section.appendChild(descP);
            }

            if (group.subcategories && group.subcategories.length > 0) {
                group.subcategories.forEach((sub, subIdx) => {
                    if (sub.resources.length === 0) return;

                    const subSection = document.createElement('section');
                    subSection.id = sub.id;

                    const h3 = document.createElement('h3');
                    h3.id = `heading-${sub.id}`;

                    const subNumSpan = document.createElement('span');
                    subNumSpan.className = 'mw-headline-number';
                    subNumSpan.textContent = `${catNum}.${subIdx + 1}`;

                    const subTextSpan = document.createElement('span');
                    subTextSpan.className = 'mw-headline-text';
                    subTextSpan.textContent = sub.title;

                    h3.appendChild(subNumSpan);
                    h3.appendChild(subTextSpan);
                    subSection.appendChild(h3);

                    // Render subcategory description paragraph if present
                    if (sub.description) {
                        const subDescP = document.createElement('p');
                        subDescP.className = 'mw-category-description';
                        subDescP.textContent = sub.description;
                        subSection.appendChild(subDescP);
                    }

                    const ol = document.createElement('ol');
                    sub.resources.forEach(res => {
                        ol.appendChild(createResourceListItem(res));
                    });

                    subSection.appendChild(ol);
                    section.appendChild(subSection);
                });
            } else {
                const ol = document.createElement('ol');
                group.resources.forEach(res => {
                    ol.appendChild(createResourceListItem(res));
                });
                section.appendChild(ol);
            }

            appMain.appendChild(section);
        });

        renderStats();
    }

    function groupResourcesByCategory(resourcesList) {
        const groups = [];

        API.categories.forEach(cat => {
            const catResources = resourcesList.filter(r => r.categoryId === cat.id && !r.subcategoryId);
            const subGroups = [];

            if (cat.subcategories && cat.subcategories.length > 0) {
                cat.subcategories.forEach(sub => {
                    const subRes = resourcesList.filter(r => r.subcategoryId === sub.id);
                    if (subRes.length > 0) {
                        subGroups.push({
                            id: sub.id,
                            title: sub.title,
                            description: sub.description || '',
                            resources: subRes
                        });
                    }
                });
            }

            if (catResources.length > 0 || subGroups.length > 0) {
                groups.push({
                    id: cat.id,
                    title: cat.title,
                    description: cat.description || '',
                    resources: catResources,
                    subcategories: subGroups
                });
            }
        });

        return groups;
    }

    function createResourceListItem(res) {
        const li = document.createElement('li');
        const article = document.createElement('article');
        article.className = 'mw-resource-article';
        article.id = res.id;

        const header = document.createElement('header');
        const h3 = document.createElement('h3');

        const resType = res.type || 'article';
        const resLabel = res.typeLabel || 'Link';

        const aTitle = document.createElement('a');
        aTitle.href = res.url;
        aTitle.target = '_blank';
        aTitle.rel = 'noopener noreferrer';
        aTitle.title = `[${resLabel}] Open link: ${res.title}`;
        aTitle.className = 'resource-link';

        const iconSpan = document.createElement('i');
        iconSpan.className = `${getResourceIconClass(resType)} resource-type-icon`;
        iconSpan.setAttribute('aria-hidden', 'true');
        aTitle.appendChild(iconSpan);

        const titleText = document.createElement('span');
        titleText.className = 'resource-title-text';
        titleText.textContent = res.title;
        aTitle.appendChild(titleText);

        h3.appendChild(aTitle);
        header.appendChild(h3);

        if (res.author) {
            const cite = document.createElement('cite');
            cite.textContent = ` (${res.author})`;
            cite.title = `Author: ${res.author}`;
            header.appendChild(cite);
        }

        article.appendChild(header);

        const pDesc = document.createElement('p');
        pDesc.textContent = res.description;
        article.appendChild(pDesc);

        const footer = document.createElement('footer');

        const catSmall = document.createElement('small');
        catSmall.textContent = `Category: ${res.category}`;
        if (res.subcategory) {
            catSmall.textContent += ` > ${res.subcategory}`;
        }
        footer.appendChild(catSmall);

        if (res.tags && res.tags.length > 0) {
            const tagSpan = document.createElement('span');
            tagSpan.textContent = ' | Tags: ';
            res.tags.forEach((tag, idx) => {
                const kbd = document.createElement('kbd');
                const isSelected = selectedTags.includes(tag);
                kbd.className = `tag-pill-btn${isSelected ? ' active-tag' : ''}`;
                kbd.title = `Toggle filter for tag: ${tag}`;
                kbd.textContent = tag;
                kbd.addEventListener('click', () => {
                    const tIdx = selectedTags.indexOf(tag);
                    if (tIdx > -1) {
                        selectedTags.splice(tIdx, 1);
                    } else {
                        selectedTags.push(tag);
                    }
                    renderMultiTagCloud();
                    renderResources();
                });
                tagSpan.appendChild(kbd);
                if (idx < res.tags.length - 1) {
                    tagSpan.appendChild(document.createTextNode(' '));
                }
            });
            footer.appendChild(tagSpan);
        }

        const bookmarkBtn = createBookmarkButton(res.id);
        footer.appendChild(document.createTextNode(' '));
        footer.appendChild(bookmarkBtn);

        article.appendChild(footer);
        li.appendChild(article);
        return li;
    }

    function createBookmarkButton(resId) {
        const isBookmarked = bookmarkedResourceIds.includes(resId);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `mw-bookmark-btn${isBookmarked ? ' bookmarked' : ''}`;
        btn.dataset.id = resId;
        btn.title = isBookmarked ? 'Remove bookmark' : 'Bookmark this resource';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '13');
        svg.setAttribute('height', '13');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', isBookmarked ? '#f5c518' : 'none');
        svg.setAttribute('stroke', isBookmarked ? '#d4a017' : 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2');
        svg.appendChild(polygon);

        const labelSpan = document.createElement('span');
        labelSpan.className = 'mw-bookmark-label';
        labelSpan.textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';

        btn.appendChild(svg);
        btn.appendChild(labelSpan);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentlyBookmarked = toggleBookmark(resId);

            btn.classList.toggle('bookmarked', currentlyBookmarked);
            btn.title = currentlyBookmarked ? 'Remove bookmark' : 'Bookmark this resource';
            svg.setAttribute('fill', currentlyBookmarked ? '#f5c518' : 'none');
            svg.setAttribute('stroke', currentlyBookmarked ? '#d4a017' : 'currentColor');
            labelSpan.textContent = currentlyBookmarked ? 'Bookmarked' : 'Bookmark';

            updateBookmarkCounts();
            renderStats();

            if (currentCategoryFilter === 'bookmarks') {
                renderResources();
            }
        });

        return btn;
    }

    function loadBookmarks() {
        try {
            const saved = localStorage.getItem('0xTamil_bookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    function updateBookmarkCounts() {
        const bmxLinks = document.querySelectorAll('a[data-category="bookmarks"]');
        if (bookmarkedResourceIds.length === 0 && bmxLinks.length > 0) {
            // Bookmarks went to 0 — rebuild TOC to hide the entry
            initCategoryNav();
            return;
        }
        if (bookmarkedResourceIds.length > 0 && bmxLinks.length === 0) {
            // First bookmark added — rebuild TOC to show the entry
            initCategoryNav();
            return;
        }
        bmxLinks.forEach(link => {
            link.textContent = `★ Bookmarked (${bookmarkedResourceIds.length})`;
        });
    }

    function toggleBookmark(id) {
        const index = bookmarkedResourceIds.indexOf(id);
        let isNowBookmarked = false;
        if (index > -1) {
            bookmarkedResourceIds.splice(index, 1);
            isNowBookmarked = false;
        } else {
            bookmarkedResourceIds.push(id);
            isNowBookmarked = true;
        }
        try {
            localStorage.setItem('0xTamil_bookmarks', JSON.stringify(bookmarkedResourceIds));
        } catch (e) {
            console.error('Failed to save bookmark to localStorage:', e);
        }
        updateBookmarkCounts();
        return isNowBookmarked;
    }

    function getResourceIconClass(type) {
        switch (type) {
            case 'youtube':       return 'fab fa-youtube';
            case 'github':        return 'fab fa-github';
            case 'awesome-list':  return 'fas fa-star';
            case 'book':          return 'fas fa-book-open';
            case 'course':        return 'fas fa-graduation-cap';
            case 'interactive':   return 'fas fa-terminal';
            case 'docs':          return 'fas fa-file-lines';
            case 'article':
            default:              return 'fas fa-globe';
        }
    }

    function renderRoadmap() {
        if (!appMain) return;
        appMain.innerHTML = '';

        const roadmapData = API.roadmap || { intro: '', steps: [] };

        const section = document.createElement('section');
        section.className = 'mw-roadmap-section';

        if (roadmapData.intro) {
            const pIntro = document.createElement('p');
            pIntro.className = 'mw-category-description';
            pIntro.style.fontStyle = 'normal';
            pIntro.style.fontSize = '1.05em';
            pIntro.style.marginBottom = '20px';
            pIntro.textContent = roadmapData.intro;
            section.appendChild(pIntro);
        }

        const ol = document.createElement('ol');
        ol.className = 'mw-roadmap-list';

        roadmapData.steps.forEach(step => {
            const li = document.createElement('li');
            li.className = 'mw-roadmap-item';

            const article = document.createElement('article');
            article.className = 'mw-resource-article mw-roadmap-card';

            const header = document.createElement('header');
            const h3 = document.createElement('h3');

            const numSpan = document.createElement('span');
            numSpan.className = 'mw-headline-number';
            numSpan.textContent = `Step ${step.number}.`;

            const textSpan = document.createElement('span');
            textSpan.className = 'mw-headline-text';
            textSpan.textContent = step.title;

            h3.appendChild(numSpan);
            h3.appendChild(textSpan);
            header.appendChild(h3);
            article.appendChild(header);

            if (step.whatToDo) {
                article.appendChild(createFormattedParagraph('What to do: ', step.whatToDo));
            }

            if (step.whyItMatters) {
                article.appendChild(createFormattedParagraph('Why it matters: ', step.whyItMatters));
            }

            li.appendChild(article);
            ol.appendChild(li);
        });

        section.appendChild(ol);
        appMain.appendChild(section);
    }

    function createFormattedParagraph(prefixLabel, rawText) {
        const p = document.createElement('p');
        p.className = 'roadmap-block';
        const strongPrefix = document.createElement('strong');
        strongPrefix.textContent = prefixLabel;
        p.appendChild(strongPrefix);

        const regex = /(\*\*.*?\*\*|`.*?`)/g;
        const parts = rawText.split(regex);

        parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const b = document.createElement('strong');
                b.textContent = part.slice(2, -2);
                p.appendChild(b);
            } else if (part.startsWith('`') && part.endsWith('`')) {
                const c = document.createElement('code');
                c.textContent = part.slice(1, -1);
                p.appendChild(c);
            } else {
                p.appendChild(document.createTextNode(part));
            }
        });

        return p;
    }
});
