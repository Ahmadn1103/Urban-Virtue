/* Urban Virtue: custom blend hero. Framework-free DOM code, started once from <CustomBlend />. */
let started = false;

export function startCustomBlend() {
  if (started) return;
  started = true;

  // Where the liquid sits in the bottle photos, as fractions of the image (measured from the 3D render).
  var GEO = /*GEO*/{"w": 720, "h": 960, "liqTop": 0.3167, "liqBottom": 0.8313, "liqLeft": 0.2056, "liqRight": 0.7931, "neckTop": 0.1783, "bodyLeft": 0.1765, "bodyRight": 0.8235};

  var NOTES = [
    { id: 'rose', name: 'Damask Rose', family: 'Floral', mood: 'soft petals', color: '#E0607E', adj: 'Velvet', noun: 'Bloom' },
    { id: 'bergamot', name: 'Bergamot', family: 'Citrus', mood: 'bright peel', color: '#F0B23E', adj: 'Golden', noun: 'Zest' },
    { id: 'oud', name: 'Oud', family: 'Woody', mood: 'smoky resin', color: '#7A3F27', adj: 'Midnight', noun: 'Smoke' },
    { id: 'vanilla', name: 'Vanilla', family: 'Gourmand', mood: 'creamy warmth', color: '#EBC77F', adj: 'Silken', noun: 'Cream' },
    { id: 'lavender', name: 'Lavender', family: 'Aromatic', mood: 'calm herbs', color: '#9C83D4', adj: 'Dusk', noun: 'Haze' },
    { id: 'seasalt', name: 'Sea Salt', family: 'Fresh', mood: 'airy mineral', color: '#4FB3C6', adj: 'Coastal', noun: 'Tide' },
    { id: 'sandalwood', name: 'Sandalwood', family: 'Woody', mood: 'creamy wood', color: '#C88A55', adj: 'Warm', noun: 'Grove' },
    { id: 'amber', name: 'Amber', family: 'Resinous', mood: 'warm glow', color: '#D46F22', adj: 'Gilded', noun: 'Ember' },
    { id: 'vetiver', name: 'Vetiver', family: 'Earthy', mood: 'green roots', color: '#5E8A4A', adj: 'Wild', noun: 'Root' }
  ];
  var SIZES = [
    { id: '30', label: '30 ml', price: '[PRICE]' },
    { id: '50', label: '50 ml', price: '[PRICE]' },
    { id: '100', label: '100 ml', price: '[PRICE]' }
  ];
  var MIN = 2, MAX = 3;

  // ---------- particle canvases: golden motes in the air, splashes and the finale burst
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fx = (function () {
    var cv = document.getElementById('fx'), ctx = cv && cv.getContext('2d'), parts = [], running = false, dpr = 1;
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    if (cv) { size(); addEventListener('resize', size); }
    function loop() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(function (p) { return p.life > 0; });
      parts.forEach(function (p) {
        p.vy += p.g; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.life -= 1;
        var a = Math.min(1, p.life / 30);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        if (p.star) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * .1); ctx.fillRect(-p.r, -p.r * .3, p.r * 2, p.r * .6); ctx.fillRect(-p.r * .3, -p.r, p.r * .6, p.r * 2); ctx.restore(); }
        else { ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }
      });
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(loop); else running = false;
    }
    function go() { if (!running && ctx) { running = true; requestAnimationFrame(loop); } }
    return {
      splash: function (x, y, c) {
        if (reduceMotion || !ctx) return;
        for (var i = 0; i < 16; i++) {
          var a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 1.5 + Math.random() * 2.6;
          parts.push({ x: x + (Math.random() - .5) * 30, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .12, r: 1.2 + Math.random() * 2.2, c: i % 3 ? c : '#fff', life: 40 + Math.random() * 20 });
        }
        go();
      },
      burst: function (x, y, colors) {
        if (reduceMotion || !ctx) return;
        for (var i = 0; i < 110; i++) {
          var a = Math.random() * 6.283, v = 2 + Math.random() * 6;
          parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2.5, g: .06, r: 1.5 + Math.random() * 3, c: i % 4 === 0 ? '#e9c98f' : colors[i % colors.length], star: i % 5 === 0, life: 60 + Math.random() * 50 });
        }
        go();
      }
    };
  })();

  (function ambient() {
    var cv = document.getElementById('ambient');
    if (!cv || reduceMotion) return;
    var ctx = cv.getContext('2d'), dpr = 1, motes = [];
    function size() { dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 46; i++) motes.push({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.9, s: .00008 + Math.random() * .00025, p: Math.random() * 6.283, a: .25 + Math.random() * .5 });
    function frame(t) {
      if (document.hidden) { requestAnimationFrame(frame); return; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      motes.forEach(function (m) {
        m.y -= m.s; if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
        var x = (m.x + Math.sin(t / 4000 + m.p) * .01) * innerWidth, y = m.y * innerHeight;
        var tw = .6 + .4 * Math.sin(t / 900 + m.p * 3);
        ctx.globalAlpha = m.a * tw;
        var g = ctx.createRadialGradient(x, y, 0, x, y, m.r * 4);
        g.addColorStop(0, 'rgba(214,170,100,.9)'); g.addColorStop(1, 'rgba(214,170,100,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, m.r * 4, 0, 6.283); ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  var state = { picks: [], size: '50', phase: 'build', auto: false, full: false, added: false };
  var timers = [];
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    slots: $('slots'), count: $('count'), status: $('status'), sizes: $('sizes'), price: $('price'),
    actions: $('actions'), grid: $('noteGrid'), surprise: $('surprise'), blendBox: $('blendBox'),
    frame: $('frame'), liquid: $('liquid'), tint: $('tintLayers'), tintBlend: $('tintBlend'), tintHue: $('tintHue'), tintHueBlend: $('tintHueBlend'),
    surface: $('surface'), stream: $('stream'), cap: $('cap'), shine: $('shine'),
    tag: $('tag'), tagName: $('tagName'), tagNotes: $('tagNotes')
  };

  function find(id) { return NOTES.filter(function (n) { return n.id === id; })[0]; }
  function chosen() { return state.picks.map(find); }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function pct(v) { return (v * 100).toFixed(3) + '%'; }

  // fill fraction (0..1) -> y position in the photo, as a fraction of its height
  function levelY(f) { return GEO.liqBottom - (GEO.liqBottom - GEO.liqTop) * f; }

  function hexToRgb(h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }
  function mixColor(list) {
    if (!list.length) return '#c88a55';
    var sum = [0, 0, 0];
    list.forEach(function (n) { hexToRgb(n.color).forEach(function (v, i) { sum[i] += v; }); });
    return '#' + sum.map(function (v) { var s = Math.round(v / list.length).toString(16); return s.length < 2 ? '0' + s : s; }).join('');
  }
  // lighten a colour so the multiply tint reads like coloured glass rather than paint
  function glassTint(hex) {
    return 'rgb(' + hexToRgb(hex).map(function (v) { return Math.round(255 - (255 - v) * 0.96); }).join(',') + ')';
  }

  function blendName(list) {
    if (!list.length) return '';
    return list[0].adj + ' ' + list[list.length - 1].noun;
  }
  function blendNumber(list) {
    var n = 0;
    list.forEach(function (c) { n = n * 7 + NOTES.indexOf(c) + 1; });
    n = (n % 97) + 1;
    return (n < 10 ? '0' : '') + n;
  }

  // ---------- bottle rendering
  function paintBottle(prev) {
    var list = chosen();
    var n = list.length;
    var building = state.phase === 'build';

    // liquid level: clip the filled-bottle photo from the top
    var top = n ? levelY(n / MAX) : 1;
    el.liquid.classList.toggle('is-draining', n < prev);
    el.liquid.style.clipPath = 'inset(' + pct(top) + ' 0 0 0)';
    el.surface.style.top = pct(n ? top : GEO.liqBottom);
    el.surface.classList.toggle('is-on', n > 0);

    // colour bands, one per third, with a soft seam where two notes meet
    if (n) {
      var stops = [];
      list.forEach(function (c, k) {
        var col = glassTint(c.color);
        var from = 1 - levelY(k / MAX), to = 1 - levelY((k + 1) / MAX);
        var seam = 0.012;
        stops.push(col + ' ' + pct(k === 0 ? 0 : from + seam));
        stops.push(col + ' ' + pct(k === n - 1 ? 1 : to - seam));
      });
      el.tint.style.background = el.tintHue.style.background = 'linear-gradient(to top, ' + stops.join(', ') + ')';
    }
    el.tintBlend.style.background = el.tintHueBlend.style.background = glassTint(mixColor(list));

    // cap off while composing
    el.cap.classList.toggle('is-open', building && n > 0);
    document.getElementById('bottle').classList.toggle('cap-open', building && n > 0);
    var shTint = document.getElementById('shTint');
    shTint.classList.toggle('is-on', n > 0);
    if (n) shTint.style.background = 'radial-gradient(closest-side, ' + (state.phase === 'done' ? mixColor(list) : list[n - 1].color) + ', transparent)';

    // the frosted tag on the glass
    el.tagName.textContent = state.phase === 'done' ? blendName(list) : 'Your Blend';
    el.tagNotes.textContent = n ? list.map(function (c) { return c.name.replace('Damask ', ''); }).join(' · ') : 'Pick 2 to 3 notes';
  }

  function pour(color) {
    var top = levelY(state.picks.length / MAX);
    var startY = -0.04;
    el.stream.style.height = pct(top - startY + 0.01);
    el.stream.style.background = 'linear-gradient(180deg, rgba(255,255,255,0), ' + glassTint(color) + ' 14%, ' + color + ')';
    el.stream.style.boxShadow = 'inset 1px 0 0 rgba(255,255,255,.6)';
    if (el.stream.animate) {
      el.stream.animate([
        { transform: 'scaleY(0)', transformOrigin: 'top' },
        { transform: 'scaleY(1)', transformOrigin: 'top', offset: .42 },
        { transform: 'scaleY(1)', transformOrigin: 'bottom', offset: .58 },
        { transform: 'scaleY(0)', transformOrigin: 'bottom' }
      ], { duration: 1300, easing: 'cubic-bezier(.45,0,.25,1)' });
    }
    later(function () {
      var r = el.frame.getBoundingClientRect();
      fx.splash(r.left + r.width / 2, r.top + r.height * levelY(state.picks.length / MAX), color);
      el.frame.classList.remove('is-ping'); void el.frame.offsetWidth; el.frame.classList.add('is-ping');
    }, 900);
  }

  // ---------- panel rendering
  function renderSlots() {
    var list = chosen();
    var locked = state.phase !== 'build' || state.auto;
    var html = '';
    for (var k = 0; k < MAX; k++) {
      var c = list[k];
      var num = (k + 1) + '/3';
      if (c) {
        html += '<li data-key="' + c.id + (locked ? '-l' : '') + '"><button class="slot is-full" type="button" data-id="' + c.id + '" aria-label="Remove ' + c.name + '"' + (locked ? ' disabled' : '') + '>' +
          '<span class="slot-num">' + num + (locked ? '' : '<span class="slot-x" aria-hidden="true">×</span>') + '</span>' +
          '<span class="slot-name"><i class="slot-dot" style="background:' + c.color + '"></i><span>' + c.name.replace('Damask ', '') + '</span></span>' +
          '<span class="slot-bar" style="background:' + c.color + '"></span></button></li>';
      } else {
        html += '<li data-key="empty' + k + '"><div class="slot"><span class="slot-num">' + num + '</span><span class="slot-empty">' + (k === MAX - 1 ? 'Optional' : 'Pick a note') + '</span><span class="slot-bar"></span></div></li>';
      }
    }
    var tmp = document.createElement('ol'); tmp.innerHTML = html;
    [].forEach.call(tmp.children, function (li, k) {
      var cur = el.slots.children[k];
      if (!cur) el.slots.appendChild(li);
      else if (cur.dataset.key !== li.dataset.key) {
        // a chip that only moved position (or got locked) should not pop again
        if (cur.dataset.key && li.dataset.key && cur.dataset.key.split('-')[0] === li.dataset.key.split('-')[0]) li.firstChild.style.animation = 'none';
        el.slots.replaceChild(li, cur);
      }
    });
    el.count.textContent = list.length + ' / ' + MAX;
    el.blendBox.hidden = state.phase === 'done';
  }

  function statusText() {
    var n = state.picks.length;
    if (state.phase === 'done') return 'Blended. ' + blendName(chosen()) + ' is ready to bottle.';
    if (state.phase === 'mixing') return 'Sealing, shaking and blending…';
    if (state.auto) return 'Pouring a surprise blend…';
    if (state.full) return 'The bottle is full. Remove a note to swap it.';
    if (n === 0) return 'Pick your first note to start pouring.';
    if (n === 1) return 'One more note to go. Two is the minimum.';
    if (n === 2) return 'Ready to mix, or add a third note.';
    return 'Bottle full. Time to mix.';
  }

  function renderSizes() {
    el.sizes.innerHTML = SIZES.map(function (z) {
      return '<button class="size" type="button" data-size="' + z.id + '" aria-pressed="' + (z.id === state.size) + '">' + z.label + '</button>';
    }).join('');
    el.price.textContent = currentSize().price;
  }
  function currentSize() { return SIZES.filter(function (z) { return z.id === state.size; })[0]; }

  function renderActions() {
    var n = state.picks.length;
    var list = chosen();
    if (state.phase === 'build') {
      var ready = n >= MIN && !state.auto;
      el.actions.innerHTML = '<button class="btn btn-primary' + (ready ? ' is-ready' : '') + '" type="button" data-act="mix"' + (ready ? '' : ' disabled') + '>' +
        (n < MIN ? 'Pick ' + (MIN - n) + ' more to mix' : 'Mix my blend') + '</button>';
    } else if (state.phase === 'mixing') {
      el.actions.innerHTML = '<button class="btn btn-primary" type="button" disabled style="background:var(--accent);color:var(--paper)"><span class="spinner"></span>Blending…</button>';
    } else {
      el.actions.innerHTML =
        '<div class="result"><small>Your signature blend</small><strong>' + blendName(list) + '</strong>' +
        '<p>No. ' + blendNumber(list) + ' · ' + currentSize().label + ' · ' + list.map(function (c) { return '1/3 ' + c.name.replace('Damask ', ''); }).join(' + ') + '</p>' +
        '<div class="result-bar">' + list.map(function (c) { return '<span style="background:' + c.color + '"></span>'; }).join('') + '</div></div>' +
        '<button class="btn btn-primary" type="button" data-act="cart">' + (state.added ? 'Added to bag' : 'Add to bag · ' + currentSize().price) + '</button>' +
        '<div class="btn-row"><button class="btn btn-ghost" type="button" data-act="edit">Edit notes</button>' +
        '<button class="btn btn-ghost" type="button" data-act="reset">Start over</button></div>';
    }
  }

  var tiles = {};
  function buildNotes() {
    el.grid.innerHTML = NOTES.map(function (nt) {
      return '<li><button class="note" type="button" data-id="' + nt.id + '" aria-pressed="false" style="--ring:' + nt.color + '">' +
        '<span class="note-img"><img src="/hero/note-' + nt.id + '.webp" alt="" width="180" height="180"></span>' +
        '<span class="note-name">' + nt.name + '</span>' +
        '<span class="note-fam"><span class="fam">' + nt.family + '</span><span class="mood">' + nt.mood + '</span></span></button></li>';
    }).join('');
    NOTES.forEach(function (nt) { tiles[nt.id] = el.grid.querySelector('[data-id="' + nt.id + '"]'); });
    setTimeout(function () { el.grid.classList.add('is-settled'); }, 1600);
  }

  function renderNotes() {
    var n = state.picks.length;
    var locked = state.phase !== 'build' || state.auto;
    NOTES.forEach(function (nt) {
      var b = tiles[nt.id];
      var idx = state.picks.indexOf(nt.id);
      var on = idx >= 0;
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-dim', !on && (n >= MAX || locked));
      b.disabled = locked;
      var img = b.querySelector('.note-img');
      var badge = img.querySelector('.note-badge');
      var label = (idx + 1) + '/3';
      if (on && !badge) { badge = document.createElement('span'); badge.className = 'note-badge'; badge.textContent = label; img.appendChild(badge); }
      else if (on && badge.textContent !== label) { badge.textContent = label; }
      else if (!on && badge) { badge.remove(); }
    });
    el.surprise.disabled = state.auto || state.phase === 'mixing';
  }

  function renderSteps() {
    var n = state.picks.length;
    var active = state.phase === 'done' ? 3 : (n >= MIN ? 2 : 1);
    [].forEach.call(document.querySelectorAll('#steps li'), function (li) {
      var k = +li.dataset.step;
      li.classList.toggle('is-active', k === active);
      li.classList.toggle('is-done', k < active);
    });
  }

  function render(prevCount) {
    paintBottle(prevCount === undefined ? state.picks.length : prevCount);
    renderSlots();
    renderNotes();
    renderActions();
    renderSteps();
    el.status.textContent = statusText();
  }

  // ---------- actions
  function add(id) {
    if (state.picks.length >= MAX || state.picks.indexOf(id) >= 0) return;
    var prev = state.picks.length;
    state.picks = state.picks.concat([id]);
    state.full = false;
    var wasClosed = prev === 0;
    // let the cap clear the neck before the first pour
    if (wasClosed) { render(prev); later(function () { pour(find(id).color); }, 250); }
    else { pour(find(id).color); render(prev); }
  }

  function toggle(id) {
    if (state.phase !== 'build' || state.auto) return;
    var i = state.picks.indexOf(id);
    if (i >= 0) {
      var prev = state.picks.length;
      state.picks = state.picks.filter(function (p) { return p !== id; });
      state.full = false;
      render(prev);
    } else if (state.picks.length >= MAX) {
      state.full = true;
      el.status.textContent = statusText();
      el.blendBox.classList.remove('shake-x');
      void el.blendBox.offsetWidth;
      el.blendBox.classList.add('shake-x');
    } else {
      add(id);
    }
  }

  function mix() {
    if (state.picks.length < MIN || state.phase !== 'build' || state.auto) return;
    clearTimers();
    state.phase = 'mixing'; state.full = false; state.added = false;
    render();
    el.frame.classList.add('is-shaking');
    later(function () { el.liquid.classList.add('is-blended'); }, 1050);
    later(function () {
      state.phase = 'done';
      el.frame.classList.remove('is-shaking');
      render();
      el.shine.classList.remove('is-on'); void el.shine.offsetWidth; el.shine.classList.add('is-on');
      var r = el.frame.getBoundingClientRect();
      fx.burst(r.left + r.width / 2, r.top + r.height * GEO.neckTop, chosen().map(function (c) { return c.color; }));
    }, 1900);
  }

  function edit() {
    clearTimers();
    state.phase = 'build'; state.added = false;
    el.liquid.classList.remove('is-blended');
    render();
  }

  function reset() {
    clearTimers();
    var prev = state.picks.length;
    state.picks = []; state.phase = 'build'; state.auto = false; state.full = false; state.added = false;
    el.liquid.classList.remove('is-blended');
    el.frame.classList.remove('is-shaking');
    render(prev);
  }

  function surprise() {
    if (state.auto) return;
    reset();
    var pool = NOTES.map(function (n) { return n.id; });
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    state.auto = true;
    render(0);
    [0, 1, 2].forEach(function (k) { later(function () { flyThenAdd(pool[k]); }, 300 + k * 1100); });
    later(function () { state.auto = false; render(); }, 4200);
  }

  // ---------- events (delegated, so re-rendered buttons keep working)
  var flying = {};
  function flyThenAdd(id) {
    var tile = tiles[id], c = find(id);
    if (flying[id]) return;
    var from = tile.querySelector('.note-img').getBoundingClientRect();
    var to = el.frame.getBoundingClientRect();
    var x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
    var x1 = to.left + to.width / 2, y1 = to.top + to.height * GEO.neckTop;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !document.body.animate) { add(id); return; }
    flying[id] = true;
    var d = document.createElement('span');
    d.className = 'drop-fly';
    d.style.background = 'radial-gradient(circle at 35% 35%, #fff, ' + c.color + ' 45%, ' + c.color + ')';
    document.body.appendChild(d);
    var mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 120;
    var steps = [];
    for (var i = 0; i <= 12; i++) {
      var t = i / 12, u = 1 - t;
      var x = u * u * x0 + 2 * u * t * mx + t * t * x1, y = u * u * y0 + 2 * u * t * my + t * t * y1;
      steps.push({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + (-45 + t * 90) + 'deg) scale(' + (1 + Math.sin(t * Math.PI) * .5) + ')', opacity: t > .92 ? 0 : 1 });
    }
    var a = d.animate(steps, { duration: 700, easing: 'cubic-bezier(.4,0,.3,1)' });
    a.onfinish = function () { d.remove(); flying[id] = false; add(id); };
  }
  function pick(id) {
    if (state.phase !== 'build' || state.auto) return;
    if (state.picks.indexOf(id) < 0 && state.picks.length + Object.keys(flying).filter(function (k) { return flying[k]; }).length < MAX) flyThenAdd(id);
    else toggle(id);
  }
  el.grid.addEventListener('click', function (e) { var b = e.target.closest('.note'); if (b) pick(b.dataset.id); });
  el.slots.addEventListener('click', function (e) { var b = e.target.closest('button.slot'); if (b) toggle(b.dataset.id); });
  el.sizes.addEventListener('click', function (e) {
    var b = e.target.closest('.size'); if (!b) return;
    state.size = b.dataset.size; renderSizes(); renderActions();
  });
  el.actions.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.dataset.act;
    if (act === 'mix') mix();
    else if (act === 'edit') edit();
    else if (act === 'reset') reset();
    else if (act === 'cart') { state.added = true; renderActions(); }
  });
  el.surprise.addEventListener('click', surprise);

  // ---------- place the frosted tag on the lower body of the bottle
  var bodyW = GEO.bodyRight - GEO.bodyLeft;
  el.tag.style.left = pct(GEO.bodyLeft + bodyW * 0.29);
  el.tag.style.width = pct(bodyW * 0.42);
  el.tag.style.top = pct(GEO.liqTop + (GEO.liqBottom - GEO.liqTop) * 0.66);
  var liqW = GEO.liqRight - GEO.liqLeft;
  el.surface.style.left = pct(GEO.liqLeft);
  el.surface.style.width = pct(liqW);

  buildNotes();
  renderSizes();
  render();

  // ---------- bottle tilts toward the pointer, glare follows
  var stage = document.querySelector('.stage'), bottle = $('bottle'), glare = $('glare');
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine) {
    stage.addEventListener('pointermove', function (e) {
      var r = bottle.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      bottle.style.transform = 'rotateY(' + (px * 9).toFixed(2) + 'deg) rotateX(' + (-py * 6).toFixed(2) + 'deg)';
      glare.style.setProperty('--gx', ((px + .5) * 100).toFixed(1) + '%');
      glare.style.setProperty('--gy', ((py + .5) * 100).toFixed(1) + '%');
      // light comes from the pointer side, so the cast shadow falls away from it
      bottle.style.setProperty('--sx', (-px * 26 + 4).toFixed(1) + '%');
      bottle.style.setProperty('--sk', (px * 50).toFixed(1) + 'deg');
    });
    stage.addEventListener('pointerleave', function () { bottle.style.transform = ''; bottle.style.removeProperty('--sx'); bottle.style.removeProperty('--sk'); });

    // magnetic buttons
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn-primary:not(:disabled), .surprise:not(:disabled)');
      [].forEach.call(document.querySelectorAll('.is-magnet'), function (m) { if (m !== b) { m.style.transform = ''; m.classList.remove('is-magnet'); } });
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.classList.add('is-magnet');
      b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .12).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px)';
    });
  }

  // ripple on every press
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn, .size, .surprise, button.slot');
    if (!b || b.disabled) return;
    var r = b.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    var s = document.createElement('span');
    s.className = 'ripple';
    s.style.width = s.style.height = size + 'px';
    s.style.left = (e.clientX - r.left - size / 2) + 'px';
    s.style.top = (e.clientY - r.top - size / 2) + 'px';
    b.appendChild(s);
    setTimeout(function () { s.remove(); }, 750);
  });
}
