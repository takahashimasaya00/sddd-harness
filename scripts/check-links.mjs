import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import markdownLinkCheck from 'markdown-link-check';

const ROOT_DIR = process.cwd();
const CONFIG_PATH = path.join(ROOT_DIR, '.markdown-link-check.json');
const IGNORED_DIRS = new Set(['node_modules', '.git', '.husky']);

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return {};
  }
  const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  return {
    ...raw,
    ignorePatterns: (raw.ignorePatterns ?? []).map((item) => ({
      pattern: new RegExp(item.pattern),
    })),
  };
}

function collectMarkdownFiles(dir, result = []) {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      if (!IGNORED_DIRS.has(dirent.name)) {
        collectMarkdownFiles(path.join(dir, dirent.name), result);
      }
    } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.md')) {
      result.push(path.join(dir, dirent.name));
    }
  }
  return result;
}

function checkFile(filePath, baseConfig) {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(filePath);
    const markdown = fs.readFileSync(absPath, 'utf8');
    const opts = {
      ...baseConfig,
      baseUrl: pathToFileURL(path.dirname(absPath)).href,
    };

    markdownLinkCheck(markdown, opts, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });
}

const cliFiles = process.argv.slice(2).filter((arg) => arg.toLowerCase().endsWith('.md'));
const targetFiles =
  cliFiles.length > 0 ? cliFiles.map((f) => path.resolve(f)) : collectMarkdownFiles(ROOT_DIR).sort();

if (targetFiles.length === 0) {
  console.log('No Markdown files to check.');
  process.exit(0);
}

const baseConfig = loadConfig();
let deadCount = 0;

for (const filePath of targetFiles) {
  const relPath = path.relative(ROOT_DIR, filePath).replaceAll('\\', '/');
  const results = await checkFile(filePath, baseConfig);
  const deadLinks = results.filter((r) => r.status === 'dead');

  if (deadLinks.length > 0) {
    deadCount += deadLinks.length;
    console.error(`✖ ${relPath}`);
    for (const link of deadLinks) {
      const code = link.statusCode ? ` (status: ${link.statusCode})` : '';
      const errMsg = link.err ? ` - ${link.err.message ?? link.err}` : '';
      console.error(`  - [DEAD] ${link.link}${code}${errMsg}`);
    }
  } else {
    console.log(`✔ ${relPath} (${results.length} links checked)`);
  }
}

if (deadCount > 0) {
  console.error(`\nFound ${deadCount} dead link(s).`);
  process.exit(1);
}

console.log(`\nAll links passed across ${targetFiles.length} Markdown file(s).`);
