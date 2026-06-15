const fs = require('fs');
const path = require('path');

const filesToPatch = [
  path.join(__dirname, 'app/page.js'),
  path.join(__dirname, 'components/DealOfTheDay.js')
];

filesToPatch.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace #f3e3d3 with var(--text-primary)
    content = content.replace(/['"]#f3e3d3['"]/gi, "'var(--text-primary)'");
    
    // Replace #160d0a with var(--brand-primary)
    content = content.replace(/['"]#160d0a['"]/gi, "'var(--brand-primary)'");

    // Replace #f4d3b6 with var(--brand-accent) in app/page.js (this was the 'All Categories' button background)
    content = content.replace(/['"]#f4d3b6['"]/gi, "'var(--brand-accent)'");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Patched specific hex codes in: ${filePath}`);
    }
  }
});
