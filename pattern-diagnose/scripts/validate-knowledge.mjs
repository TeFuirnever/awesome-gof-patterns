// SPDX-License-Identifier: MIT
/**
 * validate-knowledge.mjs
 *
 * Validates the YAML frontmatter of every knowledge card under references/
 * against the v0 schema. Fails CI if a card violates the schema.
 *
 * v0 schema (frontmatter required fields):
 *   - name (string)
 *   - intent (string)
 *   - category (one of: behavioral | structural | creational)
 *   - smells (non-empty list with id+pattern)
 *   - anti_patterns (non-empty list with id+rule+why)
 *   - steps (non-empty list)
 *   - sources (non-empty list of strings)
 *
 * Optional:
 *   - modern_relevance (string)
 *   - attribution_chain (object)
 *
 * Usage:
 *   node pattern-diagnose/scripts/validate-knowledge.mjs
 *   node pattern-diagnose/scripts/validate-knowledge.mjs <file>
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { argv, exit } from "node:process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFERENCES_DIR = join(__dirname, "..", "references");

function extractFrontmatter(text) {
  // Strip leading SPDX/HTML comments
  const stripped = text.replace(/^(<!--[\s\S]*?-->\s*)+/, "");
  const match = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return match[1];
}

function parseSimpleYaml(yamlText) {
  // Minimal YAML parser sufficient for our schema (no external deps in v0).
  // Supports: scalars, block lists with `- key: value` items, multiline `|`,
  // and nested objects via 2-space indent.
  const lines = yamlText.split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, container: root, key: null }];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) { i++; continue; }
    const indent = line.match(/^ */)[0].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const top = stack[stack.length - 1];
    const trimmed = line.slice(indent);

    if (trimmed.startsWith("- ")) {
      const itemBody = trimmed.slice(2);
      if (!Array.isArray(top.container)) {
        // promote previous key into a list
        const parent = stack[stack.length - 2];
        const key = top.key;
        const list = [];
        parent.container[key] = list;
        stack.pop();
        stack.push({ indent: top.indent, container: list, key: null });
      }
      const list = stack[stack.length - 1].container;
      const colonIdx = itemBody.indexOf(":");
      if (colonIdx > -1) {
        const k = itemBody.slice(0, colonIdx).trim();
        const v = itemBody.slice(colonIdx + 1).trim();
        const obj = {};
        if (v && v !== "|") obj[k] = stripQuotes(v);
        else if (v === "|") obj[k] = consumeBlockScalar(lines, i + 1, indent + 2, () => i++);
        list.push(obj);
        stack.push({ indent, container: obj, key: null });
      } else {
        list.push(stripQuotes(itemBody));
      }
      i++;
      continue;
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) { i++; continue; }
    const key = trimmed.slice(0, colonIdx).trim();
    const valueRaw = trimmed.slice(colonIdx + 1).trim();

    if (!valueRaw) {
      const obj = {};
      top.container[key] = obj;
      stack.push({ indent, container: obj, key });
    } else if (valueRaw === "|") {
      // collect indented continuation lines
      const collected = [];
      let j = i + 1;
      while (j < lines.length) {
        const ln = lines[j];
        if (!ln.trim()) { collected.push(""); j++; continue; }
        const ind = ln.match(/^ */)[0].length;
        if (ind <= indent) break;
        collected.push(ln.slice(indent + 2));
        j++;
      }
      top.container[key] = collected.join("\n").trim();
      i = j;
      continue;
    } else {
      top.container[key] = stripQuotes(valueRaw);
    }
    i++;
  }
  return root;
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function consumeBlockScalar(lines, startIdx, baseIndent, advanceLine) {
  const collected = [];
  let j = startIdx;
  while (j < lines.length) {
    const ln = lines[j];
    if (!ln.trim()) { collected.push(""); j++; advanceLine(); continue; }
    const ind = ln.match(/^ */)[0].length;
    if (ind < baseIndent) break;
    collected.push(ln.slice(baseIndent));
    j++;
    advanceLine();
  }
  return collected.join("\n").trim();
}

function validate(card, file) {
  const errors = [];
  const required = ["name", "intent", "category", "smells", "anti_patterns", "steps", "sources"];
  for (const k of required) {
    if (!(k in card)) errors.push(`missing required field: ${k}`);
  }
  const validCategories = ["behavioral", "structural", "creational"];
  if (card.category && !validCategories.includes(card.category)) {
    errors.push(`category must be one of ${validCategories.join("|")}, got "${card.category}"`);
  }
  if (Array.isArray(card.smells)) {
    if (card.smells.length === 0) errors.push("smells must be non-empty");
    for (const [i, s] of card.smells.entries()) {
      if (typeof s === "object") {
        if (!s.id) errors.push(`smells[${i}] missing id`);
        if (!s.pattern || !s.pattern.trim()) errors.push(`smells[${i}] has empty pattern`);
      }
    }
  }
  if (Array.isArray(card.anti_patterns)) {
    if (card.anti_patterns.length === 0) errors.push("anti_patterns must be non-empty");
    for (const [i, a] of card.anti_patterns.entries()) {
      if (typeof a === "object") {
        if (!a.id) errors.push(`anti_patterns[${i}] missing id`);
        if (!a.rule || !a.rule.trim()) errors.push(`anti_patterns[${i}] has empty rule`);
        if (!a.why || !a.why.trim()) errors.push(`anti_patterns[${i}] has empty why`);
      }
    }
  }
  if (Array.isArray(card.steps)) {
    if (card.steps.length === 0) errors.push("steps must be non-empty");
    for (const [i, s] of card.steps.entries()) {
      if (typeof s === "string" && !s.trim()) errors.push(`steps[${i}] is empty`);
    }
  }
  if (Array.isArray(card.sources)) {
    if (card.sources.length === 0) errors.push("sources must be non-empty");
  }
  return errors;
}

function checkFile(file) {
  const text = readFileSync(file, "utf8");
  const fm = extractFrontmatter(text);
  if (!fm) return [`no YAML frontmatter found`];
  const card = parseSimpleYaml(fm);
  return validate(card, file);
}

function main() {
  const single = argv[2];
  const files = single
    ? [single]
    : readdirSync(REFERENCES_DIR).filter((f) => f.endsWith(".md")).map((f) => join(REFERENCES_DIR, f));

  let failed = 0;
  for (const f of files) {
    const errs = checkFile(f);
    if (errs.length) {
      failed++;
      console.error(`FAIL ${f}`);
      for (const e of errs) console.error(`  - ${e}`);
    } else {
      console.log(`PASS ${f}`);
    }
  }
  if (failed > 0) exit(1);
}

main();
