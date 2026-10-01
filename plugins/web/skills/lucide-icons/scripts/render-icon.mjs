#!/usr/bin/env node
// Render a lucide-style icon node so it can be *looked at* and *measured* — on the 24-unit grid,
// enlarged, and at the sizes it will actually be used at beside lucide's own `circle` and `square`
// (the two weight references the design language names).
//
// Sources, any number, in any mix:
//   lucide:<name>              an icon of the lucide-react resolved from the current directory
//   <file>.tsx[#Export,…]      every `createLucideIcon` export of that file, or the named ones
//   <file>.json[#name]         an IconNode array, or an object of them keyed by name
//
// Options:
//   --out <dir>       where the sheets go (default ./icon-review)
//   --sizes <list>    native sizes for the comparison rows (default 12,14,16,20,24)
//   --scale <n>       grid enlargement, px per unit (default 12)
//   --svg             write the SVG sheet only, never rasterise
//   --quiet           no report on stdout
//
// Rasterises with a headless Chrome where one is installed (pixel-exact), else `rsvg-convert`, else
// macOS `qlmanage` (approximate), else leaves the SVG. Loading
// a `.tsx` needs Node 23.6+ (or `--experimental-strip-types` on 22.6+); the file must contain no JSX,
// which a file of `createLucideIcon` calls never does.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { registerHooks, createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULTS = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
};
const REFERENCE = {
  circle: [['circle', { cx: '12', cy: '12', r: '10' }]],
  square: [['rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }]],
};

// ——— arguments ———

const args = process.argv.slice(2);
const opt = { out: 'icon-review', sizes: [12, 14, 16, 20, 24], scale: 12, svg: false, quiet: false };
const sources = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') opt.out = args[++i];
  else if (a === '--sizes') opt.sizes = args[++i].split(',').map(Number);
  else if (a === '--scale') opt.scale = Number(args[++i]);
  else if (a === '--svg') opt.svg = true;
  else if (a === '--quiet') opt.quiet = true;
  else sources.push(a);
}
if (sources.length === 0) {
  console.error('usage: render-icon.mjs [--out dir] [--sizes 12,16,24] [--scale 12] [--svg] <source>…');
  process.exit(2);
}

// ——— loading ———

/**
 * Where lucide-react is: resolved from the current directory, else from the first workspace package
 * that depends on it — a monorepo's icon library is usually one package down from where the script
 * is run.
 */
function lucideDir() {
  const roots = [process.cwd(), ...['packages', 'apps'].flatMap((d) => (existsSync(d) ? readdirSync(d).map((p) => join(process.cwd(), d, p)) : []))];
  for (const root of roots) {
    try {
      const main = createRequire(pathToFileURL(join(root, 'package.json'))).resolve('lucide-react');
      return main.slice(0, main.lastIndexOf('/dist/'));
    } catch {}
  }
  console.error('lucide-react not found from here; run from a package that depends on it');
  process.exit(1);
}
const stubUrl = pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'lucide-stub.mjs')).href;
/** The directory each temp copy came from, so a `./sibling` import resolves against the original. */
const origin = new Map();
registerHooks({
  resolve(spec, ctx, next) {
    if (spec === 'lucide-react') return { url: stubUrl, shortCircuit: true };
    const from = ctx.parentURL && origin.get(ctx.parentURL);
    if (from && spec.startsWith('.')) return next(spec, { ...ctx, parentURL: pathToFileURL(join(from, 'x')).href });
    return next(spec, ctx);
  },
});

function toKebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

