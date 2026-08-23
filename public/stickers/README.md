# Sticker images

Drop the files here with these exact names. The About screen picks them up automatically;
any that are missing fall back to a labelled placeholder box, so partial sets are fine.

| file            | image                        | notes |
|-----------------|------------------------------|-------|
| `pepe.png`      | Pepe at the desk             | sits on a grey background. Needs cutting out, or it shows as a grey rectangle. remove.bg or Photoshop select-subject both do it in one pass. |
| `urus.png`      | Yellow Lamborghini Urus      | already on black. Composites cleanly on the dark pane with no editing. |
| `bike.png`      | AMFLOW mountain bike         | already on black. Same. |
| `photo.png`     | a photo of you               | optional. Cut out, milo style. |

PNG or WEBP both work; the code does not care about the extension as long as the
name matches. Keep them under about 400KB each, they are decoration not evidence.

Full-size sources live in `assets/sticker-originals/`, one level up and outside
`public/`, so they stay in the repo as a backup without being served to visitors.
The files here are downscaled to display size.
