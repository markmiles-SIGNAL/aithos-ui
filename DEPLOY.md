# Deploying the AiTHOS mockup

`index.html` is at the repo **root**, so GitHub Pages works with the default setting.

## GitHub Pages

1. Create a **public** repo on GitHub (free Pages requires public).
2. Upload everything here (drag files into GitHub's web uploader, or push with git — below).
3. **Settings → Pages**.
4. **Source:** Deploy from a branch.
5. **Branch:** `main`  ·  **Folder:** `/ (root)`  ·  **Save**.
6. Wait ~1 min, refresh. Link appears at the top:
   `https://<your-username>.github.io/<repo-name>/`

### Push with git

```bash
git init
git add .
git commit -m "AiTHOS Healthograph Phase 1"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## If the link doesn't appear

Work down this list — one of these is almost always the cause:

1. **Repo is private.** Free GitHub Pages only publishes **public** repos.
   Fix: Settings → General → (bottom) Change visibility → Public.
2. **Source is "None."** You must pick *Deploy from a branch* and select `main`.
   Settings → Pages → Source.
3. **Wrong folder.** `index.html` must be in the folder Pages is pointed at. Here it's at
   root, so set folder to **`/ (root)`**, not `/docs`.
4. **Build still running or failed.** Check the **Actions** tab.
   Yellow dot = building (wait). Green check = live (link is in Settings → Pages).
   Red X = failed (open it to see why).
5. **Just deployed — give it a minute.** First publish can take 1–2 minutes, then
   refresh the Pages settings page.
6. **Brand-new GitHub account.** Email must be verified before Pages will publish.

## Fastest alternative — Netlify Drop (no account, ~30 sec)

1. Go to **https://app.netlify.com/drop**
2. Drag **`index.html`** onto the page.
3. You get a live `https://<name>.netlify.app` link instantly. Open on your phone or share it.

---

*This is the live, mobile-responsive visual prototype. Action buttons are illustrative,
not backend-connected. AiTHOS · Sovereign Health · Phase 1 · Confidential.*
