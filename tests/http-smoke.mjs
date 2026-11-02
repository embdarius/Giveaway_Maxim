// Read-only smoke checks against the local preview. No valid entry is submitted.
import assert from "node:assert/strict";

const base = "http://127.0.0.1:3000";
const home = await fetch(base);
assert.equal(home.status, 200);
assert.equal(home.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.headers.get("x-frame-options"), "DENY");
const html = await home.text();
assert.match(html, /Un eveniment/);
assert.match(html, /name="lastName"/);
assert.doesNotMatch(html, /SUPABASE_SECRET_KEY|RATE_LIMIT_SECRET/);

async function expectPost(body, headers, expected) {
  const response = await fetch(`${base}/api/entries`, { method: "POST", headers, body });
  assert.equal(response.status, expected);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).ok, false);
}

await expectPost("{}", { "Content-Type": "text/plain" }, 415);
await expectPost("{}", { "Content-Type": "application/json", Origin: "https://example.invalid" }, 403);
await expectPost("not-json", { "Content-Type": "application/json" }, 400);
await expectPost(JSON.stringify({ value: "x".repeat(9000) }), { "Content-Type": "application/json" }, 413);
const unavailable = await fetch(`${base}/api/entries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
assert.ok([400, 503].includes(unavailable.status));
assert.equal((await unavailable.json()).ok, false);
const sameOrigin = await fetch(`${base}/api/entries`, { method: "POST", headers: { "Content-Type": "application/json", Origin: base }, body: "{}" });
assert.ok([400, 503].includes(sameOrigin.status), "Same-origin browser request must not be rejected as cross-origin");
for (const route of ["/regulament", "/confidentialitate"]) {
  const response = await fetch(`${base}${route}`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /La MAXIM/);
}
assert.equal((await fetch(`${base}/page-that-does-not-exist`)).status, 404);
console.log("HTTP smoke checks passed: homepage, headers, body limit, origin, content type, JSON, configuration, legal pages, 404.");
