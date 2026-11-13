(async () => {
  const $ = s => document.querySelector(s);
  const e = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let D;
  try { D = await (await fetch('data.json?' + Date.now())).json(); } catch (x) { return; }
  D.slots = D.slots || [];
  const c = D.contact || {};
  const PHONE = c.phone || '51906576897';

  /* ---------- Fechas ---------- */
  const pad = n => String(n).padStart(2, '0');
  const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const today = key(now);
  const hhmm = () => pad(now.getHours()) + ':' + pad(now.getMinutes());
  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
  const parse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmt = k => {
    const d = parse(k);
    return `${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  };

  /* ---------- Textos de la portada y contacto ---------- */
  const H = D.hero || {};
  $('#heroTitle').innerHTML = `${e(H.title1)} <span>${e(H.title2)}</span>`;
  $('#heroText').textContent = H.text || '';
  $('#heroAddr').textContent = c.address || '';
  $('#hoursTxt').textContent = c.hours1 || '';
  const heroImg = $('.hero-img img');
  if (H.image) heroImg.src = H.image; else $('.hero').classList.add('no-img');

  /* ---------- Banners y galería ---------- */
  const bans = (D.banners || []).filter(Boolean);
  $('#banners').innerHTML = bans.map((b, i) => `<div><img src="${e(b)}" alt="Promoción ${i + 1}" loading="lazy" onerror="this.parentNode.remove()"></div>`).join('');
  $('#promos').style.display = bans.length ? '' : 'none';
  const gal = (D.gallery || []).filter(Boolean);
  $('#gallery').innerHTML = gal.map((g, i) => `<div><img src="${e(g)}" alt="Corte ${i + 1}" loading="lazy" onerror="this.parentNode.remove()"></div>`).join('');
  $('#galeria').style.display = gal.length ? '' : 'none';

  /* ---------- Estado ---------- */
  const services = (D.categories || []).flatMap(k => k.items.map(i => ({ ...i, cat: k.name })));
  const av = b => b.available !== false;
  const barbers = D.barbers || [];
  const st = { svc: services[0] || null, who: '', date: '', time: '', timeBarber: '', y: now.getFullYear(), m: now.getMonth() };

  /* ---------- Disponibilidad ---------- */
  const libres = x => (x.times || []).filter(h => x.date !== today || h.padStart(5, '0') > hhmm());
  const vivo = x => x.date && x.date >= today && libres(x).length && !(x.barber && barbers.some(b => b.name === x.barber && !av(b)));
  const aplica = (x, who) => !who || !x.barber || x.barber === who;
  const slotsOf = who => D.slots.filter(x => vivo(x) && aplica(x, who));
  const cuenta = n => slotsOf(n).reduce((t, x) => t + libres(x).length, 0);
  // fecha -> { hora: barbero }
  const byDate = who => {
    const out = {};
    slotsOf(who).forEach(x => libres(x).forEach(h => {
      const o = out[x.date] = out[x.date] || {};
      const hh = h.padStart(5, '0');
      if (!(hh in o)) o[hh] = x.barber || '';
    }));
    return out;
  };

  /* ---------- Servicios ---------- */
  const svcList = $('#svcList');
  const drawSvc = () => {
    let last = '';
    svcList.innerHTML = services.map((s, i) => {
      const head = s.cat !== last ? `<div class="svc-cat">${e(s.cat)}</div>` : '';
      last = s.cat;
      const sel = st.svc === s;
      return `${head}<button type="button" class="opt${sel ? ' sel' : ''}" data-i="${i}"><span><span class="t">${e(s.name)}</span><span class="p">S/ ${e(s.price)}</span>${s.features && s.features.length ? `<span class="f">${e(s.features.join(' · '))}</span>` : ''}</span><span class="radio"><i class="fa-solid fa-check"></i></span></button>`;
    }).join('');
  };
  svcList.addEventListener('click', ev => {
    const b = ev.target.closest('.opt'); if (!b) return;
    st.svc = services[+b.dataset.i]; drawSvc(); summary();
  });

  /* ---------- Barberos ---------- */
  const barList = $('#barberList');
  const drawBar = () => {
    const card = (name, sub, photo, ok, sel, who) => `<button type="button" class="opt${sel ? ' sel' : ''}${ok ? '' : ' off'}" data-w="${e(who)}" ${ok ? '' : 'disabled'}><span class="barber"><span class="avatar">${photo ? `<img src="${e(photo)}" alt="" onerror="this.remove()">` : '<i class="fa-solid fa-user"></i>'}</span><span><span class="t">${e(name)}</span><span class="p">${sub}</span></span></span><span class="radio"><i class="fa-solid fa-check"></i></span></button>`;
    const any = cuenta('');
    barList.innerHTML =
      card('Cualquiera disponible', any ? `<span class="cnt">${any} ${any === 1 ? 'cupo' : 'cupos'}</span>` : 'Sin cupos', '', true, st.who === '', '').replace('<i class="fa-solid fa-user"></i>', '<i class="fa-solid fa-users"></i>') +
      barbers.map(b => {
        const n = cuenta(b.name);
        const sub = av(b) ? `${e(b.role || 'Barbero')} · <span class="cnt">${n ? `${n} ${n === 1 ? 'cupo' : 'cupos'}` : 'sin cupos'}</span>` : 'No disponible';
        return card(b.name, sub, b.photo, av(b), st.who === b.name, b.name);
      }).join('');
  };
  barList.addEventListener('click', ev => {
    const b = ev.target.closest('.opt'); if (!b || b.disabled) return;
    st.who = b.dataset.w; st.time = ''; st.timeBarber = '';
    if (st.date && !byDate(st.who)[st.date]) st.date = '';
    drawBar(); drawCal(); drawTimes(); summary();
  });

  /* ---------- Calendario ---------- */
  const calGrid = $('#calGrid');
  const drawCal = () => {
    const av2 = byDate(st.who);
    $('#calTitle').textContent = `${MESES[st.m]} ${st.y}`;
    const first = new Date(st.y, st.m, 1), days = new Date(st.y, st.m + 1, 0).getDate();
    const ym = `${st.y}-${pad(st.m + 1)}`;
    const nowYM = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
    const lastKey = Object.keys(av2).sort().pop() || today;
    $('#calPrev').disabled = ym <= nowYM;
    $('#calNext').disabled = ym >= lastKey.slice(0, 7);
    let h = DIAS.map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < first.getDay(); i++) h += '<div></div>';
    for (let d = 1; d <= days; d++) {
      const k = `${ym}-${pad(d)}`, has = !!av2[k];
      h += `<button type="button" class="day${has ? ' has' : ''}${k === st.date ? ' sel' : ''}${k === today ? ' today' : ''}" ${has ? `data-d="${k}"` : 'disabled'}>${d}</button>`;
    }
    calGrid.innerHTML = h;
  };
  calGrid.addEventListener('click', ev => {
    const b = ev.target.closest('.day.has'); if (!b) return;
    st.date = b.dataset.d; st.time = ''; st.timeBarber = '';
    drawCal(); drawTimes(); summary();
  });
  $('#calPrev').onclick = () => { st.m--; if (st.m < 0) { st.m = 11; st.y--; } drawCal(); };
  $('#calNext').onclick = () => { st.m++; if (st.m > 11) { st.m = 0; st.y++; } drawCal(); };

  /* ---------- Horas ---------- */
  const timeList = $('#timeList');
  const drawTimes = () => {
    const hs = st.date ? byDate(st.who)[st.date] : null;
    if (!hs) { timeList.innerHTML = '<p class="empty">Elige un día marcado con punto dorado.</p>'; return; }
    timeList.innerHTML = Object.keys(hs).sort().map(h => `<button type="button" class="time${h === st.time ? ' sel' : ''}" data-h="${h}" data-b="${e(hs[h])}">${h}</button>`).join('');
  };
  timeList.addEventListener('click', ev => {
    const b = ev.target.closest('.time'); if (!b) return;
    st.time = b.dataset.h; st.timeBarber = b.dataset.b; drawTimes(); summary();
  });

  /* ---------- Resumen y pasos ---------- */
  const steps = [...document.querySelectorAll('#stepper .step')];
  const name = $('#clientName');
  const barberName = () => st.who || st.timeBarber || 'Cualquiera disponible';
  function summary() {
    const set = (id, v, empty) => { const el = $(id); el.textContent = v || empty; el.className = v ? '' : 'empty-v'; };
    $('#sSvc').innerHTML = st.svc ? `<span>${e(st.svc.name)}</span><span>S/ ${e(st.svc.price)}</span>` : '—';
    set('#sBar', st.time ? barberName() : (st.who || 'Cualquiera disponible'), '—');
    set('#sDate', st.date ? fmt(st.date) : '', 'Elige una fecha');
    set('#sTime', st.time, 'Elige una hora');
    $('#sTotal').textContent = st.svc ? `S/ ${st.svc.price}` : 'S/ 0';
    const done = [!!st.svc, true, !!(st.date && st.time), !!(st.date && st.time && name.value.trim())];
    const act = done.indexOf(false);
    steps.forEach((s, i) => { s.classList.toggle('done', done[i] && i !== act); s.classList.toggle('active', i === act); });
  }
  name.addEventListener('input', summary);

  $('#confirmBtn').onclick = () => {
    if (!st.svc) { alert('Elige un servicio.'); return; }
    if (!st.date || !st.time) { alert('Elige el día y la hora de tu cita.'); return; }
    const n = name.value.trim();
    if (!n) { alert('Por favor escribe tu nombre.'); name.focus(); return; }
    const msg = `Hola, quiero reservar una cita.\n\n*Nombre:* ${n}\n*Servicio:* ${st.svc.name} (S/${st.svc.price})\n*Barbero:* ${barberName()}\n*Fecha:* ${fmt(st.date)}\n*Hora:* ${st.time}`;
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  };

  /* ---------- Carta de servicios ---------- */
  $('#carta').innerHTML = services.map((s, i) => `<div class="card-s">${s.badge ? `<span class="tag">${e(s.badge)}</span>` : ''}<span class="cat">${e(s.cat)}</span><h3>${e(s.name)}</h3><div class="pr">S/ ${e(s.price)}</div>${s.features && s.features.length ? `<ul>${s.features.map(f => `<li><i class="fa-solid fa-check"></i>${e(f)}</li>`).join('')}</ul>` : '<ul></ul>'}<a href="#agenda" class="btn-outline-gold" data-i="${i}">Reservar</a></div>`).join('');
  $('#carta').addEventListener('click', ev => {
    const a = ev.target.closest('a[data-i]'); if (!a) return;
    st.svc = services[+a.dataset.i]; drawSvc(); summary();
  });

  /* ---------- Footer ---------- */
  const li = (cls, t) => `<i class="${cls}"></i>${e(t)}`;
  $('#foot').innerHTML = `
    <div><a href="#inicio" class="logo"><i class="fa-solid fa-scissors"></i><span><small>ANTO'S</small><strong>BARBER</strong></span></a>
      <p>${e(H.text || '')}</p>
      <div class="social">
        ${c.tiktok ? `<a href="${e(c.tiktok)}" target="_blank" rel="noopener" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>` : ''}
        ${c.instagram ? `<a href="${e(c.instagram)}" target="_blank" rel="noopener" title="Instagram"><i class="fa-brands fa-instagram"></i></a>` : ''}
        ${c.facebook ? `<a href="${e(c.facebook)}" target="_blank" rel="noopener" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>` : ''}
        <a href="https://wa.me/${e(PHONE)}" target="_blank" rel="noopener" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
      </div></div>
    <div><h4>Navegación</h4><ul><li><a href="#inicio">Inicio</a></li><li><a href="#servicios">Servicios</a></li><li><a href="#agenda">Barberos</a></li><li><a href="#galeria">Galería</a></li><li><a href="#contacto">Contacto</a></li></ul></div>
    <div><h4>Servicios</h4><ul>${services.slice(0, 5).map(s => `<li><a href="#servicios">${e(s.name)}</a></li>`).join('')}</ul></div>
    <div><h4>Contacto</h4><ul><li>${li('fa-solid fa-phone', c.phoneText || '')}</li><li>${li('fa-solid fa-location-dot', c.address || '')}</li></ul></div>
    <div><h4>Horario de atención</h4><p>${e(c.hours1 || '')}</p><p>${e(c.hours2 || '')}</p></div>`;

  /* ---------- Inicio ---------- */
  const first = Object.keys(byDate('')).sort()[0];
  if (first) { const d = parse(first); st.y = d.getFullYear(); st.m = d.getMonth(); }
  drawSvc(); drawBar(); drawCal(); drawTimes(); summary();
})();