async function load(source) {
  const [ref, picks] = source.split('#');
  const wanted = picks ? new Set(picks.split(',')) : null;
  if (ref.startsWith('lucide:')) {
    const name = ref.slice(7);
    const file = join(lucideDir(), 'dist/esm/icons', `${name}.mjs`);
    const mod = await import(pathToFileURL(file).href);
    return [{ name, node: mod.__iconNode }];
  }
  const file = resolve(ref);
  if (file.endsWith('.json')) {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    const entries = Array.isArray(data) ? [[basename(file, '.json'), data]] : Object.entries(data);
    return entries.filter(([k]) => !wanted || wanted.has(k)).map(([name, node]) => ({ name, node }));
  }
  // A `.tsx` copied to `.mts`: Node strips the types itself and the stub answers for lucide-react.
  const dir = mkdtempSync(join(tmpdir(), 'lucide-icons-'));
  const tmp = join(dir, `${basename(file).replace(/\.tsx?$/, '')}.mts`);
  writeFileSync(tmp, readFileSync(file, 'utf8'));
  const url = pathToFileURL(tmp).href;
  origin.set(url, dirname(file));
  let mod;
  try {
    mod = await import(url);
  } catch (e) {
    console.error(`could not load ${ref}: ${e.message}\n(a .tsx needs Node 23.6+, or --experimental-strip-types on 22.6+, and no JSX)`);
    process.exit(1);
  }
  return Object.entries(mod)
    .filter(([k, v]) => v && Array.isArray(v.node) && (!wanted || wanted.has(k)))
    .map(([k, v]) => ({ name: `${v.name}`, export: k, node: v.node }));
}

// ——— measuring ———

/** Walk a path's commands and return the points it passes through (end points, not control points). */
function pathPoints(d) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const pts = [];
  let cmd = '';
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === 'Z') {
      x = sx;
      y = sy;
      continue;
    }
    if (C === 'H') {
      const v = num();
      x = rel ? x + v : v;
    } else if (C === 'V') {
      const v = num();
      y = rel ? y + v : v;
    } else {
      const skip = { M: 0, L: 0, T: 0, C: 4, S: 2, Q: 2, A: 5 }[C];
      if (skip === undefined) break;
      for (let k = 0; k < skip; k++) num();
      const nx = num();
      const ny = num();
      x = rel ? x + nx : nx;
      y = rel ? y + ny : ny;
      if (C === 'M') {
        sx = x;
        sy = y;
        cmd = rel ? 'l' : 'L';
      }
    }
    pts.push([x, y]);
  }
  return pts;
}

