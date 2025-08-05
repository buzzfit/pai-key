// app/api/agents/_store.js
/** One in-memory array per running serverless instance. */
export default function store() {
  globalThis.__AGENTS__ ??= [];
  return globalThis.__AGENTS__;
}
