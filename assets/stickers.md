# Sticker images

Drop a file here and it appears on the About screen. The build reads the folder,
so there is no filename list to maintain and no extension to declare.

## Adding one

1. Cut it out. A transparent PNG or WebP gets a white outline traced around its
   alpha; a rectangle with a background gets a photo frame instead. Both look
   deliberate, but only if the file matches the one you meant.
2. Export as **WebP, quality 82**, longest edge 800–900px. See the budget below.
3. Add a placement to `PLACED` and `PLACED_NARROW` in `components/Stickers.tsx`.

Step 3 is not optional. Anything without a placement falls back to a six-point
ring cycled by file index, so two unplaced files land on the same coordinates and
stack, and the ring uses wide-stage coordinates that sit off the panel entirely
on a phone. Three files were invisible on mobile for exactly this reason.

`bismillah` and `avatar` are reserved: they have fixed roles elsewhere and are
skipped by the collage.

## Budget

**Total, not per file.** The whole folder should stay under about 450KB, because
all of it loads on the first screen. A per-file limit is what let three 250KB
PNGs through at once.

WebP is the reason this fits. The same set as PNG was 1,450KB; at quality 82 it
is 435KB with no visible difference. If a file is over ~60KB, it is almost
certainly still a PNG.

## Sizes

Aim for 1.7–2.0× the displayed width so it stays crisp on a phone. Softness is
invisible on photographic cutouts and obvious on lettering, so logos and flat
graphics need the headroom more than photos do.

Full-size sources live in `assets/sticker-originals/`, outside `public/`, so they
stay in the repo without being served.
