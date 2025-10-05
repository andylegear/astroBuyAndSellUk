# Copilot Instructions: UK Astronomy Buy & Sell Enhanced Frontend

## Project Overview
Create a modern, client-side web application that provides an improved browsing experience for the UK Astronomy Buy & Sell website (https://www.astrobuysell.com/uk/). The application will scrape listings from multiple pages and present them in a searchable, filterable interface.

## Technical Requirements

### Technology Stack
- Pure client-side implementation using HTML, CSS, and JavaScript
- No backend server or database required
- Consider using DOMParser API for HTML parsing (built into browsers)
- Optional: Use a lightweight library like Cheerio.js (browser version) if needed for parsing

### Core Functionality

#### 1. Data Fetching
- Fetch all pages of listings from: `https://www.astrobuysell.com/uk/propview.php?minprice=0&maxprice=1000000000000000&cur_page={PAGE_NUMBER}&sort=id+DESC`
- Start with page 0 and continue until no more results
- Implement CORS-aware fetching (note: may need to use a CORS proxy like `https://corsproxy.io/?` or `https://api.allorigins.win/raw?url=`)
- Show loading progress indicator while fetching multiple pages

#### 2. Data Parsing
Target table structure begins with:
```html
<table border=1 cellspacing=1 cellpadding=2 style="border-collapse: collapse" bgcolor="#C0C0C0">
```

Extract from each listing row:
- **Ad Number** (column 1)
- **Ad Type** (column 2: "For Sale", "Wanted", "Notice", etc.)
- **Status** (column 3: "Active", "Sold", "Sale Pending")
- **Photo indicator** (column 4: check for camera.gif image)
- **Short Description** (column 5)
- **Price** (column 6: in GBP £)
- **Date** (column 7)
- **Location** (column 8)
- **Link to full listing** (extract href from ad number or type)

Note: Featured ads have bgcolor="#FFF87A", regular ads have bgcolor="#EBEBEB"

#### 3. UI Design

**Layout:**
- Clean, modern design with card-based or table-based listing display
- Responsive design that works on desktop and mobile
- Use CSS Grid or Flexbox for layout
- Consider a dark/light theme toggle

**Search & Filter Panel:**
- Real-time text search across description and location
- Filter by:
  - Ad Type (For Sale, Wanted, etc.)
  - Status (Active, Sold, Sale Pending)
  - Price range (min/max sliders or inputs)
  - Date range
  - Location (text or dropdown)
  - Has Photo (checkbox)
  - Featured ads only (checkbox)
- Multiple filters should work together (AND logic)
- Show count of filtered results

**Sorting:**
- Sort by: Date (newest/oldest), Price (high/low), Ad Number
- Default to newest first

**Listing Display:**
- Show all extracted fields clearly
- Highlight featured ads visually
- Display photo indicator icon if present
- Make entire listing clickable to open original ad in new tab
- Show "Sold" or "Sale Pending" badges prominently

**Additional Features:**
- Pagination or infinite scroll for results
- "Load More" button if not all pages fetched initially
- Export/share functionality (optional)
- Refresh button to re-fetch latest data

### Error Handling
- Handle CORS errors gracefully (suggest CORS proxy usage)
- Handle network failures with retry logic
- Show clear error messages to users
- Validate parsed data and skip malformed entries

### Performance Considerations
- Cache fetched data in localStorage (with timestamp)
- Allow manual refresh to bypass cache
- Debounce search input (300ms delay)
- Virtualize long lists if performance issues arise
- Consider fetching pages progressively (show results as they load)

### Code Organization
```
project/
├── buyandselluk.html          # Main HTML structure
├── styles_buyandselluk.css          # All styling
├── app_buyandselluk.js              # Main application logic
├── scraper_buyandselluk.js          # Fetching and parsing logic
├── filter_buyandselluk.js           # Search and filter logic
└── README_buyandselluk.md           # Setup and usage instructions
```

## Implementation Guidelines

1. **Start with a single page fetch** to verify parsing logic before implementing multi-page fetching
2. **Test CORS handling early** - the original site may block direct requests
3. **Use semantic HTML** and ARIA labels for accessibility
4. **Implement progressive enhancement** - show basic functionality even if JavaScript partially fails
5. **Add console logging** for debugging during development
6. **Comment complex parsing logic** to explain HTML structure being targeted

## Security Notes
- This is for personal/educational use only
- Respect the original site's terms of service
- Don't overwhelm the server with rapid requests (add delays between page fetches)
- Never store or transmit user credentials

## Nice-to-Have Features
- Save favorite listings to localStorage
- Price alerts (if price drops on saved search)
- Share filtered view via URL parameters
- Print-friendly view
- Comparison tool for multiple items
- Download listings as CSV
- Send email notifications for new listings matching criteria
- Share listings on social media or via email

## Testing Checklist
- [ ] Parse sample HTML correctly
- [ ] Handle empty results gracefully
- [ ] All filters work independently and combined
- [ ] Sorting works correctly
- [ ] Links to original ads work
- [ ] Responsive on mobile devices
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Handles network errors appropriately