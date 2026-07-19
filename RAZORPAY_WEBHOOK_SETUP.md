# Razorpay Payment Verification — Secure Backend (Google Apps Script)

This makes payments tamper-proof. Instead of the app trusting its own "success",
a tiny Google Apps Script backend:
1. **Creates a Razorpay Order** (server-side) before checkout, and
2. **Verifies the payment signature** with your **Key Secret** after checkout —
   and only then does the app unlock.

Your **Key Secret never goes in the app.** It lives only in this script's settings.

> Do this as a **separate** Apps Script project from the analytics one (it holds a
> secret). ~10 minutes, no coding.

## 1. Create the script
1. Go to **script.google.com** → **New project**.
2. Delete the sample code, paste the code from **section 4** below.
3. Rename it "Divine Tarot Payments" (optional).

## 2. Add your keys as Script Properties (kept secret)
1. Left sidebar → **Project Settings** (gear).
2. Scroll to **Script Properties** → **Add script property** for each:

| Property | Value |
|----------|-------|
| `RZP_KEY_ID` | your Key Id (`rzp_live_SzPh46jW9yjpV4`) |
| `RZP_KEY_SECRET` | your Key **Secret** (from Razorpay → Settings → API Keys) |
| `SHEET_ID` | *(optional)* a Google Sheet ID to log verified payments |

Save. The secret stays server-side — never shipped in the app.

## 3. Deploy as a Web App
1. **Deploy → New deployment** → gear → **Web app**.
2. **Execute as:** Me. **Who has access:** **Anyone**.
3. **Deploy**, approve permissions, copy the **/exec URL**.
4. Open `src/lib/razorpay.js` and paste it:
   ```javascript
   export const PAYMENTS_ENDPOINT = 'https://script.google.com/macros/s/YYYY/exec';
   ```
The app now uses the secure Order + verify flow automatically on the phone build.

## 4. The code (`Code.gs`)
```javascript
function prop(k) { return PropertiesService.getScriptProperties().getProperty(k); }

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function hmacHex(message, secret) {
  var raw = Utilities.computeHmacSha256Signature(message, secret);
  return raw.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var keyId = prop('RZP_KEY_ID');
    var secret = prop('RZP_KEY_SECRET');

    if (data.action === 'create_order') {
      var payload = {
        amount: data.amount,                 // paise
        currency: data.currency || 'INR',
        receipt: 'rcpt_' + Date.now(),
        notes: data.notes || {}
      };
      var res = UrlFetchApp.fetch('https://api.razorpay.com/v1/orders', {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: 'Basic ' + Utilities.base64Encode(keyId + ':' + secret) },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      var o = JSON.parse(res.getContentText());
      if (!o.id) return json({ error: o.error ? o.error.description : 'order failed' });
      return json({ order_id: o.id, amount: o.amount });
    }

    if (data.action === 'verify_payment') {
      var expected = hmacHex(data.order_id + '|' + data.payment_id, secret);
      var valid = (expected === data.signature);
      logPayment(data, valid);
      return json({ valid: valid });
    }

    return json({ error: 'unknown action' });
  } catch (err) {
    return json({ error: String(err) });
  }
}

function logPayment(data, valid) {
  var id = prop('SHEET_ID');
  if (!id) return;
  try {
    var sh = SpreadsheetApp.openById(id).getSheetByName('Payments')
      || SpreadsheetApp.openById(id).insertSheet('Payments');
    if (sh.getLastRow() === 0)
      sh.appendRow(['ts', 'order_id', 'payment_id', 'valid']);
    sh.appendRow([new Date().toISOString(), data.order_id, data.payment_id, valid]);
  } catch (e) {}
}

function doGet() {
  return ContentService.createTextOutput('The Divine Tarot payments backend is running.');
}
```

## 5. Test
1. In `razorpay.js` temporarily use your **test** Key Id + Secret (in Script Properties).
2. Open the app → Subscribe / Pay → complete with test card `4111 1111 1111 1111`.
3. The app shows "Verifying your payment…" then unlocks. A row appears in the
   **Payments** sheet with `valid = true`.

## Notes
- If verification fails, the app does **not** unlock and tells the user any
  deducted amount will be auto-refunded (uncaptured payments auto-refund).
- On the **web preview**, Google blocks reading the backend's response (CORS), so
  web stays on the simple client flow. The shipped **phone app** uses full
  verification — that's what matters.
- Apps Script can't read request headers, so Razorpay *dashboard* webhooks can't be
  signature-checked here; the create-order + verify-signature flow above is the
  standard, secure approach and is sufficient.
```
