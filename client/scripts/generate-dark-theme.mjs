/**
 * Generates src/styles/dark-theme.css – a real dark theme for the whole site.
 *
 * The site's colors are hard-coded in many stylesheets, so instead of rewriting them all,
 * this script reads every rule and emits a matching
 *   :root[data-theme="dark"] <selector> { ...dark colors... }
 * rule. Light backgrounds become dark surfaces (keeping their relative order, so cards stay
 * a bit lighter than the page), dark text becomes light, light borders become dark, and
 * saturated brand colors (blue buttons, colored banners) are kept as-is.
 *
 * Run after changing any CSS:  npm run theme:dark
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import postcss from "postcss";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(root, "src");
const OUT = path.join(SRC, "styles", "dark-theme.css");
const DARK = ':root[data-theme="dark"]';

/* ───────── input files ───────── */
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".css") ? [p] : [];
  });
const inputs = [
  path.join(root, "node_modules/react-date-range/dist/styles.css"),
  path.join(root, "node_modules/react-date-range/dist/theme/default.css"),
  ...walk(SRC).filter((p) => !p.includes(`${path.sep}styles${path.sep}dark-theme.css`)),
];

/* ───────── color helpers ───────── */
const NAMED = {
  white: "#ffffff", black: "#000000", whitesmoke: "#f5f5f5", gainsboro: "#dcdcdc",
  lightgray: "#d3d3d3", lightgrey: "#d3d3d3", silver: "#c0c0c0", gray: "#808080", grey: "#808080",
  ghostwhite: "#f8f8ff", aliceblue: "#f0f8ff", snow: "#fffafa", ivory: "#fffff0", beige: "#f5f5dc",
  linen: "#faf0e6", darkgray: "#a9a9a9", dimgray: "#696969",
};
const COLOR_RE = new RegExp(
  `#[0-9a-fA-F]{3,8}\\b|rgba?\\([^)]*\\)|hsla?\\([^)]*\\)|\\b(?:${Object.keys(NAMED).join("|")})\\b`,
  "g"
);

const parse = (token) => {
  let t = token.toLowerCase();
  if (NAMED[t]) t = NAMED[t];
  if (t.startsWith("#")) {
    let h = t.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const m = t.match(/^(rgba?|hsla?)\(([^)]*)\)$/);
  if (!m) return null;
  const parts = m[2].split(/[\s,/]+/).filter(Boolean);
  if (m[1].startsWith("rgb")) {
    const [r, g, b] = parts.slice(0, 3).map(Number);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    return [r, g, b].some(Number.isNaN) ? null : { r, g, b, a };
  }
  const [h, s, l] = [parseFloat(parts[0]), parseFloat(parts[1]) / 100, parseFloat(parts[2]) / 100];
  const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
  return { ...hslToRgb(h, s, l), a };
};

const rgbToHsl = ({ r, g, b }) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s, l };
};
const hslToRgb = (h, s, l) => {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
};
const fmt = ({ h, s, l }, a) => {
  const { r, g, b } = hslToRgb(h, Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, l)));
  const hex = (n) => n.toString(16).padStart(2, "0");
  return a < 1 ? `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})` : `#${hex(r)}${hex(g)}${hex(b)}`;
};

// neutral surfaces get a slight blue-slate tint
const NEUTRAL = { h: 222, s: 0.18 };

/** light background → dark surface (white cards end up slightly lighter than the page) */
const mapBg = (c) => {
  const hsl = rgbToHsl(c);
  if (hsl.l >= 0.86) {
    if (hsl.s < 0.35) return fmt({ ...NEUTRAL, l: Math.max(0.07, 0.15 - (1 - hsl.l) * 0.9) }, c.a);
    return fmt({ h: hsl.h, s: Math.min(hsl.s, 0.45), l: 0.2 }, c.a); // tinted light (e.g. #eef2ff) → tinted dark
  }
  if (hsl.l >= 0.6 && hsl.s < 0.2) return fmt({ ...NEUTRAL, l: 0.24 }, c.a); // light grey chips/hover
  return null; // brand colors and dark colors stay
};

/** dark text → light text */
const mapText = (c) => {
  const hsl = rgbToHsl(c);
  if (hsl.l <= 0.5 && hsl.s < 0.35) return fmt({ h: hsl.h, s: Math.min(hsl.s, 0.15), l: 0.93 - hsl.l * 0.55 }, c.a);
  if (hsl.l <= 0.5) return fmt({ h: hsl.h, s: Math.min(hsl.s, 0.85), l: Math.max(0.68, hsl.l) }, c.a); // colored text
  if (hsl.l < 0.85 && hsl.s < 0.2) return fmt({ h: hsl.h, s: hsl.s, l: Math.max(hsl.l, 0.64) }, c.a); // greys
  return null;
};