function measure(node) {
  const notes = [];
  /** The geometry's own extent, and the ink's — the geometry grown by half of each element's stroke. */
  const geo = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const ink = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const grow = (b, x, y, h) => {
    b.minX = Math.min(b.minX, x - h);
    b.maxX = Math.max(b.maxX, x + h);
    b.minY = Math.min(b.minY, y - h);
    b.maxY = Math.max(b.maxY, y + h);
  };
  const offGrid = new Set();
  let arcs = false;
  const grid = (v) => {
    if (Math.abs(v * 2 - Math.round(v * 2)) > 1e-6) offGrid.add(r2(v));
  };
  node.forEach(([tag, attrs], n) => {
    const a = Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), String(v)]));
    for (const key of ['stroke-width', 'stroke', 'stroke-linecap', 'stroke-linejoin']) {
      if (key in a) notes.push(`element ${n} (${tag}) restates ${key}="${a[key]}" — the set's is ${DEFAULTS[key]}`);
    }
    const filled = a.fill && a.fill !== 'none';
    if (filled) notes.push(`element ${n} (${tag}) is filled (${a.fill}); lucide fills in 9 of 2007 icons`);
    const stroked = a.stroke !== 'none';
    const half = stroked ? Number(a['stroke-width'] ?? 2) / 2 : 0;
    const take = (x, y) => {
      grow(geo, x, y, 0);
      grow(ink, x, y, half);
    };
    if (tag === 'path') {
      const pts = pathPoints(a.d);
      for (const [x, y] of pts) {
        take(x, y);
        grid(x);
        grid(y);
      }
      if (/[Aa]/.test(a.d)) arcs = true;
      if (/[CcSs]/.test(a.d)) notes.push(`element ${n} uses cubic curves — prefer arcs and quadratics where they fit`);
    } else if (tag === 'circle') {
      const [cx, cy, r] = [Number(a.cx), Number(a.cy), Number(a.r)];
      take(cx - r, cy - r);
      take(cx + r, cy + r);
      grid(cx);
      grid(cy);
      const outer = (r + half) * 2;
      const hole = r - half;
      notes.push(`element ${n} circle r=${r} reads as a ${outer}px ${filled || hole <= 0 ? 'disc' : `ring with a ${hole * 2}px hole`}`);
    } else if (tag === 'rect') {
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((k) => Number(a[k] ?? 0));
      take(x, y);
      take(x + w, y + h);
      [x, y, x + w, y + h].forEach(grid);
      const rx = Number(a.rx ?? 0);
      const want = Math.min(w, h) >= 8 ? 2 : 1;
      if (rx === 0) notes.push(`element ${n} rect ${w}×${h} has sharp corners — lucide rounds at rx=${want}`);
      else if (rx !== want) notes.push(`element ${n} rect ${w}×${h} has rx=${rx} — the size rule says ${want}`);
    } else if (tag === 'line') {
      take(Number(a.x1), Number(a.y1));
      take(Number(a.x2), Number(a.y2));
    } else if (tag === 'polygon' || tag === 'polyline') {
      const nums = a.points.match(/-?\d*\.?\d+/g).map(Number);
      for (let k = 0; k + 1 < nums.length; k += 2) {
        take(nums[k], nums[k + 1]);
        grid(nums[k]);
        grid(nums[k + 1]);
      }
      if (tag === 'polygon') notes.push(`element ${n} is a polygon — its corners are sharp; a rounded path is the lucide way`);
    }
  });
  if (ink.minX < 1 || ink.minY < 1 || ink.maxX > 23 || ink.maxY > 23) {
    notes.push(`ink reaches ${fmt(ink)}: the 1px safe zone is broken (ink stays within 1…23, a 2-wide stroke's path within 2…22)`);
  }
  const cx = (ink.minX + ink.maxX) / 2;
  const cy = (ink.minY + ink.maxY) / 2;
  if (Math.abs(cx - 12) > 0.5 || Math.abs(cy - 12) > 0.5) notes.push(`ink centred at ${cx.toFixed(2)},${cy.toFixed(2)} rather than 12,12 (fine if deliberate)`);
  if (offGrid.size) notes.push(`off the half-pixel grid: ${[...offGrid].slice(0, 12).join(', ')}${offGrid.size > 12 ? ', …' : ''}${arcs ? ' (the tangent points of a rounded diagonal corner always are)' : ''}`);
  return { geo, ink, notes };
}

const r2 = (v) => Number(v.toFixed(2));
const fmt = (b) => `x ${r2(b.minX)}…${r2(b.maxX)}, y ${r2(b.minY)}…${r2(b.maxY)}`;

// ——— drawing ———

