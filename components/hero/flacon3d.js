/* Urban Virtue: Real-time 3D Flacon
   A WebGL model of the house's rectangular glass flacon in its three volumes
   (30 / 50 / 100 ml): thick glass walls and base, a gold sprayer and tall gold
   cap, a layered liquid fill and the Urban Virtue emblem printed on the glass.
   Driven imperatively by blend.js through the handle createFlacon3D returns.
*/

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Physical proportions in centimetres, modelled on the boutique's flacons
const FLACONS = {
  30: { w: 3.5, h: 5.8, d: 2.2, capR: 0.62, capH: 3.0 },
  50: { w: 4.2, h: 6.9, d: 2.6, capR: 0.72, capH: 3.6 },
  100: { w: 5.2, h: 8.8, d: 3.3, capR: 0.88, capH: 4.4 },
};
const LARGEST = FLACONS[100];

const SWAP_TIME = 1.15; // seconds for one half-turn of the size carousel

const LABEL_W = 800;
const LABEL_H = 980;
const LIQUID_TINT = new THREE.Color("#fff6e8");

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function damp(a, b, lambda, dt) {
  return a + (b - a) * (1 - Math.exp(-lambda * dt));
}

// Wall, base and shoulder thicknesses of a flacon, plus the inner cavity
function anatomy(spec) {
  const t = 0.2 + spec.w * 0.02;
  const base = spec.h * 0.13;
  const shoulder = 0.32;
  const cavBottom = base + 0.04;
  const cavTop = spec.h - shoulder;
  const capSeat = spec.h + 0.12;
  const lift = 0.9 + spec.capH * 0.12;
  return {
    t,
    base,
    cavBottom,
    cavTop,
    fullH: (cavTop - cavBottom) * 0.88,
    capSeat,
    lift,
    // Height the camera frames: body + seated cap + room for the lifted cap
    frameH: capSeat + spec.capH + lift + 0.4,
  };
}

// Dark, edge-weighted glass: nearly clear face-on, denser and greener at grazing
// angles, with specular highlights kept bright regardless of the base opacity.
function glassMaterial({ side, opacity, edge, tint = 0x2c3833 }) {
  const m = new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.03,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.6,
    transparent: true,
    opacity,
    depthWrite: false,
    side,
  });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `float uvFres = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);
      outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.88, 0.95, 0.92), uvFres);
      float uvSpec = dot(totalSpecular, vec3(0.2126, 0.7152, 0.0722));
      diffuseColor.a = clamp(max(diffuseColor.a + uvFres * ${edge.toFixed(2)}, uvSpec * 1.3), 0.0, 0.94);
      #include <opaque_fragment>`
    );
  };
  return m;
}

