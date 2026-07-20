# Lock Down Your Firestore Database (2 minutes)

Right now your database may be in **test mode** (open to anyone) or the default
(locked). These rules make sure each signed-in user can read/write **only their own
profile** — nobody can see or change anyone else's data.

## Apply the rules
1. Go to **console.firebase.google.com** → your **the-divine-tarot** project.
2. **Build → Firestore Database → Rules** tab.
3. Delete what's there and paste the contents of **`firestore.rules`** (in your project
   folder), or the block below:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
4. Click **Publish**.

## What this does
- A logged-in user can read/write `users/<their-own-uid>` — their profile. ✅
- They cannot read or write anyone else's profile, or any other collection. 🔒
- Requests with no login are rejected.

## If you add features later
When you add new collections (e.g. `readings`, `orders`, `courses`), you'll add a
matching `match` block with appropriate `allow` conditions. Tell me the collection and
who should access it, and I'll write the rule. Until then, the catch-all `if false`
keeps everything else safe.

> Note: your app writes profiles to `users/{uid}` and reads the signed-in user's own
> doc, so these rules fit the current app exactly. If you ever see "Missing or
> insufficient permissions" in the app, it means a read/write doesn't match a rule —
> send me the details and I'll adjust.
