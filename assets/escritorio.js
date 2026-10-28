// CREATV MYNDZ · el escritorio retro (escritorio.html). Todo sale de data/escritorio.json:
//   fondo / fondos  → fondos de pantalla (el visitante los cambia desde el menú "Fondo")
//   proyectos       → un cuadradito por proyecto creativo, regado por el escritorio
//   dock            → los programas de la barra de tareas; cada uno abre una ventana o un enlace ("|" dibuja un separador)
// Lo que el visitante cambia (fondo, blur, su propio fondo, dónde arrastró los íconos) se guarda solo en su navegador.
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={
  get(k){try{return JSON.parse(localStorage.getItem("cm-desk-"+k))}catch(e){return null}},
  set(k,v){try{localStorage.setItem("cm-desk-"+k,JSON.stringify(v));return true}catch(e){return false}},
  del(k){try{localStorage.removeItem("cm-desk-"+k)}catch(e){}}
};
const phone=()=>matchMedia("(max-width:640px)").matches;
const cssPx=v=>parseInt(getComputedStyle(document.documentElement).getPropertyValue(v));

// Un ícono es la ruta de una imagen (assets/iconos/...). Los .png son pixel art: se escalan nítidos.
const iconHTML=(src,cls="")=>src?`<img class="${cls}${/\.png$/i.test(src)?" px":""}" src="${esc(src)}" alt="" draggable="false">`:"";
const FOLDER="assets/iconos/carpeta.png";

let D={fondo:"",fondos:[],proyectos:[],dock:[]};

// ---------- fondo de pantalla
function blurFor(f){
  const lvl=store.get("blur")||"suave", base=f?.blur??10;
  return lvl==="sin"?0:lvl==="fuerte"?Math.min(32,Math.max(14,base*2)):base;
}
function currentFondo(){
  const id=store.get("fondo");
  return D.fondos.find(x=>x.id===id)||D.fondos.find(x=>x.id===D.fondo)||D.fondos[0];
}
function applyWall(){
  const mine=store.get("mio"), f=currentFondo();
  const img=mine||f?.imagen;
  $("#wall").style.backgroundImage=img?`url("${img}")`:"none";
  document.documentElement.style.setProperty("--blur",blurFor(mine?{blur:f?.blur}:f)+"px");
  renderFondoMenu();
}
function renderFondoMenu(){
  const mine=!!store.get("mio"), cur=currentFondo()?.id, lvl=store.get("blur")||"suave";
  const ck=on=>`<span class="ck">${on?"●":""}</span>`;
  $("#fondoMenu").innerHTML=
    D.fondos.map(f=>`<button role="menuitemradio" aria-checked="${!mine&&f.id===cur}" data-fondo="${esc(f.id)}">${ck(!mine&&f.id===cur)}${esc(f.nombre)}</button>`).join("")+
    `<hr><button role="menuitem" data-subir>${ck(mine)}Subir mi propio fondo…</button>`+
    `<button role="menuitem" data-quitar aria-disabled="${!mine}"><span class="ck"></span>Quitar mi fondo</button>`+
    `<hr><div class="mtitle">BLUR</div>`+
    [["sin","Sin blur"],["suave","Suave"],["fuerte","Fuerte"]].map(([k,n])=>`<button role="menuitemradio" aria-checked="${k===lvl}" data-blur="${k}">${ck(k===lvl)}${n}</button>`).join("");
}

// "Subir mi propio fondo": se reduce en el navegador (máx. 1600 px, JPEG) para que
// quepa en localStorage. No se sube nada a ningún servidor.
function useOwnWall(file){
  if(!file||!/^image\//.test(file.type))return;
  const url=URL.createObjectURL(file), im=new Image();
  im.onload=()=>{
    let saved=false;
    for(const [max,q] of [[1600,.82],[1280,.75],[960,.7],[720,.65]]){
      const s=Math.min(1,max/Math.max(im.width,im.height));
      const c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
      c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      if(store.set("mio",c.toDataURL("image/jpeg",q))){saved=true;break;}
    }
    URL.revokeObjectURL(url);
    if(!saved){alertWin("No se pudo guardar","La imagen es muy pesada para guardarla en este navegador. Prueba con otra más liviana.");return;}
    applyWall();
  };
  im.onerror=()=>{URL.revokeObjectURL(url);alertWin("No se pudo abrir","Ese archivo no parece una imagen.");};
  im.src=url;
}

// ---------- posiciones "al azar" pero fijas: cada proyecto tiene su lugar según su id,
// salvo que traiga x/y en el JSON o que el visitante lo haya arrastrado.
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};}
function deskSize(){return [innerWidth,innerHeight-cssPx("--mb")-cssPx("--tb")];}
function layout(){
  const [W,H]=deskSize(), pad=phone()?50:76, top=pad, bottom=H-(phone()?60:70);
  const placed=[], moved=store.get("pos")||{};
  return D.proyectos.map(p=>{
    if(moved[p.id])return {p,x:moved[p.id][0]*W,y:moved[p.id][1]*H};
    if(p.x!=null&&p.y!=null)return {p,x:p.x/100*W,y:p.y/100*H};
    const r=rng(p.id||p.titulo||"x");let best=null,bestD=-1;
    for(let k=0;k<40;k++){
      const x=pad+r()*(W-2*pad),y=top+r()*Math.max(40,bottom-top);
      const d=Math.min(...placed.map(q=>Math.hypot(q[0]-x,q[1]-y)),1e9);
      if(d>bestD){best=[x,y];bestD=d;}if(d>(phone()?100:130))break;
    }
    placed.push(best);return {p,x:best[0],y:best[1]};
  });
}
function renderDesk(){
  $("#desk").innerHTML=layout().map(({p,x,y})=>`<button class="ico" data-p="${esc(p.id)}" style="left:${x}px;top:${y}px" aria-label="${esc(p.titulo)}"><span class="th">${p.portada?`<img src="${esc(p.portada)}" alt="" draggable="false" loading="lazy">`:iconHTML(FOLDER)}</span><span class="lb">${esc(p.titulo)}</span></button>`).join("");
  $("#empty").hidden=D.proyectos.length>0;
}

