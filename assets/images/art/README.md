# Original artwork

Every `.svg` in this folder is generated from code in `tools/art/`. Nothing here
was downloaded, traced, or derived from a stock library, icon set, brand asset
or photograph, so none of it carries a licence obligation or attribution
requirement.

To change a colour, motif or layout, edit the relevant file in `tools/art/` and
regenerate:

```bash
node tools/art/generate.js
```

Output is deterministic — the same source produces byte-identical files.

## What lives where

| File | Where it appears |
|---|---|
| `tools/art/lib.js` | Shared primitives: canvas, panels, chips, wires, grids |
| `tools/art/covers.js` | Project and Technoblog card covers |
| `tools/art/blogs.js` | Blog-hub, hobby and language covers, plus in-article figures |
| `tools/art/heroes.js` | Full-width page hero backdrops |

## Naming

- `cover-*.svg` — 1200×900 card art; also reused as that post's hero background.
- `fig-*.svg` — 1600×900 figures embedded in article bodies.
- `hero-*.svg` — 1600×900 page hero backdrops, sat behind a dark CSS gradient.

## Design notes

Cards are dimmed by the site CSS (`filter: brightness(0.6)`) with a centred
white caption on top, so the art is authored brighter than a finished image
would be and carries a centre vignette to keep captions legible.
