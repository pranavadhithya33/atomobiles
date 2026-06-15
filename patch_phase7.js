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
    } else {
      console.log(`No changes made to ${filePath} (pattern not found or already changed)`);
    }
  }
}

// 1. Globals
replaceInFile(path.join(__dirname, 'app/globals.css'), [
  {
    // Fix B&W hero background to solid black to blend with the dark product image
    search: /--hero-bg-start:\s*#f4f4f5;\s*--hero-bg-end:\s*#ffffff;/g,
    replace: "--hero-bg-start: #000000;\n  --hero-bg-end: #000000;"
  },
  {
    // Fix Deal Timer Box background from dark brown to transparent white
    search: /\.deal-timer-box\s*\{\s*background:\s*#1a100c;/g,
    replace: ".deal-timer-box { background: rgba(255, 255, 255, 0.08);"
  }
]);

// 2. app/page.js
replaceInFile(path.join(__dirname, 'app/page.js'), [
  {
    // Revert checkmarks to var(--text-white) because hero background is now always dark
    search: /color:\s*['"]var\(--text-primary\)['"]/g,
    replace: "color: 'var(--text-white)'"
  },
  {
    // Fix Features banner background from dark brown to var(--deal-bg)
    search: /background:\s*['"]#3e2820['"]/g,
    replace: "background: 'var(--deal-bg)'"
  }
]);

// 3. components/DealOfTheDay.js
replaceInFile(path.join(__dirname, 'components/DealOfTheDay.js'), [
  {
    // Fix Days/Hours labels from tan to transparent white
    search: /color:\s*['"]#a69385['"]/g,
    replace: "color: 'rgba(255, 255, 255, 0.7)'"
  },
  {
    // Ensure the original price also doesn't use tan
    search: /<span style=\{\{\s*color:\s*'rgba\(255, 255, 255, 0\.7\)',\s*textDecoration:\s*'line-through',/g,
    replace: "<span style={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'line-through',"
  }
]);

console.log("Phase 7 patches executed successfully.");
