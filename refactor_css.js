const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Background colors
  content = content.replace(/background:\s*['"]?#fff['"]?;/g, "background: var(--bg-card);");
  content = content.replace(/background:\s*['"]?#ffffff['"]?;/g, "background: var(--bg-card);");
  
  // Text colors
  content = content.replace(/color:\s*['"]?#fff['"]?;/g, "color: var(--text-primary);");
  content = content.replace(/color:\s*['"]?#ffffff['"]?;/g, "color: var(--text-primary);");
  
  // Specifically fix known cases in Header.module.css where we need header-text
  // like the logo
  if (filePath.endsWith('Header.module.css')) {
    content = content.replace(/\.logoName\s*\{[^}]*color:\s*var\(--text-primary\);/g, match => match.replace('var(--text-primary)', 'var(--header-text)'));
    content = content.replace(/\.waBtn\s*\{[^}]*color:\s*var\(--text-primary\);/g, match => match.replace('var(--text-primary)', 'var(--text-white)')); // WhatsApp is always green
  }
  
  // Transparent colors
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, "var(--glass-bg)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, "var(--glass-border)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.2\)/g, "var(--glass-border)");
  
  // Text secondary / muted
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.85\)/g, "var(--text-secondary)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.7\)/g, "var(--text-secondary)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.9\)/g, "var(--text-primary)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.8\)/g, "var(--text-primary)");
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.5\)/g, "var(--text-muted)");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Refactored CSS: ${path.basename(filePath)}`);
  }
}

const dir = path.join(__dirname, 'styles');
fs.readdirSync(dir).forEach(f => {
  if (f.endsWith('.module.css')) {
    processFile(path.join(dir, f));
  }
});
console.log('CSS module refactoring complete!');
