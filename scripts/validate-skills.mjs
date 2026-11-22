import fs from 'node:fs';
import path from 'node:path';
import { validateSkillEntries } from 'agent-skills-ts-sdk';

const ROOT_DIR = process.cwd();
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');

function collectSkillDirs() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readTopLevelEntries(skillDirPath) {
  const entries = [];
  for (const dirent of fs.readdirSync(skillDirPath, { withFileTypes: true })) {
    if (dirent.isFile()) {
      const filePath = path.join(skillDirPath, dirent.name);
      entries.push({
        name: dirent.name,
        content: fs.readFileSync(filePath, 'utf8'),
      });
    }
  }
  return entries;
}

const skillDirs = collectSkillDirs();

if (skillDirs.length === 0) {
  console.log('No skill directories found under skills/.');
  process.exit(0);
}

let hasError = false;

for (const dirName of skillDirs) {
  const skillDirPath = path.join(SKILLS_DIR, dirName);
  const relLocation = path.relative(ROOT_DIR, skillDirPath).replaceAll('\\', '/');
  const entries = readTopLevelEntries(skillDirPath);

  const errors = validateSkillEntries(entries, {
    location: relLocation,
    expectedName: dirName,
    exists: true,
    isDirectory: true,
  });

  if (errors.length > 0) {
    hasError = true;
    console.error(`✖ ${relLocation}`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
  } else {
    console.log(`✔ ${relLocation}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`\nAll ${skillDirs.length} skills passed validation.`);
