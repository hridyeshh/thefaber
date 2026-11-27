// Contact form → Google Sheet + email. The site's server posts each enquiry here: it becomes one row in the
// "thefaber" sheet and an email to team@thefaber.in.
//
// Set up once, signed in to the Google account that owns the sheet:
// 1. Open the sheet, then Extensions → Apps Script. Replace Code.gs with this file and save.
//    The script stays bound to the sheet, so the sheet's link never goes in this public repo.
// 2. Deploy → New deployment → type "Web app". Execute as: Me. Who has access: Anyone. Deploy, then allow access
//    (Google calls the app unverified because you wrote it: Advanced → Go to the project).
// 3. Copy the web app URL (it ends in /exec) into CONTACT_SHEET_URL in the site's environment
//    (Vercel → Project → Settings → Environment Variables), then redeploy the site.
// After editing this script: Deploy → Manage deployments → edit → Version: New version. The URL stays the same.

const NOTIFY = "team@thefaber.in";

function doPost(e) {
  const row = JSON.parse(e.postData.contents).row; // [name, email or phone, call or meet, needs, message]
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(["Received", "Name", "Email or phone", "Call or Meet", "Needs", "Message"]);
  sheet.appendRow([new Date(), ...row]);
  // The row is saved by now, so a failed email (say, the 100-a-day quota) mustn't make the site ask them to resend.
  try {
    const [name, reach, talk, need, message] = row.map((v) => String(v).replace(/^'/, "")); // undo the formula guard
    const mail = {
      to: NOTIFY,
      name: "thefaber website",
      subject: `${talk} request from ${name} (${need})`,
      body: `${name} asked for a ${talk} about: ${need}.\nReach them at ${reach}\n\n${message}\n\nEvery enquiry: ${book.getUrl()}`,
    };
    if (reach.includes("@")) mail.replyTo = reach; // so Reply goes straight to them
    MailApp.sendEmail(mail);
  } catch (err) {
    console.error("enquiry saved, but the email failed", err);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
