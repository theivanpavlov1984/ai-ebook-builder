/**
 * Simulation of model calls: async, timed, streaming, with failures that can be switched on
 * (?fail=ch2,cover or ?fail=all, or the Demo controls). Each failure fires once, so "Try again" works.
 */

export class SimulatedFailure extends Error {
  constructor(public key: string) {
    super(`Simulated failure: ${key}`);
    this.name = "SimulatedFailure";
  }
}

let pending = new Set<string>();
let failAll = false;
let firedInAllMode = new Set<string>();

export function setFailures(keys: string[]): void {
  failAll = keys.includes("all");
  pending = new Set(keys.filter((k) => k !== "all"));
  firedInAllMode = new Set();
}

export function activeFailures(): string[] {
  return [...(failAll ? ["all"] : []), ...pending];
}

export function failuresFromUrl(search: string): string[] {
  const raw = new URLSearchParams(search).get("fail");
  return raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

function shouldFail(key: string): boolean {
  if (pending.has(key)) {
    pending.delete(key);
    return true;
  }
  if (failAll && !firedInAllMode.has(key)) {
    firedInAllMode.add(key);
    return true;
  }
  return false;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function simulate<T>(key: string, produce: () => T, opts?: { ms?: number }): Promise<T> {
  await wait(opts?.ms ?? 600);
  if (shouldFail(key)) throw new SimulatedFailure(key);
  return produce();
}

/** Streams paragraphs word by word; `onChunk` receives the full text so far. */
export async function streamParagraphs(
  paragraphs: string[],
  onChunk: (text: string) => void,
  opts?: { cps?: number; signal?: { cancelled: boolean } },
): Promise<void> {
  const full = paragraphs.join("\n\n");
  const cps = opts?.cps ?? 900;
  if (!Number.isFinite(cps)) {
    onChunk(full);
    return;
  }
  const tickMs = 40;
  const charsPerTick = Math.max(1, Math.round((cps * tickMs) / 1000));
  let i = 0;
  while (i < full.length) {
    if (opts?.signal?.cancelled) return;
    i = Math.min(full.length, i + charsPerTick);
    const space = full.indexOf(" ", i);
    if (space !== -1 && space - i < 12) i = space;
    onChunk(full.slice(0, i));
    await wait(tickMs);
  }
  onChunk(full);
}
