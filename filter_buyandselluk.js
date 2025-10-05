// UK Astronomy Buy & Sell Enhanced - Filter Module
// Handles search, filtering, and sorting of listings

class ListingFilter {
    constructor() {
        this.listings = [];
        this.filteredListings = [];
        this.filters = {
            search: '',
            adType: '',
            status: '',
            minPrice: null,
            maxPrice: null,
            location: '',
            hasPhoto: false,
            featuredOnly: false
        };
        this.sortBy = 'date-desc';
        this.searchDebounceTimer = null;
        this.onFilterChange = null;
    }

    /**
     * Set the listings data
     */
    setListings(listings) {
        this.listings = listings;
        this.applyFilters();
    }

    /**
     * Set filter values
     */
    setFilter(filterName, value) {
        if (this.filters.hasOwnProperty(filterName)) {
            this.filters[filterName] = value;
            this.applyFilters();
        }
    }

    /**
     * Set multiple filters at once
     */
    setFilters(filters) {
        Object.assign(this.filters, filters);
        this.applyFilters();
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = {
            search: '',
            adType: '',
            status: '',
            minPrice: null,
            maxPrice: null,
            location: '',
            hasPhoto: false,
            featuredOnly: false
        };
        this.applyFilters();
    }

    /**
     * Set sort criteria
     */
    setSortBy(sortBy) {
        this.sortBy = sortBy;
        this.applyFilters();
    }

