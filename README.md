# UK Astronomy Buy & Sell Enhanced Frontend

A modern, client-side web application that enhances the browsing experience for the UK Astronomy Buy & Sell website (astrobuysell.com) with advanced filtering, searching, and data presentation features.

## 🌟 Features

### Core Functionality
- **Web Scraping**: Extracts listing data from astrobuysell.com using CORS proxies
- **Enhanced Search**: Real-time search across titles, descriptions, and categories
- **Advanced Filtering**: Filter by category, price range, and keywords
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between visual themes
- **Data Export**: Export filtered results to CSV format
- **Caching**: Intelligent caching to reduce server load

### Technical Features
- **Pure Client-Side**: No backend required - runs entirely in the browser
- **CORS Proxy Support**: Multiple fallback proxies for reliable data access
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Error Handling**: Robust error handling and user feedback
- **Progress Tracking**: Real-time progress indicators during data loading

## 🗂️ Project Structure

```
astroBuyAndSellUk/
├── buyandselluk.html          # Main application interface
├── styles_buyandselluk.css    # Complete styling with theme support
├── scraper_buyandselluk.js    # Data fetching and HTML parsing
├── filter_buyandselluk.js     # Search and filtering logic
├── app_buyandselluk.js        # Main application coordinator
├── sample_content.html        # Sample data for testing
├── system-test.html           # Comprehensive testing interface
├── test-detailed.html         # Detailed parser testing
├── test-parser.html           # Basic parser testing
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local testing server)
- Internet connection (for scraping live data)

### Quick Start

1. **Clone or download** the project files to a local directory
2. **Start a local web server**:
   ```bash
   cd astroBuyAndSellUk
   python -m http.server 8080
   ```
3. **Open your browser** and navigate to:
   - Main Application: `http://localhost:8080/buyandselluk.html`
   - System Tests: `http://localhost:8080/system-test.html`

### Usage

1. **Launch the application** - The app will automatically test available CORS proxies
2. **Load data** - Click "Load Latest Listings" to fetch current data from astrobuysell.com
3. **Search and filter** - Use the sidebar controls to find specific items
4. **Export results** - Use the "Export to CSV" button to save filtered data
5. **Toggle theme** - Switch between light and dark modes using the theme toggle

## 🔧 Technical Details

### Architecture

The application follows a modular architecture with clear separation of concerns:

- **`scraper_buyandselluk.js`**: Handles data fetching from the source website and HTML parsing
- **`filter_buyandselluk.js`**: Manages search, filtering, and sorting functionality
- **`app_buyandselluk.js`**: Coordinates between modules and manages UI state
- **`styles_buyandselluk.css`**: Provides complete styling with CSS custom properties

### CORS Proxy Support

The application uses multiple CORS proxy services for reliable data access:
- api.allorigins.win (primary)
- corsproxy.io (fallback)
- cors-anywhere.herokuapp.com (fallback)
- thingproxy.freeboard.io (fallback)
- api.codetabs.com (fallback)

### Data Parsing

The scraper intelligently parses the source website's HTML structure:
- Identifies individual listing tables by background color
- Extracts title, price, category, description, and contact information
- Handles both featured listings (#FFF87A background) and regular listings (#EBEBEB background)
- Provides robust error handling for malformed data

### Caching Strategy

- **Session Storage**: Caches scraped data during browser session
- **Intelligent Refresh**: Only re-fetches data when explicitly requested
- **Proxy Rotation**: Automatically switches to working proxies

## 🧪 Testing

The project includes comprehensive testing tools:

### System Test (`system-test.html`)
- Complete integration testing
- Module instantiation tests
- Data parsing validation
- Filter functionality tests
- Live scraping tests with proxy validation

### Parser Tests (`test-detailed.html`, `test-parser.html`)
- HTML parsing accuracy
- Data structure validation
- Error handling verification

### Running Tests

1. Start the local server
2. Navigate to `http://localhost:8080/system-test.html`
3. Tests run automatically on page load
4. Use the "Test Live Scraping" button to test CORS proxy functionality

## 📱 Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design supports mobile devices

## 🔒 Privacy & Security

- **Client-Side Only**: No data is sent to external servers except the source website
- **No Tracking**: No analytics or tracking code
- **Local Storage**: All cached data stays in your browser
- **CORS Compliance**: Uses public CORS proxies for legitimate data access

## 🐛 Troubleshooting

### Common Issues

**"Failed to load listings"**
- Check internet connection
- Try refreshing the page (different proxy will be used)
- Verify the source website is accessible

**"No listings found"**
- The source website structure may have changed
- Check the system test page for parsing errors
- Verify sample content is loading correctly

**Styling issues**
- Clear browser cache
- Ensure CSS file is loading correctly
- Check browser console for errors

### Debug Mode

Use the system test page (`system-test.html`) to diagnose issues:
1. Module loading problems
2. Parsing failures
3. CORS proxy availability
4. Data structure validation

## 🔄 Updates & Maintenance

### Updating Parser Logic
If the source website structure changes:
1. Use the test pages to identify parsing issues
2. Update the `parseListingTable` method in `scraper_buyandselluk.js`
3. Test with sample content before deploying

### Adding New Features
1. Follow the modular architecture
2. Add new functionality to appropriate modules
3. Update the main app coordinator as needed
4. Test thoroughly with the provided test suite

## 📄 License

This project is provided as-is for educational and personal use. Please respect the terms of service of the source website and use responsibly.

## 🤝 Contributing

This is a standalone project designed for personal use. Feel free to fork and modify according to your needs.

---

**Note**: This application is not affiliated with astrobuysell.com. It's an independent frontend enhancement tool that accesses publicly available data through standard web scraping techniques.