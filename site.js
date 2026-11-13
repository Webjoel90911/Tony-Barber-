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
  const st = { svc: null, who: null, date: '', time: '', timeBarber: '', y: now.getFullYear(), m: now.getMonth() };

  /* ---------- Disponibilidad ---------- */
  const libres = x => (x.times || []).filter(h => x.date !== today || h.padStart(5, '0') > hhmm());
  const vivo = x => x.date && x.date >= today && libres(x).length && !(x.barber && barbers.some(b => b.name === x.barber && !av(b)));
  const aplica = (x, who) => !who || !x.barber || x.barber === who;
  const slotsOf = who => D.slots.filter(x => vivo(x) && aplica(x, who));
  const cuenta = n => slotsOf(n).reduce((t, x) => t + libres(x).length, 0);
  // fecha -> { hora: barbero }
  const byDate = who => {
    who = who || '';
    const out = {};
    slotsOf(who).forEach(x => libres(x).forEach(h => {
      const o = out[x.date] = out[x.date] || {};
      const hh = h.padStart(5, '0');
      if (!(hh in o)) o[hh] = x.barber || '';
    }));
    return out;
  };

  /* ---------- Servicios (carta) ---------- */
  const goAgenda = () => { const a = $('#agenda'); if (a) a.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const carta = $('#carta');
  const drawCarta = () => {
    carta.innerHTML = services.map((s, i) => `<div class="card-s${st.svc === s ? ' sel' : ''}">${s.badge ? `<span class="tag">${e(s.badge)}</span>` : ''}<span class="cat">${e(s.cat)}</span><h3>${e(s.name)}</h3><div class="pr">S/ ${e(s.price)}</div>${s.features && s.features.length ? `<ul>${s.features.map(f => `<li><i class="fa-solid fa-check"></i>${e(f)}</li>`).join('')}</ul>` : '<ul></ul>'}<button type="button" class="btn-gold" data-i="${i}">${st.svc === s ? 'Seleccionado' : 'Seleccionar'}</button></div>`).join('');
  };
  carta.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-i]'); if (!b) return;
    st.svc = services[+b.dataset.i];
    drawCarta(); drawCal(); summary();
    setTimeout(goAgenda, 120);
  });
  document.querySelectorAll('a.go').forEach(a => a.addEventListener('click', ev => {
    if (st.svc) { ev.preventDefault(); goAgenda(); }
  }));

  /* ---------- Barberos ---------- */
  const barList = $('#barberList');
  const drawBar = () => {
    const card = (name, role, photo, ok, sel, who, n, icon) => `<button type="button" class="opt${sel ? ' sel' : ''}${ok ? '' : ' off'}" data-w="${e(who)}" ${ok ? '' : 'disabled'}><span class="barber"><span class="avatar">${photo ? `<img src="${e(photo)}" alt="" onerror="this.remove()">` : `<i class="fa-solid ${icon || 'fa-user'}"></i>`}</span><span><span class="t">${e(name)}</span><span class="p">${e(role)}</span><span class="st ${ok ? 'ok' : 'bad'}"><i class="fa-solid fa-circle"></i>${ok ? 'Disponible' : 'No disponible'}${ok ? ` <em>· ${n ? `${n} ${n === 1 ? 'cupo' : 'cupos'}` : 'sin cupos'}</em>` : ''}</span></span></span><span class="radio"><i class="fa-solid fa-check"></i></span></button>`;
    barList.innerHTML =
      card('Cualquiera disponible', 'El primero que tenga cupo', '', true, st.who === '', '', cuenta(''), 'fa-users') +
      barbers.map(b => card(b.name, b.role || 'Barbero', b.photo, av(b), st.who === b.name, b.name, cuenta(b.name))).join('');
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
    const ready = !!st.svc && st.who !== null;
    $('#calBox').classList.toggle('dim', !ready);
    const lk = $('#calLock');
    lk.classList.toggle('on', !ready);
    lk.textContent = !st.svc ? 'Primero elige un servicio en la carta.' : 'Elige un barbero para ver sus fechas.';
    const av2 = ready ? byDate(st.who) : {};
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
    const hs = st.date && st.who !== null ? byDate(st.who)[st.date] : null;
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
  const barberLabel = () => st.who === null ? '' : (st.who || (st.time ? barberName() : 'Cualquiera disponible'));
  function summary() {
    const set = (id, v, empty) => { const el = $(id); el.textContent = v || empty; el.className = v ? '' : 'empty-v'; };
    $('#sSvc').innerHTML = st.svc ? `<span>${e(st.svc.name)}</span><span>S/ ${e(st.svc.price)}</span>` : '<span class="empty-v">Elige un servicio de la carta</span>';
    $('#chgSvc').classList.add('on');
    $('#chgSvc').textContent = st.svc ? 'Cambiar servicio' : 'Ir a la carta de servicios';
    set('#sBar', barberLabel(), 'Elige un barbero');
    set('#sDate', st.date ? fmt(st.date) : '', 'Elige una fecha');
    set('#sTime', st.time, 'Elige una hora');
    $('#sTotal').textContent = st.svc ? `S/ ${st.svc.price}` : 'S/ 0';
    const done = [!!st.svc, !!st.svc && st.who !== null, !!st.svc && st.who !== null && !!(st.date && st.time), !!st.svc && st.who !== null && !!(st.date && st.time) && !!name.value.trim()];
    const act = done.indexOf(false);
    steps.forEach((s, i) => { s.classList.toggle('done', done[i]); s.classList.toggle('active', i === act); });
  }
  name.addEventListener('input', summary);

  $('#confirmBtn').onclick = () => {
    if (!st.svc) { alert('Primero elige un servicio de la carta.'); const c = $('#servicios'); if (c) c.scrollIntoView({ behavior: 'smooth' }); return; }
    if (st.who === null) { alert('Elige un barbero.'); return; }
    if (!st.date || !st.time) { alert('Elige el día y la hora de tu cita.'); return; }
    const n = name.value.trim();
    if (!n) { alert('Por favor escribe tu nombre.'); name.focus(); return; }
    const msg = `Hola, quiero reservar una cita.\n\n*Nombre:* ${n}\n*Servicio:* ${st.svc.name} (S/${st.svc.price})\n*Barbero:* ${barberName()}\n*Fecha:* ${fmt(st.date)}\n*Hora:* ${st.time}`;
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  };

  /* ---------- Footer ---------- */
  const li = (cls, t) => `<i class="${cls}"></i>${e(t)}`;
  $('#foot').innerHTML = `
    <div><a href="#inicio" class="logo"><img class="logo-img" alt=""></a>
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

  const ic = document.querySelector('link[rel="apple-touch-icon"]');
  if (ic) document.querySelectorAll('.logo-img').forEach(i => { i.src = ic.href; });

  /* ---------- Inicio ---------- */
  const first = Object.keys(byDate('')).sort()[0];
  if (first) { const d = parse(first); st.y = d.getFullYear(); st.m = d.getMonth(); }
  drawCarta(); drawBar(); drawCal(); drawTimes(); summary();
})();
