const fs = require('fs');
const https = require('http'); // since localhost
const path = require('path');

const fileContent = fs.readFileSync('/Users/lizmartinez/.gemini/antigravity/brain/ab5fbe2c-5e69-4ea3-93e2-a3873e8b995b/.system_generated/steps/83/output.txt', 'utf8');
const urls = [...new Set(fileContent.match(/http:\/\/localhost:3845\/assets\/[^"]+/g) || [])];

if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

let completed = 0;
urls.forEach(url => {
  const filename = path.basename(url);
  const file = fs.createWriteStream(path.join('assets', filename));
  https.get(url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      completed++;
      if (completed === urls.length) console.log('All downloads completed!');
    });
  }).on('error', err => {
    fs.unlink(path.join('assets', filename));
    console.error(err);
  });
});