// stops: [[offset, cssColor], ...] from the centre outwards. The gradient stops short
// of the canvas edge and mipmaps are off, so the plane's border is always fully clear.
function radialTexture(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 108);
  stops.forEach(([at, color]) => g.addColorStop(at, color));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function cssFont(varName, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

// Draw text shrunk to fit maxW
function printText(ctx, text, x, y, size, maxW, font, color, spacing) {
  let s = size;
  ctx.letterSpacing = spacing + "px";
  ctx.font = font.replace("{s}", s);
  while (ctx.measureText(text).width > maxW && s > 12) {
    s -= 1;
    ctx.font = font.replace("{s}", s);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Split "A · B · C" over two lines when one line would force the type too small
function splitNotes(ctx, notes, maxW) {
  if (ctx.measureText(notes).width <= maxW) return [notes];
  const parts = notes.split(" · ");
  if (parts.length < 2) return [notes];
  const cut = Math.ceil(parts.length / 2);
  return [parts.slice(0, cut).join(" · "), parts.slice(cut).join(" · ")];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Navy plate in the emblem's colours with large cream & gold lettering, so the
// print reads at a glance over any liquid colour behind the glass
function drawLabel(ctx, logo, fonts, text, volume) {
  const cx = LABEL_W / 2;
  const navy = "#14213d";
  const cream = "#fbf3e2";
  const gold = "#f0cf8a";
  const foil = "#c9a14a";
  const plateTop = 250;
  ctx.clearRect(0, 0, LABEL_W, LABEL_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Plate
  ctx.save();
  ctx.shadowColor = "rgba(10, 14, 30, 0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  roundRect(ctx, 14, plateTop, LABEL_W - 28, LABEL_H - plateTop - 20, 30);
  ctx.fillStyle = navy;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, 14, plateTop, LABEL_W - 28, LABEL_H - plateTop - 20, 30);
  ctx.lineWidth = 7;
  ctx.strokeStyle = foil;
  ctx.stroke();
  roundRect(ctx, 32, plateTop + 18, LABEL_W - 64, LABEL_H - plateTop - 56, 20);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(201, 161, 74, 0.6)";
  ctx.stroke();

  // Official emblem medallion, overlapping the top of the plate
  const r = 150;
  const ey = 160;
  ctx.save();
  ctx.shadowColor = "rgba(10, 14, 30, 0.4)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.arc(cx, ey, r, 0, Math.PI * 2);
  ctx.fillStyle = navy;
  ctx.fill();
  ctx.restore();
  if (logo && logo.complete && logo.naturalWidth) {
    const n = logo.naturalWidth;
    const sr = n * 0.47;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, ey, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, n / 2 - sr, logo.naturalHeight / 2 - sr, sr * 2, sr * 2, cx - r, ey - r, r * 2, r * 2);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, ey, r, 0, Math.PI * 2);
  ctx.lineWidth = 8;
  ctx.strokeStyle = foil;
  ctx.stroke();

  const maxW = LABEL_W - 110;
  printText(ctx, text.name, cx, 448, 118, maxW, "italic 700 {s}px " + fonts.display, cream, 0);

  // Notes: one or two lines, kept large
  const notesFont = "800 {s}px " + fonts.body;
  ctx.letterSpacing = "2px";
  ctx.font = notesFont.replace("{s}", 54);
  const lines = splitNotes(ctx, text.notes.toUpperCase(), maxW);
  let y = lines.length > 1 ? 526 : 542;
  lines.forEach((line) => {
    printText(ctx, line, cx, y, 54, maxW, notesFont, gold, 2);
    y += 62;
  });

  // Gold divider
  const dy = lines.length > 1 ? 648 : 618;
  ctx.strokeStyle = foil;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 230, dy);
  ctx.lineTo(cx - 36, dy);
  ctx.moveTo(cx + 36, dy);
  ctx.lineTo(cx + 230, dy);
  ctx.stroke();
  printText(ctx, "✦", cx, dy + 15, 40, 90, "{s}px " + fonts.body, foil, 0);

  printText(ctx, "EXTRAIT DE PARFUM", cx, dy + 112, 66, maxW, "700 {s}px " + fonts.display, cream, 4);
  printText(ctx, volume, cx, dy + 196, 54, maxW, "800 {s}px " + fonts.body, gold, 3);
}

function buildFlacon(spec, shared) {
  const { w, h, d, capR, capH } = spec;
  const a = anatomy(spec);
  const root = new THREE.Group();
  const body = new THREE.Group(); // everything that scales in / out on a size change
  root.add(body);

  // Glass body: far walls first, liquid, then near walls so the fill reads through the glass
  const outerGeo = new RoundedBoxGeometry(w, h, d, 6, Math.min(0.34, d * 0.14));
  outerGeo.translate(0, h / 2, 0);
  const glassBack = new THREE.Mesh(outerGeo, shared.glassBack);
  glassBack.renderOrder = 1;
  const glassFront = new THREE.Mesh(outerGeo, shared.glassFront);
  glassFront.renderOrder = 5;

  const baseGeo = new RoundedBoxGeometry(w - a.t * 2, a.base, d - a.t * 2, 4, 0.14);
  baseGeo.translate(0, a.base / 2 + 0.04, 0);
  const base = new THREE.Mesh(baseGeo, shared.glassBase);
  base.renderOrder = 2;

  // Liquid: three stacked tiers, one per poured note
  const liqGeo = new THREE.BoxGeometry(w - a.t * 2 - 0.03, 1, d - a.t * 2 - 0.03);
  liqGeo.translate(0, 0.5, 0);
  const tiers = shared.liquid.map((mat) => {
    const m = new THREE.Mesh(liqGeo, mat);
    m.renderOrder = 3;
    m.visible = false;
    body.add(m);
    return m;
  });

  // Neck, crimped collar, sprayer actuator and dip tube
  const neckR = capR * 0.62;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(neckR, neckR, 0.34, 40), shared.glassFront);
  neck.position.y = h + 0.13;
  neck.renderOrder = 5;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(capR * 0.8, capR * 0.84, 0.46, 48), shared.gold);
  collar.position.y = h + 0.38;
  const actR = capR * 0.52;
  const actuator = new THREE.Mesh(new THREE.CylinderGeometry(actR, actR, 0.46, 40), shared.gold);
  actuator.position.y = h + 0.84;
  const nozzle = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), shared.nozzle);
  nozzle.position.set(0, h + 0.88, actR + 0.002);
  const tubeH = h - a.cavBottom - 0.15;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, tubeH, 10), shared.tube);
  tube.position.y = a.cavBottom + 0.15 + tubeH / 2;
  tube.renderOrder = 4;

  // Tall gold cap with a softened top edge
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(capR - 0.03, 0),
    new THREE.Vector2(capR, 0.04),
    new THREE.Vector2(capR, capH - 0.14),
  ];
  for (let i = 1; i <= 6; i++) {
    const t = (i / 6) * (Math.PI / 2);
    profile.push(new THREE.Vector2(capR - 0.14 + Math.cos(t) * 0.14, capH - 0.14 + Math.sin(t) * 0.14));
  }
  profile.push(new THREE.Vector2(0, capH));
  const cap = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), shared.gold);
  const capPivot = new THREE.Group();
  capPivot.position.y = a.capSeat;
  capPivot.add(cap);

  // Printed emblem label on the front face
  const canvas = document.createElement("canvas");
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = shared.anisotropy;
  const lw = w * 0.82;
  const lh = lw * (LABEL_H / LABEL_W);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(lw, lh),
    // Unlit and outside tone mapping so the print keeps its exact colours and contrast
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
  );
  label.position.set(0, a.cavBottom + (a.cavTop - a.cavBottom) * 0.5, d / 2 + 0.006);
  label.renderOrder = 6;

  // Soft contact shadow and the coloured light the liquid throws on the surface
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.8, d * 2.7), shared.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.004;
  const caustic = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.6, d * 2.6), shared.caustic);
  caustic.rotation.x = -Math.PI / 2;
  caustic.position.set(w * 0.12, 0.008, d * 1.05);

  body.add(shadow, caustic, glassBack, base, tube, glassFront, neck, collar, actuator, nozzle, capPivot, label);

  return {
    spec,
    a,
    root,
    body,
    tiers,
    capPivot,
    canvas,
    ctx: canvas.getContext("2d"),
    texture,
    label,
    // Position on the size carousel: 0 = front and centre, ±PI = hidden at the back
    theta: Math.PI,
    from: Math.PI,
    to: Math.PI,
    t0: 0,
  };
}