// ---------- barra de tareas con los programas
function appIcon(a){
  if(a.id==="papelera"&&a.iconoLleno&&(a.ideas||[]).length)return a.iconoLleno;
  return a.icono;
}
function renderDock(){
  $("#dock").innerHTML=D.dock.map(a=>a==="|"?`<span class="sep" aria-hidden="true"></span>`:`<button class="app" data-app="${esc(a.id)}" aria-label="${esc(a.nombre)}">${iconHTML(appIcon(a))}<span class="tip" role="tooltip">${esc(a.nombre)}</span></button>`).join("");
}
const dock=$("#dock");
// Tooltip amarillo clásico; va "fixed" para que el scroll del dock no lo recorte.
dock.addEventListener("pointerover",e=>{const b=e.target.closest(".app");if(!b||e.pointerType!=="mouse")return;const t=b.querySelector(".tip"),r=b.getBoundingClientRect();
  t.style.left=Math.min(innerWidth-8-t.offsetWidth,Math.max(4,r.left+r.width/2-t.offsetWidth/2))+"px";t.style.top=(r.top-t.offsetHeight-6)+"px";t.style.opacity=1;});
dock.addEventListener("pointerout",e=>{const b=e.target.closest(".app");if(b)b.querySelector(".tip").style.opacity=0;});

// ---------- ventanas
let zTop=25,openCount=0;
function openWin(key,title,html,{icon=FOLDER,status="Listo",info=""}={}){
  let w=document.querySelector(`.win[data-k="${CSS.escape(key)}"]`);
  if(!w){
    w=document.createElement("section");w.className="win";w.dataset.k=key;w.setAttribute("role","dialog");w.setAttribute("aria-label",title);
    const off=(openCount++%6)*26, ww=Math.min(620,innerWidth-32);
    w.style.left=Math.max(16,(innerWidth-ww)/2+off-60)+"px";w.style.top=(cssPx("--mb")+innerHeight*.07+off)+"px";
    $("#wins").appendChild(w);
  }
  w.innerHTML=`<div class="bar">${iconHTML(icon,"wi")}<b>${esc(title)}</b><span class="ctl"><i aria-hidden="true">_</i><i aria-hidden="true">□</i><i class="x" data-close role="button" tabindex="0" aria-label="Cerrar">×</i></span></div>
    <div class="menurow" aria-hidden="true"><span><u>A</u>rchivo</span><span><u>E</u>dición</span><span><u>V</u>er</span><span>Ay<u>u</u>da</span></div>
    <div class="body">${html}</div>
    <div class="status"><span>${esc(status)}</span>${info?`<span>${esc(info)}</span>`:""}</div>`;
  w.style.zIndex=++zTop;markDock();keepAboveTaskbar(w);
  w.querySelectorAll(".body img").forEach(im=>im.addEventListener("load",()=>keepAboveTaskbar(w),{once:true}));
  return w;
}
// Ninguna ventana tapa la barra de tareas: si se pasa, se sube.
function keepAboveTaskbar(w){if(phone())return;requestAnimationFrame(()=>{const r=w.getBoundingClientRect(),floor=innerHeight-cssPx("--tb")-8;
  if(r.bottom>floor)w.style.top=Math.max(cssPx("--mb")+6,floor-r.height)+"px";});}
