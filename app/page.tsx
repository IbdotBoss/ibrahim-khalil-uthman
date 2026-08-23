import fs from "node:fs";
import path from "node:path";
import Shell from "@/components/Shell";

// Read the sticker folder at build time so dropping a file into
// public/stickers is all that is needed. No filename list to maintain,
// no extension guessing.
const PREFERENCE = ["png", "jpg", "jpeg", "avif", "gif", "webp"];

// These two live in the same folder but have fixed roles rather than being
// scattered with the rest.
const RESERVED = ["bismillah", "avatar"];

function stickerFiles(): string[] {
  try {
    const files = fs
      .readdirSync(path.join(process.cwd(), "public", "stickers"))
      .filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f))
      .filter((f) => !RESERVED.includes(f.replace(/\.[^.]+$/, "").toLowerCase()));

    // One sticker per base name. If the same image exists in several formats,
    // keep the most preferred and ignore the rest, so dropping in a second
    // format does not render the same thing twice.
    const best = new Map<string, string>();
    for (const f of files) {
      const base = f.replace(/\.[^.]+$/, "").toLowerCase();
      const ext = f.split(".").pop()!.toLowerCase();
      const current = best.get(base);
      if (!current) {
        best.set(base, f);
        continue;
      }
      const currentExt = current.split(".").pop()!.toLowerCase();
      if (PREFERENCE.indexOf(ext) < PREFERENCE.indexOf(currentExt)) best.set(base, f);
    }
    return [...best.values()].sort();
  } catch {
    return [];
  }
}

/**
 * Whether a file can carry transparency, read from the PNG header at build time.
 * Byte 25 of a PNG is the IHDR colour type: 6 is RGBA, 4 is grey+alpha.
 * JPEG has no alpha channel at all.
 *
 * This used to be detected in the browser by sampling the canvas, which meant
 * every sticker rendered inside a white photo frame for a moment and then
 * snapped to a cutout once the check finished. Deciding at build time removes
 * that flash entirely.
 */
function hasAlpha(file: string): boolean {
  const ext = file.split(".").pop()!.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return false;
  if (ext !== "png") return true; // webp/avif/gif: assume transparency
  try {
    const fd = fs.openSync(path.join(process.cwd(), "public", "stickers", file), "r");
    const head = Buffer.alloc(26);
    fs.readSync(fd, head, 0, 26, 0);
    fs.closeSync(fd);
    const colourType = head[25];
    return colourType === 6 || colourType === 4;
  } catch {
    return false;
  }
}

export default function Home() {
  const files = stickerFiles();
  return <Shell stickers={files.map((f) => ({ file: f, cutout: hasAlpha(f) }))} />;
}
