# ibrahim-khalil-uthman

My personal site, built as the ServiceNow platform navigator. Applications down
the left, records on the right, everything is a record.

The joke is never explained on the site itself. If you work with the platform
you recognised it in the first second; if you don't, it's an index that happens
to be well organised.

**Live:** not deployed yet · **Stack:** Next.js 15, static export, plain CSS

## Why it looks like that

Every value in the interface was measured from a real ServiceNow instance with
dev tools rather than eyeballed from screenshots:

| | |
|---|---|
| header | 52px, `#081426` |
| rail | 320px, `#032D42`, 32px rows at 16px |
| content | `#FFFFFF`, ink `#172B31`, Lato 14px |
| list bands | toolbar `#E5EDEF` 45px, breadcrumb `#F3F8F9` 30px |
| rows | 31px, zebra `#FFFFFF` / `#F3F8F9` |
| borders | `#CCD9DD` · links `#006884` · star `#62D84E` |

Two earlier attempts were built from descriptions instead, and both were wrong
in ways that were obvious the moment anything was actually measured. The content
pane is white, not dark; the rail is `#032D42`, not the near-black I had read off
a tooltip by mistake.

Colour is one visible mark: a single green letter in the wordmark, the same green
the platform uses on its own favourite stars.

## Running it

```bash
npm install
npm run dev     # http://localhost:3210
npm run build   # static export to out/
```

`npm run build` refuses to run while the dev server is up. Building rewrites
`.next`, which is what `next dev` serves from, so doing both at once takes the
dev server down with an unexplained Internal Server Error. See
`scripts/guard-build.js`.

## Layout

```
app/
  page.tsx          reads public/stickers at build time, renders Shell
  cv/               the CV, rendered from the same records as the site
  globals.css       every token, one file
components/
  Shell.tsx         header, rail, filter, favourites, the record views
  Stickers.tsx      the draggable collage
  useDraggable.ts   pointer drag plus arrow-key nudging
data/
  records.ts        single source for both the site and the CV
scripts/
  audit.js          paste into the console to measure the built page
  guard-build.js    stops a build clobbering the dev server
```

### Adding a sticker

Drop an image into `public/stickers`. It appears with no code change. Transparency
is read from the PNG header at build time, so a cut-out image gets a white outline
traced round its alpha and a photo with a solid background gets a photo frame.
Give it a placement in `PLACED` in `Stickers.tsx` if you don't want it scattered.

Keep the originals: `public/stickers/originals` holds the full-size versions, and
the served copies are downscaled to display size. The whole set is about 500KB.

### Adding a record

Everything on the site and the CV comes from `data/records.ts`. Each application
declares its own columns, so Experience shows Role / Company / Type / Period while
Projects shows Name / State / Stack / Year. Applications holding a single record
use `view: "form"`, which is the platform's other view; Contact uses
`view: "links"`.

`siteDetail: false` keeps a record's write-up out of the site list while the CV
still uses it.
