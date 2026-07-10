# Ecommerce Scraper (Amazon & Flipkart)

This is a custom script designed to scrape product details directly from Amazon and Flipkart URLs. It uses **Puppeteer** (a headless browser automation tool) because Amazon and Flipkart actively block basic scraping scripts like `cheerio`.

## Prerequisites

Before running the script, you must install `puppeteer`:

```bash
npm install puppeteer
```

## Exact Prompt / How to Run

To scrape a product, paste the exact URL as an argument when running the script in your terminal. 

**Format:**
```bash
node scrape_ecommerce.js "<PASTE_LINK_HERE>"
```

### Example for Amazon:
```bash
node scrape_ecommerce.js "https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY"
```

### Example for Flipkart:
```bash
node scrape_ecommerce.js "https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4"
```

## What it Does

1. Launches an invisible Chromium browser.
2. Navigates to the pasted link.
3. Automatically detects if the link is Amazon or Flipkart.
4. Extracts the **Product Title**, **Brand**, **Price**, and **Main Image URL**.
5. Outputs a **SQL `INSERT` Statement** tailored to your Supabase `products` schema, calculating the `our_price` automatically (10% off the scraped online price).

## Limitations & Troubleshooting
- **CAPTCHAs:** Sometimes Amazon/Flipkart may still present a CAPTCHA if you run it too many times in a short period.
- **Class Names Changes:** Flipkart frequently changes its HTML class names (e.g., `._30jeq3`). If the price stops extracting, you may need to update the query selectors in the code.
