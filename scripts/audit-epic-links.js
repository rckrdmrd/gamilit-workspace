/**
 * Auditoría de enlaces Markdown en docs/10-requirements/epics/**
 * Reporta links rotos (destinos que no existen como archivo)
 */
const fs = require('fs');
const path = require('path');

const EPICS_ROOT = path.join(__dirname, '../docs/10-requirements/epics');

function* walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkDir(full);
    } else if (e.name.endsWith('.md')) {
      yield full;
    }
  }
}

function extractLinks(content, filePath) {
  const links = [];
  const re = /\]\(([^)\n]+)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const href = m[1].trim();
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#') && !href.startsWith('@') &&
        !href.includes('\n') && href.length < 200) {
      links.push(href);
    }
  }
  return links;
}

function resolveTarget(filePath, href) {
  const dir = path.dirname(filePath);
  let resolved = path.normalize(path.join(dir, href));
  resolved = path.relative(process.cwd(), resolved).replace(/\\/g, '/');
  return resolved;
}

function checkExists(targetPath) {
  const full = path.join(process.cwd(), targetPath);
  if (fs.existsSync(full)) return true;
  const fullMd = full.endsWith('.md') ? full : full + '.md';
  return fs.existsSync(fullMd);
}

const broken = [];
const patternCount = {};

for (const file of walkDir(EPICS_ROOT)) {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');
  const links = extractLinks(content, file);
  for (const href of links) {
    const target = resolveTarget(file, href);
    const targetSplit = target.split('#')[0];
    if (!checkExists(targetSplit)) {
      broken.push({ from: rel, href, target: targetSplit });
      const p = href.split('#')[0];
      const dirPart = p.replace(/[^/]+\.md$/, '').replace(/[^/]+$/, '') || p;
      const key = dirPart || p;
      patternCount[key] = (patternCount[key] || 0) + 1;
    }
  }
}

const sorted = Object.entries(patternCount).sort((a, b) => b[1] - a[1]);
console.log('=== BROKEN LINKS ===');
console.log('Total:', broken.length);
console.log('\n--- By file ---');
broken.slice(0, 50).forEach(b => console.log(`${b.from} -> ${b.href}`));
console.log('\n--- Top 10 patterns ---');
sorted.slice(0, 10).forEach(([p, c]) => console.log(`${c}\t${p}`));
