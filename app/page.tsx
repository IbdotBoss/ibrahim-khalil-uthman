import fs from "node:fs";
import path from "node:path";
import Shell, { type Shot } from "@/components/Shell";

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

export type ImageMeta = { cutout: boolean; width: number; height: number };

/**
 * Transparency and intrinsic size, read straight out of the file header at
 * build time. No image library, and nothing to install.
 *
 * Transparency used to be detected in the browser by sampling the canvas, which
 * meant every sticker rendered inside a white photo frame for a moment and then
 * snapped to a cutout once the check finished. Deciding here removes that flash.
 *
 * The size matters for the same class of reason: without width and height on
 * the img the browser does not know the aspect ratio until the bytes arrive, so
 * thirteen stickers each reflow the collage as they decode.
 *
 * Returns width 0 for anything it cannot parse, and the caller then omits the
 * attributes rather than asserting a wrong ratio.
 */
function imageMeta(file: string, dir = "stickers"): ImageMeta {
  const unknown = { cutout: !/\.(jpe?g)$/i.test(file), width: 0, height: 0 };
  try {
    const fd = fs.openSync(path.join(process.cwd(), "public", dir, file), "r");
    const head = Buffer.alloc(64);
    const read = fs.readSync(fd, head, 0, 64, 0);
    fs.closeSync(fd);
    if (read < 32) return unknown;

    // PNG: 8-byte signature, then IHDR. Width and height are big-endian u32 at
    // 16 and 20; byte 25 is the colour type, 6 being RGBA and 4 grey+alpha.
    if (head.toString("hex", 0, 8) === "89504e470d0a1a0a") {
      const colourType = head[25];
      return {
        cutout: colourType === 6 || colourType === 4,
        width: head.readUInt32BE(16),
        height: head.readUInt32BE(20),
      };
    }

    // WebP: "RIFF" .... "WEBP" then a chunk naming the variant.
    if (head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP") {
      const chunk = head.toString("ascii", 12, 16);
      if (chunk === "VP8X") {
        // Extended: flags byte carries the alpha bit, then 24-bit LE sizes - 1.
        return {
          cutout: (head[20] & 0x10) !== 0,
          width: head.readUIntLE(24, 3) + 1,
          height: head.readUIntLE(27, 3) + 1,
        };
      }
      if (chunk === "VP8L") {
        // Lossless: 14 bits width - 1, 14 bits height - 1, then the alpha flag.
        const bits = head.readUInt32LE(21);
        return {
          cutout: (head[24] & 0x10) !== 0,
          width: (bits & 0x3fff) + 1,
          height: ((bits >> 14) & 0x3fff) + 1,
        };
      }
      if (chunk === "VP8 ") {
        // Simple lossy: no alpha channel, sizes are 14-bit after the frame tag.
        return {
          cutout: false,
          width: head.readUInt16LE(26) & 0x3fff,
          height: head.readUInt16LE(28) & 0x3fff,
        };
      }
      return unknown;
    }

    // JPEG: walk the segment chain to the start-of-frame, which carries the
    // size. There is no alpha channel in a JPEG at all.
    if (head[0] === 0xff && head[1] === 0xd8) {
      const buf = fs.readFileSync(path.join(process.cwd(), "public", dir, file));
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isFrame) {
          return { cutout: false, width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
        }
        i += 2 + buf.readUInt16BE(i + 2);
      }
      return { cutout: false, width: 0, height: 0 };
    }

    return unknown;
  } catch {
    return unknown;
  }
}

/**
 * Intrinsic size for every screenshot in public/shots, keyed by basename, so a
 * re-capture at a different size needs no code change and still reserves the
 * right space.
 */
function shots(): Record<string, Shot> {
  const out: Record<string, Shot> = {};
  try {
    for (const file of fs.readdirSync(path.join(process.cwd(), "public", "shots"))) {
      if (!/\.(png|jpe?g|webp|avif)$/i.test(file)) continue;
      const { width, height } = imageMeta(file, "shots");
      out[file.replace(/\.[^.]+$/, "")] = { src: `/shots/${file}`, width, height };
    }
  } catch {}
  return out;
}

export default function Home() {
  return (
    <Shell
      stickers={stickerFiles().map((file) => ({ file, ...imageMeta(file) }))}
      shots={shots()}
    />
  );
}
