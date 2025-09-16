# Slack Clone (React + Vite + Tailwind + Firebase)
**Option A (Tailwind)** starter.

## Quick Start
```bash
npm i
npm i -D tailwindcss postcss autoprefixer @vitejs/plugin-react
npm i lucide-react react-router-dom firebase
cp .env.example .env.local  # fill your Firebase web app keys
npm run dev
```

## Firestore Rules (Console → Rules → Publish)
```
// Example rules — tighten as needed
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }

    match /channels/{channelId} {
      allow read, create: if isSignedIn();
      match /messages/{messageId} { allow read, create: if isSignedIn(); }
    }
    match /dms/{pairId} {
      allow read, create: if isSignedIn();
      match /messages/{messageId} { allow read, create: if isSignedIn(); }
    }
    match /users/{uid} { allow read, write: if isSignedIn(); }
    match /typing/{uid} { allow read, write: if isSignedIn(); }

    // Temporary permissive rule (place LAST). Remove after your demo.
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 10, 15);
    }
  }
}
```

## Notes
- First run will show empty channels unless you create one. You can create `general` channel from the sidebar.
- Desktop notifications require allowing permission in the browser.
- Typing indicator is based on a `typing` collection with TTL simulated by `until` timestamp checked on the client.
