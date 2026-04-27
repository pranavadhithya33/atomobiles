const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4';

async function testMobileUA() {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ];

  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    'Accept-Language': 'en-IN,en-US,en;q=0.9',
  };

  for (const proxy of proxies) {
    console.log(`\n--- Testing Proxy: ${proxy} ---`);
    try {
      const res = await fetch(proxy, { headers });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Length: ${text.length}`);
      
      if (text.toLowerCase().includes('robot') || text.toLowerCase().includes('captcha')) {
        console.log('⚠️ BOT PROTECTION DETECTED');
      }
      if (text.includes('Nx9bqj') || text.includes('_30jeq3') || text.includes('B_NuCI')) {
        console.log('✅ PRODUCT SELECTOR FOUND');
      } else {
        console.log('❌ PRODUCT SELECTOR NOT FOUND');
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  }
}

testMobileUA();
