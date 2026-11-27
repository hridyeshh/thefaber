import assert from "node:assert/strict";
import test from "node:test";
import { parseContact, toRow } from "./contact.ts";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};
const good = {
  name: "Asha",
  reach: "asha@example.com",
  talk: "Google Meet" as const,
  need: "A website" as const,
  message: "A site for my bakery.",
};

test("accepts an enquiry with an email or a phone number", () => {
  assert.deepEqual(parseContact(form(good)), { ok: true, data: good });
  const phone = parseContact(form({ ...good, reach: "+91 98765 43210", talk: "Phone call" }));
  assert.ok("ok" in phone && phone.ok);
});

test("rejects what it can't reply to or doesn't know", () => {
  for (const bad of [{ reach: "call me" }, { talk: "Carrier pigeon" }, { need: "A yacht" }, { message: "hi" }, { name: "" }]) {
    const r = parseContact(form({ ...good, ...bad }));
    assert.ok("ok" in r && !r.ok, JSON.stringify(bad));
  }
});

test("keeps sheet cells as text, never formulas", () => {
  const row = toRow({ ...good, name: '=IMPORTXML("http://x.example")', reach: "+91 98765 43210" });
  assert.deepEqual(row, [`'=IMPORTXML("http://x.example")`, "'+91 98765 43210", "Google Meet", "A website", "A site for my bakery."]);
});

test("flags the honeypot as spam", () => {
  assert.deepEqual(parseContact(form({ ...good, company_url: "http://spam.example" })), { spam: true });
});
