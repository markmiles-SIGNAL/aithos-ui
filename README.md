# AiTHOS Healthograph — Phase 1

Phase 1 validation materials for the AiTHOS **Healthograph** — the patient's personalized
health signature — plus the UI mockup used to brief the build team (Numeral).

> **Status:** Phase 1 validation. For planning, process validation, and stakeholder review —
> **not** for live patient use. The patient authorization (`CC-AITHOS-LEGAL-003`) remains a
> counsel-review draft.

## Go live in 1 minute (GitHub Pages)

`index.html` is at the **root** of this repo on purpose, so GitHub Pages finds it with no
fuss:

1. Push/upload this repo to GitHub. **The repo must be public** for free GitHub Pages.
2. Go to **Settings → Pages**.
3. Under **Source**, pick **Deploy from a branch**.
4. Branch: **`main`**, folder: **`/ (root)`** → **Save**.
5. Wait ~1 minute, then refresh. Your link appears at the top:
   `https://<your-username>.github.io/<repo-name>/`
6. Open it on your phone — it's responsive.

If no link shows up, see `DEPLOY.md` → "If the link doesn't appear."

## Contents

```
index.html            ← the interactive, mobile-responsive UI mockup (the live page)
AiTHOS_Healthograph_UI_Mockup.pdf
.nojekyll             ← makes Pages serve the HTML as-is
prototype/
  AiTHOS_Concierge_Dashboard.jsx     ← React tracker prototype
docs/
  AiTHOS_Numeral_Build_Brief.docx    ← architecture & module scope
  AiTHOS_Guided_Walkthrough.docx     ← concierge process + interface spec
  AiTHOS_Tracker_Concierge_QuickReference.docx
  AiTHOS_Test_Script.docx
  AiTHOS_Records_Request_Melanie_Miles.docx
```

## The mockup

Single self-contained file — logo and concierge photo are embedded, works offline. Two
views toggle at the top: **Patient** (Welcome, Healthograph progress, Authorization, Records
tracker, Health Narrative upload, Administration) and **Concierge** (autonomous onboarding
script, progress dashboard, authorization creation, records tracker, review-before-delivery).

It's a **visual prototype** — the layout and toggle work; action buttons are illustrative,
not wired to a backend. The working platform is Numeral's build.

## The design boundary

AiTHOS (secure environment) houses every module touching patient content; the coordination
assistant sits outside it and never holds patient health information. Subjects appear by
**code** (S01–S07); names and clinical content live only in the secure record. Full
architecture in `docs/AiTHOS_Numeral_Build_Brief.docx`.

---

*AiTHOS · Sovereign Health · Phase 1 · Confidential. Not legal advice; not for patient use.*