function elements(node) {
  return node
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs)
        .filter(([k]) => k !== 'key')
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}="${v}"`)
        .join(' ');
      return `<${tag} ${a}/>`;
    })
    .join('');
}

function sheet(icon, refs) {
  const S = opt.scale;
  const G = 24 * S;
  const pad = 16;
  const cell = (s) => s + 12;
  const cols = 1 + refs.length;
  const boxW = (s) => cell(s) * cols + 8;
  const rowH = Math.max(...opt.sizes) + 28;
  const rowsW = opt.sizes.reduce((w, s) => w + boxW(s) + 8, 0);
  const W = Math.max(G, rowsW) + 2 * pad;
  const rowsY = pad + G + 28;
  const H = rowsY + 2 * rowH + pad;
  const gridLines = [];
  for (let i = 0; i <= 24; i++) {
    const p = pad + i * S;
    const heavy = i % 12 === 0 ? '#c0c0c0' : i % 2 === 0 ? '#e2e2e2' : '#f0f0f0';
    gridLines.push(`<line x1="${p}" y1="${pad}" x2="${p}" y2="${pad + G}" stroke="${heavy}"/>`);
    gridLines.push(`<line x1="${pad}" y1="${p}" x2="${pad + G}" y2="${p}" stroke="${heavy}"/>`);
  }
  const safe =
    `<rect x="${pad}" y="${pad}" width="${G}" height="${G}" fill="none" stroke="#f3b0b0" stroke-dasharray="4 4"/>` +
    `<rect x="${pad + S}" y="${pad + S}" width="${G - 2 * S}" height="${G - 2 * S}" fill="none" stroke="#e08080"/>`;
  const big = `<g transform="translate(${pad} ${pad}) scale(${S})" color="#111" ${attrs(DEFAULTS)}>${elements(icon.node)}</g>`;
  const label = `<text x="${pad}" y="${pad + G + 16}" font-family="ui-monospace, Menlo, monospace" font-size="11" fill="#333">${icon.name} — 24-unit grid at ${S}px/unit; inner box is the 1px safe zone; below, beside circle and square</text>`;
  let native = '';
  for (let r = 0; r < 2; r++) {
    const dark = r === 1;
    const y0 = rowsY + r * rowH;
    let x = pad + 4;
    for (const s of opt.sizes) {
      native += `<rect x="${x - 4}" y="${y0}" width="${boxW(s)}" height="${rowH - 8}" fill="${dark ? '#1b1b1f' : '#ffffff'}" stroke="#d8d8d8"/>`;
      native += `<text x="${x}" y="${y0 + 12}" font-family="ui-monospace, Menlo, monospace" font-size="9" fill="${dark ? '#aaa' : '#666'}">${s}px</text>`;
      let cx = x;
      for (const node of [icon.node, ...refs]) {
        native += `<svg x="${cx}" y="${y0 + 18}" width="${s}" height="${s}" viewBox="0 0 24 24" color="${dark ? '#f2f2f2' : '#111'}" ${attrs(DEFAULTS)}>${elements(node)}</svg>`;
        cx += cell(s);
      }
      x += boxW(s) + 8;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fafafa"/>${gridLines.join('')}${safe}${big}${label}${native}</svg>`;
}

const attrs = (o) => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ');

/** A headless Chrome, if one is installed: the only rasteriser here that renders the SVG at 1:1. */
function chrome() {
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ];
  return candidates.find((c) => c && existsSync(c)) ?? null;
}

function rasterise(svgPath) {
  const png = svgPath.replace(/\.svg$/, '.png');
  const [w, h] = readFileSync(svgPath, 'utf8').match(/width="(\d+)" height="(\d+)"/).slice(1, 3).map(Number);
  const browser = chrome();
  if (browser) {
    spawnSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${w},${h}`, `--screenshot=${resolve(png)}`, pathToFileURL(resolve(svgPath)).href], { stdio: 'ignore' });
    if (existsSync(png)) return png;
  }
  if (spawnSync('rsvg-convert', ['--version'], { stdio: 'ignore' }).status === 0) {
    execFileSync('rsvg-convert', ['-o', png, svgPath]);
    return png;
  }
  // qlmanage fits the sheet to a square and rescales it, so the native rows are only approximate.
  if (process.platform === 'darwin' && existsSync('/usr/bin/qlmanage')) {
    execFileSync('/usr/bin/qlmanage', ['-t', '-s', String(Math.max(w, h)), '-o', dirname(svgPath), svgPath], { stdio: 'ignore' });
    renameSync(`${svgPath}.png`, png);
    return png;
  }
  return null;
}

// ——— main ———

mkdirSync(opt.out, { recursive: true });
const refs = [REFERENCE.circle, REFERENCE.square];
for (const source of sources) {
  for (const icon of await load(source)) {
    const file = join(opt.out, `${icon.name}.svg`);
    writeFileSync(file, sheet(icon, refs));
    const png = opt.svg ? null : rasterise(file);
    const { geo, ink, notes } = measure(icon.node);
    const report = [`${icon.name}${icon.export ? ` (${icon.export})` : ''}`, `  path extent: ${fmt(geo)}; ink extent: ${fmt(ink)}`, ...notes.map((n) => `  - ${n}`), `  sheet: ${png ?? file}`].join('\n');
    writeFileSync(join(opt.out, `${icon.name}.txt`), `${report}\n`);
    if (!opt.quiet) console.log(report);
  }
}
