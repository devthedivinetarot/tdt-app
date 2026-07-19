# Session Logging → Google Sheet — Setup (10 minutes, no coding)

The app can log each app-open to your Google Sheet:
**https://docs.google.com/spreadsheets/d/1fT1aCms-fBaqzvHh14iNVKbOpeuuFP0w8WOWFlatwmo/edit**

It records: time, install id, platform, signed-in user (uid / name / email / phone),
device (brand, manufacturer, model, OS + version, app version/build), and — **only if
the user turns on location sharing and grants OS permission** — city / region / country / lat / lng.

Google Sheets can't be written to directly from an app without credentials, so we use a
tiny **Google Apps Script Web App** as the bridge. Do this once:

## 1. Open the script editor
1. Open your sheet (link above).
2. Menu: **Extensions → Apps Script**.
3. Delete any sample code in `Code.gs`.

## 2. Paste this code
```javascript
var SHEET_ID = '1fT1aCms-fBaqzvHh14iNVKbOpeuuFP0w8WOWFlatwmo';
var SHEET_NAME = 'Logs';
var HEADERS = ['ts','installId','platform','uid','name','email','phone','brand',
  'manufacturer','model','osName','osVersion','appVersion','build',
  'lat','lng','city','region','country'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    sh.appendRow(HEADERS.map(function (h) { return data[h] != null ? data[h] : ''; }));
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('The Divine Tarot logger is running.');
}
```

## 3. Deploy as a Web App
1. Click **Deploy → New deployment**.
2. Gear icon → **Web app**.
3. **Execute as:** Me. **Who has access:** **Anyone**.
4. **Deploy** → approve the permissions prompt (choose your Google account → Advanced → Allow).
5. Copy the **Web app URL** — it ends in `/exec`.

## 4. Put the URL in the app
Open `src/lib/analytics.js` and paste the URL into:
```javascript
export const LOG_ENDPOINT = 'https://script.google.com/macros/s/XXXXX/exec';
```
Save. Done — the next app-open writes a row.

## Test it
Paste your `/exec` URL in a browser: you should see *"The Divine Tarot logger is running."*
Then open the app; a new row appears in the **Logs** tab within a few seconds.

## Privacy notes (important)
- **Location is opt-in.** It's only collected after the user enables it in **Profile →
  Privacy** and grants the OS location permission. Never collected silently.
- Users can **opt out of all logging** from the same Profile section.
- Because you collect personal + location data, add a short **privacy policy** (required by
  the Play Store and App Store) explaining what you collect and why. I can draft one for you.
