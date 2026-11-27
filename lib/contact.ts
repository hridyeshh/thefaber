// Validates the contact form at the trust boundary (called by the server action).

export const TALK = ["Phone call", "Google Meet"] as const;
export const NEEDS = ["A website", "Branding", "Website + branding", "Something else"] as const;
export type Talk = (typeof TALK)[number];
export type Need = (typeof NEEDS)[number];
export type Contact = { name: string; reach: string; talk: Talk; need: Need; message: string };
export type Parsed = { ok: true; data: Contact } | { ok: false; error: string } | { spam: true };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{8,20}$/;

export function parseContact(form: FormData): Parsed {
  const get = (key: string) => String(form.get(key) ?? "").trim();
  if (get("company_url")) return { spam: true }; // honeypot: hidden from people, filled by bots
  const name = get("name");
  const reach = get("reach");
  const talk = get("talk");
  const need = get("need");
  const message = get("message");
  if (!name || name.length > 80) return { ok: false, error: "Tell us your name." };
  if (reach.length > 120 || !(EMAIL.test(reach) || PHONE.test(reach)))
    return { ok: false, error: "Add an email or phone number we can reply to." };
  if (!TALK.includes(talk as Talk)) return { ok: false, error: "Pick a call or a Google Meet." };
  if (!NEEDS.includes(need as Need)) return { ok: false, error: "Pick what you need." };
  if (message.length < 10) return { ok: false, error: "A line or two about the project, please." };
  if (message.length > 2000) return { ok: false, error: "Keep it under 2000 characters." };
  return { ok: true, data: { name, reach, talk: talk as Talk, need: need as Need, message } };
}

/**
 * The enquiry as a sheet row, in the form's order. Sheets runs a cell starting with = + - @ as a formula
 * (and phone numbers start with +), so those get a leading ' to stay plain text.
 */
export const toRow = (c: Contact) =>
  [c.name, c.reach, c.talk, c.need, c.message].map((v) => (/^[=+\-@]/.test(v) ? `'${v}` : v));
