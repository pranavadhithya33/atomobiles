const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'styles');
const files = fs.readdirSync(dir);
const hexRegex = /#[0-9a-fA-F]{3,6}/g;

let foundHexes = new Set();

files.forEach(f => {
  if (f.endsWith('.css')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    let match;
    while ((match = hexRegex.exec(content)) !== null) {
      // Ignore #fff, #000 as they were mostly handled
      if (match[0].toLowerCase() !== '#fff' && match[0].toLowerCase() !== '#000' && match[0].toLowerCase() !== '#ffffff' && match[0].toLowerCase() !== '#000000') {
        foundHexes.add(`${match[0].toLowerCase()} in ${f}`);
      }
    }
  }
});

console.log('Found Hardcoded Hex Colors:');
console.log(Array.from(foundHexes).sort().join('\n'));
