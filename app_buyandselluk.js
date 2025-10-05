// UK Astronomy Buy & Sell Enhanced - Main Application
// Coordinates all components and handles UI interactions

class AstroBuyAndSellApp {
    constructor() {
        this.scraper = new AstroBuyAndSellScraper();
        this.filter = new ListingFilter();
        this.currentTheme = this.detectInitialTheme();
        this.isLoading = false;
        this.autoRefreshInterval = null;
        this.darkModeMediaQuery = null;
        
        this.initializeApp();
    }

    /**
     * Initialize the application
     */
    async initializeApp() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupFilterCallbacks();
        
        // Load cached data if available
        const hasCachedData = this.loadCachedData();
        
        // Test proxies first, then load data
        await this.initializeProxiesAndLoadData(hasCachedData);
    }

    /**
     * Detect initial theme from localStorage or browser preference
     */
    detectInitialTheme() {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            return savedTheme;
        }
        
        // Fall back to browser/system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    /**
     * Setup theme handling with browser preference monitoring
     */
    setupTheme() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeButton();
        
        // Set up media query listener for system theme changes
        this.setupDarkModeListener();
    }

    /**
     * Setup listener for system dark mode changes
     */
    setupDarkModeListener() {
        if (window.matchMedia) {
            this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Listen for changes in system color scheme
            const handleThemeChange = (e) => {
                // Only auto-change if user hasn't manually set a preference
                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme) {
                    const newTheme = e.matches ? 'dark' : 'light';
                    if (newTheme !== this.currentTheme) {
                        this.currentTheme = newTheme;
                        document.documentElement.setAttribute('data-theme', this.currentTheme);
                        this.updateThemeButton();
                        this.showMessage(`Switched to ${newTheme} mode (system preference)`, 'info');
                    }
                }
            };
            
            // Add event listener with proper browser support
            if (this.darkModeMediaQuery.addEventListener) {
                this.darkModeMediaQuery.addEventListener('change', handleThemeChange);
            } else if (this.darkModeMediaQuery.addListener) {
                // Fallback for older browsers
                this.darkModeMediaQuery.addListener(handleThemeChange);
            }
        }
    }

    /**
     * Update theme toggle button
     */
    updateThemeButton() {
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            const isAutoMode = !localStorage.getItem('theme');
            const oppositeTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            
            themeBtn.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
            
            // Set data attribute for CSS styling
            themeBtn.setAttribute('data-auto', isAutoMode);
            
            if (isAutoMode) {
                themeBtn.title = `${this.currentTheme} mode (auto) - Click to switch to ${oppositeTheme}, double-click to stay auto`;
            } else {
                themeBtn.title = `${this.currentTheme} mode (manual) - Click to switch to ${oppositeTheme}, double-click for auto mode`;
            }
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Theme toggle with double-click for auto mode
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            // Single click: manual toggle
            themeToggle.addEventListener('click', () => this.toggleTheme());
            
            // Double click: reset to auto mode
            themeToggle.addEventListener('dblclick', (e) => {
                e.preventDefault();
                this.resetToAutoTheme();
            });
        }

        // Test proxies button
        const testProxiesBtn = document.getElementById('test-proxies-btn');
        if (testProxiesBtn) {
            testProxiesBtn.addEventListener('click', () => this.testProxies());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadListings(true));
        }

        // Clear filters button
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllFilters());
        }

        // Search input with debouncing
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.filter.setupDebouncedSearch(searchInput);
        }

        // Filter controls
        this.setupFilterControls();

        // Sort control
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filter.setSortBy(e.target.value);
            });
        }

        // Event delegation for listing number links
        document.addEventListener('click', (e) => {
            console.log('Document click detected:', e.target);
            console.log('Target classes:', e.target.classList);
            console.log('Target tag:', e.target.tagName);
            
            // Check if click is within listings grid or listings container
            const listingsGrid = document.getElementById('listings-grid');
            const listingsContainer = document.querySelector('.listings-container');
            
            if ((listingsGrid && listingsGrid.contains(e.target)) || 
                (listingsContainer && listingsContainer.contains(e.target))) {
                console.log('✅ Click is within listings area');
                
                // Check how many listing-number-link elements exist
                const allListingLinks = document.querySelectorAll('.listing-number-link');
                console.log(`📊 Total .listing-number-link elements on page: ${allListingLinks.length}`);
                
                if (allListingLinks.length === 0) {
                    console.log('⚠️ No listing-number-link elements found on page!');
                    console.log('🔍 Checking if any listings were rendered...');
                    const listingCards = document.querySelectorAll('.listing-card');
                    console.log(`📊 Total .listing-card elements: ${listingCards.length}`);
                    if (listingCards.length > 0) {
                        console.log('🔍 Sample listing card HTML:', listingCards[0].outerHTML.substring(0, 500) + '...');
                    }
                    return;
                }
            } else {
                console.log('ℹ️ Click outside listings area, ignoring');
                return;
            }
            
            // Check if the clicked element or any of its parents has the listing-number-link class
            let targetElement = e.target;
            let foundLink = null;
            
            // Walk up the DOM tree to find the anchor link
            while (targetElement && targetElement !== document) {
                console.log('Checking element:', targetElement, 'Classes:', targetElement.classList);
                
                if (targetElement.classList && targetElement.classList.contains('listing-number-link')) {
                    foundLink = targetElement;
                    break;
                }
                targetElement = targetElement.parentElement;
            }
            
            if (foundLink) {
                console.log('✅ Found listing-number-link class!', foundLink);
                e.preventDefault();
                e.stopPropagation();
                const listingNumber = foundLink.getAttribute('data-listing-number');
                console.log(`Opening listing ${listingNumber} in new tab`);
                window.open(`https://www.astrobuysell.com/uk/propview.php?view=${listingNumber}`, '_blank');
            } else {
                console.log('❌ No listing-number-link class found in target or parents');
            }
        });
    }

    /**
     * Setup filter controls
     */
    setupFilterControls() {
        const filterControls = [
            { id: 'ad-type-filter', filter: 'adType' },
            { id: 'status-filter', filter: 'status' },
            { id: 'min-price', filter: 'minPrice' },
            { id: 'max-price', filter: 'maxPrice' },
            { id: 'location-filter', filter: 'location' },
            { id: 'has-photo-filter', filter: 'hasPhoto' },
            { id: 'featured-only-filter', filter: 'featuredOnly' }
        ];

        filterControls.forEach(({ id, filter }) => {
            const element = document.getElementById(id);
            if (element) {
                const eventType = element.type === 'checkbox' ? 'change' : 'input';
                element.addEventListener(eventType, (e) => {
                    const value = element.type === 'checkbox' ? e.target.checked : e.target.value;
                    this.filter.setFilter(filter, value);
                });
            }
        });
    }

    /**
     * Setup filter callbacks
     */
    setupFilterCallbacks() {
        this.filter.onFilterChange = (filteredListings) => {
            this.renderListings(filteredListings);
            this.updateResultsCount(filteredListings.length);
        };
    }

    /**
     * Toggle theme (manual override)
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Save preference to override auto-detection
        localStorage.setItem('theme', this.currentTheme);
        
        this.updateThemeButton();
        this.showMessage(`Switched to ${this.currentTheme} mode (manual)`, 'info');
    }

    /**
     * Reset to automatic theme detection
     */
    resetToAutoTheme() {
        // Remove manual preference
        localStorage.removeItem('theme');
        
        // Detect current system preference
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newTheme = systemPrefersDark ? 'dark' : 'light';
        
        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;
            document.documentElement.setAttribute('data-theme', this.currentTheme);
        }
        
        this.updateThemeButton();
        this.showMessage(`Switched to auto mode (${this.currentTheme})`, 'info');
    }

    /**
     * Initialize proxies and load data
     */
    async initializeProxiesAndLoadData(hasCachedData) {
        this.showMessage('Initializing application...', 'info');
        
        try {
            // Check if we have a working proxy from this session
            const savedProxy = this.getSavedWorkingProxy();
            if (savedProxy) {
                console.log(`✅ Using saved working proxy: ${savedProxy.proxy} (index ${savedProxy.index})`);
                this.scraper.currentProxyIndex = savedProxy.index;
                this.updateProxyStatus(savedProxy, true);
                this.showMessage(`Using saved proxy ${savedProxy.index + 1}. Loading listings...`, 'success');
                
                // Skip proxy testing and go straight to loading data
                await this.loadListings();
                return;
            }
            
            // Show proxy testing status
            this.updateResultsCount('Testing CORS proxies...');
            
            // Test proxies automatically
            const workingProxies = await this.testProxiesQuietly();
            
            if (workingProxies.length > 0) {
                // Set the best working proxy
                const bestProxy = this.selectBestProxy(workingProxies);
                this.scraper.currentProxyIndex = bestProxy.index;
                
                // Save the working proxy for this session
                this.saveWorkingProxy(bestProxy);
                
                console.log(`✅ Using proxy: ${bestProxy.proxy} (${bestProxy.responseTime}ms)`);
                this.showMessage(`Connected via proxy ${bestProxy.index + 1}. Loading listings...`, 'success');
                this.updateProxyStatus(bestProxy, true);
                
                // Now load fresh data
                await this.loadListings();
            } else {
                console.warn('❌ No working proxies found');
                
                if (hasCachedData) {
                    this.showMessage('No working proxies found. Using cached data only.', 'warning');
                    this.updateProxyStatus(null, false);
                    this.showProxyHelp();
                } else {
                    this.showMessage('No working proxies found and no cached data available.', 'error');
                    this.updateProxyStatus(null, false);
                    this.showError('Cannot access listings. Please try the troubleshooting options.');
                    this.showProxyHelp();
                }
            }
        } catch (error) {
            console.error('Initialization error:', error);
            
            if (hasCachedData) {
                this.showMessage('Proxy test failed. Using cached data.', 'warning');
            } else {
                this.showMessage('Failed to initialize. No data available.', 'error');
                this.showError('Initialization failed. Please check your internet connection.');
            }
        }
    }

    /**
     * Save working proxy to session storage
     */
    saveWorkingProxy(proxyInfo) {
        try {
            const proxyData = {
                index: proxyInfo.index,
                proxy: proxyInfo.proxy,
                responseTime: proxyInfo.responseTime,
                timestamp: Date.now()
            };
            sessionStorage.setItem('astro-working-proxy', JSON.stringify(proxyData));
            console.log(`💾 Saved working proxy ${proxyInfo.index + 1} for this session`);
        } catch (error) {
            console.warn('Error saving working proxy:', error);
        }
    }

    /**
     * Get saved working proxy from session storage
     */
    getSavedWorkingProxy() {
        try {
            const saved = sessionStorage.getItem('astro-working-proxy');
            if (saved) {
                const proxyData = JSON.parse(saved);
                const age = Date.now() - proxyData.timestamp;
                const maxAge = 30 * 60 * 1000; // 30 minutes
                
                // Use saved proxy if it's less than 30 minutes old
                if (age < maxAge) {
                    return proxyData;
                } else {
                    // Remove expired proxy data
                    sessionStorage.removeItem('astro-working-proxy');
                    console.log('🗑️  Removed expired proxy data');
                }
            }
        } catch (error) {
            console.warn('Error loading saved proxy:', error);
            sessionStorage.removeItem('astro-working-proxy');
        }
        return null;
    }

    /**
     * Clear saved working proxy (for manual proxy retest)
     */
    clearSavedWorkingProxy() {
        try {
            sessionStorage.removeItem('astro-working-proxy');
            console.log('🗑️  Cleared saved working proxy');
        } catch (error) {
            console.warn('Error clearing saved proxy:', error);
        }
    }

    /**
     * Test proxies quietly without showing all the detailed logs
     */
    async testProxiesQuietly() {
        try {
            console.log('🧪 Testing CORS proxies...');
            const results = await this.scraper.testProxies();
            
            const workingProxies = results.filter(r => r.status === 'success' && r.isValid);
            
            if (workingProxies.length > 0) {
                console.log(`✅ Found ${workingProxies.length} working proxy(ies)`);
            } else {
                console.warn('❌ No working proxies found');
            }
            
            return workingProxies;
        } catch (error) {
            console.error('Proxy test error:', error);
            return [];
        }
    }

    /**
     * Select the best proxy from working ones (fastest response time)
     */
    selectBestProxy(workingProxies) {
        // Sort by response time and select the fastest
        return workingProxies.sort((a, b) => a.responseTime - b.responseTime)[0];
    }

    /**
     * Update proxy status display
     */
    updateProxyStatus(proxyInfo = null, isConnected = false) {
        const proxyStatus = document.getElementById('proxy-status');
        const proxyInfoEl = document.getElementById('proxy-info');
        
        if (proxyStatus && proxyInfoEl) {
            if (isConnected && proxyInfo) {
                proxyStatus.style.display = 'flex';
                proxyInfoEl.textContent = `🔗 Proxy ${proxyInfo.index + 1} (${proxyInfo.responseTime}ms)`;
                proxyInfoEl.className = 'proxy-connected';
            } else if (!isConnected) {
                proxyStatus.style.display = 'flex';
                proxyInfoEl.textContent = '❌ No proxy connection';
                proxyInfoEl.className = 'proxy-disconnected';
            } else {
                proxyStatus.style.display = 'none';
            }
        }
    }

    /**
     * Load cached data from localStorage
     */
    loadCachedData() {
        try {
            const cached = localStorage.getItem('astro-listings-cache');
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                const maxAge = 30 * 60 * 1000; // 30 minutes

                if (age < maxAge && data && data.length > 0) {
                    console.log('Loading cached listings data');
                    this.filter.setListings(data);
                    this.updateResultsCount(data.length);
                    this.showMessage('Loaded cached data. Click refresh for latest listings.', 'info');
                    return true;
                }
            }
        } catch (error) {
            console.warn('Error loading cached data:', error);
        }
        return false;
    }

    /**
     * Save data to cache
     */
    saveCachedData(listings) {
        try {
            const cacheData = {
                data: listings,
                timestamp: Date.now()
            };
            localStorage.setItem('astro-listings-cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Error saving to cache:', error);
        }
    }

    /**
     * Load listings from the website with progressive loading
     */
    async loadListings(force = false) {
        if (this.isLoading && !force) return;
        
        this.isLoading = true;
        this.showLoadingState(true);
        this.hideError();

        try {
            // Clear existing listings for fresh start
            this.filter.setListings([]);
            let accumulatedListings = [];
            
            // Enhanced parallel scraping with configurable options
            const parallelCheckbox = document.getElementById('parallel-loading');
            const useParallel = parallelCheckbox ? parallelCheckbox.checked : true;
            const concurrentLimit = 3; // Number of simultaneous requests
            const maxPages = 50; // Maximum pages to scrape
            
            console.log(`🔄 Starting ${useParallel ? 'parallel' : 'sequential'} scraping...`);
            
            const listings = await this.scraper.fetchAllPages(
                (progress) => this.updateProgress(progress),
                (progressiveData) => {
                    // Progressive loading: add new listings as they arrive
                    accumulatedListings = accumulatedListings.concat(progressiveData.newListings);
                    
                    // Update filter with accumulated listings
                    this.filter.setListings(accumulatedListings);
                    
                    // Update UI immediately
                    this.populateFilterOptions();
                    
                    // Enhanced status message for parallel loading
                    const loadingMode = useParallel ? '🚀 Parallel' : '📄 Sequential';
                    this.showMessage(
                        `${loadingMode} Loading... ${progressiveData.totalListings} listings found so far (${progressiveData.status})`,
                        'info'
                    );
                },
                maxPages,
                useParallel,
                concurrentLimit
            );

            // Final update with all listings
            this.filter.setListings(listings);
            this.saveCachedData(listings);
            this.populateFilterOptions();
            this.showMessage(`Successfully loaded ${listings.length} listings!`, 'success');
            
        } catch (error) {
            console.error('Error loading listings:', error);
            this.showError(error.message);
            
            // Suggest re-testing proxies if loading fails
            this.showMessage('Failed to load listings. Try testing proxies again.', 'error');
            
            // Auto-suggest proxy retest after failure
            setTimeout(() => {
                if (confirm('Loading failed. Would you like to test proxies again and retry?')) {
                    this.testProxies().then(() => {
                        if (this.scraper.currentProxyIndex >= 0) {
                            this.loadListings(true);
                        }
                    });
                }
            }, 2000);
        } finally {
            this.isLoading = false;
            this.showLoadingState(false);
        }
    }

    /**
     * Test CORS proxies (manual test triggered by user)
     */
    async testProxies() {
        const testBtn = document.getElementById('test-proxies-btn');
        if (testBtn) {
            testBtn.disabled = true;
            testBtn.textContent = 'Testing...';
        }

        // Clear any saved working proxy when manually testing
        this.clearSavedWorkingProxy();

        this.showMessage('Testing CORS proxies...', 'info');

        try {
            const results = await this.scraper.testProxies();
            
            // Show results in console and UI
            console.table(results);
            
            const workingProxies = results.filter(r => r.status === 'success' && r.isValid);
            
            if (workingProxies.length > 0) {
                const bestProxy = this.selectBestProxy(workingProxies);
                this.scraper.currentProxyIndex = bestProxy.index;
                
                // Save the new working proxy
                this.saveWorkingProxy(bestProxy);
                
                this.showMessage(
                    `Found ${workingProxies.length} working proxy(ies)! Using fastest: Proxy ${bestProxy.index + 1} (${bestProxy.responseTime}ms)`, 
                    'success'
                );
                
                this.updateProxyStatus(bestProxy, true);
                console.log(`🚀 Switched to best proxy: ${bestProxy.proxy}`);
            } else {
                this.showMessage('No working proxies found. Check console for details.', 'error');
                this.updateProxyStatus(null, false);
                this.showProxyHelp();
            }
            
        } catch (error) {
            console.error('Proxy test error:', error);
            this.showMessage('Proxy test failed', 'error');
        } finally {
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.textContent = 'Test Proxies';
            }
        }
    }

    /**
     * Show proxy help information
     */
    showProxyHelp() {
        const helpMessage = `
CORS Proxy Issues - Possible Solutions:

1. **Browser Extensions:**
   - Install "CORS Unblock" or "CORS Everywhere" extension
   - Enable the extension and try again

2. **Browser Settings:**
   - Launch Chrome with: --disable-web-security --user-data-dir="c:/temp/chrome"
   - This disables CORS (not recommended for regular browsing)

3. **Alternative Methods:**
   - Use a local proxy server
   - Set up your own CORS proxy service
   - Use browser developer tools to copy curl commands

4. **Check Console:**
   - Open DevTools (F12) and check for specific error messages
   - Network tab shows which requests are failing

The target website may also be temporarily unavailable or blocking requests.
        `.trim();
        
        console.log(helpMessage);
        
        // Create a modal or alert with the help information
        if (confirm('No working proxies found. Would you like to see troubleshooting help in the console?')) {
            console.info('📋 CORS Troubleshooting Guide:', helpMessage);
        }
    }

    /**
     * Refresh data
     */
    async refreshData() {
        this.scraper.clearCache();
        await this.loadListings(true);
    }

    /**
     * Show loading state
     */
    showLoadingState(loading) {
        const refreshBtn = document.getElementById('refresh-btn');
        const loadingProgress = document.getElementById('loading-progress');
        const listingsGrid = document.getElementById('listings-grid');
        const initialSpinner = document.getElementById('initial-loading-spinner');

        if (refreshBtn) {
            refreshBtn.disabled = loading;
            refreshBtn.textContent = loading ? 'Loading...' : 'Refresh Data';
        }

        if (loadingProgress) {
            loadingProgress.style.display = loading ? 'flex' : 'none';
        }

        if (listingsGrid && loading) {
            listingsGrid.classList.toggle('loading', loading);
        }

        // Show/hide initial loading spinner based on whether we have any listings
        if (initialSpinner) {
            const hasListings = listingsGrid && listingsGrid.querySelector('.listing-card');
            const shouldShowSpinner = loading && !hasListings;
            initialSpinner.style.display = shouldShowSpinner ? 'flex' : 'none';
        }
    }

    /**
     * Update progress bar
     */
    updateProgress(progress) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill && progressText) {
            if (progress.completed) {
                progressFill.style.width = '100%';
                progressText.textContent = progress.status;
            } else {
                // Estimate progress based on current page (assuming max 20 pages)
                const estimatedProgress = Math.min((progress.currentPage / 20) * 100, 95);
                progressFill.style.width = `${estimatedProgress}%`;
                progressText.textContent = progress.status;
            }

            if (progress.error) {
                progressText.style.color = 'var(--accent-color)';
            } else {
                progressText.style.color = 'var(--text-muted)';
            }
        }
    }

    /**
     * Update results count
     */
    updateResultsCount(count) {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const total = this.filter.listings.length;
            if (count === total) {
                resultsCount.textContent = `Showing ${count} listing${count !== 1 ? 's' : ''}`;
            } else {
                resultsCount.textContent = `Showing ${count} of ${total} listing${total !== 1 ? 's' : ''}`;
            }
        }
    }

    /**
     * Render listings in the grid
     */
    renderListings(listings) {
        const listingsGrid = document.getElementById('listings-grid');
        const initialSpinner = document.getElementById('initial-loading-spinner');
        if (!listingsGrid) return;

        // Hide initial loading spinner once we have content to show
        if (initialSpinner) {
            initialSpinner.style.display = 'none';
        }

        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No listings found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        const html = listings.map(listing => this.renderListingCard(listing)).join('');
        listingsGrid.innerHTML = html;
        
        // Debug: Check if anchor links were properly created
        const anchorLinks = listingsGrid.querySelectorAll('.listing-number-link');
        console.log(`🔍 Debug: Found ${anchorLinks.length} anchor links with .listing-number-link class`);
        anchorLinks.forEach((link, index) => {
            console.log(`Link ${index + 1}:`, link, 'data-listing-number:', link.getAttribute('data-listing-number'));
            
            // Add direct click listener to each link
            link.addEventListener('click', (e) => {
                console.log('🎯 Direct click on anchor link!', link);
                e.preventDefault();
                e.stopPropagation();
                const listingNumber = link.getAttribute('data-listing-number');
                console.log(`Opening listing ${listingNumber} in new tab`);
                window.open(`https://www.astrobuysell.com/uk/propview.php?view=${listingNumber}`, '_blank');
            });
        });
    }

    /**
     * Render individual listing card
     */
    renderListingCard(listing) {
        const formattedPrice = this.formatPrice(listing.price, listing.priceText);
        const formattedDate = this.formatDate(listing.date, listing.dateText);
        const statusClass = listing.status.toLowerCase().replace(/\s+/g, '-');

        return `
        
            <div class="listing-card ${listing.isFeatured ? 'featured' : ''}" 
                 role="button"
                 tabindex="0"
                 style="pointer-events: none;"
                 >
                
                <div class="listing-badges-container" style="pointer-events: none;">
                    ${listing.hasPhoto ? '<div class="badge badge-photo">📷 Photo</div>' : ''}
                    ${listing.isFeatured ? '<div class="badge badge-featured">⭐ Featured</div>' : ''}
                </div>
                
                <div class="listing-header" style="pointer-events: none;">
                    <div class="listing-number" style="pointer-events: none;">
                     <a href="#" 
                        class="listing-number-link"
                        data-listing-number="${listing.adNumber}"
                        style="cursor: pointer; text-decoration: none; color: var(--secondary-color); position: relative; z-index: 1000; pointer-events: auto; display: inline-block; padding: 4px;">
                        #${listing.adNumber}
                     </a>
                    </div>
                    <div class="listing-header-badges" style="pointer-events: none;">
                        <span class="listing-type">${listing.adType}</span>
                        <span class="listing-status status-${statusClass}">${listing.status}</span>
                    </div>
                </div>

                <div class="listing-description" style="pointer-events: none;">${this.escapeHtml(listing.description)}</div>

                <div class="listing-details" style="pointer-events: none;">
                    <div class="listing-price">${formattedPrice}</div>
                    <div class="listing-date">📅 ${formattedDate}</div>
                    <div class="listing-location">📍 ${this.escapeHtml(listing.location)}</div>
                </div>
            </div>
        `;
    }

    /**
     * Format price for display
     */
    formatPrice(price, priceText) {
        if (price === null || price === undefined) {
            return priceText || 'POA';
        }
        
        return `£${price.toLocaleString('en-GB', { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 2 
        })}`;
    }

    /**
     * Format date for display
     */
    formatDate(date, dateText) {
        if (date) {
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        return dateText || 'Unknown';
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Populate filter options based on loaded data
     */
    populateFilterOptions() {
        const uniqueValues = this.filter.getUniqueValues();

        // Update ad type filter
        const adTypeFilter = document.getElementById('ad-type-filter');
        if (adTypeFilter) {
            const currentValue = adTypeFilter.value;
            adTypeFilter.innerHTML = '<option value="">All Types</option>' +
                uniqueValues.adTypes.map(type => 
                    `<option value="${type}" ${type === currentValue ? 'selected' : ''}>${type}</option>`
                ).join('');
        }

        // Update status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            const currentValue = statusFilter.value;
            statusFilter.innerHTML = '<option value="">All Statuses</option>' +
                uniqueValues.statuses.map(status => 
                    `<option value="${status}" ${status === currentValue ? 'selected' : ''}>${status}</option>`
                ).join('');
        }
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.filter.clearFilters();
        
        // Reset UI controls
        document.getElementById('search-input').value = '';
        document.getElementById('ad-type-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        document.getElementById('location-filter').value = '';
        document.getElementById('has-photo-filter').checked = false;
        document.getElementById('featured-only-filter').checked = false;
        document.getElementById('sort-select').value = 'date-desc';
        
        this.showMessage('All filters cleared', 'info');
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.style.display = 'block';
            const messageP = errorElement.querySelector('p');
            if (messageP) {
                messageP.textContent = message;
            }
        }
    }

    /**
     * Hide error message
     */
    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    /**
     * Show temporary message to user
     */
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('temp-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'temp-message';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                max-width: 300px;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(messageEl);
        }

        // Set message and style based on type
        messageEl.textContent = message;
        const colors = {
            info: 'var(--secondary-color)',
            success: 'var(--success-color)',
            error: 'var(--accent-color)',
            warning: 'var(--warning-color)'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        // Show message
        setTimeout(() => messageEl.style.opacity = '1', 10);

        // Hide message after delay
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Export current filtered results
     */
    exportResults() {
        try {
            this.filter.downloadCSV();
            this.showMessage('Listings exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Failed to export listings', 'error');
        }
    }

    /**
     * Get application statistics
     */
    getStats() {
        const stats = this.filter.getFilterStats();
        const cacheStats = this.scraper.getCacheStats();
        
        return {
            ...stats,
            cache: cacheStats,
            theme: this.currentTheme,
            isLoading: this.isLoading
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 UK Astronomy Buy & Sell Enhanced - Starting up...');
    window.astroBuyAndSellApp = new AstroBuyAndSellApp();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    window.astroBuyAndSellApp.refreshData();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('search-input')?.focus();
                    break;
                case 'e':
                    e.preventDefault();
                    window.astroBuyAndSellApp.exportResults();
                    break;
                case 't':
                    e.preventDefault();
                    window.astroBuyAndSellApp.testProxies();
                    break;
            }
        }
        
    });
    
    console.log('✅ Application initialized successfully!');
    console.log('📋 Keyboard shortcuts:');
    console.log('- Ctrl+R: Refresh data');
    console.log('- Ctrl+F: Focus search');
    console.log('- Ctrl+E: Export results');
    console.log('- Ctrl+T: Test proxies');
    console.log('- Escape: Clear filters');
});