/* Urban Virtue: Custom Blend Atelier & Interactive Flacon Engine
   Includes:
   - High-performance Background Splash Canvas Engine (fluid plumes, 3D droplets, ripples, vortex mix)
   - Real-time Web Audio Synthesizer (droplets, pour trickle, harmonic mix chime)
   - Scent Accord Radar & Formula Calculations
   - Real-time 3D Flacon in three volumes (see flacon3d.js)
   - Flacon Personalization / Custom Label Stamping
*/

import { NOTES, SIZES, MIN, MAX, formulaName, formulaNumber, labelNotes, mixColor } from "@/lib/catalog";
import { lookOfLine, renderStills } from "@/lib/flaconStills";

let stopActive = null;

// Boots the studio on the current DOM and returns stop(), which removes every global listener,
// animation loop, timer and the WebGL flacon. Starting again (React remount, StrictMode,
// client-side navigation back to a page with the studio) first stops the previous run.
export function startCustomBlend() {
  if (stopActive) stopActive();

  let alive = true;
  const cleanups = [];
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  }
  // Animation loops stop rescheduling once this run is stopped
  function raf(fn) {
    if (alive) requestAnimationFrame(fn);
  }

  const reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Web Audio Synthesizer (Realistic Sound Effects)
  const sound = (() => {
    let ctx = null;
    let enabled = false;

    function init() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioCtx();
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
    }

    return {
      toggle: () => {
        enabled = !enabled;
        if (enabled) init();
        return enabled;
      },
      isEnabled: () => enabled,
      drop: (freq = 800) => {
        if (!enabled || !ctx) return;
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = "bandpass";
          filter.frequency.setValueAtTime(freq, now);
          filter.Q.setValueAtTime(8, now);

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq * 1.5, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.12);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
        } catch (e) {}
      },
      pour: () => {
        if (!enabled || !ctx) return;
        try {
          const now = ctx.currentTime;
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            const f0 = 420 + Math.random() * 320;
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1200, now);

            osc.type = "triangle";
            osc.frequency.setValueAtTime(f0, now + i * 0.08);
            osc.frequency.linearRampToValueAtTime(f0 * 1.3, now + i * 0.08 + 0.18);

            gain.gain.setValueAtTime(0.001, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.06, now + i * 0.08 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
          }
        } catch (e) {}
      },
      mixChime: () => {
        if (!enabled || !ctx) return;
        try {
          const now = ctx.currentTime;
          // Harmonic glass chime chord: E5, B5, G#6
          const chords = [659.25, 987.77, 1661.22];
          chords.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);

            gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 1.9);
          });
        } catch (e) {}
      },
      click: () => {
        if (!enabled || !ctx) return;
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.035);
        } catch (e) {}
      },
    };
  })();

  // ---------- Realistic Background Splash & Caustic Engine
  // Situated on canvas#splashCanvas directly behind the bottle flacon
  const splashEngine = (() => {
    const cv = document.getElementById("splashCanvas");
    if (!cv) return null;
    const ctx = cv.getContext("2d");
    if (!ctx) return null;

    let dpr = 1;
    let width = 0;
    let height = 0;
    let activeColor = "#d4af37";

    // Particle structures
    let plumes = []; // Fluid splash tendrils/curving plumes
    let droplets = []; // 3D spherical liquid beads
    let ripples = []; // Concentric caustic floor rings
    let mist = []; // Atmospheric floating scent micelles
    let vortexStreams = []; // Whirlpool spiral arcs for the mixing phase
    let running = true;

    function resize() {
      const stageEl = document.getElementById("stageContainer") || cv.parentElement;
      const rect = stageEl ? stageEl.getBoundingClientRect() : cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width || 600);
      height = Math.max(450, rect.height || 680);
      cv.width = Math.max(1, Math.floor(width * dpr));
      cv.height = Math.max(1, Math.floor(height * dpr));
    }
    resize();
    on(window, "resize", resize);

    // Initial ambient mist particles
    for (let i = 0; i < 40; i++) {
      mist.push({
        x: Math.random() * (width || 500),
        y: Math.random() * (height || 700),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.15 - Math.random() * 0.35,
        r: 1 + Math.random() * 2.5,
        alpha: 0.15 + Math.random() * 0.45,
        color: i % 2 === 0 ? "#ffd700" : "#ffffff",
      });
    }

    // Spawn ambient splash wave on startup
    setTimeout(() => {
      triggerAmbientCrown();
    }, 400);

    function triggerAmbientCrown() {
      const cx = width / 2;
      const cy = height * 0.52;
      const col = chosen().length ? chosen()[chosen().length - 1].color : "#d5b263";
      for (let i = 0; i < 5; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        const angle = -Math.PI / 2 + side * (0.35 + (i * 0.2));
        plumes.push({
          baseX: cx + (Math.random() - 0.5) * 40,
          baseY: cy + 120,
          ctrlX: cx + side * (70 + i * 20),
          ctrlY: cy - (20 + i * 25),
          tipX: cx + Math.cos(angle) * (110 + i * 25),
          tipY: cy + Math.sin(angle) * (120 + i * 30),
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          gravity: 0.08,
          thickness: 4 + Math.random() * 3,
          color: col,
          life: 60 + i * 8,
          maxLife: 90,
        });
      }
    }

    // Helper: Draw realistic 3D liquid droplet with specular glint
    function draw3DDroplet(x, y, r, color, alpha) {
      if (r <= 0.5) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Realistic optical drop shadow for tactile depth
      ctx.shadowColor = "rgba(45, 25, 12, 0.22)";
      ctx.shadowBlur = Math.max(2, r * 1.2);
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      // Droplet radial gradient (translucent center, richer rim)
      const grad = ctx.createRadialGradient(
        x - r * 0.3,
        y - r * 0.35,
        r * 0.1,
        x,
        y,
        r
      );
      grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.35, color);
      grad.addColorStop(0.85, color);
      grad.addColorStop(1, "rgba(45, 25, 12, 0.35)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Clear shadow for crisp pinpoint specular highlight
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(x - r * 0.32, y - r * 0.38, Math.max(0.6, r * 0.24), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    let ambientTick = 0;
    // Main animation loop
    function render(time) {
      if (document.hidden) {
        raf(render);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.52;

      ambientTick++;
      // Continuous elegant ambient splashes rising behind the flacon
      if (ambientTick % 48 === 0 && plumes.length < 5) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const angle = -Math.PI / 2 + side * (0.35 + Math.random() * 0.85);
        const col = chosen().length ? chosen()[chosen().length - 1].color : "#d5b263";
        plumes.push({
          baseX: cx + (Math.random() - 0.5) * 50,
          baseY: cy + 120,
          ctrlX: cx + side * (60 + Math.random() * 80),
          ctrlY: cy - (10 + Math.random() * 80),
          tipX: cx + Math.cos(angle) * (100 + Math.random() * 110),
          tipY: cy + Math.sin(angle) * (100 + Math.random() * 120),
          vx: Math.cos(angle) * (2 + Math.random() * 2.5),
          vy: Math.sin(angle) * (2 + Math.random() * 2.5),
          gravity: 0.07,
          thickness: 3 + Math.random() * 3.5,
          color: col,
          life: 55 + Math.floor(Math.random() * 25),
          maxLife: 80,
        });

        // Ambient ascending perfume droplets
        for (let k = 0; k < 2; k++) {
          droplets.push({
            x: cx + (Math.random() - 0.5) * 100,
            y: cy + 50 + Math.random() * 50,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.2 - Math.random() * 2,
            gravity: -0.015,
            drag: 0.99,
            r: 1.5 + Math.random() * 2.5,
            color: k === 0 ? "#ffffff" : col,
            life: 60 + Math.random() * 30,
            maxLife: 90,
          });
        }
      }

      // 1. Draw expanding floor caustic ripples behind the bottle base
      ripples = ripples.filter((rp) => rp.life > 0);
      ripples.forEach((rp) => {
        rp.r += rp.speed;
        rp.life -= 1;
        const progress = 1 - rp.life / rp.maxLife;
        const a = (1 - progress) * rp.initialAlpha;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.strokeStyle = rp.color;
        ctx.lineWidth = Math.max(1, rp.width * (1 - progress * 0.6));
        ctx.beginPath();
        // Perspective ellipse
        ctx.ellipse(rp.x, rp.y, rp.r * 1.5, rp.r * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Secondary inner caustic shimmer ring
        if (rp.r > 20) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.ellipse(rp.x, rp.y, rp.r * 1.25, rp.r * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 2. Draw Fluid Splash Plumes (curving liquid waves & crowns)
      plumes = plumes.filter((p) => p.life > 0);
      plumes.forEach((p) => {
        p.life -= 1;
        const prog = 1 - p.life / p.maxLife;
        const ease = Math.sin(prog * Math.PI);
        const alpha = Math.min(1, ease * 1.2);

        // Update physics
        p.tipX += p.vx;
        p.tipY += p.vy;
        p.vy += p.gravity;
        p.ctrlX += p.vx * 0.45;
        p.ctrlY += p.vy * 0.35;

        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.shadowColor = "rgba(45, 25, 12, 0.15)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;

        // Fluid stream path
        ctx.beginPath();
        ctx.moveTo(p.baseX, p.baseY);
        ctx.quadraticCurveTo(p.ctrlX, p.ctrlY, p.tipX, p.tipY);

        // Liquid plume gradient
        const streamGrad = ctx.createLinearGradient(
          p.baseX,
          p.baseY,
          p.tipX,
          p.tipY
        );
        streamGrad.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        streamGrad.addColorStop(0.3, p.color);
        streamGrad.addColorStop(0.8, p.color);
        streamGrad.addColorStop(1, "rgba(255, 255, 255, 0.9)");

        ctx.strokeStyle = streamGrad;
        ctx.lineWidth = Math.max(2, p.thickness * (1 - prog * 0.7));
        ctx.lineCap = "round";
        ctx.stroke();

        // Crisp specular highlight along the leading edge
        ctx.lineWidth = Math.max(1, (p.thickness * 0.3) * (1 - prog * 0.7));
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.stroke();

        // Droplet blossoming at the tip
        draw3DDroplet(
          p.tipX,
          p.tipY,
          p.thickness * 0.8 * (1 - prog * 0.4),
          p.color,
          alpha
        );

        ctx.restore();
      });

      // 3. Draw Whirlpool / Vortex Streams (Active during mixing)
      vortexStreams = vortexStreams.filter((v) => v.life > 0);
      vortexStreams.forEach((v) => {
        v.life -= 1;
        v.angle += v.speed;
        v.dist *= 1.018;
        const prog = 1 - v.life / v.maxLife;
        const curX = cx + Math.cos(v.angle) * v.dist * 1.2;
        const curY = cy + Math.sin(v.angle) * (v.dist * 0.6) - prog * 60;
        const alpha = Math.sin(prog * Math.PI) * 0.85;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = v.color;
        ctx.lineWidth = Math.max(1.5, v.width * (1 - prog));
        ctx.beginPath();
        ctx.arc(curX, curY, Math.max(2, v.width * 1.2), 0, Math.PI * 2);
        ctx.fillStyle = v.color;
        ctx.fill();
        draw3DDroplet(curX, curY, Math.max(1.5, v.width * 0.9), v.color, alpha);
        ctx.restore();
      });

      // 4. Draw 3D Liquid Droplets
      droplets = droplets.filter((d) => d.life > 0);
      droplets.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += d.gravity;
        d.vx *= d.drag;
        d.vy *= d.drag;
        d.life -= 1;

        const progress = 1 - d.life / d.maxLife;
        const alpha = Math.min(1, (d.life / d.maxLife) * 1.4);

        // Motion trail for high-speed drops
        if (Math.abs(d.vx) + Math.abs(d.vy) > 3) {
          ctx.save();
          ctx.globalAlpha = alpha * 0.35;
          ctx.strokeStyle = d.color;
          ctx.lineWidth = d.r * 1.2;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.vx * 1.8, d.y - d.vy * 1.8);
          ctx.stroke();
          ctx.restore();
        }

        draw3DDroplet(d.x, d.y, d.r, d.color, alpha);
      });

      // 5. Draw Slow-drifting Golden/Scent Mist
      mist.forEach((m) => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        const pulse = 0.7 + 0.3 * Math.sin(time * 0.002 + m.r);
        ctx.save();
        ctx.globalAlpha = m.alpha * pulse;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2.5);
        g.addColorStop(0, m.color);
        g.addColorStop(1, "rgba(218, 165, 32, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      raf(render);
    }

    raf(render);

    return {
      setColor: (col) => {
        activeColor = col;
      },
      // Trigger dramatic liquid splash when a note is poured
      triggerPourSplash: (color = activeColor) => {
        if (reduceMotion) return;
        const cx = width / 2;
        const cy = height * 0.58;

        // 1. Splash Plumes erupting upwards and outwards from behind the bottle
        const plumeCount = 10 + Math.floor(Math.random() * 5);
        for (let i = 0; i < plumeCount; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const spread = 0.35 + Math.random() * 1.2;
          const angle = -Math.PI / 2 + side * spread;
          const force = 8 + Math.random() * 12;

          plumes.push({
            baseX: cx + (Math.random() - 0.5) * 40,
            baseY: cy + 40,
            ctrlX: cx + side * (50 + Math.random() * 70),
            ctrlY: cy - (40 + Math.random() * 80),
            tipX: cx + Math.cos(angle) * (90 + Math.random() * 120),
            tipY: cy + Math.sin(angle) * (90 + Math.random() * 130),
            vx: Math.cos(angle) * (force * 0.4),
            vy: Math.sin(angle) * (force * 0.5),
            gravity: 0.18,
            thickness: 4 + Math.random() * 6,
            color: color,
            life: 45 + Math.floor(Math.random() * 25),
            maxLife: 70,
          });
        }

        // 2. High-speed 3D droplets casting outward in a crown
        const dropCount = 48;
        for (let i = 0; i < dropCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 8.5;
          droplets.push({
            x: cx + (Math.random() - 0.5) * 60,
            y: cy - 20 + (Math.random() - 0.5) * 50,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.2,
            gravity: 0.16,
            drag: 0.982,
            r: 1.5 + Math.random() * 3.8,
            color: i % 4 === 0 ? "#ffffff" : color,
            life: 50 + Math.floor(Math.random() * 35),
            maxLife: 85,
          });
        }

        // 3. Expanding caustic ripples along the bottle base
        ripples.push({
          x: cx,
          y: cy + 140,
          r: 20,
          speed: 3.5,
          width: 3.5,
          initialAlpha: 0.85,
          color: color,
          life: 45,
          maxLife: 45,
        });
        ripples.push({
          x: cx,
          y: cy + 140,
          r: 10,
          speed: 2.2,
          width: 2,
          initialAlpha: 0.65,
          color: "#ffffff",
          life: 55,
          maxLife: 55,
        });

        // Sound trigger
        sound.pour();
      },

      // Trigger spectacular vortex mixing splash when user clicks 'Mix My Blend'
      triggerMixVortex: (colors = ["#dca74e", "#e25c80", "#683925"]) => {
        if (reduceMotion) return;
        const cx = width / 2;
        const cy = height * 0.52;

        // Spiraling vortex ribbons
        for (let i = 0; i < 90; i++) {
          const c = colors[i % colors.length];
          vortexStreams.push({
            angle: (i / 90) * Math.PI * 4,
            dist: 30 + (i % 3) * 35,
            speed: 0.08 + Math.random() * 0.06,
            width: 3 + Math.random() * 4,
            color: c,
            life: 75 + Math.random() * 35,
            maxLife: 110,
          });
        }

        // Explosive finale droplet burst
        for (let i = 0; i < 120; i++) {
          const a = Math.random() * Math.PI * 2;
          const v = 3.5 + Math.random() * 11;
          const c = colors[i % colors.length];
          droplets.push({
            x: cx + (Math.random() - 0.5) * 40,
            y: cy + (Math.random() - 0.5) * 60,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v - 2.8,
            gravity: 0.12,
            drag: 0.985,
            r: 2 + Math.random() * 4.5,
            color: i % 5 === 0 ? "#fff2c8" : c,
            life: 65 + Math.random() * 45,
            maxLife: 110,
          });
        }

        // Heavy floor shockwave ripples
        for (let k = 0; k < 3; k++) {
          setTimeout(() => {
            ripples.push({
              x: cx,
              y: cy + 140,
              r: 15,
              speed: 4 + k * 1.2,
              width: 4,
              initialAlpha: 0.9,
              color: colors[k % colors.length],
              life: 50,
              maxLife: 50,
            });
          }, k * 200);
        }

        sound.mixChime();
      },

      // Interactive splash at user pointer position
      triggerPointerSplash: (x, y, color = activeColor, intensity = 1) => {
        if (reduceMotion) return;
        const count = Math.floor(12 * intensity);
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const v = (1.5 + Math.random() * 4.5) * intensity;
          droplets.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v - 1.2,
            gravity: 0.14,
            drag: 0.98,
            r: 1.2 + Math.random() * 2.8,
            color: i % 3 === 0 ? "#ffffff" : color,
            life: 30 + Math.random() * 25,
            maxLife: 55,
          });
        }
        ripples.push({
          x: x,
          y: y,
          r: 6,
          speed: 2.2,
          width: 1.8,
          initialAlpha: 0.65,
          color: color,
          life: 32,
          maxLife: 32,
        });

        sound.drop(650 + Math.random() * 300);
      },
    };
  })();

  // Ambient motes on main screen canvas#ambient
  (() => {
    const cv = document.getElementById("ambient");
    if (!cv || reduceMotion) return;
    const ctx = cv.getContext("2d");
    let dpr = 1;
    const motes = [];

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
    }
    size();
    on(window, "resize", size);

    for (let i = 0; i < 48; i++) {
      motes.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 2,
        s: 0.00008 + Math.random() * 0.00022,
        p: Math.random() * 6.283,
        a: 0.2 + Math.random() * 0.55,
      });
    }

    function frame(t) {
      if (document.hidden) {
        raf(frame);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      motes.forEach((m) => {
        m.y -= m.s;
        if (m.y < -0.02) {
          m.y = 1.02;
          m.x = Math.random();
        }
        const x = (m.x + Math.sin(t / 4200 + m.p) * 0.015) * window.innerWidth;
        const y = m.y * window.innerHeight;
        const tw = 0.6 + 0.4 * Math.sin(t / 950 + m.p * 3);

        ctx.globalAlpha = m.a * tw;
        const g = ctx.createRadialGradient(x, y, 0, x, y, m.r * 4.5);
        g.addColorStop(0, "rgba(229, 192, 123, 0.95)");
        g.addColorStop(1, "rgba(229, 192, 123, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, m.r * 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      raf(frame);
    }
    raf(frame);
  })();

  // ---------- Atelier State
  const state = {
    picks: [],
    size: "50",
    phase: "build", // 'build' | 'mixing' | 'done'
    auto: false,
    full: false,
    added: false,
    adding: false,
    cartError: "",
    customName: "",
    soundEnabled: false,
  };

  let timers = [];
  const $ = (id) => document.getElementById(id);
  const el = {
    slots: $("slots"),
    count: $("count"),
    resetBtn: $("resetBtn"),
    status: $("status"),
    sizes: $("sizes"),
    price: $("price"),
    actions: $("actions"),
    grid: $("noteGrid"),
    surprise: $("surprise"),
    blendBox: $("blendBox"),
    bottle: $("bottle"),
    frame: $("frame"),
    botanicalStage: $("botanicalStage"),
    stageGlow: $("stageGlow"),
    stageCaustic: $("stageCaustic"),
    accordBreakdown: $("accordBreakdown"),
    customNameInput: $("customNameInput"),
    soundToggle: $("soundToggle"),
    cartCounter: $("cartCounter"),
  };

  // Real-time 3D flacon, loaded after the studio controls so the page is usable straight away
  // (the bottle skeleton shows until its first frame). Falls back to a still where WebGL is
  // unavailable. Until it arrives every flacon call is skipped, then it catches up with the state.
  let flacon = null;
  // Building the scene (reflection map, shader compile) is the heaviest step, so it waits for an
  // idle moment: clicks on the note organ stay instant while it happens
  const whenIdle = () =>
    new Promise((resolve) =>
      window.requestIdleCallback ? requestIdleCallback(resolve, { timeout: 400 }) : setTimeout(resolve, 1),
    );
  Promise.all([import("./flacon3d"), whenIdle()])
    .then(([{ createFlacon3D }]) => {
      if (!alive) return;
      flacon = createFlacon3D({
        host: el.frame,
        sizes: SIZES,
        sizeId: state.size,
        logoSrc: "/logo.jpeg",
        reduceMotion,
      });
      if (state.phase !== "build") flacon.setBlended(true);
      paintBottle();
    })
    .catch(() => {
      if (alive) el.bottle.classList.add("no-webgl");
    });

  // The desktop studio fills exactly one screen below the announcement bar & header
  function measureChrome() {
    const bar = document.querySelector(".announcement-bar");
    const header = document.querySelector(".site-header");
    const h = (bar ? bar.offsetHeight : 0) + (header ? header.offsetHeight : 0);
    document.documentElement.style.setProperty("--chrome-h", h + "px");
  }
  measureChrome();
  on(window, "resize", measureChrome);

  function find(id) {
    return NOTES.filter((n) => n.id === id)[0];
  }
  function chosen() {
    return state.picks.map(find);
  }
  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function blendName(list) {
    return formulaName(list, state.customName);
  }

  function blendNumber(list) {
    return formulaNumber(list);
  }

  function currentSize() {
    return SIZES.filter((z) => z.id === state.size)[0] || SIZES[1];
  }

  // Calculate live olfactory accord balance
  function calculateAccords(list) {
    if (!list.length) {
      return { floral: 0, woody: 0, fresh: 0, oriental: 0, gourmand: 0 };
    }
    const acc = { floral: 0, woody: 0, fresh: 0, oriental: 0, gourmand: 0 };
    list.forEach((note) => {
      acc.floral += note.accords.floral;
      acc.woody += note.accords.woody;
      acc.fresh += note.accords.fresh;
      acc.oriental += note.accords.oriental;
      acc.gourmand += note.accords.gourmand;
    });
    const total = Object.values(acc).reduce((a, b) => a + b, 0) || 1;
    return {
      floral: Math.round((acc.floral / total) * 100),
      woody: Math.round((acc.woody / total) * 100),
      fresh: Math.round((acc.fresh / total) * 100),
      oriental: Math.round((acc.oriental / total) * 100),
      gourmand: Math.round((acc.gourmand / total) * 100),
    };
  }

  // ---------- Bottle & Stage Rendering
  function paintBottle() {
    const list = chosen();
    const n = list.length;
    const building = state.phase === "build";
    const mixed = mixColor(list);

    if (flacon) {
      flacon.setLiquid(list.map((c) => c.color), MAX, mixed);
      flacon.setCapOpen(building && n > 0);
      flacon.setSize(state.size);
    }
    paintLabel(list);

    // Dynamic stage ambient glow & caustics
    if (el.stageGlow) {
      if (n > 0) {
        const glowCol = state.phase === "done" ? mixed : list[n - 1].color;
        el.stageGlow.style.background =
          "radial-gradient(circle at 50% 50%, " +
          glowCol +
          "55 0%, " +
          glowCol +
          "22 45%, transparent 70%)";
        el.stageGlow.style.opacity = "1";
      } else {
        el.stageGlow.style.background = "";
        el.stageGlow.style.opacity = "0.35";
      }
    }

    // Inform the background splash engine of active color
    if (splashEngine && n > 0) {
      splashEngine.setColor(state.phase === "done" ? mixed : list[n - 1].color);
    }
  }

  // Emblem label printed on the glass
  function paintLabel(list) {
    if (!flacon) return;
    flacon.setLabel({
      name: blendName(list),
      notes: list.length ? labelNotes(list) : "Pick 2 to 3 notes",
    });
  }

  function pour(color) {
    if (flacon) flacon.pour(color);

    later(() => {
      // Trigger background fluid splash
      if (splashEngine) {
        splashEngine.triggerPourSplash(color);
      }
      if (flacon) flacon.ping();
    }, 850);
  }

  // ---------- Accord Radar & Analysis
  function renderAccords() {
    if (!el.accordBreakdown) return;
    const accords = calculateAccords(chosen());
    el.accordBreakdown.innerHTML = `
      <div class="accord-composite-track" title="Accord balance spectrum">
        <span style="width: ${accords.floral}%; background: #e25c80;" title="Floral ${accords.floral}%"></span>
        <span style="width: ${accords.woody}%; background: #ba7b43;" title="Woody ${accords.woody}%"></span>
        <span style="width: ${accords.fresh}%; background: #3fa7ba;" title="Fresh ${accords.fresh}%"></span>
        <span style="width: ${accords.gourmand}%; background: #dca74e;" title="Gourmand ${accords.gourmand}%"></span>
        <span style="width: ${accords.oriental}%; background: #c96218;" title="Oriental ${accords.oriental}%"></span>
      </div>
      <div class="accord-labels-row">
        <span class="accord-tag"><i style="background: #e25c80"></i>Floral ${accords.floral}%</span>
        <span class="accord-tag"><i style="background: #ba7b43"></i>Woody ${accords.woody}%</span>
        <span class="accord-tag"><i style="background: #3fa7ba"></i>Fresh ${accords.fresh}%</span>
        <span class="accord-tag"><i style="background: #dca74e"></i>Gourmand ${accords.gourmand}%</span>
        <span class="accord-tag"><i style="background: #c96218"></i>Oriental ${accords.oriental}%</span>
      </div>
    `;
  }

  // Botanical raw ingredients floating aura behind flacon
  function renderBotanicals() {
    if (!el.botanicalStage) return;
    const list = chosen();
    if (!list.length) {
      el.botanicalStage.innerHTML = "";
      return;
    }

    const posClasses = ["pos-top-left", "pos-top-right", "pos-crown"];
    el.botanicalStage.innerHTML = list
      .map((note, idx) => {
        const pos = posClasses[idx] || "pos-top-left";
        return (
          '<div class="botanical-aura-item ' +
          pos +
          '" style="--note-color:' +
          note.color +
          '; animation-delay:' +
          idx * 0.12 +
          's;">' +
          '<div class="botanical-glow" style="background: radial-gradient(circle, ' +
          note.color +
          '44 0%, ' +
          note.color +
          '00 70%);"></div>' +
          '<div class="botanical-badge">' +
          '<img src="' +
          note.image +
          '" alt="' +
          note.name +
          '" class="botanical-img" />' +
          '<span class="botanical-tag">' +
          note.name +
          '</span>' +
          '</div>' +
          '</div>'
        );
      })
      .join("");
  }

  // ---------- Formula Slots
  function renderSlots() {
    const list = chosen();
    const locked = state.phase !== "build" || state.auto;
    let html = "";

    for (let k = 0; k < MAX; k++) {
      const c = list[k];
      const tierName = k === 0 ? "Top" : k === 1 ? "Heart" : "Base";
      const num = k + 1 + "/3";

      if (c) {
        html +=
          '<li data-key="' +
          c.id +
          (locked ? "-l" : "") +
          '"><button class="slot is-full" type="button" data-id="' +
          c.id +
          '" aria-label="Remove ' +
          c.name +
          '"' +
          (locked ? " disabled" : "") +
          ">" +
          '<span class="slot-num">' +
          num +
          " · " +
          tierName +
          (locked
            ? ""
            : '<span class="slot-x" title="Remove note" aria-hidden="true">✕</span>') +
          "</span>" +
          '<span class="slot-name"><i class="slot-dot" style="background:' +
          c.color +
          '"></i><span>' +
          c.name +
          "</span></span>" +
          '<span class="slot-origin">' +
          c.origin +
          "</span>" +
          '<span class="slot-bar" style="background:' +
          c.color +
          '"></span></button></li>';
      } else {
        html +=
          '<li data-key="empty' +
          k +
          '"><div class="slot"><span class="slot-num">' +
          num +
          " · " +
          tierName +
          '</span><span class="slot-empty">' +
          (k === MAX - 1 ? "Optional Note" : "Select Note") +
          '</span><span class="slot-bar"></span></div></li>';
      }
    }

    el.slots.innerHTML = html;
    el.count.textContent = list.length + " / " + MAX;
    if (el.resetBtn) {
      el.resetBtn.style.opacity = list.length > 0 ? "1" : "0.5";
      el.resetBtn.style.pointerEvents = list.length > 0 ? "auto" : "none";
    }
  }

  function statusText() {
    const n = state.picks.length;
    if (state.phase === "done")
      return "Formulation Complete. " + blendName(chosen()) + " is sealed & ready.";
    if (state.phase === "mixing") return "Sealing, shaking and blending essence…";
    if (state.auto) return "Master perfumer is formulating a signature blend…";
    if (state.full) return "Flacon is full. Tap a note above to replace it.";
    if (n === 0) return "Select your first noble essence to begin the pour.";
    if (n === 1) return "Pouring first tier. Pick a heart note to harmonize.";
    if (n === 2) return "Ready to blend, or choose a third note for complexity.";
    return "Flacon ready. Harmonize your blend.";
  }

  function renderSizes() {
    el.sizes.innerHTML = SIZES.map((z) => {
      return (
        '<button class="size" type="button" data-size="' +
        z.id +
        '" aria-pressed="' +
        (z.id === state.size) +
        '">' +
        '<span class="size-vol">' +
        z.label +
        "</span>" +
        '<span class="size-pr">' +
        z.price +
        "</span>" +
        "</button>"
      );
    }).join("");
    el.price.textContent = currentSize().price;
  }

  function renderActions() {
    const n = state.picks.length;
    const list = chosen();

    if (state.phase === "build") {
      const ready = n >= MIN && !state.auto;
      el.actions.innerHTML =
        '<button class="btn btn-primary' +
        (ready ? " is-ready" : "") +
        '" type="button" data-act="mix"' +
        (ready ? "" : " disabled") +
        ">" +
        '<span class="btn-shine"></span>' +
        '<span class="btn-text">' +
        (n < MIN
          ? "Select " + (MIN - n) + " more note" + (MIN - n > 1 ? "s" : "") + " to blend"
          : "✦ Harmonize My Blend") +
        "</span></button>";
    } else if (state.phase === "mixing") {
      el.actions.innerHTML =
        '<button class="btn btn-primary" type="button" disabled style="background:#5a3818;color:#fdfbf7">' +
        '<span class="spinner"></span>Sealing & Harmonizing Essence…</button>';
    } else {
      el.actions.innerHTML =
        '<div class="result">' +
        '<div class="result-badge">✦ ATELIER SIGNATURE FORMULA</div>' +
        "<strong>" +
        blendName(list) +
        "</strong>" +
        "<p>Formula No. " +
        blendNumber(list) +
        " · " +
        currentSize().label +
        " (" +
        currentSize().volume +
        ") · " +
        list.map((c) => "1/3 " + c.name).join(" + ") +
        "</p>" +
        '<div class="result-bar">' +
        list
          .map((c) => '<span style="background:' + c.color + '"></span>')
          .join("") +
        "</div></div>" +
        (state.added
          ? '<a class="btn btn-primary btn-gold" href="/bag">' +
            '<span class="btn-shine"></span>' +
            '<span class="btn-text">✓ Added · View Your Bag</span></a>'
          : '<button class="btn btn-primary btn-gold" type="button" data-act="cart"' +
            (state.adding ? " disabled" : "") +
            ">" +
            '<span class="btn-shine"></span>' +
            '<span class="btn-text">' +
            (state.adding ? "Adding to Bag…" : "Add to Bag · " + currentSize().price) +
            "</span></button>") +
        (state.cartError
          ? '<p class="cart-error" role="alert">' + escapeHtml(state.cartError) + "</p>"
          : "") +
        '<div class="btn-row"><button class="btn btn-ghost" type="button" data-act="edit">Adjust Formula</button>' +
        '<button class="btn btn-ghost" type="button" data-act="reset">New Formulation</button></div>';
    }
  }

  const tiles = {};
  function buildNotes() {
    el.grid.innerHTML = NOTES.map((nt) => {
      return (
        '<li><button class="note" type="button" data-id="' +
        nt.id +
        '" aria-pressed="false" style="--ring:' +
        nt.color +
        '">' +
        '<span class="note-img">' +
        '<img src="' +
        nt.thumb +
        '" alt="' +
        nt.name +
        '" width="180" height="180" loading="lazy">' +
        '<span class="tier-pill tier-' +
        nt.tier +
        '">' +
        nt.tier.toUpperCase() +
        "</span>" +
        "</span>" +
        '<span class="note-meta">' +
        '<span class="note-name">' +
        nt.name +
        "</span>" +
        '<span class="note-fam">' +
        nt.family +
        " · " +
        nt.origin +
        "</span>" +
        '<span class="note-mood">' +
        nt.mood +
        "</span>" +
        "</span>" +
        "</button></li>"
      );
    }).join("");

    NOTES.forEach((nt) => {
      tiles[nt.id] = el.grid.querySelector('[data-id="' + nt.id + '"]');
    });
    setTimeout(() => {
      el.grid.classList.add("is-settled");
    }, 1200);
  }

  function renderNotes() {
    const n = state.picks.length;
    const locked = state.phase !== "build" || state.auto;

    NOTES.forEach((nt) => {
      const b = tiles[nt.id];
      if (!b) return;
      const idx = state.picks.indexOf(nt.id);
      const on = idx >= 0;
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("is-dim", !on && (n >= MAX || locked));
      b.disabled = locked;

      const img = b.querySelector(".note-img");
      let badge = img.querySelector(".note-badge");
      const label = idx + 1 + "/3";

      if (on && !badge) {
        badge = document.createElement("span");
        badge.className = "note-badge";
        badge.textContent = label;
        img.appendChild(badge);
      } else if (on && badge.textContent !== label) {
        badge.textContent = label;
      } else if (!on && badge) {
        badge.remove();
      }
    });

    el.surprise.disabled = state.auto || state.phase === "mixing";
  }

  function renderSteps() {
    const n = state.picks.length;
    const active = state.phase === "done" ? 3 : n >= MIN ? 2 : 1;
    [].forEach.call(document.querySelectorAll("#steps li"), (li) => {
      const k = +li.dataset.step;
      li.classList.toggle("is-active", k === active);
      li.classList.toggle("is-done", k < active);
    });
  }

  function render() {
    paintBottle();
    renderBotanicals();
    renderSlots();
    renderNotes();
    renderActions();
    renderSteps();
    renderAccords();
    el.status.textContent = statusText();
  }

  // ---------- Action Handlers
  function add(id) {
    if (state.picks.length >= MAX || state.picks.indexOf(id) >= 0) return;
    const prev = state.picks.length;
    state.picks = state.picks.concat([id]);
    state.full = false;
    const wasClosed = prev === 0;

    if (wasClosed) {
      render();
      later(() => {
        pour(find(id).color);
      }, 250);
    } else {
      pour(find(id).color);
      render();
    }
  }

  function toggle(id) {
    if (state.phase !== "build" || state.auto) return;
    const i = state.picks.indexOf(id);
    if (i >= 0) {
      state.picks = state.picks.filter((p) => p !== id);
      state.full = false;
      render();
      sound.click();
    } else if (state.picks.length >= MAX) {
      state.full = true;
      el.status.textContent = statusText();
      el.blendBox.classList.remove("shake-x");
      void el.blendBox.offsetWidth;
      el.blendBox.classList.add("shake-x");
      sound.click();
    } else {
      add(id);
    }
  }

  function mix() {
    if (state.picks.length < MIN || state.phase !== "build" || state.auto) return;
    clearTimers();
    state.phase = "mixing";
    state.full = false;
    state.added = false;
    state.cartError = "";
    render();

    if (flacon) flacon.shake();

    // Background splash vortex
    if (splashEngine) {
      splashEngine.triggerMixVortex(chosen().map((c) => c.color));
    }

    later(() => {
      if (flacon) flacon.setBlended(true);
    }, 1050);

    later(() => {
      state.phase = "done";
      render();
      if (flacon) flacon.shine();
    }, 2100);
  }

  function edit() {
    clearTimers();
    state.phase = "build";
    state.added = false;
    state.cartError = "";
    if (flacon) flacon.setBlended(false);
    render();
    sound.click();
  }

  function reset() {
    clearTimers();
    flyingAnimations.forEach((a) => {
      try { a.cancel(); } catch (e) {}
    });
    flyingAnimations = [];
    document.querySelectorAll(".drop-fly").forEach((d) => d.remove());
    Object.keys(flying).forEach((k) => delete flying[k]);

    state.picks = [];
    state.phase = "build";
    state.auto = false;
    state.full = false;
    state.added = false;
    state.cartError = "";
    state.customName = "";
    if (el.customNameInput) el.customNameInput.value = "";
    if (el.botanicalStage) el.botanicalStage.innerHTML = "";
    if (flacon) flacon.reset();
    render();
    sound.click();
  }

  function surprise() {
    if (state.auto) return;
    reset();
    const pool = NOTES.map((n) => n.id);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pool[i];
      pool[i] = pool[j];
      pool[j] = t;
    }
    state.auto = true;
    render();
    [0, 1, 2].forEach((k) => {
      later(() => {
        flyThenAdd(pool[k]);
      }, 350 + k * 1200);
    });
    later(() => {
      state.auto = false;
      render();
    }, 4500);
  }

  // Droplet parabolic arc animation from tile to bottle flacon
  const flying = {};
  let flyingAnimations = [];
  function flyThenAdd(id) {
    const tile = tiles[id];
    const c = find(id);
    if (!tile || !c || flying[id]) return;

    const from = tile.querySelector(".note-img").getBoundingClientRect();
    const to = el.frame.getBoundingClientRect();
    const neck = flacon ? flacon.neckPoint() : { x: to.left + to.width / 2, y: to.top + to.height * 0.2 };
    const x0 = from.left + from.width / 2;
    const y0 = from.top + from.height / 2;
    const x1 = neck.x;
    const y1 = neck.y;

    if (reduceMotion || !document.body.animate) {
      add(id);
      return;
    }

    flying[id] = true;
    const d = document.createElement("span");
    d.className = "drop-fly";
    d.style.background =
      "radial-gradient(circle at 35% 35%, #fff, " +
      c.color +
      " 45%, " +
      c.color +
      ")";
    document.body.appendChild(d);

    const mx = (x0 + x1) / 2;
    const my = Math.min(y0, y1) - 130;
    const steps = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const u = 1 - t;
      const x = u * u * x0 + 2 * u * t * mx + t * t * x1;
      const y = u * u * y0 + 2 * u * t * my + t * t * y1;
      steps.push({
        transform:
          "translate(" +
          x +
          "px," +
          y +
          "px) rotate(" +
          (-45 + t * 90) +
          "deg) scale(" +
          (1 + Math.sin(t * Math.PI) * 0.6) +
          ")",
        opacity: t > 0.94 ? 0 : 1,
      });
    }

    const a = d.animate(steps, { duration: 750, easing: "cubic-bezier(.4,0,.3,1)" });
    flyingAnimations.push(a);
    a.onfinish = () => {
      d.remove();
      flying[id] = false;
      const idx = flyingAnimations.indexOf(a);
      if (idx >= 0) flyingAnimations.splice(idx, 1);
      if (state.phase === "build") add(id);
    };
  }

  function pick(id) {
    if (state.phase !== "build" || state.auto) return;
    if (
      state.picks.indexOf(id) < 0 &&
      state.picks.length + Object.keys(flying).filter((k) => flying[k]).length < MAX
    ) {
      flyThenAdd(id);
    } else {
      toggle(id);
    }
  }

  // ---------- Atelier Bag (server-side, see app/api/bag)
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");
  }

  function setBagCount(n) {
    window.dispatchEvent(new CustomEvent("uv:bag-count", { detail: n }));
    // A React-rendered badge (BagBadge, in the shop) updates itself from the event
    if (!el.cartCounter || "reactBadge" in el.cartCounter.dataset) return;
    el.cartCounter.textContent = String(n);
    el.cartCounter.style.display = n > 0 ? "inline-flex" : "none";
  }

  async function addToBag() {
    if (state.adding || state.added || state.phase !== "done") return;
    state.adding = true;
    state.cartError = "";
    renderActions();

    try {
      const res = await fetch("/api/bag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: state.picks, size: state.size, inscription: state.customName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't add this blend. Please try again.");
      setBagCount(data.count);
      // Pre-draw the bag's still of this flacon so the bag page opens with it ready
      const line = data.items && data.items.find((i) => i.id === data.itemId);
      if (line) setTimeout(() => renderStills([lookOfLine(line)]).catch(() => {}), 300);
      // The patron may have adjusted or reset the formula while the request was in flight
      if (state.phase === "done") state.added = true;
      sound.click();
    } catch (err) {
      state.cartError =
        err instanceof TypeError
          ? "We couldn't reach the atelier. Check your connection and try again."
          : err.message;
    } finally {
      state.adding = false;
      if (state.phase === "done") renderActions();
    }
  }

  // Delegated events
  el.grid.addEventListener("click", (e) => {
    const b = e.target.closest(".note");
    if (b) pick(b.dataset.id);
  });
  el.slots.addEventListener("click", (e) => {
    const b = e.target.closest("button.slot");
    if (b) toggle(b.dataset.id);
  });
  el.sizes.addEventListener("click", (e) => {
    const b = e.target.closest(".size");
    if (!b) return;
    state.size = b.dataset.size;
    state.added = false;
    state.cartError = "";
    renderSizes();
    renderActions();
    paintBottle();
    sound.click();
  });
  el.actions.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "mix") mix();
    else if (act === "edit") edit();
    else if (act === "reset") reset();
    else if (act === "cart") addToBag();
  });
  el.surprise.addEventListener("click", surprise);
  if (el.resetBtn) el.resetBtn.addEventListener("click", reset);

  // Label personalization input
  if (el.customNameInput) {
    el.customNameInput.addEventListener("input", (e) => {
      state.customName = e.target.value;
      paintLabel(chosen());
      // A new inscription is a different flacon, so it can be added to the bag again
      if (state.phase === "done") {
        state.added = false;
        state.cartError = "";
        renderActions();
      }
    });
  }

  // Sound toggle button
  if (el.soundToggle) {
    el.soundToggle.addEventListener("click", () => {
      const on = sound.toggle();
      state.soundEnabled = on;
      el.soundToggle.setAttribute("aria-pressed", String(on));
      el.soundToggle.classList.toggle("is-active", on);
      const icon = el.soundToggle.querySelector(".sound-status");
      if (icon) icon.textContent = on ? "ON" : "OFF";
      if (on) sound.drop(880);
    });
  }

  buildNotes();
  renderSizes();
  render();

  // ---------- Interactive 3D Stage & Background Splash Trigger
  const stage = document.querySelector(".stage");
  const bottle = el.bottle;
  const fine =
    window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fine && stage && bottle) {
    let lastMoveTime = 0;
    stage.addEventListener("pointermove", (e) => {
      const r = bottle.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;

      if (flacon) flacon.pointer(px, py);

      // Interactive fluid disturbances when hovering around bottle
      const now = performance.now();
      if (now - lastMoveTime > 90 && splashEngine) {
        lastMoveTime = now;
        const stageRect = stage.getBoundingClientRect();
        const splashX = e.clientX - stageRect.left;
        const splashY = e.clientY - stageRect.top;
        const col = chosen().length ? chosen()[chosen().length - 1].color : "#d4af37";
        splashEngine.triggerPointerSplash(splashX, splashY, col, 0.4);
      }
    });

    stage.addEventListener("pointerleave", () => {
      if (flacon) flacon.pointerLeave();
    });

    // Clicking anywhere in the stage creates an interactive splash wave!
    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button, input, a")) return;
      if (splashEngine) {
        const stageRect = stage.getBoundingClientRect();
        const splashX = e.clientX - stageRect.left;
        const splashY = e.clientY - stageRect.top;
        const col = chosen().length ? chosen()[chosen().length - 1].color : "#d4af37";
        splashEngine.triggerPointerSplash(splashX, splashY, col, 1.2);
      }
    });
  }

  // Magnetic buttons & ripple feedback
  on(document, "pointerdown", (e) => {
    const b = e.target.closest && e.target.closest(".btn, .size, .surprise, button.slot, .note");
    if (!b || b.disabled) return;
    const r = b.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement("span");
    s.className = "ripple";
    s.style.width = s.style.height = size + "px";
    s.style.left = e.clientX - r.left - size / 2 + "px";
    s.style.top = e.clientY - r.top - size / 2 + "px";
    b.appendChild(s);
    setTimeout(() => {
      s.remove();
    }, 750);
  });

  function stop() {
    alive = false;
    cleanups.forEach((fn) => fn());
    clearTimers();
    flyingAnimations.forEach((a) => {
      try {
        a.cancel();
      } catch (e) {}
    });
    if (flacon) flacon.dispose();
    if (stopActive === stop) stopActive = null;
  }
  stopActive = stop;
  return stop;
}
