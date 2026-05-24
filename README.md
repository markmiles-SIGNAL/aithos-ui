# AiTHOS Healthograph — Phase 1

This repository holds the Phase 1 validation materials for the AiTHOS **Healthograph** —
the patient's personalized health signature — and the UI mockup used to brief the build team (Numeral).

> **Status:** Phase 1 validation. Everything here is for planning, process validation, and
> stakeholder review — **not** for live patient use. The patient authorization
> (`CC-AITHOS-LEGAL-003`) remains a counsel-review draft.

---

## What's in here

```
.
├── site/                         ← the deployable mockup (GitHub Pages serves this)
│   ├── index.html                ← interactive, mobile-responsive UI mockup
│   ├── AiTHOS_Healthograph_UI_Mockup.pdf
│   └── .nojekyll                 ← tells GitHub Pages to serve files as-is
├── prototype/
│   └── AiTHOS_Concierge_Dashboard.jsx   ← React tracker prototype (for testing)
├── docs/                         ← Phase 1 documents
│   ├── AiTHOS_Numeral_Build_Brief.docx          ← architecture & module scope
│   ├── AiTHOS_Guided_Walkthrough.docx           ← concierge process + interface spec
│   ├── AiTHOS_Tracker_Concierge_QuickReference.docx
│   ├── AiTHOS_Test_Script.docx                  ← validation test run
│   └── AiTHOS_Records_Request_Melanie_Miles.docx
└── README.md
```

## The mockup

`site/index.html` is a single, self-contained file — the AiTHOS logo and concierge
photo are embedded, so it needs no other assets and works offline. It has two views,
toggled at the top:

- **Patient view** — Welcome (concierge), Healthograph progress, Authorization,
  Records tracker, Health Narrative upload, and Administration.
- **Concierge view** — autonomous onboarding script, progress dashboard, authorization
  creation, records tracker, and a review-before-delivery step.

It is a **visual prototype**: the layout and view toggle work; buttons (create request,
resume script, upload) are illustrative, not wired to a backend.

## The design boundary (carried throughout)

AiTHOS (a secure, HIPAA-appropriate environment) houses every module that touches patient
content. The coordination assistant sits outside that boundary and never holds patient
health information. Subjects are shown by **code** (S01–S07); names and clinical content
live only in the secure record. See `docs/AiTHOS_Numeral_Build_Brief.docx` for the full
architecture and the automation/human-checkpoint boundary.

## Deploying the mockup

See `DEPLOY.md` for step-by-step GitHub Pages and Netlify instructions.

---

*AiTHOS · Sovereign Health · Phase 1 · Confidential. Not legal advice; not for patient use.
Confirm authorization language and data-handling with counsel.*
