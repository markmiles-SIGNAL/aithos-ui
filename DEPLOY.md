# Deploying the AiTHOS mockup

The mockup is a single self-contained file (`site/index.html`). Two easy ways to get a
live, mobile-navigable link.

---

## Option A — GitHub Pages (keeps it with your other AiTHOS pages)

1. Create a new repository on GitHub (e.g. `aithos-healthograph-mockup`), or use an existing one.
2. Upload the contents of this folder (drag the files into GitHub's web uploader, or push with git — see below).
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set **Branch** to `main` and the folder to **`/site`**, then **Save**.
   - (If `/site` isn't offered as a folder option, set the folder to `/docs` instead and
     move `index.html` there — or use the root and move `index.html` to the top level.)
6. Wait ~1 minute. Your live link appears at the top of the Pages settings, like:
   `https://<your-username>.github.io/aithos-healthograph-mockup/`
7. Open it on your phone — it's responsive.

### Pushing with git (if you prefer the command line)

```bash
git init
git add .
git commit -m "AiTHOS Healthograph Phase 1 — mockup and docs"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then do steps 3–6 above.

> The `site/.nojekyll` file is included so GitHub Pages serves the HTML exactly as-is.

---

## Option B — Netlify Drop (fastest, ~30 seconds, no account)

1. Go to **https://app.netlify.com/drop**
2. Drag **`site/index.html`** onto the page (just that one file is enough).
3. Netlify instantly gives you a live `https://<random-name>.netlify.app` link.
4. Open it on your phone, or share it. You can rename the site or add a custom domain
   later from the Netlify dashboard.

---

## What this is (and isn't)

This is the live, clickable, mobile-responsive **visual prototype**. The view toggle and
layout work. The action buttons (create request, resume script, upload) are illustrative —
they don't connect to a backend. That's the right scope for stakeholder review and for
briefing the build team; the working platform is Numeral's build.

*AiTHOS · Sovereign Health · Phase 1 · Confidential.*
