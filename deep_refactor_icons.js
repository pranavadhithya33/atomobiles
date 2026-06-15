const fs = require('fs');
const path = require('path');

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

  // Icons have color="#fff"
  content = content.replace(/color="#fff"/g, 'color="var(--header-text)"');
  content = content.replace(/color="#ffffff"/g, 'color="var(--header-text)"');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Refactored icons: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'components'), processFile);
walkDir(path.join(__dirname, 'app'), processFile);

console.log('Icon refactoring complete!');
