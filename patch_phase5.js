const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    replacements.forEach(r => {
      content = content.replace(r.search, r.replace);
    });
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Patched: ${filePath}`);
    }
  }
}

// 1. app/page.js
replaceInFile(path.join(__dirname, 'app/page.js'), [
  {
    // Fix Hero background gradient so the left side is dark brown (#160d0a) instead of var(--bg-page)
    search: /radial-gradient\(circle at 70% 50%, #4a2c1d 0%, var\(--bg-page\) 70%\)/g,
    replace: 'radial-gradient(circle at 70% 50%, #4a2c1d 0%, #160d0a 70%)'
  },
  {
    // Also revert any var(--text-primary) back to var(--text-white) in the hero features grid
    // Actually, my patch_phase4 script already did this: it replaced color: 'var(--text-white)'
    // Just to be sure:
    search: /color:\s*['"]var\(--text-primary\)['"]/g,
    replace: "color: 'var(--text-white)'"
  }
]);

// 2. components/DealOfTheDay.js
replaceInFile(path.join(__dirname, 'components/DealOfTheDay.js'), [
  {
    // The Deal of the Day card has background: #241710; (Dark Brown)
    // So the text must explicitly be white or off-white, NOT var(--text-primary).
    search: /color:\s*['"]var\(--text-primary\)['"]/g,
    replace: "color: 'var(--text-white)'"
  },
  {
    search: /color:\s*['"]var\(--text-muted\)['"]/g,
    replace: "color: '#a69385'"
  }
]);

// 3. app/globals.css
replaceInFile(path.join(__dirname, 'app/globals.css'), [
  {
    // Fix .hero-title, ensure it's explicitly white
    search: /\.hero-title\s*\{[^}]*color:\s*var\(--text-primary\);/g,
    replace: ".hero-title { font-size: 64px; font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 16px; letter-spacing: 1px; }"
  },
  {
    // Ensure .hero-subtitle is also white
    search: /\.hero-subtitle\s*\{[^}]*color:\s*var\(--brand-accent\);/g,
    replace: ".hero-subtitle { font-size: 24px; color: var(--text-white); font-weight: 500; margin-bottom: 40px; letter-spacing: 1px; }"
  }
]);

console.log("Phase 5 patches applied.");
