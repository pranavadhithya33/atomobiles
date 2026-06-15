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
    search: /--brand-accent-light:\s*#f4d3b6;/g,
    replace: "--brand-accent-light: #f4d3b6;\n  --hero-bg-start: #4a2c1d;\n  --hero-bg-end: #160d0a;\n  --deal-bg: #241710;"
  },
  {
    search: /--brand-accent-light:\s*#bfffb3;/g,
    replace: "--brand-accent-light: #bfffb3;\n  --hero-bg-start: #1a2e1a;\n  --hero-bg-end: #000000;\n  --deal-bg: #18181b;"
  },
  {
    search: /--brand-accent-light:\s*#e4e4e7;/g,
    replace: "--brand-accent-light: #e4e4e7;\n  --hero-bg-start: #f4f4f5;\n  --hero-bg-end: #ffffff;\n  --deal-bg: #000000;"
  },
  {
    search: /\.deal-card-wrap\s*\{\s*background:\s*#241710;/g,
    replace: ".deal-card-wrap { background: var(--deal-bg);"
  }
]);

let globalsContent = fs.readFileSync(path.join(__dirname, 'app/globals.css'), 'utf8');
if (!globalsContent.includes('.hero-image { filter: grayscale(100%); }')) {
  fs.appendFileSync(path.join(__dirname, 'app/globals.css'), "\n[data-theme='minimalist-bw'] .hero-image {\n  filter: grayscale(100%);\n}\n");
}

// 2. Header.js
replaceInFile(path.join(__dirname, 'components/Header.js'), [
  {
    search: /<Search size=\{18\} color="#160d0a" \/>/g,
    replace: "<Search size={18} color=\"var(--brand-primary)\" />"
  },
  {
    search: /<ShoppingCart size=\{16\} color="#160d0a" strokeWidth=\{2\.5\} \/>/g,
    replace: "<ShoppingCart size={16} color=\"var(--brand-primary)\" strokeWidth={2.5} />"
  },
  {
    search: /<span style=\{\{\s*color:\s*'#160d0a',\s*fontWeight:\s*800,\s*fontSize:\s*'14px'\s*\}\}>Checkout<\/span>/g,
    replace: "<span style={{ color: 'var(--brand-primary)', fontWeight: 800, fontSize: '14px' }}>Checkout</span>"
  },
  {
    search: /<span style=\{\{\s*background:\s*'#160d0a',\s*color:\s*'var\(--brand-accent\)',/g,
    replace: "<span style={{ background: 'var(--brand-primary)', color: 'var(--brand-accent)',"
  }
]);

// 3. app/page.js
replaceInFile(path.join(__dirname, 'app/page.js'), [
  {
    search: /background:\s*['"]radial-gradient\(circle at 70% 50%, #4a2c1d 0%, #160d0a 70%\)['"]/g,
    replace: "background: 'radial-gradient(circle at 70% 50%, var(--hero-bg-start) 0%, var(--hero-bg-end) 70%)'"
  },
  {
    search: /color:\s*['"]var\(--text-white\)['"]/g,
    replace: "color: 'var(--text-primary)'"
  },
  {
    search: /<Image src="\/hero_devices\.png" alt="High-Tech Devices" width=\{500\} height=\{400\} style=\{\{ objectFit: 'contain', width: '100%', height: 'auto', dropShadow: '0 20px 40px rgba\(0,0,0,0\.5\)' \}\} priority \/>/g,
    replace: "<Image src=\"/hero_devices.png\" alt=\"High-Tech Devices\" width={500} height={400} style={{ objectFit: 'contain', width: '100%', height: 'auto', dropShadow: '0 20px 40px rgba(0,0,0,0.5)' }} priority className=\"hero-image\" />"
  }
]);

console.log("Phase 6 patches executed successfully.");
