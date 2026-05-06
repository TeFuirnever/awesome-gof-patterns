// SPDX-FileCopyrightText: 2026 awesome-gof-patterns contributors
// SPDX-License-Identifier: MIT

/**
 * run-eval.mjs
 *
 * Runs the full evaluation protocol on N cases, extracting outcomes for all
 * three arms (A, B, C) and saving raw results.
 *
 * Usage:
 *   node scripts/run-eval.mjs \
 *     --cases-dir evals/cases \
 *     [--n=50] \
 *     [--output evals/results/raw-results.json]
 *
 * NOTE: The actual LLM API integration is a TODO. The current implementation
 * validates the case structure and produces a skeleton results file.
 * Replace callClaudeAPI() with real Anthropic SDK calls for production use.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Command } from 'commander';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..', '..');
const program = new Command();

program
  .option('--cases-dir <dir>', 'Cases directory (relative to evals/)', 'cases')
  .option('--n <n>', 'Number of cases to evaluate', '50')
  .option('--output <file>', 'Output file (relative to evals/)', 'results/raw-results.json')
  .parse();

const options = program.opts();

// Read cases (__dirname/.. = evals/)
const casesDir = resolve(__dirname, '..', options.casesDir);

const allCases = readdirSync(casesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .filter(name => name !== 'annotations')
  .sort();

const n = parseInt(options.n);
const selectedCases = allCases.slice(0, n);

console.log(`Evaluating ${selectedCases.length} cases...`);

// Prepare output directory
const resultsDir = resolve(__dirname, '..', 'results');
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

// Load skill content for arm C (progressive loading: hub + pattern-specific reference)
function loadSkillContext(patternName) {
  const skillPath = resolve(projectRoot, 'pattern-diagnose', 'SKILL.md');
  const refPath = resolve(projectRoot, 'pattern-diagnose', 'references', `${patternName.toLowerCase()}.md`);

  let context = '';
  if (existsSync(skillPath)) {
    context += readFileSync(skillPath, 'utf8');
  }
  if (existsSync(refPath)) {
    context += '\n\n' + readFileSync(refPath, 'utf8');
  }
  return context;
}

// Generate placebo context (token-matched unrelated text)
function generatePlaceboContext(tokenTarget) {
  const sentences = [
    "Preheat oven to 350°F (175°C).",
    "Mix flour, sugar, and baking powder in a large bowl.",
    "Add eggs and milk gradually.",
    "Bake for 30 minutes until golden brown.",
    "Cool before serving.",
    "Chop vegetables into small pieces.",
    "Season with salt and pepper to taste.",
    "Sauté onions until translucent.",
    "Add tomatoes and cook for 10 minutes.",
    "Serve hot with fresh herbs.",
    "Marinate meat overnight for best results.",
    "Grill over medium heat for 15 minutes.",
    "Add herbs during the last minute of cooking.",
    "Let rest for 5 minutes before cutting.",
    "Garnish with lemon wedges."
  ];

  const context = [];
  let currentLength = 0;

  while (currentLength < tokenTarget * 4) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    context.push(sentence);
    currentLength += sentence.length;
  }

  return context.join(' ');
}

// Build prompts for each arm
function buildPrompts(caseData) {
  const patternName = caseData.pattern || 'strategy';
  const skillContext = loadSkillContext(patternName);
  const tokenEstimate = Math.floor(skillContext.length / 4);
  const placebo = generatePlaceboContext(tokenEstimate);

  const basePrompt = `You are an expert software architecture consultant. Analyze this code and recommend the most appropriate GoF design pattern.

Source code:
${caseData.source_code}

Your task: Recommend the most suitable design pattern for this code. If no pattern is needed, say "No pattern needed".

What is your recommendation? Include:
1. The pattern name (or "No pattern needed")
2. A brief rationale (1-2 sentences)
3. Any applicable anti-patterns (when NOT to apply this pattern)`;

  return {
    A: basePrompt,
    B: `You are an expert software architecture consultant. Analyze this code and recommend the most appropriate GoF design pattern.

Context: The following text is provided for reference. It is unrelated to the code but matches the token count of the skill content.

${placebo}

Source code:
${caseData.source_code}

Your task: Recommend the most suitable design pattern for this code. If no pattern is needed, say "No pattern needed".

What is your recommendation? Include:
1. The pattern name (or "No pattern needed")
2. A brief rationale (1-2 sentences)
3. Any applicable anti-patterns (when NOT to apply this pattern)`,
    C: `You are an expert software architecture consultant. Analyze this code and recommend the most appropriate GoF design pattern.

Context: You have access to the following pattern-diagnose skill knowledge:

${skillContext}

Source code:
${caseData.source_code}

Your task: Recommend the most suitable design pattern for this code. If no pattern is needed, say "No pattern needed".

What is your recommendation? Include:
1. The pattern name (or "No pattern needed")
2. A brief rationale (1-2 sentences)
3. Any applicable anti-patterns (when NOT to apply this pattern)`
  };
}

/**
 * TODO: Replace this with real Anthropic SDK calls.
 *
 * Production implementation should:
 * 1. Use the Anthropic SDK (or HTTP API) to call Claude
 * 2. Use temperature=0 and a fixed seed per case
 * 3. Run 5 independent calls per arm for self-consistency
 * 4. Use majority vote for the final answer
 * 5. Parse the response to extract pattern name, anti-patterns, and rationale
 */
