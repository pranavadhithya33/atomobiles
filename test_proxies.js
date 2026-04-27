const url = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485515ae4';

async function testProxies() {
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
`https://api.corsproxy.io/?url=${encodeURIComponent(url)}`
  ];

for (const proxy of proxies) {
  console.log(`\n--- Testing Proxy: ${proxy} ---`);
  try {
    const res = await fetch(proxy);
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    console.log(`Preview: ${text.substring(0, 1000)}`);

    if (text.toLowerCase().includes('robot') || text.toLowerCase().includes('captcha')) {
      console.log('⚠️ BOT PROTECTION DETECTED');
    }
    if (text.includes('Nx9bqj') || text.includes('_30jeq3')) {
      console.log('✅ PRICE SELECTOR FOUND');
    } else {
      console.log('❌ PRICE SELECTOR NOT FOUND');
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}
}

testProxies();
