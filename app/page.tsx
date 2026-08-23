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

export default function Home() {
  return <Shell stickers={stickerFiles()} />;
}
