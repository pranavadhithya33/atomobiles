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
    search: /--deal-bg:\s*#241710;/g,
    replace: "--deal-bg: #241710;\n  --hero-text: #ffffff;\n  --deal-text: #ffffff;\n  --deal-muted: rgba(255, 255, 255, 0.7);"
  },
  {
    search: /--deal-bg:\s*#18181b;/g,
    replace: "--deal-bg: #18181b;\n  --hero-text: #ffffff;\n  --deal-text: #ffffff;\n  --deal-muted: rgba(255, 255, 255, 0.7);"
  },
  {
    search: /--hero-bg-start:\s*#000000;\s*--hero-bg-end:\s*#000000;\s*--deal-bg:\s*#000000;/g,
    replace: "--hero-bg-start: #f4f4f5;\n  --hero-bg-end: #ffffff;\n  --deal-bg: #ffffff;\n  --hero-text: #000000;\n  --deal-text: #000000;\n  --deal-muted: #71717a;"
  },
  {
    search: /\.hero-title\s*\{[^}]*color:\s*#fff;/g,
    replace: ".hero-title { font-size: 64px; font-weight: 900; color: var(--hero-text);"
  },
  {
    search: /\.hero-subtitle\s*\{[^}]*color:\s*var\(--text-white\);/g,
    replace: ".hero-subtitle { font-size: 24px; color: var(--hero-text);"
  },
  {
    search: /\.deal-timer-box\s*\{[^}]*color:\s*#fff;/g,
    replace: ".deal-timer-box { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: var(--deal-text);"
  },
  {
    search: /\.deal-title\s*\{[^}]*color:\s*var\(--text-primary\);/g,
    replace: ".deal-title { color: var(--deal-text); font-size: 28px; font-weight: 800; margin-bottom: 8px; line-height: 1.2; }"
  },
  {
    search: /\.deal-price-our\s*\{[^}]*color:\s*var\(--text-primary\);/g,
    replace: ".deal-price-our { color: var(--deal-text); font-size: 40px; font-weight: 900; }"
  }
]);

// 2. app/page.js
replaceInFile(path.join(__dirname, 'app/page.js'), [
  {
    search: /color:\s*['"]var\(--text-white\)['"]/g,
    replace: "color: 'var(--hero-text)'"
  },
  {
    // Fix features text: the banner is hardcoded to var(--text-primary)
    // Wait, in my regex from phase 8 I did:
    // search: /color:\s*['"]var\(--text-primary\)['"]/g,
    // That's too broad! It will replace ALL text-primary. Let me be specific.
    search: /<div style=\{\{\s*color:\s*'var\(--text-primary\)',\s*fontWeight:\s*700,\s*fontSize:\s*'15px'\s*\}\}>([^<]+)<\/div>/g,
    replace: "<div style={{ color: 'var(--deal-text)', fontWeight: 700, fontSize: '15px' }}>$1</div>"
  },
  {
    search: /<div style=\{\{\s*color:\s*'var\(--text-muted\)',\s*fontSize:\s*'13px'\s*\}\}>([^<]+)<\/div>/g,
    replace: "<div style={{ color: 'var(--deal-muted)', fontSize: '13px' }}>$1</div>"
  }
]);

// 3. components/DealOfTheDay.js
replaceInFile(path.join(__dirname, 'components/DealOfTheDay.js'), [
  {
    search: /color:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.7\)['"]/g,
    replace: "color: 'var(--deal-muted)'"
  },
  {
    search: /color:\s*['"]var\(--text-white\)['"]/g,
    replace: "color: 'var(--deal-text)'"
  },
  {
    search: /color:\s*['"]rgba\(255,\s*255,\s*255,\s*0\.5\)['"]/g,
    replace: "color: 'var(--deal-muted)'"
  }
]);

// 4. components/Header.js
replaceInFile(path.join(__dirname, 'components/Header.js'), [
  {
    search: /<span className="header-action-text" style=\{\{\s*color:\s*'#160d0a',\s*fontSize:\s*'15px',\s*fontWeight:\s*700\s*\}\}>Checkout<\/span>/g,
    replace: "<span className=\"header-action-text\" style={{ color: 'var(--brand-primary)', fontSize: '15px', fontWeight: 700 }}>Checkout</span>"
  },
  {
    search: /background:\s*'#160d0a',\s*color:\s*'var\(--brand-accent\)'/g,
    replace: "background: 'var(--brand-primary)', color: 'var(--brand-accent)'"
  }
]);

console.log("Phase 8 patches executed successfully.");