// still: no render loop or observers; the caller poses the flacon, then settle() + snapshot()
export function createFlacon3D({ host, sizes, sizeId, logoSrc, reduceMotion, still = false }) {
  const canvas = document.createElement("canvas");
  canvas.className = "flacon-canvas";
  canvas.setAttribute("aria-hidden", "true");

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(still ? 2 : Math.min(window.devicePixelRatio || 1, 2));
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(24, 3 / 4, 0.5, 300);

  const key = new THREE.DirectionalLight(0xfff1dc, 1.6);
  key.position.set(-6, 14, 9);
  const rim = new THREE.DirectionalLight(0xffe2b8, 1.1);
  rim.position.set(8, 6, -6);
  const sweep = new THREE.DirectionalLight(0xffffff, 0);
  scene.add(key, rim, sweep, new THREE.AmbientLight(0xffffff, 0.25));

  const shared = {
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
    glassBack: glassMaterial({ side: THREE.BackSide, opacity: 0.04, edge: 0.14 }),
    glassFront: glassMaterial({ side: THREE.FrontSide, opacity: 0.05, edge: 0.22 }),
    glassBase: glassMaterial({ side: THREE.FrontSide, opacity: 0.12, edge: 0.16, tint: 0x8fb3a2 }),
    gold: new THREE.MeshPhysicalMaterial({
      color: 0xd2a347,
      metalness: 1,
      roughness: 0.24,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.3,
    }),
    nozzle: new THREE.MeshBasicMaterial({ color: 0x1a1208 }),
    tube: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, transparent: true, opacity: 0.32, depthWrite: false }),
    liquid: [0, 1, 2].map(
      () =>
        new THREE.MeshPhysicalMaterial({
          color: 0xc88a55,
          emissive: 0xc88a55,
          emissiveIntensity: 0.16,
          roughness: 0.08,
          clearcoat: 1,
          envMapIntensity: 0.8,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        })
    ),
    shadow: new THREE.MeshBasicMaterial({
      map: radialTexture([
        [0, "rgba(40, 22, 10, 0.55)"],
        [0.38, "rgba(40, 22, 10, 0.26)"],
        [1, "rgba(40, 22, 10, 0)"],
      ]),
      transparent: true,
      depthWrite: false,
    }),
    caustic: new THREE.MeshBasicMaterial({
      map: radialTexture([
        [0, "rgba(255, 255, 255, 1)"],
        [1, "rgba(255, 255, 255, 0)"],
      ]),
      color: 0xc88a55,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  };

  const turn = new THREE.Group(); // pointer / drag / shake rotation, pivoting on the base
  scene.add(turn);

  const flacons = {};
  sizes.forEach((z) => {
    const f = buildFlacon(FLACONS[z.id], shared);
    f.volume = z.label.toUpperCase() + " · " + z.volume;
    f.root.visible = false;
    turn.add(f.root);
    flacons[z.id] = f;
  });

  // Pour stream from above into the neck
  const stream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 1, 14).translate(0, 0.5, 0),
    new THREE.MeshPhysicalMaterial({ color: 0xc88a55, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.9, depthWrite: false })
  );
  stream.renderOrder = 4;
  stream.visible = false;
  turn.add(stream);

  // ---------- Live state
  const timer = new THREE.Timer();
  let time = 0;
  let raf = 0;
  const order = sizes.map((z) => z.id);
  let active = flacons[sizeId] || flacons[50];
  active.theta = active.from = active.to = 0;

  const tiers = [0, 1, 2].map(() => ({ h: 0, target: 0, color: new THREE.Color(0xc88a55), goal: new THREE.Color(0xc88a55) }));
  let liquidColors = [];
  let mixedColor = new THREE.Color(0xc88a55);
  let blended = false;
  let capOpen = false;
  let capLift = 0;
  let pourAt = -1;
  let pourColor = new THREE.Color();
  let shakeAt = -1;
  let pingAt = -1;
  let shineAt = -1;

  let pointerOn = false;
  let pointerYaw = 0;
  let pointerPitch = 0;
  let yaw = 0;
  let pitch = 0;
  let dragYaw = 0;
  let dragVel = 0;
  let dragging = false;
  let lastDragAt = -10;
  let lastX = 0;

  let frameH = anatomy(active.spec).frameH;
  let labelText = { name: "Your Blend", notes: "Pick 2 to 3 notes" };

  // ---------- Label printing
  const fonts = {
    display: cssFont("--font-playfair", "'Playfair Display', Georgia, serif"),
    body: cssFont("--font-manrope", "Manrope, 'Segoe UI', sans-serif"),
  };
  const logo = new Image();
  logo.decoding = "async";
  logo.src = logoSrc;

  function printLabels() {
    Object.keys(flacons).forEach((id) => {
      const f = flacons[id];
      drawLabel(f.ctx, logo, fonts, labelText, f.volume);
      f.texture.needsUpdate = true;
    });
  }
  printLabels();
  const logoReady = new Promise((resolve) => {
    logo.onload = logo.onerror = resolve;
  }).then(printLabels);
  const fontsReady =
    document.fonts && document.fonts.ready
      ? Promise.all([
          document.fonts.load("italic 700 118px " + fonts.display),
          document.fonts.load("700 66px " + fonts.display),
          document.fonts.load("800 54px " + fonts.body),
        ])
          .catch(() => {})
          .then(printLabels)
      : Promise.resolve();
  // Resolves once the label can print with its real fonts and emblem
  const labelsReady = Promise.all([logoReady, fontsReady]);

  // ---------- Sizing & visibility
  function resize() {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) kick();
  });
  io.observe(host);

  // ---------- Drag to spin
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    dragVel = 0;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    dragYaw += dx * 0.012;
    dragVel = dx * 0.012 * 60;
    lastDragAt = time;
  });
  const endDrag = () => {
    dragging = false;
    lastDragAt = time;
    canvas.classList.remove("is-dragging");
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // ---------- Render loop
  function kick() {
    if (!still && !raf) raf = requestAnimationFrame(tick);
  }

  function tick() {
    raf = 0;
    if (!visible) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 1 / 30);
    time = timer.getElapsed();
    step(dt);
    renderer.render(scene, camera);
    if (!drawn) {
      // First real frame is up: lets the page fade out its loading skeleton
      drawn = true;
      canvas.classList.add("is-drawn");
    }
    raf = requestAnimationFrame(tick);
  }

  // Advance every animation by dt seconds and pose the scene
  function step(dt) {
    const motion = reduceMotion ? 0 : 1;

    // Camera framing eases between sizes so larger flacons genuinely read larger
    const own = anatomy(active.spec).frameH;
    frameH = damp(frameH, anatomy(LARGEST).frameH * 0.25 + own * 0.75, 5, dt);
    // Headroom so the floating cap (bob + pointer tilt) never touches the canvas top
    const viewH = frameH / 0.86;

    // Size carousel: flacons ride a turntable behind the stage. On a size change the
    // current one swings out along the arc to the back while the next swings in from
    // the opposite side, each turning as it travels and shrinking toward the back.
    const radius = viewH * camera.aspect * 0.3;
    Object.keys(flacons).forEach((id) => {
      const f = flacons[id];
      const u = reduceMotion ? 1 : Math.min(1, (time - f.t0) / SWAP_TIME);
      f.theta = f.from + (f.to - f.from) * easeInOutCubic(u);
      const near = (1 + Math.cos(f.theta)) / 2;
      const s = Math.pow(near, 0.7);
      f.root.visible = s > 0.02;
      f.root.position.set(Math.sin(f.theta) * radius, 0, (Math.cos(f.theta) - 1) * radius);
      f.root.rotation.y = f.theta * 0.75;
      f.body.scale.setScalar(Math.max(s, 0.0001));
    });
    const lookY = frameH * 0.45;
    const dist = viewH / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(0, lookY + viewH * 0.16, dist);
    camera.lookAt(0, lookY, 0);

    // Liquid tiers rise, drain and blend
    let stack = 0;
    tiers.forEach((tier, k) => {
      tier.h = damp(tier.h, tier.target, reduceMotion ? 60 : 2.6, dt);
      tier.color.lerp(tier.goal, 1 - Math.exp(-(blended ? 2.2 : 6) * dt));
      shared.liquid[k].color.copy(tier.color).lerp(LIQUID_TINT, 0.16);
      shared.liquid[k].emissive.copy(tier.color);
      Object.keys(flacons).forEach((id) => {
        const f = flacons[id];
        const m = f.tiers[k];
        const hh = tier.h * f.a.fullH;
        m.visible = hh > 0.01;
        m.scale.y = Math.max(hh, 0.001);
        m.position.y = f.a.cavBottom + stack * f.a.fullH;
      });
      stack += tier.h;
    });
    shared.caustic.color.copy(mixedColor);
    shared.caustic.opacity = damp(shared.caustic.opacity, liquidColors.length ? 0.22 + stack * 0.2 : 0, 3, dt);

    // Cap floats aside while pouring
    capLift = damp(capLift, capOpen ? 1 : 0, reduceMotion ? 60 : 4.5, dt);
    Object.keys(flacons).forEach((id) => {
      const f = flacons[id];
      const bob = capOpen ? Math.sin(time * 2.1) * 0.06 * motion : 0;
      f.capPivot.position.set(capLift * (f.spec.capR * 2.4 + 0.3), f.a.capSeat + capLift * f.a.lift + bob, 0);
      f.capPivot.rotation.z = -capLift * 0.32;
    });

    // Pour stream: grows down from above, holds, then falls in from the top
    if (pourAt >= 0) {
      const u = (time - pourAt) / 1.25;
      if (u >= 1) {
        pourAt = -1;
        stream.visible = false;
      } else {
        const top = active.a.frameH + 6;
        const surface = active.a.cavBottom + stack * active.a.fullH;
        const span = top - surface;
        let lo = surface;
        let hi = top;
        if (u < 0.42) lo = top - span * (u / 0.42);
        else if (u > 0.58) hi = top - span * ((u - 0.58) / 0.42);
        stream.visible = true;
        stream.position.y = lo;
        stream.scale.y = Math.max(hi - lo, 0.001);
        stream.material.color.copy(pourColor);
      }
    }

    // Orientation: idle sway, pointer follow, drag spin with inertia and spring home
    if (!dragging) {
      dragYaw += dragVel * dt;
      dragVel = damp(dragVel, 0, 3.5, dt);
      if (time - lastDragAt > 1.4) {
        const home = Math.round(dragYaw / (Math.PI * 2)) * Math.PI * 2;
        dragYaw = damp(dragYaw, home, 2.2, dt);
      }
    }
    const idle = pointerOn ? 0 : Math.sin(time * 0.45) * 0.38 * motion;
    yaw = damp(yaw, (pointerOn ? pointerYaw : idle) + dragYaw, 5, dt);
    pitch = damp(pitch, pointerOn ? pointerPitch : 0, 5, dt);

    let roll = 0;
    let shiftX = 0;
    if (shakeAt >= 0 && motion) {
      const u = (time - shakeAt - 0.55) / 1.0;
      if (u >= 1) shakeAt = -1;
      else if (u > 0) {
        const env = Math.pow(1 - u, 1.3);
        roll = Math.sin(u * Math.PI * 2 * 3.2) * 0.09 * env;
        shiftX = Math.sin(u * Math.PI * 2 * 3.2 + 0.6) * -0.18 * env;
      }
    }
    let bump = 1;
    if (pingAt >= 0) {
      const u = (time - pingAt) / 0.5;
      if (u >= 1) pingAt = -1;
      else bump = 1 + Math.sin(u * Math.PI) * 0.025 * motion;
    }
    turn.rotation.set(pitch, yaw, roll);
    turn.position.x = shiftX;
    turn.scale.setScalar(bump);

    // Light sweep across the glass after blending
    if (shineAt >= 0) {
      const u = (time - shineAt) / 1.4;
      if (u >= 1) {
        shineAt = -1;
        sweep.intensity = 0;
      } else {
        sweep.position.set(-12 + 24 * u, 8, 10);
        sweep.intensity = Math.sin(u * Math.PI) * 2.6;
      }
    }

  }
  let drawn = false;
  kick();

  // ---------- Public handle
  return {
    setSize(id) {
      const next = flacons[id];
      if (!next || next === active) return;
      // Larger sizes enter from the right, smaller from the left
      const dir = order.indexOf(id) > order.indexOf(order.find((k) => flacons[k] === active)) ? 1 : -1;
      const prev = active;
      prev.from = prev.theta;
      prev.to = -dir * Math.PI;
      prev.t0 = time;
      next.from = Math.abs(next.theta) > Math.PI * 0.98 ? dir * Math.PI : next.theta;
      next.to = 0;
      next.t0 = time;
      active = next;
      kick();
    },
    setLiquid(colors, max, mixed) {
      liquidColors = colors;
      mixedColor = new THREE.Color(mixed);
      tiers.forEach((tier, k) => {
        tier.target = k < colors.length ? 1 / max : 0;
        if (k < colors.length) tier.goal.set(blended ? mixed : colors[k]);
        if (tier.h < 0.002 && k < colors.length) tier.color.set(colors[k]);
      });
    },
    setBlended(on) {
      blended = on;
      tiers.forEach((tier, k) => {
        if (k < liquidColors.length) tier.goal.set(on ? mixedColor : liquidColors[k]);
      });
    },
    setCapOpen(open) {
      capOpen = open;
    },
    reset() {
      capOpen = false;
      capLift = 0;
      blended = false;
      liquidColors = [];
      tiers.forEach((tier) => {
        tier.h = 0;
        tier.target = 0;
      });
      Object.keys(flacons).forEach((id) => {
        const f = flacons[id];
        f.capPivot.position.set(0, f.a.capSeat, 0);
        f.capPivot.rotation.z = 0;
      });
      kick();
    },
    setLabel(text) {
      if (text.name === labelText.name && text.notes === labelText.notes) return;
      labelText = text;
      printLabels();
    },
    pour(color) {
      pourColor = new THREE.Color(color);
      pourAt = time;
    },
    shake() {
      shakeAt = time;
    },
    ping() {
      pingAt = time;
    },
    shine() {
      shineAt = time;
    },
    pointer(px, py) {
      pointerOn = true;
      pointerYaw = px * 0.9;
      pointerPitch = py * 0.16;
    },
    pointerLeave() {
      pointerOn = false;
    },
    // Jump every animation to its resting state: no carousel swing, pour or fill
    settle() {
      Object.keys(flacons).forEach((id) => {
        const f = flacons[id];
        f.theta = f.from = f.to = f === active ? 0 : Math.PI;
        f.t0 = -Infinity;
      });
      tiers.forEach((tier) => {
        tier.h = tier.target;
        tier.color.copy(tier.goal);
      });
      const fill = tiers.reduce((sum, tier) => sum + tier.target, 0);
      shared.caustic.opacity = liquidColors.length ? 0.22 + fill * 0.2 : 0;
      capLift = capOpen ? 1 : 0;
      frameH = anatomy(LARGEST).frameH * 0.25 + anatomy(active.spec).frameH * 0.75;
      pourAt = shakeAt = pingAt = shineAt = -1;
      stream.visible = false;
      sweep.intensity = 0;
      step(0);
    },
    labelsReady,
    // Render the current pose once and return it as an image URL
    snapshot(type = "image/webp", quality = 0.9) {
      resize();
      renderer.render(scene, camera);
      return canvas.toDataURL(type, quality);
    },
    // Stop rendering and free the GPU context (the bag page mounts one flacon per item)
    dispose() {
      visible = false;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) [].concat(obj.material).forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      });
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
    // Client coordinates of the active flacon's neck, for the droplet flight
    neckPoint() {
      const v = new THREE.Vector3(0, active.spec.h + 0.4, 0);
      active.root.localToWorld(v);
      v.project(camera);
      const r = canvas.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
    },
  };
}
