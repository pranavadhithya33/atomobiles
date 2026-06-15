const fs = require('fs');
const files = ['app/admin/(protected)/dashboard/page.js', 'app/admin/(protected)/dashboard/page-gohan.js', 'app/admin/(protected)/page.js'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  content = content.replace(/: '#fff'/g, ": 'var(--bg-card)'");
  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log(`Fixed ternary backgrounds in ${f}`);
  }
});
