// SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors
// SPDX-License-Identifier: MIT

/**
 * bootstrap-ci.mjs
 *
 * Computes bootstrap confidence intervals for the treatment effect (C - B)
 * on Top-1 accuracy. Also computes the point estimate and McNemar p-value.
 *
 * Usage:
 *   node scripts/bootstrap-ci.mjs \
 *     --results-dir evals/results \
 *     --output evals/results/bootstrap-ci.json \
 *     [--reps=10000]
 */

import { readFileSync, writeFileSync } from 'fs';
import { Command } from 'commander';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .option('--results-dir <dir>', 'Results directory', 'evals/results')
  .option('--output <file>', 'Output file', 'evals/results/bootstrap-ci.json')
  .option('--reps <n>', 'Bootstrap replicates', '10000')
  .parse();

const options = program.opts();

// Log gamma function (Lanczos approximation)
function lgamma(x) {
  const tmp = (x - 0.5) * Math.log(x + 4.5) - (x + 4.5);
  const ser = 1.0 + 76.18009173 / (x + 0) - 86.50532033 / (x + 1)
                     + 24.01409822 / (x + 2) - 1.231739516 / (x + 3)
                     + 0.00120858003 / (x + 4) - 0.00000536382 / (x + 5);
  return tmp + Math.log(ser * Math.sqrt(2 * Math.PI));
}

// Binomial CDF
function binomialCDF(n, p, k) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += Math.exp(
      lgamma(n + 1) - lgamma(i + 1) - lgamma(n - i + 1) +
      i * Math.log(p) + (n - i) * Math.log(1 - p)
    );
  }
  return sum;
}

// Read raw results
const rawResultsPath = resolve(__dirname, '..', options.resultsDir, 'raw-results.json');
const rawResults = JSON.parse(readFileSync(rawResultsPath, 'utf8'));

// Extract paired outcomes (B, C) for each case
const pairedOutcomes = [];
for (const [caseId, arms] of Object.entries(rawResults)) {
  const outcomeB = arms.B?.top1_correct ? 1 : 0;
  const outcomeC = arms.C?.top1_correct ? 1 : 0;
  pairedOutcomes.push({ caseId, outcomeB, outcomeC });
}

// Compute observed point estimate (C - B)
const deltaObserved = pairedOutcomes.reduce((sum, { outcomeB, outcomeC }) =>
  sum + (outcomeC - outcomeB), 0) / pairedOutcomes.length;

// Bootstrap
const reps = parseInt(options.reps);
console.log(`Computing bootstrap CI with ${reps} replicates...`);

const deltas = [];
const n = pairedOutcomes.length;

for (let i = 0; i < reps; i++) {
  let deltaSum = 0;
  for (let j = 0; j < n; j++) {
    const idx = Math.floor(Math.random() * n);
    deltaSum += pairedOutcomes[idx].outcomeC - pairedOutcomes[idx].outcomeB;
  }
  deltas.push(deltaSum / n);
}

// Compute 95% CI
const sortedDeltas = [...deltas].sort((a, b) => a - b);
const ciLower = sortedDeltas[Math.floor(0.025 * reps)];
const ciUpper = sortedDeltas[Math.floor(0.975 * reps)];

// McNemar's test (exact binomial)
const p01 = pairedOutcomes.filter(({ outcomeB, outcomeC }) =>
  outcomeB === 0 && outcomeC === 1).length;
const p10 = pairedOutcomes.filter(({ outcomeB, outcomeC }) =>
  outcomeB === 1 && outcomeC === 0).length;
const nDiscordant = p01 + p10;

const pValue = nDiscordant === 0 ? 1 :
  2 * Math.min(
    binomialCDF(nDiscordant, 0.5, Math.max(p01, p10) - 1),
    binomialCDF(nDiscordant, 0.5, Math.min(p01, p10))
  );

// Output
const results = {
  point_estimate: deltaObserved,
  ci_lower: ciLower,
  ci_upper: ciUpper,
  ci_95: `[${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]`,
  p_value: Math.min(pValue, 1.0),
  n_cases: pairedOutcomes.length,
  discordant_pairs: nDiscordant,
  discordant_p01: p01,
  discordant_p10: p10,
  bootstrap_reps: reps
};

console.log("Bootstrap CI Results:");
console.log(`Point estimate (C - B): ${deltaObserved.toFixed(3)}`);
console.log(`95% CI: [${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]`);
console.log(`Exact p-value (McNemar): ${results.p_value.toFixed(4)}`);
console.log(`Discordant pairs: ${nDiscordant} (B->C: ${p01}, C->B: ${p10})`);

const outputPath = resolve(__dirname, '..', options.output);
writeFileSync(outputPath, JSON.stringify(results, null, 2) + '\n');
console.log(`Results saved to ${outputPath}`);