async function callClaudeAPI(prompt, caseId, arm) {
  // Placeholder: read case ground truth for validation structure only
  const caseFile = readFileSync(resolve(casesDir, caseId, 'case.json'), 'utf8');
  const caseData = JSON.parse(caseFile);

  console.log(`  [${arm}] ${caseId} - SKIPPED (no API key configured)`);

  return {
    top1_correct: null,
    recommendation: null,
    antipatterns: [],
    note: 'Placeholder result — integrate Anthropic SDK for production use'
  };
}

// Evaluate a single case
async function evaluateCase(caseId) {
  console.log(`Evaluating case: ${caseId}`);

  const caseFile = readFileSync(resolve(casesDir, caseId, 'case.json'), 'utf8');
  const caseData = JSON.parse(caseFile);

  const prompts = buildPrompts(caseData);
  const results = {};

  for (const [arm, prompt] of Object.entries(prompts)) {
    results[arm] = await callClaudeAPI(prompt, caseId, arm);
  }

  return { caseId, results };
}

// Main execution
async function main() {
  const allResults = {};

  for (const caseId of selectedCases) {
    const result = await evaluateCase(caseId);
    allResults[caseId] = result.results;
  }

  // Save raw results
  const outputPath = resolve(__dirname, '..', options.output);
  writeFileSync(outputPath, JSON.stringify(allResults, null, 2) + '\n');

  console.log(`\nEvaluation complete! Results saved to ${outputPath}`);
  console.log('NOTE: Results are placeholders. Integrate Anthropic SDK for real evaluation.');

  // Run bootstrap CI if we have real results
  const hasRealResults = Object.values(allResults).some(
    arms => arms.C?.top1_correct !== null
  );

  if (hasRealResults) {
    console.log("\nComputing confidence intervals...");
    await new Promise(resolve => {
      const child = spawn('node', [__dirname + '/bootstrap-ci.mjs'], {
        stdio: 'inherit'
      });
      child.on('close', resolve);
    });

    // Compute annotation reliability if available
    const annotationsDir = resolve(__dirname, '..', 'cases', 'annotations');
    if (existsSync(annotationsDir)) {
      console.log("\nComputing annotation reliability...");
      await new Promise(resolve => {
        const child = spawn('node', [__dirname + '/ground-truth-kappa.mjs'], {
          stdio: 'inherit'
        });
        child.on('close', resolve);
      });
    }
  } else {
    console.log("\nSkipping bootstrap CI (no real results to analyze).");
  }
}

main().catch(console.error);
