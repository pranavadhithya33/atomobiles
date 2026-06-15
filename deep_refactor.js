const fs = require('fs');
const path = require('path');

// 1. Update globals.css to add the glass variables
const cssPath = path.join(__dirname, 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('--glass-bg')) {
  // Add to :root
  css = css.replace(/--bg-highlight: #3e2820;/, '--bg-highlight: #3e2820;\n\n  /* Glass/Transparent Utilities */\n  --glass-bg: rgba(255, 255, 255, 0.05);\n  --glass-border: rgba(255, 255, 255, 0.1);\n  --glass-icon: #ffffff;\n  --header-text: #ffffff;');
  // The other blocks were added previously
}
fs.writeFileSync(cssPath, css);

// 2. Refactor function
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
      callback(dirPath);
    }
  });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replacements
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--glass-bg)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'var(--glass-border)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.2\)/g, 'var(--glass-border)');
  
  // Specific replacements for hardcoded hex colors
  // Wait, some #fff might be in color, background, etc.
  content = content.replace(/background:\s*['"]#fff['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]#ffffff['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/color:\s*['"]#fff['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#ffffff['"]/g, "color: 'var(--text-primary)'");
  
  // For border colors
  content = content.replace(/border:\s*['"]1px solid #e0e0e0['"]/g, "border: '1px solid var(--border)'");
  
  // Some buttons have background: var(--brand-primary), color: '#fff' - we replaced #fff with var(--text-primary)
  // Let's fix that. If a button has var(--brand-primary), it should use var(--text-white).
  // This is a bit too complex for regex.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Refactored: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'components'), processFile);
walkDir(path.join(__dirname, 'app'), processFile);

console.log('Deep refactoring complete!');
