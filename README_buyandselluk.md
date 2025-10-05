# UK Astronomy Buy & Sell Enhanced Frontend

A modern, client-side web application that provides an enhanced browsing experience for the UK Astronomy Buy & Sell website (https://www.astrobuysell.com/uk/). This application scrapes listings from multiple pages and presents them in a searchable, filterable interface.

## Features

### 🔍 Enhanced Search & Filtering
- **Real-time search** across descriptions, locations, and ad numbers
- **Multi-criteria filtering**:
  - Ad Type (For Sale, Wanted, Notice, etc.)
  - Status (Active, Sold, Sale Pending)
  - Price range with min/max controls
  - Location filtering
  - Photo availability filter
  - Featured ads only filter
- **Advanced sorting**: By date, price, or ad number
- **Combined filters** with AND logic for precise results

### 📊 Improved Data Presentation
- **Card-based layout** for easy browsing
- **Visual indicators** for photos, featured ads, and status
- **Responsive design** that works on desktop and mobile
- **Dark/light theme toggle** for comfortable viewing
- **Progressive loading** with real-time progress indicators

### 💾 Smart Caching & Performance
- **Local caching** of fetched data (30-minute expiry)
- **CORS proxy support** for reliable data fetching
- **Debounced search** for smooth performance
- **Automatic retry logic** for failed requests

### 🚀 User Experience Features
- **One-click access** to original listings
- **Export functionality** to CSV format
- **Keyboard shortcuts** for power users
- **Loading progress indicators**
- **Error handling** with helpful messages

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Installation
1. Download or clone the project files
2. Open `buyandselluk.html` in your web browser
3. The application will automatically start loading listings

### CORS Considerations
Due to browser security restrictions, the application uses CORS proxies to fetch data from the original website. If you encounter loading issues:

1. **Try a different proxy**: The app automatically tries multiple proxy services
2. **Use a CORS browser extension**: Install a CORS extension for your browser
3. **Disable browser security** (not recommended): Run browser with `--disable-web-security` flag

## Project Structure

```
project/
├── buyandselluk.html          # Main HTML structure
├── styles_buyandselluk.css    # All styling (light/dark themes)
├── app_buyandselluk.js        # Main application logic
├── scraper_buyandselluk.js    # Data fetching and parsing
├── filter_buyandselluk.js     # Search and filter functionality
└── README_buyandselluk.md     # This file
```

## Usage

### Basic Usage
1. **Load the page**: The app automatically fetches all available listings
2. **Browse listings**: Scroll through the card-based interface
3. **Click any listing**: Opens the original ad in a new tab

### Filtering & Search
- **Search**: Type in the search box to filter by description or location
- **Filters**: Use the sidebar controls to narrow down results
- **Sorting**: Choose how to order the results (newest first, price, etc.)
- **Clear**: Use "Clear All Filters" to reset everything

### Advanced Features
- **Theme switching**: Click the moon/sun icon to toggle themes
- **Export data**: Use Ctrl+E to download filtered results as CSV
- **Refresh data**: Click "Refresh Data" or use Ctrl+R for latest listings
- **Keyboard shortcuts**:
  - `Ctrl+R`: Refresh data
  - `Ctrl+F`: Focus search box
  - `Ctrl+E`: Export results
  - `Escape`: Clear all filters

## Technical Details

### Data Extraction
The application parses the original site's HTML structure:
- **Target table**: Identifies listings table by specific attributes
- **Row parsing**: Extracts 8 key data points from each listing
- **Featured detection**: Identifies highlighted listings
- **Price parsing**: Handles various price formats and "POA" cases
- **Date parsing**: Supports multiple date formats

### Performance Optimizations
- **Debounced search**: 300ms delay prevents excessive filtering
- **Local caching**: Reduces server load and improves responsiveness
- **Progressive loading**: Shows results as they become available
- **Efficient rendering**: Virtual DOM-like updates for large datasets

### Browser Compatibility
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile support**: Responsive design works on phones and tablets
- **Accessibility**: ARIA labels and keyboard navigation support

## Troubleshooting

### Common Issues

**"Failed to load listings" error:**
- Check internet connection
- Try refreshing the page
- The original site may be down
- CORS proxy services may be temporarily unavailable

**Slow loading:**
- The app fetches multiple pages sequentially
- Original site response time affects loading speed
- Try refreshing to use cached data

**Missing listings:**
- Some listings may have unusual formatting that affects parsing
- The original site structure may have changed
- Check browser console for parsing errors

### Browser Console
Open browser developer tools (F12) to see:
- Loading progress details
- Parsing statistics
- Error messages and warnings
- Cache information

## Development Notes

### Code Organization
- **Modular design**: Separate files for different responsibilities
- **Class-based**: Modern JavaScript classes for maintainability
- **Event-driven**: Clean separation between UI and data logic

### Security Considerations
- **XSS protection**: All user data is properly escaped
- **CORS compliance**: Uses public proxy services
- **No data storage**: No user data is stored permanently
- **Read-only**: Application only reads from the original site

### Future Enhancements
- **Price alerts**: Notifications for price changes
- **Saved searches**: Bookmark specific filter combinations
- **Comparison tool**: Side-by-side listing comparison
- **Email sharing**: Share listings via email
- **Advanced statistics**: Market analysis features

## Legal & Ethical Notes

- **Educational use**: This tool is for personal/educational purposes
- **Terms of service**: Respect the original site's terms
- **Rate limiting**: Built-in delays prevent server overload
- **No data storage**: No permanent storage of scraped data
- **Attribution**: Links back to original listings

## Support

If you encounter issues:
1. Check this README for troubleshooting tips
2. Verify the original website is accessible
3. Try different browsers or clear browser cache
4. Check browser console for error details

## License

This project is for educational and personal use only. Please respect the original website's terms of service and copyright.

---

**Disclaimer**: This application is not affiliated with astrobuysell.com. It provides an alternative interface to publicly available data for educational purposes.