/** light border → dark border */
const mapBorder = (c) => {
  const hsl = rgbToHsl(c);
  if (hsl.l >= 0.7) {
    if (hsl.s < 0.35) return fmt({ ...NEUTRAL, l: 0.26 }, c.a);
    return fmt({ h: hsl.h, s: Math.min(hsl.s, 0.5), l: 0.35 }, c.a);
  }
  return null;
};

const kindOf = (prop) => {
  if (prop === "color" || prop === "caret-color" || prop === "text-decoration-color" || prop === "-webkit-text-fill-color")
    return "text";
  if (prop === "background" || prop === "background-color" || prop === "background-image") return "bg";
  if (prop === "fill") return "text";
  if (prop === "stroke") return "text";
  if (/^border(-(top|bottom|left|right|inline|block)(-(start|end))?)?(-color)?$/.test(prop) || prop === "outline-color") return "border";
  if (prop.startsWith("--")) {
    if (/bg|background|surface|card/.test(prop)) return "bg";
    if (/text|muted/.test(prop)) return "text";
  }
  return null;
};
const MAPPERS = { bg: mapBg, text: mapText, border: mapBorder };

const transformValue = (value, kind) => {
  if (/url\(/.test(value) && !/gradient/.test(value)) {
    // e.g. "#f8f9fa url(arrow.svg) no-repeat" – only touch the color part
  }
  let changed = false;
  const out = value.replace(COLOR_RE, (tok) => {
    if (tok.toLowerCase() === "transparent") return tok;
    const c = parse(tok);
    if (!c) return tok;
    const mapped = MAPPERS[kind](c);
    if (mapped && mapped.toLowerCase() !== tok.toLowerCase()) {
      changed = true;
      return mapped;
    }
    return tok;
  });
  return changed ? out : null;
};

/* ───────── selectors ───────── */
const darkSelector = (sel) => {
  const s = sel.trim();
  if (s.startsWith(":root")) return s.replace(":root", DARK);
  if (s.startsWith("html")) return s.replace(/^html/, 'html[data-theme="dark"]');
  if (s.startsWith("[dir")) return DARK + s;
  if (s.startsWith('[data-theme')) return null; // already theme-specific
  return `${DARK} ${s}`;
};

/* ───────── build ───────── */
const out = postcss.root();
let ruleCount = 0;

const insideKeyframes = (node) => {
  for (let p = node.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes$/i.test(p.name)) return true;
  return false;
};

for (const file of inputs) {
  const css = postcss.parse(readFileSync(file, "utf8"), { from: file });
  css.walkRules((rule) => {
    if (insideKeyframes(rule)) return;
    const decls = [];
    rule.each((d) => {
      if (d.type !== "decl") return;
      const kind = kindOf(d.prop);
      if (!kind) return;
      const value = transformValue(d.value, kind);
      if (value) decls.push(postcss.decl({ prop: d.prop, value, important: d.important }));
    });
    if (!decls.length) return;
    const selectors = rule.selectors.map(darkSelector).filter(Boolean);
    if (!selectors.length) return;
    const newRule = postcss.rule({ selectors });
    decls.forEach((d) => newRule.append(d));

    // re-create @media / @supports wrappers
    let node = newRule;
    for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) {
      const wrapper = postcss.atRule({ name: p.name, params: p.params });
      wrapper.append(node);
      node = wrapper;
    }
    out.append(node);
    ruleCount++;
  });
}

const header = `/* AUTO-GENERATED by scripts/generate-dark-theme.mjs – do not edit by hand.
   Regenerate after changing CSS:  npm run theme:dark  */

${DARK} {
  color-scheme: dark;
}
${DARK} body {
  background: #0f131b;
  color: #e5e7eb;
}
${DARK} :is(input, select, textarea) {
  background-color: #1b2130;
  color: #e5e7eb;
  border-color: #374151;
}
${DARK} ::placeholder {
  color: #8b93a1;
}
/* photos a touch dimmer so they don't glare on a dark page */
${DARK} img {
  filter: brightness(0.92);
}

`;

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, header + out.toString() + "\n");
console.log(`✅ dark theme: ${ruleCount} rules from ${inputs.length} files → ${path.relative(root, OUT)}`);
