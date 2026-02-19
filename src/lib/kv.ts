/**
 * KV abstraction: uses Vercel KV when available, falls back to local filesystem.
 */
import { kv } from "@vercel/kv";

const USE_KV = !!process.env.KV_REST_API_URL;

// --- Filesystem fallback ---
async function fsGet(key: string): Promise<any> {
  const { readFile } = await import("fs/promises");
  const { join } = await import("path");
  const DATA_DIR = join(process.cwd(), "data", "mt5");
  try {
    if (key === "mt5:latest") {
      const raw = await readFile(join(DATA_DIR, "latest.json"), "utf-8");
      return JSON.parse(raw);
    }
    // mt5:daily:{date}
    const m = key.match(/^mt5:daily:(.+)$/);
    if (m) {
      const raw = await readFile(join(DATA_DIR, `${m[1]}.jsonl`), "utf-8");
      return raw.trim().split("\n").map((l) => JSON.parse(l));
    }
    return null;
  } catch {
    return null;
  }
}

async function fsSet(key: string, value: any): Promise<void> {
  const { writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");
  const DATA_DIR = join(process.cwd(), "data", "mt5");
  await mkdir(DATA_DIR, { recursive: true });

  if (key === "mt5:latest") {
    await writeFile(join(DATA_DIR, "latest.json"), JSON.stringify(value, null, 2));
    return;
  }
  // mt5:daily:{date} — value is the full array; we store as jsonl
  const m = key.match(/^mt5:daily:(.+)$/);
  if (m) {
    const lines = (value as any[]).map((v) => JSON.stringify(v)).join("\n") + "\n";
    await writeFile(join(DATA_DIR, `${m[1]}.jsonl`), lines);
  }
}

// --- Public API ---
export async function kvGet<T = any>(key: string): Promise<T | null> {
  if (USE_KV) return kv.get<T>(key);
  return fsGet(key) as Promise<T | null>;
}

export async function kvSet(key: string, value: any): Promise<void> {
  if (USE_KV) {
    await kv.set(key, value);
    return;
  }
  await fsSet(key, value);
}

/** Append an entry to a daily log stored as a JSON array in KV */
export async function kvAppendDaily(date: string, entry: any): Promise<void> {
  const key = `mt5:daily:${date}`;
  if (USE_KV) {
    const existing = (await kv.get<any[]>(key)) || [];
    existing.push(entry);
    await kv.set(key, existing);
    return;
  }
  // Filesystem: append line
  const { writeFile, mkdir } = await import("fs/promises");
  const { join } = await import("path");
  const DATA_DIR = join(process.cwd(), "data", "mt5");
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, `${date}.jsonl`), JSON.stringify(entry) + "\n", { flag: "a" });
}
