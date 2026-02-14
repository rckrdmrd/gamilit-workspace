const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '../.env');
console.log('Path:', envFile);
console.log('Resolved:', path.resolve(envFile));
console.log('Exists:', fs.existsSync(envFile));

const c = fs.readFileSync(envFile, 'utf-8');
console.log('File size:', c.length, 'bytes');
console.log('Total lines:', c.split('\n').length);

const lines = c.split('\n');
let parsed = 0;
let skipped = 0;

lines.forEach((line, i) => {
  if (line.startsWith('#') || line.trim() === '') {
    skipped++;
    return;
  }
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim();
    parsed++;
    console.log(`  Parsed[${i}]: ${key} = ${value}`);
  } else {
    console.log(`  NoMatch[${i}]: ${JSON.stringify(line)}`);
  }
});

console.log(`\nParsed: ${parsed}, Skipped: ${skipped}`);
