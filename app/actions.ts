"use server";

import { parseContact, toRow } from "@/lib/contact";
import { EMAIL, PHONE } from "@/lib/content";

export type SendState = { status: "idle" | "sent" | "error"; message?: string };

const FALLBACK = `Couldn't send that right now. Call ${PHONE} or email ${EMAIL}.`;

// Each enquiry lands as a row in our Google Sheet and as an email to team@, through the Apps Script in
// scripts/contact-sheet.gs.
export async function sendContact(_prev: SendState, form: FormData): Promise<SendState> {
  const parsed = parseContact(form);
  if ("spam" in parsed) return { status: "sent" }; // don't tell bots they were caught
  if (!parsed.ok) return { status: "error", message: parsed.error };

  const url = process.env.CONTACT_SHEET_URL;
  if (!url) {
    console.error("contact: CONTACT_SHEET_URL is not set");
    return { status: "error", message: FALLBACK };
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ row: toRow(parsed.data) }),
      signal: AbortSignal.timeout(10_000),
    });
    // Apps Script answers errors with a 200 HTML page, so only its own {"ok":true} counts.
    const out = await res.json().catch(() => null);
    if (out?.ok !== true) throw new Error(`sheet answered ${res.status}`);
  } catch (err) {
    console.error("contact: the sheet didn't take the enquiry", err);
    return { status: "error", message: FALLBACK };
  }
  return { status: "sent" };
}
