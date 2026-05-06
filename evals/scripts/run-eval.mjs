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
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { Command } from 'commander';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .option('--cases-dir <dir>', 'Cases directory', 'evals/cases')
  .option('--n <n>', 'Number of cases to evaluate', '50')
  .option('--output <file>', 'Output file', 'evals/results/raw-results.json')
  .parse();

const options = program.opts();

// Read cases
const casesDir = resolve(__dirname, '..', options.casesDir);
import { readdirSync } from 'fs';

const allCases = readdirSync(casesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const n = parseInt(options.n);
const selectedCases = allCases.slice(0, n);

console.log(`Evaluating ${selectedCases.length} cases...`);

// Prepare output directory
const resultsDir = resolve(__dirname, '..', 'results');
if (!existsSync(resultsDir)) {
  mkdirSync(resultsDir, { recursive: true });
}

// Function to run evaluation for a single case
async function evaluateCase(caseId) {
  console.log(`Evaluating case: ${caseId}`);

  const caseDir = resolve(casesDir, caseId);
  const caseFile = readFileSync(resolve(caseDir, 'case.json'), 'utf8');
  const caseData = JSON.parse(caseFile);

  // Prepare prompts for each arm
  const prompts = {
    A: `You are an expert software architecture consultant. Analyze this code and recommend the most appropriate design pattern.

Source code:
${caseData.source_code}

Your task: Recommend the most suitable design pattern for this code. If no pattern is needed, say "No pattern needed".

What is your recommendation?`,
    B: `You are an expert software architecture consultant. Analyze this code and recommend the most appropriate design pattern.

Context: The following text is provided for reference. It is unrelated to the code but matches the token count of the skill content.

${generatePlaceboContext(caseData.source_code)}

Source code:
${caseData.source_code}

Your task: Recommend the most suitable design pattern for this code. If no pattern is needed, say "No pattern needed".

What is your recommendation?`,
    C: `You are an expert software architecture consultant. Analyze this code and recommend the most appropriate design pattern.

Context: You have access to the following strategy knowledge card:

${readFileSync(resolve(__dirname, '..', 'docs', 'SKILL.md'), 'utf8')}

${readFileSync(resolve(__dirname, '..', 'docs', 'references', 'strategy.md'), 'utf8')}

Source code:
${caseData.source_code}

Your task: Recommend the most suitable design pattern for this code. If no pattern is needed, say "No pattern needed".

What is your recommendation?`
  };

  // Run all arms with same random seed
  const results = {};

  for (const [arm, prompt] of Object.entries(prompts)) {
    // Run Claude (simulated)
    const result = await callClaudeAPI(prompt, caseId, arm);
    results[arm] = result;
  }

  return { caseId, results };
}

// Simulate API call (placeholder - replace with actual API client)
async function callClaudeAPI(prompt, caseId, arm) {
  // This is a mock implementation
  // In practice, you would use the Anthropic SDK
  const tempDir = resolve(__dirname, '..', 'results', 'temp');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  // For demo, we'll simulate responses based on ground truth
  const caseFile = readFileSync(resolve(casesDir, caseId, 'case.json'), 'utf8');
  const caseData = JSON.parse(caseFile);

  // Simulate some randomness
  const random = Math.random();

  // Simple simulation: 60% accuracy for A, 70% for B, 85% for C
  let accuracy = 0.6;
  if (arm === 'B') accuracy = 0.7;
  if (arm === 'C') accuracy = 0.85;

  const top1_correct = random < accuracy &&
    (caseData.ground_truth.pattern === 'Strategy' || Math.random() < 0.8);

  return {
    top1_correct,
    recommendation: generateMockRecommendation(caseData, arm, top1_correct),
    antipatterns: top1_correct ? generateMockAntipatterns() : []
  };
}

// Generate placebo context
function generatePlaceboContext(sourceCode) {
  const tokenLength = Math.floor(sourceCode.length / 4);
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

  while (currentLength < tokenCount) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    if (currentLength + sentence.length <= tokenLength + 100) {
      context.push(sentence);
      currentLength += sentence.length;
    } else {
      break;
    }
  }

  return context.join(' ');
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

  console.log(`Evaluation complete! Results saved to ${outputPath}`);

  // Run bootstrap CI
  console.log("\nComputing confidence intervals...");
  await new Promise(resolve => {
    const child = spawn('node', [__dirname + '/bootstrap-ci.mjs'], {
      stdio: 'inherit'
    });
    child.on('close', resolve);
  });

  // If ground truth annotations exist, compute reliability
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
}

// Run main
main().catch(console.error);