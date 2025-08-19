
const BRL = v => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const CART_KEY='rs_cart_v4';
const loadCart = ()=>JSON.parse(localStorage.getItem(CART_KEY)||'[]');
const saveCart = v=>localStorage.setItem(CART_KEY,JSON.stringify(v));

fetch('assets/site-config.json').then(r=>r.json()).then(cfg=>{
  document.querySelectorAll('[data-config="nome"]').forEach(e=>e.textContent=cfg.nome);
  document.querySelectorAll('[data-config="telefone"]').forEach(e=>e.textContent=cfg.telefone);
  document.querySelectorAll('[data-config="horario"]').forEach(e=>e.textContent=cfg.horario||'');
  const tel = 'tel:'+cfg.telefone.replace(/\D/g,'');
  const wa = 'https://wa.me/'+cfg.whatsapp;
  const mail='mailto:'+cfg.email;
  document.querySelectorAll('[data-config="telefoneLink"]').forEach(e=>e.href=tel);
  document.querySelectorAll('[data-config="whatsappLink"]').forEach(e=>e.href=wa);
  document.querySelectorAll('[data-config="emailLink"]').forEach(e=>e.href=mail);
  document.querySelectorAll('[data-config="instagram"]').forEach(e=>e.href=cfg.instagram);
  document.querySelectorAll('[data-config="facebook"]').forEach(e=>e.href=cfg.facebook);
  document.querySelectorAll('[data-config="whatsappFmt"]').forEach(el=>{
    const raw = cfg.whatsapp.replace(/^55/,''); el.textContent = '('+raw.slice(0,2)+') '+raw.slice(2,7)+'-'+raw.slice(7);
  });
  const btn = document.getElementById('btnWhats');
  const obsGeral = document.getElementById('obsGeral');
  if(btn){
    btn.addEventListener('click', e=>{
      const cart = loadCart();
      if(!cart.length){ e.preventDefault(); alert('Seu orçamento está vazio.'); return; }
      const linhas = cart.map(i=>`• ${i.nome} x${i.qtd} — ${BRL(i.preco)} = ${BRL(i.preco*i.qtd)}${i.obs?` (%0A   obs: ${encodeURIComponent(i.obs)})`:''}`);
      const total = cart.reduce((s,i)=>s+i.preco*i.qtd,0);
      let msg = `Olá! Gostaria de um orçamento:%0A%0A${linhas.join('%0A')}
%0ATotal: ${BRL(total)}`;
      if(obsGeral?.value?.trim()){
        msg += `%0A%0AObservação geral:%0A${encodeURIComponent(obsGeral.value.trim())}`;
      }
      btn.href = `https://wa.me/${cfg.whatsapp}?text=${msg}`;
    });
  }
  const y=document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();
});

