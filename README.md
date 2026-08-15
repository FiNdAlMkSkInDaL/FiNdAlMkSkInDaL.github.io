# FiNdAlMkSkInDaL.github.io

Personal portfolio site (GitHub Pages user site).

**Live:** https://findalmkskindal.github.io/

## Local

Open `index.html` in a browser, or:

```bash
npx serve .
```

## Photo

Replace `assets/photo.svg` with `assets/photo.jpg` (your headshot), then update the `<img src>` in `index.html`.

## Projects

Edit project cards in `index.html` / `garden.js`.

### Shareable project URLs

Clicking a flower (or list card) updates the hash so you can send someone straight into that project:

| Project | Link |
|---------|------|
| TickForge | https://findalmkskindal.github.io/#tickforge |
| Toolbox | https://findalmkskindal.github.io/#toolbox |
| Polymarket | https://findalmkskindal.github.io/#polymarket |
| Macro Bias | https://findalmkskindal.github.io/#macro |
| Identity | https://findalmkskindal.github.io/#identity |
| VectorBot | https://findalmkskindal.github.io/#vectorbot |

Aliases: `#macro-bias`, `#vector-bot`, `#tbm`, `#russell`. Also works: `?project=tickforge`.

From the project shell, **Back to garden** (or Home) returns to the main site and clears the hash.

## CVs

Track PDFs live in `cv/` and are linked from the nav **CV ▾** menu and the Contact modal. **Web copies omit the phone number.** Application CVs under `Desktop/CV_Optimized` are unchanged.

| Track | File |
|-------|------|
| Software / Data | `cv/Finlay_Phillips_CV_Software_Data.pdf` |
| Machine Learning | `cv/Finlay_Phillips_CV_ML.pdf` |
| EEE | `cv/Finlay_Phillips_CV_EEE.pdf` |

Rebuild phone-free web PDFs (do not copy the application PDFs):

```powershell
cd "$env:USERPROFILE\personal-website\cv"
.\rebuild-web-cvs.ps1
```
