// Paste into the browser console (or run via the preview's javascript tool)
// against a running page. Returns the same measurements used to compare this
// site against the ServiceNow instance and the reference set.
//
// Two mistakes this script exists to stop repeating:
//   1. Treating rgb(0, 0, 0) as transparent, because a naive regex matches the
//      trailing ", 0)". That makes a black section look like the white body and
//      invents contrast failures.
//   2. Comparing against a translucent background without compositing it over
//      what is behind it. rgba(255,255,255,0.07) on black is rgb(18,18,18),
//      not white.
(() => {
  const cs = (e) => getComputedStyle(e);
  const nums = (v) => (v.match(/[\d.]+/g) || []).map(Number);
  const isTransparent = (v) => v === "rgba(0, 0, 0, 0)" || /^rgba\([^)]*,\s*0\)$/.test(v);

  const over = (fg, bg) => {
    const f = nums(fg), b = nums(bg);
    const a = f.length > 3 ? f[3] : 1;
    return `rgb(${[0, 1, 2].map((i) => Math.round(f[i] * a + b[i] * (1 - a))).join(", ")})`;
  };

  const lum = (c) =>
    nums(c).slice(0, 3)
      .map((v) => (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);

  const ratio = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)];
    return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
  };

  // Walk ancestors compositing every translucent background until fully opaque.
  const effectiveBg = (el) => {
    const stack = [];
    for (let p = el; p; p = p.parentElement) {
      const bg = cs(p).backgroundColor;
      if (isTransparent(bg)) continue;
      stack.push(bg);
      if ((nums(bg)[3] ?? 1) === 1) break;
    }
    return stack.reduceRight((acc, c) => over(c, acc), "rgb(255, 255, 255)");
  };

  const vis = [...document.querySelectorAll("body *")].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  const txt = vis.filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const tally = (a) => Object.entries(a.reduce((m, v) => ((m[v] = (m[v] || 0) + 1), m), {})).sort((x, y) => y[1] - x[1]);

  const contrast = txt.map((e) => {
    const bg = effectiveBg(e);
    return { text: e.textContent.trim().slice(0, 30), ratio: ratio(over(cs(e).color, bg), bg), size: parseFloat(cs(e).fontSize) };
  });

  return {
    viewport: [innerWidth, innerHeight],
    typeSizes: [...new Set(txt.map((e) => parseFloat(cs(e).fontSize)))].sort((a, b) => a - b),
    families: tally(txt.map((e) => cs(e).fontFamily.split(",")[0].replace(/["']/g, ""))).slice(0, 4),
    radii: tally(vis.map((e) => cs(e).borderRadius).filter((v) => v && v !== "0px")).slice(0, 5),
    shadows: vis.filter((e) => cs(e).boxShadow !== "none").length,
    gradients: vis.filter((e) => (cs(e).backgroundImage || "").includes("gradient")).length,
    greenVisible: vis.filter((e) => cs(e).color === "rgb(98, 216, 78)" && parseFloat(cs(e).opacity) > 0).length,
    minContrast: Math.min(...contrast.map((c) => c.ratio)),
    contrastFails: contrast.filter((c) => c.ratio < 4.5),
    overflow: document.body.scrollWidth > document.documentElement.clientWidth + 1,
  };
})();
