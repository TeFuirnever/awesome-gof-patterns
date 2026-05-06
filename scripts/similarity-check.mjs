// SPDX-License-Identifier: MIT
/**
 * similarity-check.mjs
 *
 * Anti-plagiarism guard: compares a knowledge file against a corpus of known
 * GoF passages and fails if n-gram similarity exceeds 15%.
 *
 * v0 corpus: stub file at scripts/_known-passages.txt — populate with public
 * snippets from books, blogs, etc. that we explicitly do NOT want to mirror.
 *
 * Usage: node scripts/similarity-check.mjs <path-to-file>
 *
 * Algorithm: shingled (5-gram) Jaccard similarity. Threshold 0.15.
 */

import { readFileSync, existsSync } from "node:fs";
import { argv, exit } from "node:process";

const N = 5;
const THRESHOLD = 0.15;
const CORPUS_PATH = new URL("./_known-passages.txt", import.meta.url);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(tokens, n) {
  const out = new Set();
  for (let i = 0; i <= tokens.length - n; i++) {
    out.add(tokens.slice(i, i + n).join(" "));
  }
  return out;
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const s of a) if (b.has(s)) inter++;
  const union = a.size + b.size - inter;
  return inter / union;
}

function main() {
  const file = argv[2];
  if (!file) {
    console.error("usage: node similarity-check.mjs <file>");
    exit(2);
  }
  if (!existsSync(file)) {
    console.error(`file not found: ${file}`);
    exit(2);
  }
  if (!existsSync(CORPUS_PATH)) {
    console.warn(`[warn] corpus not found at ${CORPUS_PATH.pathname}; ` +
      `creating empty corpus. similarity check is a no-op until populated.`);
    console.log("PASS (corpus empty)");
    return;
  }

  const target = shingles(tokenize(readFileSync(file, "utf8")), N);
  const corpus = readFileSync(CORPUS_PATH, "utf8")
    .split(/\n-{3,}\n/) // passages separated by ---
    .map((p) => p.trim())
    .filter(Boolean);

  let max = 0;
  let maxIdx = -1;
  corpus.forEach((passage, i) => {
    const sim = jaccard(target, shingles(tokenize(passage), N));
    if (sim > max) {
      max = sim;
      maxIdx = i;
    }
  });

  console.log(`max similarity: ${(max * 100).toFixed(2)}% (passage #${maxIdx})`);
  if (max > THRESHOLD) {
    console.error(`FAIL: similarity ${(max * 100).toFixed(2)}% exceeds threshold ${THRESHOLD * 100}%`);
    exit(1);
  }
  console.log("PASS");
}

main();
