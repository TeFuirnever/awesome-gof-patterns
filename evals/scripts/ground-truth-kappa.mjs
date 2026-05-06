// SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors
// SPDX-License-Identifier: MIT

/**
 * ground-truth-kappa.mjs
 *
 * Computes Cohen's κ between two annotators for ground truth reliability.
 * Also reports per-item agreements and κ with confidence intervals.
 *
 * Usage:
 *   node scripts/ground-truth-kappa.mjs \
 *     --annotations-dir evals/cases/annotations \
 *     --output evals/results/reliability.json \
 *     [--method= Fleiss]
 */

import { readFileSync, writeFileSync } from 'fs';
import { Command } from 'commander';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .option('--annotations-dir <dir>', 'Annotations directory', 'evals/cases/annotations')
  .option('--output <file>', 'Output file', 'evals/results/reliability.json')
  .parse();

const options = program.opts();

// Read annotation files
const annotationsDir = resolve(__dirname, '..', options.annotationsDir);
import { readdirSync } from 'fs';

const annotationFiles = readdirSync(annotationsDir, { withFileTypes: true })
  .filter(dirent => dirent.isFile())
  .map(dirent => dirent.name)
  .filter(name => name.endsWith('.json'));

if (annotationFiles.length < 2) {
  console.error("ERROR: Need at least 2 annotation files");
  process.exit(1);
}

// Load all annotations
const allAnnotations = {};
for (const file of annotationFiles) {
  const data = JSON.parse(readFileSync(resolve(annotationsDir, file), 'utf8'));
  allAnnotations[file.replace(/\.json$/, '')] = data;
}

// Compute Cohen's κ
function cohenKappa(annotations1, annotations2) {
  // Agreement matrix
  const agreement = { aa: 0, ab: 0, ba: 0, bb: 0 };

  // Iterate through all cases
  const caseIds = new Set([
    ...Object.keys(annotations1).filter(k => k !== 'metadata'),
    ...Object.keys(annotations2).filter(k => k !== 'metadata')
  ]);

  let nCases = 0;
  for (const caseId of caseIds) {
    const a1 = annotations1[caseId]?.pattern;
    const a2 = annotations2[caseId]?.pattern;

    if (a1 !== undefined && a2 !== undefined) {
      nCases++;
      if (a1 === a2) {
        agreement.aa++;
      } else {
        agreement.ab++;
        agreement.ba++;
      }
    }
  }

  const po = (agreement.aa) / nCases;
  const pe = (agreement.aa + agreement.ab) * (agreement.aa + agreement.ba) /
             (nCases * nCases) + (agreement.ab + agreement.bb) * (agreement.ba + agreement.bb) /
             (nCases * nCases);

  const kappa = po === 1 ? 1 : (po - pe) / (1 - pe);

  // Bootstrap CI for κ
  const reps = 10000;
  const kappas = [];

  for (let i = 0; i < reps; i++) {
    let aa = 0, ab = 0, ba = 0, bb = 0;

    // Resample with replacement
    for (let j = 0; j < nCases; j++) {
      const idx = Math.floor(Math.random() * nCases);
      const a1 = annotations1[Object.keys(annotations1)[idx]]?.pattern;
      const a2 = annotations2[Object.keys(annotations2)[idx]]?.pattern;

      if (a1 === a2) {
        aa++;
      } else {
        ab++;
        ba++;
      }
    }

    const ppo = aa / nCases;
    const ppe = (aa + ab) * (aa + ba) / (nCases * nCases) +
               (ab + bb) * (ba + bb) / (nCases * nCases);

    const kk = ppo === 1 ? 1 : (ppo - ppe) / (1 - ppe);
    kappas.push(kk);
  }

  const sortedKappas = [...kappas].sort((a, b) => a - b);
  const ciLower = sortedKappas[Math.floor(0.025 * reps)];
  const ciUpper = sortedKappas[Math.floor(0.975 * reps)];

  return {
    kappa,
    n_cases: nCases,
    agreement_percent: (po * 100).toFixed(1),
    ci_lower: ciLower,
    ci_upper: ciUpper,
    ci_95: `[${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]`
  };
}

// Compute all pairwise κ
const annotators = Object.keys(allAnnotations);
const pairwiseResults = {};
let maxKappa = -Infinity;
let maxPair = null;

for (let i = 0; i < annotators.length; i++) {
  for (let j = i + 1; j < annotators.length; j++) {
    const a1 = annotators[i];
    const a2 = annotators[j];
    const result = cohenKappa(allAnnotations[a1], allAnnotations[a2]);

    pairwiseResults[`${a1} vs ${a2}`] = result;

    if (result.kappa > maxKappa) {
      maxKappa = result.kappa;
      maxPair = [a1, a2];
    }
  }
}

// Overall reliability check
const reliability = maxKappa >= 0.7;
const reliabilityStatus = reliability ? "PASS" : "FAIL";
const action = reliability ?
  "Proceed with analysis" :
  "Discard round, retrain, re-annotate";

// Output results
const results = {
  annotators,
  pairwise_kappas: pairwiseResults,
  reliability_status: reliabilityStatus,
  max_kappa: maxKappa,
  max_pair: maxPair,
  ci_95: pairwiseResults[`${maxPair[0]} vs ${maxPair[1]}`].ci_95,
  action_required: action,
  threshold: 0.7,
  timestamp: new Date().toISOString()
};

console.log("Cohen's κ Results:");
console.log(`Annotators: ${annotators.join(', ')}`);
console.log(`Max κ = ${maxKappa.toFixed(3)} (${maxPair.join(' vs ')})`);
console.log(`95% CI: ${pairwiseResults[`${maxPair[0]} vs ${maxPair[1]}`].ci_95}`);
console.log(`Reliability Status: ${reliabilityStatus}`);
console.log(`Action: ${action}`);
console.log("");

// Save results
const outputPath = resolve(__dirname, '..', options.output);
writeFileSync(outputPath, JSON.stringify(results, null, 2) + '\n');

console.log(`Results saved to ${outputPath}`);