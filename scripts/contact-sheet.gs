// Contact form → Google Sheet. The site's server posts each enquiry here; it becomes one row.
//
// Set up once:
// 1. Open the sheet, then Extensions → Apps Script. Replace Code.gs with this file and save.
// 2. Deploy → New deployment → type "Web app". Execute as: Me. Who has access: Anyone. Deploy and allow access.
// 3. Copy the web app URL (it ends in /exec) into CONTACT_SHEET_URL in the site's environment
//    (Vercel → Project → Settings → Environment Variables), then redeploy the site.
// After editing this script: Deploy → Manage deployments → edit → Version: New version. The URL stays the same.

const NOTIFY = ""; // an email address to also get each enquiry in your inbox; leave empty for none

function doPost(e) {
  const row = JSON.parse(e.postData.contents).row; // [name, email or phone, needs, message]
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(["Received", "Name", "Email or phone", "Needs", "Message"]);
  sheet.appendRow([new Date(), ...row]);
  if (NOTIFY) MailApp.sendEmail(NOTIFY, `New enquiry: ${row[2]} from ${row[0]}`, row.join("\n\n"));
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