    /**
     * Apply all filters and sorting
     */
    applyFilters() {
        let filtered = [...this.listings];

        // Apply search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(listing => 
                listing.description.toLowerCase().includes(searchTerm) ||
                listing.location.toLowerCase().includes(searchTerm) ||
                listing.adNumber.toLowerCase().includes(searchTerm)
            );
        }

        // Apply ad type filter
        if (this.filters.adType) {
            filtered = filtered.filter(listing => 
                listing.adType === this.filters.adType
            );
        }

        // Apply status filter
        if (this.filters.status) {
            filtered = filtered.filter(listing => 
                listing.status === this.filters.status
            );
        }

        // Apply price range filters
        if (this.filters.minPrice !== null && this.filters.minPrice !== '') {
            const minPrice = parseFloat(this.filters.minPrice);
            if (!isNaN(minPrice)) {
                filtered = filtered.filter(listing => 
                    listing.price !== null && listing.price >= minPrice
                );
            }
        }

        if (this.filters.maxPrice !== null && this.filters.maxPrice !== '') {
            const maxPrice = parseFloat(this.filters.maxPrice);
            if (!isNaN(maxPrice)) {
                filtered = filtered.filter(listing => 
                    listing.price !== null && listing.price <= maxPrice
                );
            }
        }

        // Apply location filter
        if (this.filters.location) {
            const locationTerm = this.filters.location.toLowerCase();
            filtered = filtered.filter(listing => 
                listing.location.toLowerCase().includes(locationTerm)
            );
        }

        // Apply photo filter
        if (this.filters.hasPhoto) {
            filtered = filtered.filter(listing => listing.hasPhoto);
        }

        // Apply featured filter
        if (this.filters.featuredOnly) {
            filtered = filtered.filter(listing => listing.isFeatured);
        }

        // Apply sorting
        filtered = this.sortListings(filtered);

        this.filteredListings = filtered;

        // Notify listeners of filter change
        if (this.onFilterChange) {
            this.onFilterChange(this.filteredListings);
        }
    }

    /**
     * Sort listings based on sort criteria
     */
    sortListings(listings) {
        const sorted = [...listings];

        switch (this.sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => {
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return b.date.getTime() - a.date.getTime();
                });

            case 'date-asc':
                return sorted.sort((a, b) => {
                    if (!a.date && !b.date) return 0;
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return a.date.getTime() - b.date.getTime();
                });

            case 'price-desc':
                return sorted.sort((a, b) => {
                    if (a.price === null && b.price === null) return 0;
                    if (a.price === null) return 1;
                    if (b.price === null) return -1;
                    return b.price - a.price;
                });

            case 'price-asc':
                return sorted.sort((a, b) => {
                    if (a.price === null && b.price === null) return 0;
                    if (a.price === null) return 1;
                    if (b.price === null) return -1;
                    return a.price - b.price;
                });

            case 'ad-number':
                return sorted.sort((a, b) => {
                    const aNum = parseInt(a.adNumber) || 0;
                    const bNum = parseInt(b.adNumber) || 0;
                    return bNum - aNum; // Descending by default
                });

            default:
                return sorted;
        }
    }

    /**
     * Set up debounced search
     */
    setupDebouncedSearch(searchInput, delay = 300) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => {
                this.setFilter('search', e.target.value);
            }, delay);
        });
    }

    /**
     * Get filter statistics
     */
    getFilterStats() {
        const stats = {
            total: this.listings.length,
            filtered: this.filteredListings.length,
            adTypes: {},
            statuses: {},
            priceRange: { min: null, max: null },
            withPhotos: 0,
            featured: 0,
            locations: new Set()
        };

        // Calculate statistics from all listings
        this.listings.forEach(listing => {
            // Ad types
            stats.adTypes[listing.adType] = (stats.adTypes[listing.adType] || 0) + 1;

            // Statuses
            stats.statuses[listing.status] = (stats.statuses[listing.status] || 0) + 1;

            // Price range
            if (listing.price !== null) {
                if (stats.priceRange.min === null || listing.price < stats.priceRange.min) {
                    stats.priceRange.min = listing.price;
                }
                if (stats.priceRange.max === null || listing.price > stats.priceRange.max) {
                    stats.priceRange.max = listing.price;
                }
            }

            // Photos and featured
            if (listing.hasPhoto) stats.withPhotos++;
            if (listing.isFeatured) stats.featured++;

            // Locations
            if (listing.location) {
                stats.locations.add(listing.location);
            }
        });

        stats.locations = Array.from(stats.locations).sort();
        
        return stats;
    }

    /**
     * Get unique values for dropdown filters
     */
    getUniqueValues() {
        const adTypes = [...new Set(this.listings.map(l => l.adType))].filter(Boolean).sort();
        const statuses = [...new Set(this.listings.map(l => l.status))].filter(Boolean).sort();
        const locations = [...new Set(this.listings.map(l => l.location))].filter(Boolean).sort();

        return {
            adTypes,
            statuses,
            locations
        };
    }

    /**
     * Export filtered listings as CSV
     */
    exportToCSV() {
        if (this.filteredListings.length === 0) {
            return null;
        }

        const headers = [
            'Ad Number',
            'Ad Type',
            'Status',
            'Description',
            'Price',
            'Date',
            'Location',
            'Has Photo',
            'Featured',
            'URL'
        ];

        const csvContent = [
            headers.join(','),
            ...this.filteredListings.map(listing => [
                `"${listing.adNumber}"`,
                `"${listing.adType}"`,
                `"${listing.status}"`,
                `"${listing.description.replace(/"/g, '""')}"`,
                `"${listing.priceText}"`,
                `"${listing.dateText}"`,
                `"${listing.location}"`,
                listing.hasPhoto ? 'Yes' : 'No',
                listing.isFeatured ? 'Yes' : 'No',
                `"${listing.listingUrl || ''}"`
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Download CSV file
     */
    downloadCSV(filename = 'astronomy-listings.csv') {
        const csvContent = this.exportToCSV();
        if (!csvContent) {
            alert('No listings to export');
            return;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Get current filter state
     */
    getFilterState() {
        return {
            filters: { ...this.filters },
            sortBy: this.sortBy,
            totalListings: this.listings.length,
            filteredCount: this.filteredListings.length
        };
    }

    /**
     * Restore filter state
     */
    restoreFilterState(state) {
        if (state.filters) {
            this.setFilters(state.filters);
        }
        if (state.sortBy) {
            this.setSortBy(state.sortBy);
        }
    }
}

// Export for use in other modules
window.ListingFilter = ListingFilter;