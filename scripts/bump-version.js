#!/usr/bin/env node
// Bumps package.json's version and appends a version.md entry, based on
// conventional-commit prefixes found in the commit messages pushed.
//
// Usage: node scripts/bump-version.js <path-to-commit-messages-file>
// The messages file has one commit subject per line.

const fs = require("fs");
const path = require("path");

const messagesFile = process.argv[2];
if (!messagesFile) {
  console.error("Usage: node scripts/bump-version.js <commit-messages-file>");
  process.exit(1);
}

const pkgPath = path.join(__dirname, "..", "package.json");
const versionMdPath = path.join(__dirname, "..", "version.md");

const rawMessages = fs.existsSync(messagesFile) ? fs.readFileSync(messagesFile, "utf8") : "";
const allMessages = rawMessages
  .split("\n")
  .map((m) => m.trim())
  .filter(Boolean);

// Merge commits carry no useful changelog content on their own.
const messages = allMessages.filter((m) => !/^Merge (pull request|branch)/i.test(m));

const BREAKING_RE = /^[a-zA-Z]+(\(.+\))?!:|BREAKING CHANGE/;
const FEAT_RE = /^feat(\(.+\))?:\s*/;
const FIX_RE = /^fix(\(.+\))?:\s*/;

let bumpType = "patch"; // safe default when nothing matches a conventional prefix
if (messages.some((m) => BREAKING_RE.test(m))) {
  bumpType = "major";
} else if (messages.some((m) => FEAT_RE.test(m))) {
  bumpType = "minor";
}

// --- bump package.json ---
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

let newVersion;
if (bumpType === "major") newVersion = `${major + 1}.0.0`;
else if (bumpType === "minor") newVersion = `${major}.${minor + 1}.0`;
else newVersion = `${major}.${minor}.${patch + 1}`;

pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// --- categorize commit messages for the changelog entry ---
const sections = {Breaking: [], Added: [], Fixed: [], Changed: []};

for (const msg of messages) {
  if (BREAKING_RE.test(msg)) {
    sections.Breaking.push(msg);
  } else if (FEAT_RE.test(msg)) {
    sections.Added.push(msg.replace(FEAT_RE, ""));
  } else if (FIX_RE.test(msg)) {
    sections.Fixed.push(msg.replace(FIX_RE, ""));
  } else {
    sections.Changed.push(msg);
  }
}

if (Object.values(sections).every((list) => list.length === 0)) {
  sections.Changed.push("See commit history for details.");
}

const today = new Date().toISOString().slice(0, 10);
let entry = `## [${newVersion}] - ${today}\n`;

for (const [label, items] of Object.entries(sections)) {
  if (items.length === 0) continue;
  entry += `\n### ${label}\n`;
  for (const item of items) entry += `- ${item}\n`;
}

// --- insert the new entry right after the intro's "---" separator, so
// entries stay newest-first above the Historical section ---
const versionMd = fs.readFileSync(versionMdPath, "utf8");
const marker = "---\n\n";
const idx = versionMd.indexOf(marker);

const updated = idx === -1 ? `${versionMd.trim()}\n\n---\n\n${entry}\n` : versionMd.slice(0, idx + marker.length) + entry + "\n" + versionMd.slice(idx + marker.length);

fs.writeFileSync(versionMdPath, updated);

console.log(`Bumped version: ${major}.${minor}.${patch} -> ${newVersion} (${bumpType})`);
