const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4';
const mobileUrl = url.replace('www.flipkart.com', 'm.flipkart.com');

async function testMobileDomain() {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(mobileUrl)}`;
  
  console.log(`\n--- Testing Mobile Domain Proxy: ${proxy} ---`);
  try {
    const res = await fetch(proxy);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    
    if (text.includes('Nx9bqj') || text.includes('_30jeq3') || text.includes('B_NuCI') || text.includes('product-title')) {
      console.log('✅ PRODUCT SELECTOR FOUND');
    } else {
      console.log('❌ PRODUCT SELECTOR NOT FOUND');
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

testMobileDomain();
