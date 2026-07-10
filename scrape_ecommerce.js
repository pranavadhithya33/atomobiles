const puppeteer = require('puppeteer');

async function scrapeAmazon(page) {
    const title = await page.$eval('#productTitle', el => el.innerText.trim()).catch(() => 'Title not found');
    const priceStr = await page.$eval('.a-price-whole', el => el.innerText.trim()).catch(() => '0');
    const price = parseInt(priceStr.replace(/,/g, ''), 10) || 0;
    const img = await page.$eval('#landingImage', el => el.src).catch(() => '');
    return { title, price, img, brand: title.split(' ')[0] };
}

async function scrapeFlipkart(page) {
    const title = await page.$eval('.B_NuCI, .VU-Tyg', el => el.innerText.trim()).catch(() => 'Title not found');
    const priceStr = await page.$eval('._30jeq3, .Nx9bqj', el => el.innerText.trim()).catch(() => '0');
    const price = parseInt(priceStr.replace(/₹|,/g, ''), 10) || 0;
    const img = await page.$eval('._396cs4, ._3exPp9, .v2Vak8', el => el.src).catch(() => '');
    return { title, price, img, brand: title.split(' ')[0] };
}

async function main() {
    const url = process.argv[2];
    
    if (!url) {
        console.error('❌ Error: Please provide a URL as an argument.');
        console.error('💡 Example Usage: node scrape_ecommerce.js "https://www.amazon.in/dp/B0..."');
        process.exit(1);
    }

    console.log(`🚀 Launching browser to scrape: ${url}`);
    
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        let data = {};

        if (url.includes('amazon.in') || url.includes('amazon.com')) {
            console.log('🛒 Detected Amazon URL. Scraping data...');
            data = await scrapeAmazon(page);
        } else if (url.includes('flipkart.com')) {
            console.log('🛒 Detected Flipkart URL. Scraping data...');
            data = await scrapeFlipkart(page);
        } else {
            console.error('❌ Unsupported URL. Only Amazon and Flipkart are supported.');
            process.exit(1);
        }

        console.log('\n✅ --- Scraping Results ---');
        console.log(`Title: ${data.title}`);
        console.log(`Brand: ${data.brand}`);
        console.log(`Price: ₹${data.price}`);
        console.log(`Image URL: ${data.img}`);
        console.log('------------------------\n');

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
        const ourPrice = Math.round(data.price * 0.9);
        const safeTitle = data.title.replace(/'/g, "''");
        
        console.log('💾 SQL Insert Statement for Supabase:');
        console.log(`INSERT INTO products (name, slug, images, amazon_price, online_price, our_price, stock, category, featured)`);
        console.log(`VALUES ('${safeTitle}', '${slug}', ARRAY['${data.img}'], ${data.price}, ${data.price}, ${ourPrice}, 20, 'smartphones', FALSE);\n`);

    } catch (error) {
        console.error('❌ Error during scraping:', error.message);
    } finally {
        await browser.close();
    }
}

main();
