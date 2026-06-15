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

// 1. Fix app/page.js Hero checkmarks
replaceInFile(path.join(__dirname, 'app/page.js'), [
  {
    // Change var(--text-primary) to var(--text-white) for the checkmarks in the hero
    search: /color:\s*['"]var\(--text-primary\)['"]/g,
    replace: "color: 'var(--text-white)'"
  }
]);

// 2. Fix globals.css hero subtitle
replaceInFile(path.join(__dirname, 'app/globals.css'), [
  {
    // .hero-subtitle had var(--brand-accent). In B&W it's black. Let's make it a light bright color or white.
    // Actually, I'll just change it to var(--text-white).
    search: /\.hero-subtitle\s*\{[^}]*color:\s*var\(--brand-accent\);/g,
    replace: ".hero-subtitle { font-size: 24px; color: var(--text-white); font-weight: 500; margin-bottom: 40px; letter-spacing: 1px; }"
  }
]);

// 3. Fix ProductDetail.module.css
replaceInFile(path.join(__dirname, 'styles/ProductDetail.module.css'), [
  {
    // .paymentBreakdown background: var(--text-secondary); -> background: var(--glass-bg);
    search: /background:\s*var\(--text-secondary\);/g,
    replace: "background: var(--glass-bg);"
  },
  {
    // .paymentBreakdownRow color: var(--text-secondary); -> this is fine, or we can make it primary
  },
  {
    // .paymentOption background: #f8fafc; -> background: var(--bg-card);
    search: /background:\s*#f8fafc;/g,
    replace: "background: var(--bg-card);"
  },
  {
    // .paymentOption:hover background: #f0f4ff; -> background: var(--bg-page);
    search: /background:\s*#f0f4ff;/g,
    replace: "background: var(--bg-page);"
  },
  {
    // .paymentOptionActive background: var(--brand-accent-light) !important;
    // We need to force color to black so it's readable on neon green!
    search: /\.paymentOptionActive\s*\{[^}]*background:\s*var\(--brand-accent-light\)\s*!important;\s*\}/g,
    replace: ".paymentOptionActive {\n  border-color: var(--brand-accent) !important;\n  background: var(--brand-accent-light) !important;\n  color: #000 !important;\n}\n.paymentOptionActive * {\n  color: #000 !important;\n}"
  },
  {
    search: /\.paymentOptionPrepaid\.paymentOptionActive\s*\{[^}]*background:\s*var\(--brand-accent-light\)\s*!important;\s*\}/g,
    replace: ".paymentOptionPrepaid.paymentOptionActive {\n  border-color: var(--brand-accent) !important;\n  background: var(--brand-accent-light) !important;\n  color: #000 !important;\n}"
  }
]);

// 4. Fix OrderForm.module.css
replaceInFile(path.join(__dirname, 'styles/OrderForm.module.css'), [
  {
    // background: #f8fafc;
    search: /background:\s*#f8fafc;/g,
    replace: "background: var(--bg-page);"
  },
  {
    // color: #64748b;
    search: /color:\s*#64748b;/g,
    replace: "color: var(--text-muted);"
  },
  {
    // color: #475569;
    search: /color:\s*#475569;/g,
    replace: "color: var(--text-secondary);"
  }
]);

// 5. Fix Admin.module.css
replaceInFile(path.join(__dirname, 'styles/Admin.module.css'), [
  {
    search: /background:\s*#f8fafc;/g,
    replace: "background: var(--bg-page);"
  },
  {
    search: /background:\s*#fafbfc;/g,
    replace: "background: var(--bg-card);"
  },
  {
    search: /color:\s*#d97706;/g,
    replace: "color: var(--warning);"
  },
  {
    search: /background:\s*#fef3c7;/g,
    replace: "background: var(--warning-bg);"
  },
  {
    search: /background:\s*#fecaca;/g,
    replace: "background: var(--error-bg);"
  },
  {
    search: /background:\s*#f3ebe3;/g,
    replace: "background: var(--brand-accent-light);"
  }
]);

console.log("Phase 4 patches applied.");
