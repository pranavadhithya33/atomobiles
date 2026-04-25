const cheerio = require('cheerio');
async function test() {
  const res = await fetch('https://www.gsmarena.com/samsung-phones-9.php', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const text = await res.text();
  const $ = cheerio.load(text);
  const phones = [];
  $('.makers ul li').each((i, el) => {
    phones.push({
      name: $(el).find('span').text(),
      img: $(el).find('img').attr('src'),
      link: $(el).find('a').attr('href')
    });
  });
  console.log(phones.slice(0, 5));
}
test();