function closeWin(w){w.remove();markDock();}
function markDock(){const open=[...document.querySelectorAll(".win")].map(w=>w.dataset.k);dock.querySelectorAll(".app").forEach(b=>b.classList.toggle("on",open.includes("app:"+b.dataset.app)));}
function alertWin(title,text){openWin("alert",title,`<div class="soon">${iconHTML("assets/iconos/cdrom.png")}<span>${esc(text)}</span></div>`,{icon:"assets/iconos/cdrom.png"});}

function projectWin(p){
  const imgs=(p.imagenes||[]).map(s=>`<img src="${esc(s)}" alt="" loading="lazy">`).join("");
  openWin("p:"+p.id,p.titulo,`${p.portada?`<img class="cover" src="${esc(p.portada)}" alt="">`:""}<h2>${esc(p.titulo)}</h2>
    <div class="meta">${esc([p.tipo,p.año].filter(Boolean).join(" · "))}</div>${p.texto?`<p>${esc(p.texto).replace(/\n/g,"<br>")}</p>`:""}
    ${imgs?`<div class="gal">${imgs}</div>`:""}${p.enlace?`<a class="btn95" href="${esc(p.enlace)}" target="_blank" rel="noopener">Ver proyecto ↗</a>`:""}`,
    {info:[p.tipo,p.año].filter(Boolean).join(" · ")});
}
function appWin(a){
  if(a.enlace){window.open(a.enlace,"_blank","noopener");return;}
  if(a.id==="papelera"){
    const ideas=a.ideas||[];
    openWin("app:"+a.id,a.nombre,ideas.length?ideas.map(i=>`<div class="idea"><b>${esc(i.titulo||"")}</b>${i.titulo?"<br>":""}${esc(i.texto||i)}</div>`).join("")
      :`<div class="soon">${iconHTML(a.icono)}<b>La papelera está vacía</b><span>Aquí van a caer las ideas sueltas.</span></div>`,
      {icon:appIcon(a),info:ideas.length+(ideas.length===1?" idea":" ideas")});return;
  }
  openWin("app:"+a.id,a.nombre,`<div class="soon">${iconHTML(a.icono)}<b>${esc(a.nombre)}</b><span>${esc(a.texto||"Muy pronto.")}</span></div>`,{icon:a.icono});
}
function listWin(){
  const n=D.proyectos.length;
  openWin("proyectos","Proyectos",n?`<ul class="list">${D.proyectos.map(p=>`<li><button data-open-p="${esc(p.id)}">${p.portada?`<img src="${esc(p.portada)}" alt="">`:iconHTML(FOLDER)}<span><b>${esc(p.titulo)}</b><br><small>${esc([p.tipo,p.año].filter(Boolean).join(" · "))}</small></span></button></li>`).join("")}</ul>`
    :`<div class="soon">${iconHTML(FOLDER)}<b>Todavía no hay proyectos</b><span>Cada proyecto creativo va a aparecer como un ícono en el escritorio.</span></div>`,
    {info:n+(n===1?" objeto":" objetos")});
}
function aboutWin(){
  openWin("sobre","Sobre CREATV MYNDZ",`<div class="soon"><img class="about-logo" src="assets/img/logo-creatv-blur.webp" alt="CREATV MYNDZ"><b>GLOBAL CREATIVE DEALERS</b><span>El escritorio de CREATV MYNDZ.<br>Proyectos creativos, ideas y procesos.</span><a class="btn95" href="index.html">Ir a creatvmyndz.com</a></div>`,
    {icon:"assets/iconos/cdrom.png",info:"CRTV "+new Date().getFullYear()});
}

// ---------- menús
function toggleMenu(menu,btn,force){const m=$(menu),b=$(btn),show=force??m.hidden;m.hidden=!show;b.setAttribute("aria-expanded",String(show));return show;}
function closeMenus(){toggleMenu("#fondoMenu","#mbFondo",false);toggleMenu("#startMenu","#startBtn",false);}
function openFondoMenu(fromStart){
  closeMenus();toggleMenu("#fondoMenu","#mbFondo",true);
  const m=$("#fondoMenu");
  if(fromStart&&!phone()){const r=$("#startMenu [data-start-fondo]").getBoundingClientRect();m.style.left=r.right+"px";m.style.top="auto";m.style.bottom=(innerHeight-r.bottom)+"px";}
  else{const r=$("#mbFondo").getBoundingClientRect();m.style.left=r.left+"px";m.style.top="";m.style.bottom="";}
}

