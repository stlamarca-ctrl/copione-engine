import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("mostra il portale e la nuova categoria Testi OCR", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Copione Engine — Archivio mobile<\/title>/i);
  assert.match(html, /I materiali della trasmissione, sempre con te\./);
  assert.match(html, /testi OCR/);
  assert.match(html, /<option value="testi">Testo OCR<\/option>/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("accetta e presenta i testi OCR come categoria distinta", async () => {
  const [page, worker, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(page, /category === "testi"/);
  assert.match(page, /TESTO OCR/);
  assert.match(worker, /\["pdf", "testi", "web", "copioni"\]/);
  assert.match(css, /\.badge\.testi/);
});
