// app/api/agents/_store.js
/**
 * Returns the single in-memory array that lives as long as
 * this serverless instance. Equivalent to a tiny global DB.
 */
export default function store() {
  globalThis.__AGENTS__ ??= [];
  return globalThis.__AGENTS__;
}