// ---------- arrastrar íconos y ventanas; doble clic (PC) o toque (celular) para abrir
let drag=null;
document.addEventListener("pointerdown",e=>{
  const ico=e.target.closest(".ico"),bar=e.target.closest(".win .bar");
  document.querySelectorAll(".ico.sel").forEach(x=>x!==ico&&x.classList.remove("sel"));
  const w=e.target.closest(".win");if(w)w.style.zIndex=++zTop;
  if(e.target.closest("[data-close]"))return;
  if(ico){ico.classList.add("sel");drag={el:ico,kind:"ico",sx:e.clientX,sy:e.clientY,ox:parseFloat(ico.style.left),oy:parseFloat(ico.style.top),moved:false};ico.setPointerCapture(e.pointerId);}
  else if(bar&&!phone()){const r=w.getBoundingClientRect();drag={el:w,kind:"win",sx:e.clientX,sy:e.clientY,ox:r.left,oy:r.top,moved:false};bar.setPointerCapture(e.pointerId);}
});
document.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!drag.moved&&Math.hypot(dx,dy)<5)return;drag.moved=true;
  if(drag.kind==="ico"){drag.el.classList.add("drag");drag.el.style.left=drag.ox+dx+"px";drag.el.style.top=drag.oy+dy+"px";}
  else{const floor=innerHeight-cssPx("--tb")-30;drag.el.style.left=Math.max(-200,drag.ox+dx)+"px";drag.el.style.top=Math.min(floor,Math.max(cssPx("--mb"),drag.oy+dy))+"px";}});
document.addEventListener("pointerup",e=>{if(!drag)return;const d=drag;drag=null;
  if(d.kind==="ico"){d.el.classList.remove("drag");
    if(d.moved){const pos=store.get("pos")||{},[W,H]=deskSize();pos[d.el.dataset.p]=[parseFloat(d.el.style.left)/W,parseFloat(d.el.style.top)/H];store.set("pos",pos);}
    else if(phone()||e.pointerType!=="mouse"){const p=D.proyectos.find(x=>x.id===d.el.dataset.p);p&&projectWin(p);}}});
document.addEventListener("dblclick",e=>{const ico=e.target.closest(".ico");if(ico){const p=D.proyectos.find(x=>x.id===ico.dataset.p);p&&projectWin(p);}});
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-close]");if(c){closeWin(c.closest(".win"));return;}
  const a=e.target.closest("[data-app]");if(a){closeMenus();const app=D.dock.find(x=>x&&x.id===a.dataset.app);app&&appWin(app);return;}
  const ao=e.target.closest("[data-app-open]");if(ao){closeMenus();const app=D.dock.find(x=>x&&x.id===ao.dataset.appOpen);app&&appWin(app);return;}
  const op=e.target.closest("[data-open-p]");if(op){const p=D.proyectos.find(x=>x.id===op.dataset.openP);p&&projectWin(p);return;}
  const fm=e.target.closest("[data-fondo]");if(fm){store.del("mio");store.set("fondo",fm.dataset.fondo);applyWall();closeMenus();return;}
  if(e.target.closest("[data-subir]")){closeMenus();$("#wallFile").click();return;}
  if(e.target.closest("[data-quitar]")){store.del("mio");applyWall();closeMenus();return;}
  const bl=e.target.closest("[data-blur]");if(bl){store.set("blur",bl.dataset.blur);applyWall();return;}
  if(e.target.closest("[data-start-fondo]")){openFondoMenu(true);return;}
  if(e.target.closest("#mbFondo")){const open=!$("#fondoMenu").hidden;closeMenus();if(!open)openFondoMenu(false);return;}
  if(e.target.closest("#startBtn")){const open=!$("#startMenu").hidden;closeMenus();if(!open)toggleMenu("#startMenu","#startBtn",true);return;}
  const wb=e.target.closest("[data-win]");if(wb){closeMenus();wb.dataset.win==="sobre"?aboutWin():listWin();return;}
  if(!e.target.closest(".menu"))closeMenus();
});
$("#wallFile").addEventListener("change",e=>{useOwnWall(e.target.files[0]);e.target.value="";});
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.matches("[data-close]")){closeWin(e.target.closest(".win"));return;}
  if(e.key==="Escape"){if(!$("#fondoMenu").hidden||!$("#startMenu").hidden){closeMenus();return;}
    const ws=[...document.querySelectorAll(".win")].sort((a,b)=>b.style.zIndex-a.style.zIndex);ws[0]&&closeWin(ws[0]);}
});

// ---------- reloj (barra de menú y bandeja)
function tick(){const d=new Date(),t=d.toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"});
  const day=d.toLocaleDateString("es",{weekday:"short",day:"numeric",month:"short"}).replace(/\./g,"").toUpperCase();
  $("#clock").textContent=phone()?t:`${day}  ${t}`;$("#trayClock").textContent=t;}
tick();setInterval(tick,15000);

let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{renderDesk();tick();},120);});

// ---------- arranque
fetch("data/escritorio.json",{cache:"no-cache"}).then(r=>r.json()).then(d=>{D=Object.assign(D,d);
  applyWall();renderDock();renderDesk();
}).catch(()=>{$("#empty").hidden=false;$("#empty span").textContent="No se pudo cargar el escritorio.";});
})();
