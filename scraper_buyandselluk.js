// UK Astronomy Buy & Sell Enhanced - Scraper Module
// Handles fetching and parsing of listings from astrobuysell.com

class AstroBuyAndSellScraper {
    constructor() {
        this.baseUrl = 'https://www.astrobuysell.com/uk/propview.php';
        this.corsProxies = [
            // Your CORS Anywhere deployment
            'https://cors-anywhere-wrwp.onrender.com/',
            
            // Public CORS Anywhere instances
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/',
            'https://crossorigin.me/',
            
            // AllOrigins proxies
            'https://api.allorigins.win/get?url=',
            'https://api.allorigins.win/raw?url=',
            
            // CodeTabs proxy
            'https://api.codetabs.com/v1/proxy?quest=',
            
            // CORS proxy services
            'https://corsproxy.io/?',
            'https://cors-proxy.htmldriven.com/?url=',
            'https://yacdn.org/proxy/',
            'https://cors.bridged.cc/',
            
            // JSONBin proxy
            'https://api.jsonbin.io/b/cors/',
            
            // JSONP proxy
            'https://jsonp.afeld.me/?url=',
            
            // Alternative CORS services
            'https://cors-anywhere.azurewebsites.net/',
            'https://cors-escape.herokuapp.com/',
            'https://cors-container.herokuapp.com/',
            'https://mighty-earth-7240.herokuapp.com/',
            
            // GitHub-based proxies
            'https://api.github.com/repos/Rob--W/cors-anywhere/contents/server.js?callback=',
            
            // WebShare proxies
            'https://proxy.webshare.io/proxy/',
            
            // ScrapingBee-style proxies
            'https://app.scrapingbee.com/api/v1/?api_key=FREE&url=',
            
            // ProxyCrawl alternatives
            'https://api.proxycrawl.com/?token=FREE&url=',
            
            // Other public proxies
            'https://api.scrapestack.com/scrape?access_key=FREE&url=',
            'https://cors-proxy.fringe.zone/',
            'https://proxy-server.herokuapp.com/proxy?url=',
            'https://galvanize-cors-proxy.herokuapp.com/',
            'https://polar-anchorage-72259.herokuapp.com/',
            'https://sleepy-peak-12345.herokuapp.com/',
            
            // Backup free services
            'https://cors-anywhere-eosin.vercel.app/',
            'https://cors-anywhere-sandy.vercel.app/',
            'https://cors-proxy-server.herokuapp.com/',
            'https://cors-anywhere-proxy.glitch.me/',
            
            // RSS2JSON (for testing alternative approaches)
            'https://api.rss2json.com/v1/api.json?rss_url=',
            
            // Additional Heroku instances
            'https://evening-journey-12345.herokuapp.com/',
            'https://ancient-caverns-98765.herokuapp.com/',
            'https://serene-harbor-54321.herokuapp.com/',
            
            // Vercel deployments
            'https://cors-proxy-nu.vercel.app/',
            'https://cors-anywhere-beta.vercel.app/',
            'https://simple-cors-proxy.vercel.app/',
            
            // Netlify functions
            'https://cors-proxy.netlify.app/.netlify/functions/proxy?url=',
            
            // Railway deployments
            'https://cors-anywhere-production.up.railway.app/',
            
            // Direct approach (no proxy) - will be tried first
            ''
        ];
        this.currentProxyIndex = -1; // No proxy selected initially
        this.cache = new Map();
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Build URL for a specific page
     */
    buildUrl(pageNumber) {
        const params = new URLSearchParams({
            minprice: '0',
            maxprice: '1000000000000000',
            cur_page: pageNumber.toString(),
            sort: 'id DESC'
        });
        return `${this.baseUrl}?${params.toString()}`;
    }

    /**
     * Build proxy URL for different proxy services
     */
    buildProxyUrl(url, proxyIndex = this.currentProxyIndex) {
        const proxy = this.corsProxies[proxyIndex];
        
        // Handle direct fetch (empty string)
        if (!proxy || proxy === '') {
            return url;
        }
        
        // Handle different proxy URL formats
        if (proxy.includes('allorigins.win')) {
            return `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('codetabs.com')) {
            return `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('corsproxy.io')) {
            return `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('cors-anywhere')) {
            // CORS Anywhere proxies should NOT encode the URL
            return `${proxy}${url}`;
        } else if (proxy.includes('thingproxy.freeboard.io')) {
            return `${proxy}${url}`;
        } else if (proxy.includes('crossorigin.me')) {
            return `${proxy}${url}`;
        } else if (proxy.includes('cors-proxy.htmldriven.com')) {
            return `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('jsonbin.io')) {
            return `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('jsonp.afeld.me')) {
            return `${proxy}${encodeURIComponent(url)}`;
        } else if (proxy.includes('rss2json.com')) {
            // Special handling for RSS2JSON which expects different format
            return proxy.replace('rss_url=', `rss_url=${encodeURIComponent(url)}`);
        } else {
            // Default format: proxy + encoded URL
            return `${proxy}${encodeURIComponent(url)}`;
        }
    }

    /**
     * Fetch a page with CORS handling and retry logic
     */
    async fetchPage(pageNumberOrUrl, maxRetries = 3) {
        // Handle custom URL vs page number
        let url, cacheKey, pageNumber, isCustomUrl;
        if (typeof pageNumberOrUrl === 'string' && pageNumberOrUrl.startsWith('http')) {
            url = pageNumberOrUrl;
            cacheKey = `custom_${btoa(url).substring(0, 20)}`;
            pageNumber = null;
            isCustomUrl = true;
        } else {
            pageNumber = pageNumberOrUrl;
            url = this.buildUrl(pageNumber);
            cacheKey = `page_${pageNumber}`;
            isCustomUrl = false;
        }
        
        const identifier = isCustomUrl ? url : `page ${pageNumber}`;
        
        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
            console.log(`Using cached data for ${identifier}`);
            return cached.data;
        }

        let lastError;
        
        // Try direct fetch first
        try {
            console.log(`Fetching ${identifier} directly...`);
            const response = await fetch(url);
            if (response.ok) {
                const html = await response.text();
                this.cache.set(cacheKey, { data: html, timestamp: Date.now() });
                return html;
            }
        } catch (error) {
            console.log(`Direct fetch failed for ${identifier}:`, error.message);
            lastError = error;
        }

        // If we have a working proxy, try it first with multiple attempts
        if (this.currentProxyIndex >= 0) {
            const maxProxyRetries = 3;
            for (let attempt = 0; attempt < maxProxyRetries; attempt++) {
                try {
                    const proxyUrl = this.buildProxyUrl(url, this.currentProxyIndex);
                    console.log(`Using selected proxy ${this.currentProxyIndex + 1} for ${identifier}, attempt ${attempt + 1}/${maxProxyRetries}...`);
                    
                    const response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                            'Referer': 'https://www.google.com/',
                            'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    if (response.ok) {
                        let html;
                        const proxy = this.corsProxies[this.currentProxyIndex];
                        
                        // Handle different proxy response formats
                        if (proxy.includes('allorigins.win/get') || proxy.includes('jsonbin.io') || proxy.includes('jsonp.afeld.me')) {
                            try {
                                const jsonResponse = await response.json();
                                html = jsonResponse.contents || jsonResponse.data || jsonResponse.content;
                                console.log(`📄 Retrieved JSON response, content length: ${html ? html.length : 0}`);
                            } catch (jsonError) {
                                console.warn('Failed to parse JSON response, trying as text:', jsonError.message);
                                html = await response.text();
                            }
                        } else if (proxy.includes('rss2json.com')) {
                            try {
                                const jsonResponse = await response.json();
                                html = jsonResponse.items && jsonResponse.items[0] ? jsonResponse.items[0].description : null;
                                console.log(`📄 Retrieved RSS JSON response, content length: ${html ? html.length : 0}`);
                            } catch (jsonError) {
                                console.warn('Failed to parse RSS JSON response:', jsonError.message);
                                html = await response.text();
                            }
                        } else {
                            html = await response.text();
                            console.log(`📄 Retrieved text response, content length: ${html ? html.length : 0}`);
                        }
                        
                        // Validate that we got actual HTML content
                        if (html && html.includes('<table') && html.length > 1000) {
                            this.cache.set(cacheKey, { data: html, timestamp: Date.now() });
                            console.log(`✅ Successfully cached ${identifier} using selected proxy ${this.currentProxyIndex + 1}`);
                            return html;
                        } else {
                            console.warn(`⚠️  Invalid content for ${identifier}: length=${html ? html.length : 0}, hasTable=${html ? html.includes('<table') : false}`);
                            if (html && html.length < 500) {
                                console.log('📋 Sample content:', html.substring(0, 200));
                            }
                            // Don't immediately fail - try again with a delay
                            if (attempt < maxProxyRetries - 1) {
                                console.log(`⏳ Retrying selected proxy in 2 seconds...`);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                                continue;
                            }
                        }
                    } else {
                        console.warn(`⚠️  Selected proxy returned HTTP ${response.status} for ${identifier}`);
                        if (attempt < maxProxyRetries - 1) {
                            console.log(`⏳ Retrying selected proxy in 2 seconds...`);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            continue;
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️  Selected proxy ${this.currentProxyIndex + 1} attempt ${attempt + 1} failed for ${identifier}:`, error.message);
                    if (attempt < maxProxyRetries - 1) {
                        console.log(`⏳ Retrying selected proxy in 2 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        continue;
                    }
                }
            }
            
            console.warn(`❌ Selected proxy ${this.currentProxyIndex + 1} failed after ${maxProxyRetries} attempts for ${identifier}`);
            console.log(`🔄 Selected proxy appears to be having issues, will search for alternative...`);
        }

        // Try with CORS proxies (only if saved proxy didn't work or we don't have one)
        // Limit fallback to just a few key proxies to avoid cycling through 50+ proxies
        const fallbackProxies = this.currentProxyIndex >= 0 ? 
            [0, 1, 2, 3, 4, 5] : // If we have a selected proxy but it failed, try just first 6
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // If no proxy selected, try first 10
            
        console.log(`🔄 ${this.currentProxyIndex >= 0 ? 'Selected proxy failed' : 'No proxy selected'}, trying ${fallbackProxies.length} fallback proxies for ${identifier}...`);
        
        for (const proxyIndex of fallbackProxies) {
            // Skip the proxy we already tried above
            if (proxyIndex === this.currentProxyIndex) {
                continue;
            }
            
            // Skip if proxy index is out of range
            if (proxyIndex >= this.corsProxies.length) {
                continue;
            }
            
            for (let attempt = 0; attempt < maxRetries; attempt++) {
                try {
                    const proxyUrl = this.buildProxyUrl(url, proxyIndex);
                    const proxyName = this.corsProxies[proxyIndex] || 'Direct (no proxy)';
                    console.log(`Attempting ${identifier} with fallback proxy ${proxyIndex + 1} (${proxyName}), attempt ${attempt + 1}...`);
                    
                    const response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                            'Referer': 'https://www.astrobuysell.com/',
                            // Add required headers for CORS Anywhere
                            'X-Requested-With': 'XMLHttpRequest',
                            'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://localhost'
                        }
                    });

                    console.log(`📡 Fallback proxy ${proxyIndex + 1} response: ${response.status} ${response.statusText}`);

                    if (response.status === 403) {
                        const errorText = await response.text();
                        console.error(`❌ 403 Forbidden from fallback proxy ${proxyIndex + 1}:`, errorText.substring(0, 200));
                        throw new Error(`Fallback proxy returned 403 Forbidden: ${errorText.substring(0, 200)}`);
                    }

                    if (response.ok) {
                        let html;
                        const proxy = this.corsProxies[proxyIndex];
                        
                        // Handle different proxy response formats
                        if (proxy === '' || !proxy) {
                            // Direct fetch
                            html = await response.text();
                        } else if (proxy.includes('allorigins.win/get') || proxy.includes('jsonbin.io') || proxy.includes('jsonp.afeld.me')) {
                            try {
                                const jsonResponse = await response.json();
                                html = jsonResponse.contents || jsonResponse.data || jsonResponse.content;
                            } catch (jsonError) {
                                html = await response.text();
                            }
                        } else if (proxy.includes('rss2json.com')) {
                            try {
                                const jsonResponse = await response.json();
                                html = jsonResponse.items && jsonResponse.items[0] ? jsonResponse.items[0].description : await response.text();
                            } catch (jsonError) {
                                html = await response.text();
                            }
                        } else {
                            html = await response.text();
                        }
                        
                        // Validate that we got actual HTML content
                        if (html && html.includes('<table') && html.length > 1000) {
                            this.cache.set(cacheKey, { data: html, timestamp: Date.now() });
                            console.log(`✅ Successfully fetched ${identifier} using fallback proxy ${proxyIndex + 1} (${proxyName})`);
                            console.log(`💡 Consider running testProxies() again to find a more reliable proxy`);
                            return html;
                        } else {
                            throw new Error('Invalid HTML content received');
                        }
                    } else {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                } catch (error) {
                    console.log(`❌ Fallback proxy ${proxyIndex + 1} attempt ${attempt + 1} failed:`, error.message);
                    lastError = error;
                    
                    // Add delay between retries
                    if (attempt < maxRetries - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    }
                }
            }
        }

        throw lastError || new Error(`Failed to fetch ${identifier} after all retry attempts`);
    }

    /**
     * Parse HTML to extract listings
     */
    parseListings(html, pageNumber) {
        console.log(`🔍 Parsing page ${pageNumber}, HTML length: ${html.length}`);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Debug: Check what we actually received
        const title = doc.querySelector('title')?.textContent || 'No title';
        console.log(`📄 Page title: "${title}"`);
        
        // Find listing tables - each listing is in its own table
        // Look for tables with the specific attributes and bgcolor="#FFF87A" or "#EBEBEB"
        const allTables = doc.querySelectorAll('table[border="1"][cellspacing="1"][cellpadding="2"]');
        console.log(`📊 Found ${allTables.length} potential listing table(s) on page ${pageNumber}`);
        
        const listingTables = [];
        
        for (let i = 0; i < allTables.length; i++) {
            const table = allTables[i];
            const style = table.getAttribute('style');
            const bgcolor = table.getAttribute('bgcolor');
            
            // Check if this is a listing table (featured or regular)
            if (style && style.includes('border-collapse: collapse') && 
                (bgcolor === '#FFF87A' || bgcolor === '#EBEBEB')) {
                listingTables.push(table);
                console.log(`✅ Found listing table ${listingTables.length}: bgcolor="${bgcolor}" (${bgcolor === '#FFF87A' ? 'FEATURED' : 'REGULAR'})`);
            }
        }

        console.log(`🎯 Found ${listingTables.length} listing table(s) on page ${pageNumber}`);

        if (listingTables.length === 0) {
            console.warn(`❌ No listing tables found on page ${pageNumber}`);
            return [];
        }

        const listings = [];
        
        // Process each listing table
        for (let i = 0; i < listingTables.length; i++) {
            const table = listingTables[i];
            const rows = table.querySelectorAll('tr');
            
            if (rows.length > 0) {
                try {
                    const listing = this.parseListingTable(table, rows[0], pageNumber, i);
                    if (listing) {
                        listings.push(listing);
                    }
                } catch (error) {
                    console.warn(`Error parsing listing table ${i + 1} on page ${pageNumber}:`, error);
                }
            }
        }

        console.log(`✅ Parsed ${listings.length} listings from page ${pageNumber}`);
        return listings;
    }

    /**
     * Parse individual listing table (each listing is in its own table)
     */
    parseListingTable(table, row, pageNumber, tableIndex) {
        const cells = row.querySelectorAll('td');
        
        // Verify we have enough columns
        if (cells.length < 8) {
            console.warn(`Table ${tableIndex + 1} on page ${pageNumber} has only ${cells.length} columns, skipping`);
            return null;
        }

        // Check if this is a featured ad
        const bgcolor = table.getAttribute('bgcolor');
        const isFeatured = bgcolor === '#FFF87A';
        
        // Extract ad number and link
        const adNumberCell = cells[0];
        const adNumberLink = adNumberCell.querySelector('a');
        const adNumber = adNumberCell.textContent.trim();
        const listingUrl = adNumberLink ? this.resolveUrl(adNumberLink.getAttribute('href')) : null;

        // Extract ad type
        const adTypeCell = cells[1];
        const adTypeLink = adTypeCell.querySelector('a');
        const adType = (adTypeLink || adTypeCell).textContent.trim();

        // Extract status
        const status = cells[2].textContent.trim();

        // Check for photo indicator
        const photoCell = cells[3];
        const hasPhoto = photoCell.querySelector('img[src*="camera.gif"]') !== null;

        // Extract description
        const description = cells[4].textContent.trim();

        // Extract and parse price
        const priceText = cells[5].textContent.trim();
        const price = this.parsePrice(priceText);

        // Extract date
        const dateText = cells[6].textContent.trim();
        const date = this.parseDate(dateText);

        // Extract location
        const location = cells[7].textContent.trim();

        const listing = {
            id: `${pageNumber}_${adNumber}`,
            adNumber,
            adType,
            status,
            hasPhoto,
            description,
            price,
            priceText,
            date,
            dateText,
            location,
            isFeatured,
            listingUrl,
            pageNumber
        };

        console.log(`📋 Parsed listing ${tableIndex + 1}: #${adNumber} - ${description.substring(0, 50)}... (${isFeatured ? 'FEATURED' : 'REGULAR'})`);
        return listing;
    }

    /**
     * Parse price from text
     */
    parsePrice(priceText) {
        if (!priceText || priceText.toLowerCase().includes('poa') || priceText.toLowerCase().includes('contact')) {
            return null;
        }

        // Remove currency symbols and commas, extract numbers
        const numericMatch = priceText.match(/[\d,]+\.?\d*/);
        if (numericMatch) {
            const cleanPrice = numericMatch[0].replace(/,/g, '');
            const parsedPrice = parseFloat(cleanPrice);
            return isNaN(parsedPrice) ? null : parsedPrice;
        }

        return null;
    }

    /**
     * Parse date from text
     */
    parseDate(dateText) {
        if (!dateText) return null;

        try {
            // Try different date formats commonly used on the site
            const formats = [
                /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
                /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // D/M/YYYY or DD/M/YYYY etc
                /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
            ];

            for (const format of formats) {
                const match = dateText.match(format);
                if (match) {
                    let day, month, year;
                    if (format === formats[2]) { // YYYY-MM-DD
                        [, year, month, day] = match;
                    } else { // DD/MM/YYYY variants
                        [, day, month, year] = match;
                    }
                    
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
            }

            // Fallback: try JavaScript's Date.parse
            const fallbackDate = new Date(dateText);
            if (!isNaN(fallbackDate.getTime())) {
                return fallbackDate;
            }
        } catch (error) {
            console.warn(`Error parsing date "${dateText}":`, error);
        }

        return null;
    }

    /**
     * Resolve relative URLs to absolute URLs
     */
    resolveUrl(href) {
        if (!href) return null;
        
        if (href.startsWith('http')) {
            return href;
        }
        
        const baseUrl = 'https://www.astrobuysell.com/uk/';
        if (href.startsWith('/')) {
            return `https://www.astrobuysell.com${href}`;
        }
        
        return `${baseUrl}${href}`;
    }

    /**
     * Fetch all pages with progress callback and progressive loading
     */
    async fetchAllPages(progressCallback = null, progressiveCallback = null, maxPages = 50, parallel = true, concurrentLimit = 3) {
        if (parallel) {
            return this.fetchAllPagesParallel(progressCallback, progressiveCallback, maxPages, concurrentLimit);
        } else {
            return this.fetchAllPagesSequential(progressCallback, progressiveCallback, maxPages);
        }
    }

    async fetchAllPagesSequential(progressCallback = null, progressiveCallback = null, maxPages = 50) {
        let allListings = [];
        let currentPage = 0;
        let consecutiveEmptyPages = 0;
        const maxEmptyPages = 3; // Stop after 3 consecutive empty pages

        while (currentPage < maxPages && consecutiveEmptyPages < maxEmptyPages) {
            try {
                if (progressCallback) {
                    progressCallback({
                        currentPage: currentPage + 1,
                        totalListings: allListings.length,
                        status: `Loading page ${currentPage + 1}...`
                    });
                }

                const html = await this.fetchPage(currentPage);
                const listings = this.parseListings(html, currentPage);

                if (listings.length === 0) {
                    consecutiveEmptyPages++;
                    console.log(`Page ${currentPage} is empty (${consecutiveEmptyPages}/${maxEmptyPages} consecutive empty pages)`);
                } else {
                    consecutiveEmptyPages = 0;
                    allListings = allListings.concat(listings);
                    console.log(`Added ${listings.length} listings from page ${currentPage}. Total: ${allListings.length}`);
                    
                    // Call progressive callback with new listings
                    if (progressiveCallback && listings.length > 0) {
                        progressiveCallback({
                            newListings: listings,
                            totalListings: allListings.length,
                            currentPage: currentPage + 1,
                            status: `Loaded page ${currentPage + 1} - ${listings.length} new listings`
                        });
                    }
                }

                currentPage++;

                // Add delay between requests to be respectful to the server
                if (currentPage < maxPages && consecutiveEmptyPages < maxEmptyPages) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

            } catch (error) {
                console.error(`Error fetching page ${currentPage}:`, error);
                
                if (progressCallback) {
                    progressCallback({
                        currentPage: currentPage + 1,
                        totalListings: allListings.length,
                        status: `Error loading page ${currentPage + 1}: ${error.message}`,
                        error: true
                    });
                }

                // If we have some listings, continue; otherwise, break
                if (allListings.length === 0) {
                    throw error;
                }
                
                consecutiveEmptyPages++;
                currentPage++;
            }
        }

        if (progressCallback) {
            progressCallback({
                currentPage: currentPage,
                totalListings: allListings.length,
                status: `Completed loading ${allListings.length} listings from ${currentPage} pages`,
                completed: true
            });
        }

        console.log(`Fetching completed. Total listings: ${allListings.length} from ${currentPage} pages`);
        return allListings;
    }

    async fetchAllPagesParallel(progressCallback = null, progressiveCallback = null, maxPages = 50, concurrentLimit = 3) {
        console.log(`🚀 Starting parallel scraping with ${concurrentLimit} concurrent requests`);
        
        let allListings = [];
        let processedPages = 0;
        let consecutiveEmptyPages = 0;
        const maxEmptyPages = 3;
        const completedPages = new Set();
        const emptyPages = new Set();
        
        // Rate limiting: stagger requests to avoid overwhelming the server
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        async function fetchPageWithRetry(pageNumber, scraper) {
            try {
                // Add small random delay to stagger requests
                await delay(Math.random() * 200);
                
                const html = await scraper.fetchPage(pageNumber);
                const listings = scraper.parseListings(html, pageNumber);
                
                return {
                    pageNumber,
                    listings,
                    success: true
                };
            } catch (error) {
                console.error(`Error fetching page ${pageNumber}:`, error);
                return {
                    pageNumber,
                    listings: [],
                    success: false,
                    error
                };
            }
        }
        
        // Process pages in batches
        let currentBatch = 0;
        const batchSize = concurrentLimit;
        
        while (processedPages < maxPages && consecutiveEmptyPages < maxEmptyPages) {
            const batchStart = currentBatch * batchSize;
            const batchEnd = Math.min(batchStart + batchSize, maxPages);
            const batchPages = [];
            
            // Create promises for current batch
            for (let pageNum = batchStart; pageNum < batchEnd; pageNum++) {
                if (processedPages >= maxPages) break;
                batchPages.push(fetchPageWithRetry(pageNum, this));
            }
            
            if (batchPages.length === 0) break;
            
            if (progressCallback) {
                progressCallback({
                    currentPage: batchStart + 1,
                    totalListings: allListings.length,
                    status: `Loading batch ${currentBatch + 1} - pages ${batchStart + 1} to ${batchEnd}...`
                });
            }
            
            // Wait for all pages in this batch to complete
            const batchResults = await Promise.all(batchPages);
            
            // Process results in page order to maintain consistency
            batchResults.sort((a, b) => a.pageNumber - b.pageNumber);
            
            let batchListings = [];
            for (const result of batchResults) {
                completedPages.add(result.pageNumber);
                processedPages++;
                
                if (result.success && result.listings.length > 0) {
                    consecutiveEmptyPages = 0;
                    batchListings = batchListings.concat(result.listings);
                    console.log(`✅ Page ${result.pageNumber}: ${result.listings.length} listings`);
                } else {
                    emptyPages.add(result.pageNumber);
                    consecutiveEmptyPages++;
                    console.log(`❌ Page ${result.pageNumber}: ${result.success ? 'empty' : 'error'}`);
                }
            }
            
            // Add batch listings to total
            if (batchListings.length > 0) {
                allListings = allListings.concat(batchListings);
                
                // Progressive callback with batch results
                if (progressiveCallback) {
                    progressiveCallback({
                        newListings: batchListings,
                        totalListings: allListings.length,
                        currentPage: batchEnd,
                        status: `Batch ${currentBatch + 1} complete - ${batchListings.length} new listings`
                    });
                }
            }
            
            currentBatch++;
            
            // Brief pause between batches to be respectful to the server
            if (currentBatch * batchSize < maxPages && consecutiveEmptyPages < maxEmptyPages) {
                await delay(300);
            }
        }
        
        if (progressCallback) {
            progressCallback({
                currentPage: processedPages,
                totalListings: allListings.length,
                status: `Parallel loading completed - ${allListings.length} listings from ${processedPages} pages`,
                completed: true
            });
        }
        
        console.log(`🎉 Parallel fetching completed. Total listings: ${allListings.length} from ${processedPages} pages`);
        console.log(`📊 Performance: ${completedPages.size} pages processed, ${emptyPages.size} empty pages`);
        return allListings;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('Cache cleared');
    }

    /**
     * Test CORS proxies to see which ones are working
     * Automatically sets the first working proxy as current and stops testing
     */
    async testProxies() {
        const testUrl = this.buildUrl(0); // Test with page 0
        const results = [];
        
        console.log('🧪 Testing CORS proxies (will stop at first working proxy)...');
        
        for (let i = 0; i < this.corsProxies.length; i++) {
            const proxy = this.corsProxies[i];
            const proxyUrl = this.buildProxyUrl(testUrl, i);
            
            // First test: Try a simple page to verify CORS Anywhere is working
            console.log(`\n🔍 Testing proxy ${i + 1}/${this.corsProxies.length}: ${proxy || 'Direct (no proxy)'}`);
            
            // Skip simple test for direct connection (empty proxy)
            if (proxy) {
                console.log(`📋 Testing simple URL first: https://httpbin.org/ip`);
                try {
                    const simpleTestUrl = `${proxy}https://httpbin.org/ip`;
                    const simpleResponse = await fetch(simpleTestUrl, {
                        method: 'GET',
                        headers: {
                            'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });
                    
                    if (simpleResponse.ok) {
                        const simpleContent = await simpleResponse.text();
                        console.log(`✅ Proxy connectivity test passed! Response: ${simpleContent.substring(0, 100)}`);
                    } else {
                        console.log(`❌ Proxy failed simple test: ${simpleResponse.status}`);
                        continue; // Skip to next proxy
                    }
                } catch (error) {
                    console.log(`❌ Proxy failed simple test: ${error.message}`);
                    continue; // Skip to next proxy
                }
            }
            
            // Now test the actual target with multiple strategies
            const strategies = [
                {
                    name: 'Minimal Headers',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                        'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                },
                {
                    name: 'Browser-like',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                        'Referer': 'https://www.google.com/',
                        'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                },
                {
                    name: 'Old User-Agent',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
                        'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://localhost',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            ];
            
            let foundWorkingStrategy = false;
            
            for (const strategy of strategies) {
                try {
                    console.log(`🧪 Trying strategy: ${strategy.name}`);
                    const startTime = Date.now();
                    
                    const response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: strategy.headers
                    });
                    
                    const responseTime = Date.now() - startTime;
                    
                    console.log(`📡 ${strategy.name} response: ${response.status} ${response.statusText}`);
                    
                    if (response.status === 403) {
                        const errorText = await response.text();
                        console.log(`❌ ${strategy.name}: 403 Forbidden - ${errorText.substring(0, 200)}`);
                        
                        // Check if it's Cloudflare
                        if (errorText.includes('cloudflare') || errorText.includes('cf_chl_opt') || errorText.includes('Just a moment')) {
                            console.log(`🛡️  Cloudflare protection detected with ${strategy.name}`);
                        }
                        continue;
                    }
                    
                    if (response.ok) {
                        let content;
                        
                        if (proxy.includes('allorigins.win/get')) {
                            const jsonResponse = await response.json();
                            content = jsonResponse.contents;
                        } else {
                            content = await response.text();
                        }
                        
                        const isValid = content && content.includes('<table') && content.length > 1000;
                        
                        const result = {
                            index: i,
                            proxy,
                            strategy: strategy.name,
                            status: 'success',
                            responseTime,
                            contentLength: content ? content.length : 0,
                            isValid
                        };
                        
                        results.push(result);
                        
                        console.log(`✅ ${strategy.name} SUCCESS! (${responseTime}ms, ${content.length} chars, valid: ${isValid})`);
                        
                        // If we found a working strategy with valid content, set it as current and stop
                        if (isValid) {
                            this.currentProxyIndex = i;
                            foundWorkingStrategy = true;
                            console.log(`🎉 FOUND WORKING PROXY! Set proxy ${i + 1} as current: ${proxy || 'Direct (no proxy)'}`);
                            console.log(`📊 Strategy: ${strategy.name}, Response time: ${responseTime}ms`);
                            console.log('🛑 Stopping proxy search - using this proxy from now on');
                            break;
                        }
                    } else {
                        console.log(`❌ ${strategy.name}: HTTP ${response.status}`);
                    }
                } catch (error) {
                    console.log(`❌ ${strategy.name}: Error - ${error.message}`);
                }
                
                // Add delay between strategies (but not if we found a working one)
                if (!foundWorkingStrategy) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            // If we found a working proxy, stop testing others
            if (foundWorkingStrategy) {
                break;
            }
            
            // If no strategy worked for this proxy, add failed result
            if (!results.find(r => r.index === i && r.status === 'success')) {
                results.push({
                    index: i,
                    proxy,
                    status: 'all_strategies_failed',
                    error: 'All strategies failed - likely Cloudflare protection'
                });
            }
        }
        
        console.log('\n🧪 Proxy test results:');
        console.table(results);
        
        if (this.currentProxyIndex >= 0) {
            console.log(`\n✅ SUCCESS: Using proxy ${this.currentProxyIndex + 1}: ${this.corsProxies[this.currentProxyIndex] || 'Direct (no proxy)'}`);
        } else {
            console.log('\n❌ FAILURE: No working proxies found');
        }
        
        return results;
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            entries: this.cache.size,
            proxies: this.corsProxies.length,
            currentProxy: this.currentProxyIndex
        };
    }
}

// Export for use in other modules
window.AstroBuyAndSellScraper = AstroBuyAndSellScraper;