function renderResumo(){
  const tbody = document.querySelector('#cartTable tbody');
  const totalEl = document.getElementById('cartTotal');
  if(!tbody || !totalEl) return;
  const cart = loadCart();
  tbody.innerHTML='';
  cart.forEach((i,ix)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i.nome}</td>
    <td><input type="number" min="1" value="${i.qtd}" data-qty="${ix}" class="input" style="max-width:90px"></td>
    <td><input type="text" value="${i.obs||''}" data-obs="${ix}" class="input" placeholder="Observação do item"></td>
    <td>${BRL(i.preco)}</td><td>${BRL(i.preco*i.qtd)}</td>
    <td><button class="btn" data-del="${ix}">Remover</button></td>`;
    tbody.appendChild(tr);
  });
  const total = cart.reduce((s,i)=>s+i.preco*i.qtd,0);
  totalEl.textContent = total.toLocaleString('pt-BR',{minimumFractionDigits:2});
  tbody.onchange = e=>{
    const q = e.target.getAttribute('data-qty');
    const o = e.target.getAttribute('data-obs');
    const cart = loadCart();
    if(q!=null){ cart[q].qtd = Math.max(1, parseInt(e.target.value||'1')); }
    if(o!=null){ cart[o].obs = e.target.value; }
    saveCart(cart); renderResumo();
  };
  tbody.onclick = e=>{
    const d = e.target.getAttribute('data-del');
    if(d!=null){ const cart = loadCart(); cart.splice(parseInt(d),1); saveCart(cart); renderResumo(); }
  }
}
document.getElementById('btnLimpar')?.addEventListener('click', ()=>{ saveCart([]); renderResumo(); });
renderResumo();

// Configurador de Bolos
fetch('assets/pricing.json').then(r=>r.json()).then(db=>{
  const bolos = db.bolos;
  if(!bolos) return;

  const mDiv = document.getElementById('optMassa');
  if(mDiv){
    mDiv.innerHTML = bolos.massas.map((m,i)=>`<label><input type="radio" name="massa" value="${m.id}" ${i===0?'checked':''}> ${m.nome}</label>`).join('');
  }
  const tDiv = document.getElementById('optTamanho');
  if(tDiv){
    const ts = bolos.formatos.redondo.tamanhos;
    tDiv.innerHTML = ts.map((t,i)=>`<label><input type="radio" name="tamanho" value="${t.id}" ${i===0?'checked':''}> ${t.nome}</label>`).join('');
  }
  function renderRecheios(grupo){
    const rDiv = document.getElementById('optRecheio');
    if(!rDiv) return;
    const lista = bolos.recheios.filter(r=>r.grupo==grupo);
    rDiv.innerHTML = lista.map((r,i)=>`<label><input type="radio" name="recheio" value="${r.id}" data-grupo="${r.grupo}" ${i===0?'checked':''}> ${r.nome}</label>`).join('');
  }
  let grupoAtual = 1;
  renderRecheios(grupoAtual);
  document.querySelectorAll('input[name="grupo"]').forEach(r=>r.addEventListener('change', e=>{
    grupoAtual = parseInt(e.target.value); renderRecheios(grupoAtual); calc();
  }));
  function getSel(name){ return document.querySelector(`input[name="${name}"]:checked`); }
  function calc(){
    const tId = getSel('tamanho')?.value;
    const tam = bolos.formatos.redondo.tamanhos.find(t=>t.id===tId);
    const grupo = parseInt(document.querySelector('input[name="grupo"]:checked').value);
    const preco = tam ? tam.precos['g'+grupo] : 0;
    const el = document.getElementById('precoBolo');
    if(el) el.textContent = preco.toLocaleString('pt-BR',{minimumFractionDigits:2});
    return {preco, tam, grupo,
      massa: bolos.massas.find(m=>m.id===getSel('massa')?.value),
      recheio: bolos.recheios.find(r=>r.id===getSel('recheio')?.value)
    };
  }
  document.addEventListener('change', e=>{
    if(['massa','recheio','tamanho'].includes(e.target.name)) calc();
  });
  calc();
  const addBtn = document.getElementById('addBolo');
  if(addBtn) addBtn.addEventListener('click', ()=>{
    const s = calc();
    if(!s.tam || !s.recheio || !s.massa){ alert('Selecione massa, recheio e tamanho.'); return; }
    const nome = `Bolo Redondo • ${s.tam.nome} • Massa: ${s.massa.nome} • Recheio: ${s.recheio.nome}`;
    const obs = document.getElementById('obsBolo')?.value.trim() || '';
    const cart = loadCart();
    cart.push({tipo:'bolo', nome, preco:s.preco, qtd:1, obs});
    saveCart(cart);
    renderResumo();
    alert('Adicionado ao orçamento!');
  });
});

// Kits
fetch('assets/pricing.json').then(r=>r.json()).then(db=>{
  const kits = db.kits||[];
  kits.forEach(k=>{
    const card = document.querySelector(`[data-kit="${k.id}"]`);
    if(!card) return;
    card.querySelector('.kit-price').textContent = k.preco.toLocaleString('pt-BR',{minimumFractionDigits:2});
    card.querySelector('.kit-desc').textContent = k.descricao;
    card.querySelector('.kit-add').addEventListener('click', ()=>{
      const qtd = Math.max(1, parseInt(card.querySelector('.kit-qty').value||'1'));
      const obs = (card.querySelector('.kit-obs').value||'').trim();
      const cart = loadCart();
      cart.push({tipo:'kit', nome:k.nome, preco:k.preco, qtd, obs});
      saveCart(cart); renderResumo(); alert('Adicionado ao orçamento!');
    });
  });
});

// Depoimentos
fetch('assets/testimonials.json').then(r=>r.json()).then(list=>{
  const root = document.getElementById('depoimentos');
  if(!root) return;
  root.innerHTML = list.map(t=>{
    const stars = '★★★★★'.slice(0, t.nota);
    return `<div class="testi">
      <div class="stars">${stars}</div>
      <p>${t.texto}</p>
      <strong>${t.nome}</strong>
    </div>`;
  }).join('');
});

