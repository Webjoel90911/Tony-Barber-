(async()=>{
const $=s=>document.querySelector(s),e=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let D;try{D=await (await fetch('data.json?'+Date.now())).json()}catch(x){return}
const c=D.contact;window.PHONE=c.phone;
$('.badge-info').innerHTML=`<i class="fa-solid fa-location-dot" style="color: var(--gold);"></i> ${e(c.address)}`;
$('.hero-content h1').innerHTML=`${e(D.hero.title1)} <span>${e(D.hero.title2)}</span>`;
$('.hero-content p').textContent=D.hero.text;
$('.hero-banner-preview img').src=D.hero.image;
$('.banners-grid').innerHTML=D.banners.map((b,i)=>`<div class="banner-card"><img src="${e(b)}" alt="Banner ${i+1}"></div>`).join('');
const box=$('.pricing-table-container');box.querySelectorAll('.service-category-title,.pricing-grid').forEach(n=>n.remove());
const btn='style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 0.5rem;"';
box.insertAdjacentHTML('beforeend',D.categories.map(k=>`<div class="service-category-title"><i class="fa-solid ${e(k.icon)}"></i> ${e(k.name)}</div><div class="pricing-grid">${k.items.map(i=>`<div class="price-card${i.badge?' featured':''}">${i.badge?`<div style="position:absolute;top:0;right:0;background:var(--gold);color:#000;font-size:.7rem;padding:3px 10px;border-bottom-left-radius:8px;font-weight:700;">${e(i.badge)}</div>`:''}<div><h3>${e(i.name)}</h3><div class="prices-row"><span class="regular-price">S/ ${e(i.price)}</span></div>${i.features.length?`<ul class="service-details">${i.features.map(f=>`<li><i class="fa-solid fa-check"></i> ${e(f)}</li>`).join('')}</ul>`:''}</div><button class="btn-gold" ${btn} onclick="setService(this.dataset.s)" data-s="${e(i.name)} (S/${e(i.price)})">Seleccionar</button></div>`).join('')}</div>`).join(''));
$('.barbers-grid').innerHTML=D.barbers.map(b=>`<div class="barber-card"><div class="barber-img-container"><img src="${e(b.photo)}" alt="${e(b.name)}"></div><div class="barber-info"><h3>${e(b.name)}</h3><div class="role">${e(b.role)}</div><button class="btn-gold" style="font-size:.85rem;padding:.4rem 1rem;" onclick="selectBarber(this.dataset.b)" data-b="${e(b.name)} (${e(b.role)})">Elegir Barbero</button></div></div>`).join('');
$('#clientBarber').innerHTML='<option value="Cualquiera disponible">Cualquiera disponible</option>'+D.barbers.map(b=>{const v=`${b.name} (${b.role})`;return `<option value="${e(v)}">${e(v)}</option>`}).join('');
$('#clientService').innerHTML=D.categories.flatMap(k=>k.items).map(i=>`<option value="${e(i.name)}">${e(i.name)} - S/ ${e(i.price)}</option>`).join('');
$('.booking-box > p').textContent=`Completa tus datos y haz clic en reservar para enviarlo directamente a nuestro WhatsApp (${c.phoneText}).`;
$('.gallery-grid').innerHTML=D.gallery.map((g,i)=>`<div class="gallery-item"><img src="${e(g)}" alt="Corte ${i+1}"></div>`).join('');
const ic='style="color: var(--gold);"';
$('.footer-container').innerHTML=`<div class="footer-col"><h4><i class="fa-solid fa-scissors" ${ic}></i> Anto's Barber Style Lounge</h4><p>${e(D.hero.text)}</p><div class="social-icons"><a href="${e(c.tiktok)}" target="_blank"><i class="fa-brands fa-tiktok"></i></a><a href="${e(c.instagram)}" target="_blank"><i class="fa-brands fa-instagram"></i></a><a href="${e(c.facebook)}" target="_blank"><i class="fa-brands fa-facebook-f"></i></a></div></div><div class="footer-col"><h4>Ubicación y Contacto</h4><p><i class="fa-solid fa-location-dot" ${ic}></i> ${e(c.address)}</p><p><i class="fa-solid fa-phone" ${ic}></i> Citas: ${e(c.phoneText)}</p></div><div class="footer-col"><h4>Horarios</h4><p>${e(c.hours1)}</p><p>${e(c.hours2)}</p></div>`;
const dt=$('#clientDate'),old=$('#clientTime'),tm=document.createElement('select');tm.id='clientTime';tm.className='form-control';old.replaceWith(tm);
const today=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);dt.min=today;
const fill=()=>{const t=(D.slots||[]).filter(x=>x.date==dt.value).flatMap(x=>x.times);tm.innerHTML=!dt.value?'<option value="">Elige primero una fecha</option>':t.length?'<option value="">Elige una hora</option>'+t.map(h=>`<option>${e(h)}</option>`).join(''):'<option value="">Sin cupos para este día</option>'};
dt.addEventListener('change',fill);fill();
})();
