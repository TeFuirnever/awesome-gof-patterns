// SPDX-License-Identifier: MIT
/**
 * power-analysis.mjs
 *
 * Computes the minimum sample size required to detect a given effect with
 * the preregistered alpha and power, for both:
 *   - Two-proportion z (independent samples, conservative upper bound)
 *   - McNemar's test (paired binary outcomes, our actual analysis)
 *
 * For our 3-arm design, each case is run through all three arms, so the
 * relevant test is McNemar's on paired (B, C) outcomes per case.
 *
 * Usage:
 *   node evals/scripts/power-analysis.mjs \
 *     [--p1=0.50 --p2=0.65 --alpha=0.0167 --power=0.80] \
 *     [--discordant=0.40]   # estimated proportion of discordant pairs
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, parseFloat(v)];
  }),
);

const p1 = args.p1 ?? 0.50;
const p2 = args.p2 ?? 0.65;
const alpha = args.alpha ?? 0.0167;
const power = args.power ?? 0.80;
// If unspecified, assume B and C are independent (worst case for paired N):
const defaultDiscordant = p1 * (1 - p2) + p2 * (1 - p1);
const discordantTotal = args.discordant ?? defaultDiscordant;

const PREREGISTERED_N = 50;

function invNorm(p) {
  if (p <= 0 || p >= 1) throw new Error("invNorm: p must be in (0,1)");
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969,
             138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887,
             66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184,
             -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143,
             3.75440866190742];
  const pl = 0.02425, ph = 1 - pl;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
           ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
  }
  if (p <= ph) {
    q = p - 0.5; r = q * q;
    return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5])*q /
           (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
          ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
}

const zAlpha = invNorm(1 - alpha / 2);
const zBeta = invNorm(power);

// 1. Two-proportion z (independent samples)
const pooled = (p1 + p2) / 2;
const numIndep = (zAlpha * Math.sqrt(2 * pooled * (1 - pooled)) +
                  zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2;
const nIndep = Math.ceil(numIndep / (p2 - p1) ** 2);

// 2. McNemar (paired binary)
// Decompose discordant total into p10 and p01 such that p10 - p01 = p2 - p1
const delta = p2 - p1;
const p10 = (discordantTotal + delta) / 2;
const p01 = (discordantTotal - delta) / 2;
const numMcN = (zAlpha * Math.sqrt(discordantTotal) +
                zBeta * Math.sqrt(discordantTotal - delta * delta)) ** 2;
const nMcN = Math.ceil(numMcN / (delta * delta));

console.log("== Power analysis ==");
console.log(`p1 (B baseline)        = ${p1}`);
console.log(`p2 (C experimental)    = ${p2}`);
console.log(`Δ                      = ${delta}`);
console.log(`alpha (per metric)     = ${alpha} (Bonferroni for 3 metrics)`);
console.log(`power                  = ${power}`);
console.log(`discordant proportion  = ${discordantTotal.toFixed(3)} ` +
            `(p10=${p10.toFixed(3)}, p01=${p01.toFixed(3)})`);
console.log(`z_alpha                = ${zAlpha.toFixed(4)}`);
console.log(`z_beta                 = ${zBeta.toFixed(4)}`);
console.log("");
console.log(`Two-proportion z N     = ${nIndep} per arm (independent samples)`);
console.log(`McNemar N              = ${nMcN} cases (paired)`);
console.log("");
console.log(`Preregistered N        = ${PREREGISTERED_N}`);

const required = nMcN; // paired design is what we actually run
if (PREREGISTERED_N >= required) {
  console.log(`PASS: ${PREREGISTERED_N} ≥ ${required} required cases`);
  process.exit(0);
}

const achievablePower = (n) => {
  const z = (delta * Math.sqrt(n) - zAlpha * Math.sqrt(discordantTotal)) /
            Math.sqrt(discordantTotal - delta * delta);
  // Approximate normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const phi = 0.3989423 * Math.exp(-z * z / 2) *
              (t * (0.319381530 + t * (-0.356563782 + t *
              (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));
  return z >= 0 ? 1 - phi : phi;
};
const realizedPower = achievablePower(PREREGISTERED_N);

console.error(`UNDERSIZED: preregistered N=${PREREGISTERED_N} below required ${required}.`);
console.error(`Realized power at N=${PREREGISTERED_N}: ${(realizedPower * 100).toFixed(1)}%`);
console.error("");
console.error("Options (must be chosen and documented in PROTOCOL.md before run):");
console.error("  (a) Increase N to required minimum");
console.error("  (b) Increase preregistered Δ (smaller effects deemed not worth detecting)");
console.error("  (c) Drop Bonferroni and pick a single primary metric (raises α to 0.05)");
console.error("  (d) Accept reduced power and report wide CIs honestly — borderline runs ");
console.error("      will trigger an extension protocol (see PROTOCOL.md §12)");
process.exit(1);
