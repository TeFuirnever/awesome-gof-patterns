// SPDX-License-Identifier: MIT
/**
 * build-smell-catalog.mjs
 *
 * Extracts smell catalog from all knowledge cards into a single JSON file.
 * Output: pattern-diagnose/references/smell-catalog.json
 *
 * Usage: node pattern-diagnose/scripts/build-smell-catalog.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFERENCES_DIR = join(__dirname, "..", "references");
const OUTPUT_PATH = join(REFERENCES_DIR, "smell-catalog.json");

function extractFrontmatter(text) {
  const stripped = text.replace(/^(<!--[\s\S]*?-->\s*)+/, "");
  const match = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

// Reuse the parser from validate-knowledge (import not possible due to path)
function parseSimpleYaml(yamlText) {
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

function main() {
  const files = readdirSync(REFERENCES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ name: f.replace(".md", ""), path: join(REFERENCES_DIR, f) }));

  const catalog = { patterns: [] };

  for (const { name, path } of files) {
    const text = readFileSync(path, "utf8");
    const fm = extractFrontmatter(text);
    if (!fm) continue;
    const card = parseSimpleYaml(fm);

    catalog.patterns.push({
      name: card.name || name,
      category: card.category || "unknown",
      intent: card.intent || "",
      smells: Array.isArray(card.smells)
        ? card.smells.map((s) => ({
            id: typeof s === "object" ? s.id : s,
            pattern: typeof s === "object" ? s.pattern : "",
          }))
        : [],
      anti_patterns: Array.isArray(card.anti_patterns)
        ? card.anti_patterns.map((a) => ({
            id: typeof a === "object" ? a.id : a,
            rule: typeof a === "object" ? a.rule : "",
          }))
        : [],
    });
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2) + "\n");
  console.log(`Wrote ${catalog.patterns.length} patterns to ${OUTPUT_PATH}`);
  for (const p of catalog.patterns) {
    console.log(`  ${p.name}: ${p.smells.length} smells, ${p.anti_patterns.length} anti_patterns`);
  }
}

main();
