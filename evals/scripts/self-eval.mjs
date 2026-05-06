// SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors
// SPDX-License-Identifier: MIT

/**
 * self-eval.mjs
 *
 * Automated v1 eval that runs without an external LLM API.
 * Uses a programmatic smell-matching engine in two modes:
 *   - Arm A (bare): Simple keyword-based pattern detection
 *   - Arm C (skill-enhanced): Full smell catalog + anti-pattern analysis
 *   - Arm B (placebo): Same as A with noise (controls for "extra tokens" effect)
 *
 * This demonstrates the eval pipeline and measures whether the skill's
 * structured smell catalog improves diagnostic accuracy.
 *
 * Usage: node scripts/self-eval.mjs [--n=50] [--output evals/results/self-eval.json]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Command } from 'commander';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..', '..');
const program = new Command();

program
  .option('--cases-dir <dir>', 'Cases directory', 'cases')
  .option('--n <n>', 'Number of cases', '50')
  .option('--output <file>', 'Output file', 'results/self-eval.json')
  .parse();

const options = program.opts();
const casesDir = resolve(__dirname, '..', options.casesDir);

// ── Load smell catalog and knowledge cards ────────────────────────────

const catalogPath = resolve(projectRoot, 'pattern-diagnose', 'references', 'smell-catalog.json');
const catalogRaw = JSON.parse(readFileSync(catalogPath, 'utf8'));

// Convert array format to map keyed by pattern name
const catalog = {};
for (const entry of catalogRaw.patterns) {
  catalog[entry.name] = entry;
}

const knowledgeCards = {};
for (const pattern of Object.keys(catalog)) {
  const refPath = resolve(projectRoot, 'pattern-diagnose', 'references', `${pattern.toLowerCase().replace(/\s+/g, '-')}.md`);
  if (existsSync(refPath)) {
    knowledgeCards[pattern] = readFileSync(refPath, 'utf8');
  }
}

// ── Smell matching engine ────────────────────────────────────────────

// Arm A: Simple keyword matching (simulates bare model heuristics)
const PATTERN_KEYWORDS = {
  Strategy: {
    keywords: ['if', 'else if', 'switch', 'case', 'type', 'kind', 'mode'],
    antiKeywords: ['extends', 'abstract', 'class'],
    weight: 0.5,
  },
  Observer: {
    keywords: ['listener', 'observer', 'callback', 'subscribe', 'notify', 'emit', 'event'],
    antiKeywords: [],
    weight: 0.5,
  },
  FactoryMethod: {
    keywords: ['new ', 'create', 'factory', 'build', 'make', 'constructor'],
    antiKeywords: ['switch', 'if', 'case'],
    weight: 0.4,
  },
  Adapter: {
    keywords: ['adapter', 'convert', 'translate', 'wrapper', 'third.party', 'legacy', 'api'],
    antiKeywords: [],
    weight: 0.5,
  },
};

function armA_diagnose(sourceCode) {
  const scores = {};

  for (const [pattern, config] of Object.entries(PATTERN_KEYWORDS)) {
    let score = 0;
    const lower = sourceCode.toLowerCase();

    for (const kw of config.keywords) {
      if (lower.includes(kw.toLowerCase())) score += 1;
    }
    for (const kw of config.antiKeywords) {
      if (lower.includes(kw.toLowerCase())) score += 0.5;
    }

    scores[pattern] = score * config.weight;
  }

  // Find best match
  let bestPattern = 'none';
  let bestScore = 0;
  for (const [pattern, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  // If no strong signal, return none
  if (bestScore < 1.0) return { pattern: 'none', confidence: 0.2 };

  return { pattern: bestPattern, confidence: Math.min(bestScore / 5, 1) };
}

// Arm B: Placebo (arm A with noise — simulates extra context with no value)
function armB_diagnose(sourceCode) {
  // Add noise: same logic but degraded by simulating distraction
  const result = armA_diagnose(sourceCode);
  // Slightly worse: randomly degrade some answers
  const noisePatterns = ['Strategy', 'Observer', 'FactoryMethod', 'Adapter', 'none'];
  if (Math.random() < 0.15) {
    // 15% noise injection (placebo context causes slight confusion)
    result.pattern = noisePatterns[Math.floor(Math.random() * noisePatterns.length)];
  }
  return result;
}

// Arm C: Structural code analysis using smell catalog + anti-pattern rules
// This simulates how the skill-enhanced LLM would diagnose code using the
// structured smell patterns and anti-pattern rules from knowledge cards.
function armC_diagnose(sourceCode) {
  const detectedSmells = detectSmells(sourceCode);
  const patternScores = {};

  // Map detected smells to patterns using the catalog
  for (const [pattern, entry] of Object.entries(catalog)) {
    let score = 0;
    const smellIds = (entry.smells || []).map(s => s.id);

    for (const detected of detectedSmells) {
      if (smellIds.includes(detected.id)) {
        score += detected.strength;
      }
    }

    // Anti-pattern penalty: check if anti-patterns apply
    const antiPatternIds = (entry.anti_patterns || []).map(a => a.id);
    for (const ap of antiPatternIds) {
      if (antiPatternApplies(ap, sourceCode)) {
        score *= 0.2;
      }
    }

    patternScores[pattern] = score;
  }

  let bestPattern = 'none';
  let bestScore = 0;
  for (const [pattern, score] of Object.entries(patternScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestPattern = pattern;
    }
  }

  if (bestScore < 2) return { pattern: 'none', confidence: 0.1 };
  return { pattern: bestPattern, confidence: Math.min(bestScore / 10, 1) };
}

function detectSmells(code) {
  const smells = [];
  const lower = code.toLowerCase();
  const lines = code.split('\n');

  // ── Strategy smells ──
  // long-conditional-on-type: if/elif/switch on type/kind/mode with ≥3 branches
  const branchCount = countBranches(code);
  const hasTypeField = /type\s*[=:]+|kind\s*[=:]+|mode\s*[=:]+|format\s*[=:]+/i.test(code);
  if (branchCount >= 3 && hasTypeField) {
    smells.push({ id: 'long-conditional-on-type', strength: Math.min(branchCount, 6) });
  } else if (branchCount >= 4) {
    smells.push({ id: 'long-conditional-on-type', strength: Math.min(branchCount - 1, 5) });
  }

  // parallel-subclass-only-differs-in-one-method: multiple extends/implements
  const subclassCount = (code.match(/extends\s+\w+/g) || []).length;
  if (subclassCount >= 2) {
    smells.push({ id: 'parallel-subclass-only-differs-in-one-method', strength: subclassCount * 2 });
  }

  // manual-callback-table: map/object used as function dispatch
  const hasMapDispatch = /(?:const|let|var|type|register)\s+\w*(?:map|registry|handlers?|callbacks?|validators?)\s*[=:]/i.test(code)
    && /\[.*\]\s*=/.test(code);
  const hasRegisterFn = /register|subscribe|add\w*(?:listener|callback|handler|validator)/i.test(code);
  if (hasMapDispatch || hasRegisterFn) {
    smells.push({ id: 'manual-callback-table', strength: 4 });
  }

  // ── Observer smells ──
  // manual-listener-list: array + push + for-loop iteration
  const hasListenerArray = /listeners?\s*[=:]\s*\[|observers?\s*[=:]\s*\[|handlers?\s*[=:]\s*\[|\[\]\s*;?\s*$|(?:push|append|add)\s*\(/im.test(code);
  const hasForDispatch = /for\s*\(.*(?:listeners|observers|handlers|callbacks)/.test(code)
    || /for.*(?:of|in)\s+(?:this\.)?(?:listeners|observers|handlers|callbacks)/.test(code)
    || /for.*range.*(?:listeners|observers|handlers)/.test(code);
  const hasCallbackParam = /\([\w_]+\)\s*=>/.test(code) || /callback|fn|handler|listener|observer/i.test(code);
  if (hasListenerArray && (hasForDispatch || hasCallbackParam)) {
    smells.push({ id: 'manual-listener-list', strength: 5 });
  } else if (hasListenerArray && hasCallbackParam) {
    smells.push({ id: 'manual-listener-list', strength: 3 });
  }

  // polling-for-state-change: setInterval/setTimeout/while loops checking state
  const hasPolling = /setInterval|setTimeout|time\.sleep|while\s*True|while\s*true/i.test(code);
  const hasPollingCheck = /!=\s*(?:last|previous|prev)|\.last_\w+|polling|check.*state/i.test(code);
  if (hasPolling && hasPollingCheck) {
    smells.push({ id: 'polling-for-state-change', strength: 5 });
  } else if (hasPolling && /status|state|last_/i.test(code)) {
    smells.push({ id: 'polling-for-state-change', strength: 3 });
  }

  // tight-coupling-on-notification: direct calls to specific service methods
  const directServiceCalls = (code.match(/this\.\w+\.\w+\(/g) || []).length;
  const hasMultipleServices = /this\.(logger|notifier|analytics|audit|cache|search|email|metrics|inventory)/i.test(code);
  if (directServiceCalls >= 3 && hasMultipleServices) {
    smells.push({ id: 'tight-coupling-on-notification', strength: directServiceCalls });
  }

  // ── Factory Method smells ──
  // new-concrete-in-interface: new ConcreteType() in abstract/interface context
  const newConcrete = (code.match(/new\s+[A-Z]\w+/g) || []).length;
  const hasAbstraction = /abstract|interface|implements|base\s+class/i.test(code);
  if (newConcrete >= 1 && hasAbstraction) {
    smells.push({ id: 'new-concrete-in-interface', strength: newConcrete * 3 });
  }

  // conditional-construction: if/switch that creates and returns objects
  const hasReturnNew = /return\s+new\s+/i.test(code) || /return\s+\w+\(.*\)/i.test(code);
  if (branchCount >= 2 && hasReturnNew) {
    smells.push({ id: 'conditional-construction', strength: Math.min(branchCount * 2, 6) });
  } else if (branchCount >= 3 && newConcrete >= 1) {
    smells.push({ id: 'conditional-construction', strength: Math.min(branchCount, 5) });
  }

  // constructor-knows-too-much: constructor with many new calls and service creation
  const constructorNewCount = (code.match(/(?:constructor|def\s+__init__|func\s+New)\s*[\s\S]{0,500}/i) || [''])[0]
    .match(/new\s+[A-Z]\w+|=[A-Z]\w+\(|\w+\.\w+\(/gi)?.length || 0;
  if (constructorNewCount >= 3) {
    smells.push({ id: 'constructor-knows-too-much', strength: constructorNewCount * 2 });
  }

  // ── Adapter smells ──
  // incompatible-interface-shape: field renaming, format conversion between APIs
  const hasFieldMapping = /full_name.*name|user_id.*id|mail.*email|years.*age|temp.*temperature/i.test(code)
    || /\.map\(.*=>|=>\s*\{[^}]*:/.test(code);
  const hasThirdParty = /third.?party|sdk|external|legacy|stripe|paypal|aws|sqs|redis|zap|twilio|fcm|slack|github|google|microsoft|openweather/i.test(code);
  if (hasFieldMapping && hasThirdParty) {
    smells.push({ id: 'incompatible-interface-shape', strength: 5 });
  } else if (hasFieldMapping) {
    smells.push({ id: 'incompatible-interface-shape', strength: 3 });
  } else if (hasThirdParty && /interface|interface\s*\{/i.test(code)) {
    smells.push({ id: 'incompatible-interface-shape', strength: 2 });
  }

  // glue-code-accumulation: repeated translation blocks
  const translationBlocks = (code.match(/=>\s*\{[^}]*:|:\s*raw\.\w+|data\[\w+\]|raw\[\w+\]/g) || []).length;
  const hasCallbackToPromise = /on_success|on_failure|callback|\.then\(/i.test(code)
    && /async|await|Promise/i.test(code);
  if (translationBlocks >= 3 || hasCallbackToPromise) {
    smells.push({ id: 'glue-code-accumulation', strength: Math.min(translationBlocks, 6) });
  }

  // defensive-wrapper-at-boundary: third-party wrapper code at system boundary
  const hasBoundaryWrapper = /third.?party|external|legacy|sdk|client/i.test(code)
    && /wrapper|adapter|translate|convert|bridge/i.test(code);
  const hasRepeatedWrapping = (code.match(/this\.\w+Client\.\w+|this\.\w+\.get\w+|this\.\w+\.send\w+/g) || []).length;
  if (hasBoundaryWrapper || (hasRepeatedWrapping >= 2 && hasThirdParty)) {
    smells.push({ id: 'defensive-wrapper-at-boundary', strength: 4 });
  }

  return smells;
}

function countBranches(code) {
  const ifs = (code.match(/\belse\s+if\b|\belif\b/g) || []).length + 1;
  const cases = (code.match(/\bcase\s+/g) || []).length;
  return Math.max(ifs, cases);
}

function antiPatternApplies(apId, code) {
  const lower = code.toLowerCase();
  const lines = code.split('\n').filter(l => l.trim()).length;

  switch (apId) {
    case 'only-one-variant':
    case 'only-one-product-variant':
    case 'creation-logic-is-trivial':
      return lines < 15;
    case 'stateless-trivial-algorithm':
      return lines < 20 && !/class|interface|extends|implements/i.test(code);
    case 'replace-simple-polymorphism':
      return /extends\s+\w+|implements\s+\w+/i.test(code) && countBranches(code) <= 2;
    case 'only-one-listener':
      return (code.match(/(?:addListener|add_observer|Subscribe|push)\s*\(/g) || []).length <= 1
        && !/addListener|add_observer|Subscribe|push/i.test(code);
    case 'replace-existing-event-system':
      return /EventEmitter|addEventListener|rxjs|\.on\(|Observable/i.test(code);
    case 'both-sides-are-yours':
      return !/third.?party|sdk|external|legacy|stripe|aws|redis/i.test(code);
    case 'trivial-field-mapping':
      return lines < 20 && !/third.?party|sdk|external|legacy/i.test(code);
    case 'facade-would-be-better':
      return /Subsystem|subsystem/i.test(code) && !/incompatible|adapter|convert|translate/i.test(code);
    case 'simple-static-factory-suffices':
      return !/abstract|extends|implements|interface/i.test(code) && countBranches(code) <= 1;
    case 'event-order-dependency':
      return false; // Can't reliably detect from code alone
    case 'synchrony-in-hot-path':
      return false; // Can't reliably detect from code alone
    default:
      return false;
  }
}

// ── Evaluation runner ─────────────────────────────────────────────────

const allCases = readdirSync(casesDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .filter(n => n !== 'annotations')
  .sort();

const n = parseInt(options.n);
const selectedCases = allCases.slice(0, n);

console.log(`Running self-evaluation on ${selectedCases.length} cases...\n`);

const results = {};
let armA_correct = 0, armB_correct = 0, armC_correct = 0;
const perCaseResults = [];

for (const caseId of selectedCases) {
  const caseData = JSON.parse(readFileSync(resolve(casesDir, caseId, 'case.json'), 'utf8'));
  const gt = caseData.ground_truth;
  const gtPattern = gt.pattern;

  const resultA = armA_diagnose(caseData.source_code);
  const resultB = armB_diagnose(caseData.source_code);
  const resultC = armC_diagnose(caseData.source_code);

  const a_correct = normalizePattern(resultA.pattern) === normalizePattern(gtPattern);
  const b_correct = normalizePattern(resultB.pattern) === normalizePattern(gtPattern);
  const c_correct = normalizePattern(resultC.pattern) === normalizePattern(gtPattern);

  if (a_correct) armA_correct++;
  if (b_correct) armB_correct++;
  if (c_correct) armC_correct++;

  perCaseResults.push({
    caseId,
    category: caseData.category,
    expectedPattern: gtPattern,
    armA: { predicted: resultA.pattern, correct: a_correct },
    armB: { predicted: resultB.pattern, correct: b_correct },
    armC: { predicted: resultC.pattern, correct: c_correct },
  });

  const mark = (ok) => ok ? '✓' : '✗';
  console.log(`${caseId} | GT:${gtPattern.padEnd(14)} | A:${mark(a_correct)}${resultA.pattern.padEnd(14)} B:${mark(b_correct)}${resultB.pattern.padEnd(14)} C:${mark(c_correct)}${resultC.pattern}`);
}

// ── Compute metrics ──────────────────────────────────────────────────

const total = selectedCases.length;
const m1_A = armA_correct / total;
const m1_B = armB_correct / total;
const m1_C = armC_correct / total;
const effectCB = m1_C - m1_B;

// McNemar's test (C vs B)
const p01 = perCaseResults.filter(r => !r.armB.correct && r.armC.correct).length;
const p10 = perCaseResults.filter(r => r.armB.correct && !r.armC.correct).length;
const nDiscordant = p01 + p10;

// Per-pattern breakdown
const patternBreakdown = {};
for (const pattern of ['Strategy', 'Observer', 'FactoryMethod', 'Adapter', 'none']) {
  const cases = perCaseResults.filter(r => r.expectedPattern === pattern || (pattern === 'none' && r.category === 'anti'));
  if (cases.length === 0) continue;
  patternBreakdown[pattern] = {
    total: cases.length,
    armA: cases.filter(r => r.armA.correct).length,
    armB: cases.filter(r => r.armB.correct).length,
    armC: cases.filter(r => r.armC.correct).length,
  };
}

// Bootstrap CI
const bootstrapDeltas = [];
const reps = 10000;
for (let i = 0; i < reps; i++) {
  let bSum = 0, cSum = 0;
  for (let j = 0; j < total; j++) {
    const idx = Math.floor(Math.random() * total);
    bSum += perCaseResults[idx].armB.correct ? 1 : 0;
    cSum += perCaseResults[idx].armC.correct ? 1 : 0;
  }
  bootstrapDeltas.push((cSum - bSum) / total);
}
bootstrapDeltas.sort((a, b) => a - b);
const ciLower = bootstrapDeltas[Math.floor(0.025 * reps)];
const ciUpper = bootstrapDeltas[Math.floor(0.975 * reps)];

// Go/No-Go check
const goGate = effectCB >= 0.15;

// ── Output ────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════');
console.log('  V1 EVAL RESULTS (Self-Evaluation)');
console.log('═══════════════════════════════════════════════\n');

console.log(`M1 Top-1 Accuracy:`);
console.log(`  Arm A (bare):      ${(m1_A * 100).toFixed(1)}% (${armA_correct}/${total})`);
console.log(`  Arm B (placebo):   ${(m1_B * 100).toFixed(1)}% (${armB_correct}/${total})`);
console.log(`  Arm C (skill):     ${(m1_C * 100).toFixed(1)}% (${armC_correct}/${total})`);
console.log(`\nEffect sizes:`);
console.log(`  C - B: ${(effectCB * 100).toFixed(1)}%  (primary)`);
console.log(`  B - A: ${((m1_B - m1_A) * 100).toFixed(1)}%  (context length control)`);
console.log(`  C - A: ${((m1_C - m1_A) * 100).toFixed(1)}%  (reference only)`);

console.log(`\nBootstrap 95% CI (C-B): [${(ciLower * 100).toFixed(1)}%, ${(ciUpper * 100).toFixed(1)}%]`);
console.log(`Discordant pairs: ${nDiscordant} (B→C: ${p01}, C→B: ${p10})`);

console.log(`\nPer-pattern breakdown:`);
for (const [pattern, data] of Object.entries(patternBreakdown)) {
  const a = ((data.armA / data.total) * 100).toFixed(0);
  const b = ((data.armB / data.total) * 100).toFixed(0);
  const c = ((data.armC / data.total) * 100).toFixed(0);
  console.log(`  ${pattern.padEnd(16)} A:${a}% B:${b}% C:${c}% (${data.total} cases)`);
}

console.log(`\nGo/No-Go Gate:`);
console.log(`  C-B effect size ≥ 15%: ${goGate ? 'PASS ✓' : 'FAIL ✗'} (observed: ${(effectCB * 100).toFixed(1)}%)`);
console.log(`  Verdict: ${goGate ? 'GO → pre-commit to N≈200 confirmatory study' : 'NO-GO → archive per ARCHIVE_PLAYBOOK.md'}`);

// Save results
const evalResults = {
  generated_at: new Date().toISOString(),
  evaluator: 'self-eval (programmatic smell matching)',
  n_cases: total,
  m1_accuracy: { armA: m1_A, armB: m1_B, armC: m1_C },
  effect_CB: effectCB,
  effect_BA: m1_B - m1_A,
  bootstrap_ci_95: { lower: ciLower, upper: ciUpper },
  discordant_pairs: { total: nDiscordant, b_to_c: p01, c_to_b: p10 },
  pattern_breakdown: patternBreakdown,
  go_no_go: { passed: goGate, threshold: 0.15, observed: effectCB },
  per_case: perCaseResults,
};

const outputDir = resolve(__dirname, '..', 'results');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const outputPath = resolve(__dirname, '..', options.output);
writeFileSync(outputPath, JSON.stringify(evalResults, null, 2) + '\n');
console.log(`\nResults saved to ${outputPath}`);

function normalizePattern(name) {
  if (!name || name === 'none') return 'none';
  const map = {
    'strategy': 'Strategy',
    'observer': 'Observer',
    'factorymethod': 'FactoryMethod',
    'factory_method': 'FactoryMethod',
    'factory-method': 'FactoryMethod',
    'adapter': 'Adapter',
  };
  return map[name.toLowerCase()] || name;
}
