# PMP Study App — Setup Guide

This turns the app into something you install on your phone's home screen, with
a progress tracker that stays in sync across every device you open it on. It
talks to a Google Sheet you already have — **PMP Study Tracker** — through a
small script you paste in once.

Total setup time: about 15 minutes, done once.

Sheet: https://docs.google.com/spreadsheets/d/18BA4O8vuhLXsrA4FdwxLCkzn3rtW9C-YXzr1MMAM9D4/edit

---

## Step 1 — Connect the Sheet as the app's backend

1. Open the **PMP Study Tracker** Google Sheet (link above).
2. Go to **Extensions → Apps Script**. A new tab opens with an empty code editor.
3. Delete anything in the `Code.gs` file that's there by default, and paste in
   the entire contents of the `Code.gs` file included in this package.
4. Near the top of the file, find this line:

   ```
   const SECRET = "CHANGE-THIS-TO-YOUR-OWN-SECRET";
   ```

   Replace `CHANGE-THIS-TO-YOUR-OWN-SECRET` with any password-like string of
   your own choosing (letters/numbers, no spaces). This is what keeps random
   people off your sheet — keep it private, but it doesn't need to be fancy.
   Save the file (Ctrl/Cmd+S).
5. Click **Deploy → New deployment**.
6. Click the gear icon next to "Select type" and choose **Web app**.
7. Fill in:
   - Description: `PMP Study App backend` (anything you like)
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**. The first time, Google will ask you to authorize the
   script — click through the "Advanced" / "Go to (unsafe)" prompts; this is
   just Google being cautious about a script you wrote yourself.
9. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

Keep that URL and the secret from step 4 handy — you need both in Step 2.

---

## Step 2 — Point the app at your Sheet

1. Open `config.js` (included in this package) in any text editor.
2. Fill in the two blanks:

   ```js
   window.PMP_CONFIG = {
     SHEET_API_URL: "https://script.google.com/macros/s/AKfycb.../exec",
     SHEET_API_SECRET: "the-secret-you-set-in-Code.gs",
   };
   ```

3. Save the file.

---

## Step 3 — Host the app so your phone can reach it

The app is a set of static files, so any free static-hosting service works.
GitHub Pages is the easiest if you don't already have a preferred host:

1. Create a free GitHub account if you don't have one (github.com).
2. Create a new repository (e.g. `pmp-study-app`) — public is fine, and free.
3. Upload every file from this package into the repository root:
   `index.html`, `manifest.json`, `sw.js`, `config.js` (with your values
   filled in), `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`.
   (On github.com you can do this with "Add file → Upload files", no git
   command line needed.)
4. In the repository, go to **Settings → Pages**.
5. Under "Build and deployment", set **Source: Deploy from a branch**,
   branch **main**, folder **/ (root)**, then **Save**.
6. GitHub shows you a URL after a minute or two, something like:
   `https://yourusername.github.io/pmp-study-app/`

That URL is your app. Open it in any browser to confirm it loads — you
should see the Study tab with flashcards.

*(If you'd rather use a different free host — Netlify, Vercel, Cloudflare
Pages — the steps are the same idea: upload these files as a static site
and get back a URL. Any of them work equally well.)*

---

## Step 4 — Install it on your phone

**iPhone (Safari):**
1. Open the GitHub Pages URL from Step 3 in Safari.
2. Tap the Share icon (square with an arrow) → **Add to Home Screen** → **Add**.

**Android (Chrome):**
1. Open the URL in Chrome.
2. Tap the ⋮ menu → **Install app** (or **Add to Home screen**) → **Install**.

You'll now have a PMP Study App icon on your home screen that opens full-screen,
like a normal app.

---

## What syncs and what doesn't

- **Flashcard "know it" / "review" tallies** are saved only on the device you
  study on (fast, private, no setup needed).
- **Quiz results, checklist toggles, and hours logged in the Tracker tab**
  are sent to your Google Sheet automatically, so they show up on every device
  where you've completed Steps 1–2 and open the app.
- The **Tracker** tab shows a small status pill (Synced / Offline / Not
  configured) so you always know whether it's talking to the Sheet.
- If you're offline, the app still opens and flashcards/quiz still work —
  tracker updates you make while offline are simply not saved until you're
  back online (there's no offline queue in this version).

## Updating study content later

If you want to add flashcards, quiz questions, or change the formula sheet,
edit the `FLASHCARDS` / `QUIZ` arrays near the top of the `<script>` block in
`index.html`, then re-upload that one file to your GitHub repository (or
whichever host you used). No changes to the Sheet or Apps Script are needed
for content edits.

## Troubleshooting

- **Tracker tab says "Not configured"**: `config.js` still has empty quotes —
  redo Step 2.
- **Tracker tab says "Offline" and never syncs**: double-check the deployment
  in Step 1 is set to "Execute as: Me" / "Who has access: Anyone", and that
  the secret in `config.js` exactly matches the one in `Code.gs`.
- **Changes on your phone don't show up on your laptop**: pull down / reopen
  the Tracker tab on the other device — it fetches on open, not continuously.
- **You change `Code.gs` later**: you must create a **new deployment version**
  (Deploy → Manage deployments → edit → New version) for changes to take
  effect — saving the script alone isn't enough.
