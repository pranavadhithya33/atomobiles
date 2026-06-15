const fs = require('fs');
const path = require('path');

const dirs = [path.join(__dirname, 'app'), path.join(__dirname, 'components')];
const hexRegex = /#[0-9a-fA-F]{3,6}/g;

let foundHexes = new Set();

function searchDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDir(fullPath);
    } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let match;
      while ((match = hexRegex.exec(content)) !== null) {
        if (match[0].toLowerCase() !== '#fff' && match[0].toLowerCase() !== '#000' && match[0].toLowerCase() !== '#ffffff' && match[0].toLowerCase() !== '#000000') {
          foundHexes.add(`${match[0].toLowerCase()} in ${fullPath.replace(__dirname, '')}`);
        }
      }
    }
  });
}

dirs.forEach(d => searchDir(d));

console.log('Found Hardcoded Hex Colors in JS files:');
console.log(Array.from(foundHexes).sort().join('\n'));
