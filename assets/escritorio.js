// CREATV MYNDZ · el escritorio retro (escritorio.html). Todo sale de data/escritorio.json:
//   fondo / fondos      → fondos de pantalla (el visitante los cambia desde el menú "Fondo")
//   creativePlayground  → true = cada CRTV de assets/projects.js es un ícono del escritorio
//   accesos             → íconos sueltos del escritorio (abren una ventana, la lista de proyectos o un enlace)
//   proyectos           → proyectos extra, además de los CRTV
//   dock                → los programas del dock; cada uno abre una ventana, un juego o un enlace ("|" = separador)
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

// Un ícono es la ruta de una imagen. Los .png de assets/iconos son pixel art: se escalan nítidos.
const isPixel=src=>/assets\/iconos\/.*\.png$/i.test(src)&&!/creatv-paleta/.test(src);
const iconHTML=(src,cls="")=>src?`<img class="${cls}${isPixel(src)?" px":""}" src="${esc(src)}" alt="" draggable="false">`:"";
const FOLDER="assets/iconos/carpeta.png", WARN="assets/iconos/aviso.png", PAINT="assets/iconos/paint.png";

let D={fondo:"",fondos:[],accesos:[],proyectos:[],dock:[]};
let ITEMS=[];   // todo lo que va en el escritorio: accesos + CRTV + proyectos extra

// ---------- los CRTV del Creative Playground (assets/projects.js) como proyectos del escritorio
const code=n=>n==null?"CRTV":"CRTV "+String(n).padStart(2,"0");
function fromPlayground(){
  if(!D.creativePlayground||typeof PROJECTS==="undefined")return [];
  return PROJECTS.map(p=>({
    id:p.id, titulo:p.title, codigo:code(p.num),
    estado:p.status==="soon"?"proximo":(p.link?"listo":"sin-material"),
    portada:p.image||"", imagen:(p.image||"").replace("/thumb/","/"),
    enlace:p.link||""
  }));
}
function buildItems(){
  ITEMS=[
    ...(D.accesos||[]).map(a=>({...a,tipoItem:"acceso"})),
    ...fromPlayground().map(p=>({...p,tipoItem:"crtv"})),
    ...(D.proyectos||[]).map(p=>({...p,tipoItem:"proyecto",estado:"listo"}))
  ];
}

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
  document.documentElement.style.setProperty("--blur",blurFor(f)+"px");
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
    if(!saved){msgBox("No se pudo guardar","La imagen es muy pesada para guardarla en este navegador. Prueba con otra más liviana.");return;}
    applyWall();
  };
  im.onerror=()=>{URL.revokeObjectURL(url);msgBox("No se pudo abrir","Ese archivo no parece una imagen.");};
  im.src=url;
}

// ---------- posiciones "al azar" pero fijas: cada ícono tiene su lugar según su id,
// salvo que traiga x/y en el JSON o que el visitante lo haya arrastrado.
// En el celular van en una cuadrícula con un poquito de desorden, para que quepan todos.
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};}
function deskSize(){return [innerWidth,innerHeight-cssPx("--mb")-cssPx("--tb")];}
function layout(){
  const [W,H]=deskSize(), moved=store.get("pos")||{};
  if(phone()){
    const cols=4, rows=Math.ceil(ITEMS.length/cols), cw=W/cols, ch=Math.min(122,(H-10)/Math.max(rows,1));
    // orden "barajado" fijo, para que no se vea como una lista
    const order=[...ITEMS].sort((a,b)=>rng(a.id)()-rng(b.id)());
    return order.map((p,i)=>{
      if(moved[p.id])return {p,x:moved[p.id][0]*W,y:moved[p.id][1]*H};
      const r=rng(p.id+"#");
      const x=cw*(i%cols+.5)+(r()-.5)*14;
      return {p,x:Math.min(W-44,Math.max(44,x)),y:ch*(Math.floor(i/cols)+.5)+8+(r()-.5)*12};
    });
  }
  const pad=80, top=70, bottom=H-60, placed=[];
  return ITEMS.map(p=>{
    if(moved[p.id])return {p,x:moved[p.id][0]*W,y:moved[p.id][1]*H};
    if(p.x!=null&&p.y!=null)return {p,x:p.x/100*W,y:p.y/100*H};
    const r=rng(p.id||p.titulo||"x");let best=null,bestD=-1;
    for(let k=0;k<60;k++){
      const x=pad+r()*(W-2*pad),y=top+r()*Math.max(40,bottom-top);
      const d=Math.min(...placed.map(q=>Math.hypot(q[0]-x,(q[1]-y)*1.2)),1e9);
      if(d>bestD){best=[x,y];bestD=d;}if(d>150)break;
    }
    placed.push(best);return {p,x:best[0],y:best[1]};
  });
}
function thumbHTML(p){
  if(p.tipoItem==="acceso")return `<span class="th bare">${iconHTML(p.icono)}</span>`;
  if(p.estado==="proximo")return `<span class="th bare">${iconHTML(WARN)}</span>`;
  return `<span class="th">${p.portada?`<img src="${esc(p.portada)}" alt="" draggable="false" loading="lazy">`:iconHTML(FOLDER)}</span>`;
}
function renderDesk(){
  $("#desk").innerHTML=layout().map(({p,x,y})=>`<button class="ico ${p.tipoItem} ${p.estado||""}" data-p="${esc(p.id)}" style="left:${x}px;top:${y}px" aria-label="${esc(p.titulo)}">${thumbHTML(p)}<span class="lb">${esc(p.titulo)}</span></button>`).join("");
  $("#empty").hidden=ITEMS.length>0;
}

// ---------- dock flotante (como un Mac moderno, con íconos retro)
function renderDock(){
  $("#dock").innerHTML=D.dock.map(a=>a==="|"?`<span class="sep" aria-hidden="true"></span>`:`<button class="app" data-app="${esc(a.id)}" aria-label="${esc(a.nombre)}">${iconHTML(a.icono)}<span class="tip" role="tooltip">${esc(a.nombre)}</span></button>`).join("");
}
const bar=$("#taskbar");
// Lupa: los íconos crecen bajo el mouse, como en un dock moderno.
bar.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse"||phone())return;
  bar.querySelectorAll(".app,#startBtn").forEach(el=>{const r=el.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));const s=1+Math.max(0,1-d/140)*.5;el.style.transform=`scale(${s.toFixed(3)})`;});});
bar.addEventListener("pointerleave",()=>bar.querySelectorAll(".app,#startBtn").forEach(el=>el.style.transform=""));

// ---------- ventanas
let zTop=25,openCount=0;
function openWin(key,title,html,{icon=FOLDER,status="Listo",info="",cls="",menu=["<u>A</u>rchivo","<u>E</u>dición","<u>V</u>er","Ay<u>u</u>da"],noMenu=false,noStatus=false}={}){
  let w=document.querySelector(`.win[data-k="${CSS.escape(key)}"]`);
  if(!w){
    w=document.createElement("section");w.dataset.k=key;w.setAttribute("role","dialog");w.setAttribute("aria-label",title);
    $("#wins").appendChild(w);
    w.className="win "+cls;
    const off=(openCount++%6)*26, ww=Math.min(cls.includes("dialog")?380:cls.includes("paint")?760:620,innerWidth-32);
    w.style.left=Math.max(16,(innerWidth-ww)/2+off-60)+"px";w.style.top=(cssPx("--mb")+innerHeight*.06+off)+"px";
  }
  w.innerHTML=`<div class="bar">${iconHTML(icon,"wi")}<b>${esc(title)}</b><span class="ctl"><i aria-hidden="true">_</i><i aria-hidden="true">□</i><i class="x" data-close role="button" tabindex="0" aria-label="Cerrar">×</i></span></div>
    ${noMenu?"":`<div class="menurow" aria-hidden="true">${menu.map(m=>`<span>${m}</span>`).join("")}</div>`}
    <div class="body">${html}</div>
    ${noStatus?"":`<div class="status"><span>${esc(status)}</span>${info?`<span>${info}</span>`:""}</div>`}`;
  w.style.zIndex=++zTop;markDock();keepAboveDock(w);
  // Si la ventana crece (una imagen que termina de cargar), se vuelve a acomodar.
  if(!w._ro&&"ResizeObserver" in window){w._ro=new ResizeObserver(()=>keepAboveDock(w));w._ro.observe(w);}
  return w;
}
// Ninguna ventana tapa el dock: si se pasa, se sube.
// Se mide con offsetHeight (la altura real, sin la animación de entrada que la achica).
function keepAboveDock(w){if(phone())return;requestAnimationFrame(()=>{const floor=$("#taskbar").getBoundingClientRect().top-10,h=w.offsetHeight,top=parseFloat(w.style.top)||0;
  if(top+h>floor)w.style.top=Math.max(cssPx("--mb")+6,floor-h)+"px";});}
function closeWin(w){w._ro&&w._ro.disconnect();w.remove();markDock();}
function markDock(){const open=[...document.querySelectorAll(".win")].map(w=>w.dataset.k);bar.querySelectorAll(".app").forEach(b=>b.classList.toggle("on",open.includes("app:"+b.dataset.app)));}

// Mensaje del sistema (aviso con Ok / Cancelar)
function msgBox(title,text,{icon=WARN,key="msg"}={}){
  openWin(key,title,`<div class="msg">${iconHTML(icon)}<p>${text}</p></div><div class="msg-btns"><button class="btn95" data-close>Ok</button><button class="btn95" data-close>Cancelar</button></div>`,
    {icon,cls:"dialog",noMenu:true,noStatus:true});
}

// Un CRTV terminado se abre como un archivo en Paint
const PAL=["#000","#808080","#800000","#808000","#008000","#008080","#000080","#800080","#808040","#004040","#0080ff","#004080","#8000ff","#804000",
           "#fff","#c0c0c0","#f00","#ff0","#0f0","#0ff","#00f","#f0f","#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040"];
const TOOLS=["✧","⬚","⌫","◈","✎","⌕","✐","▲","∿","A","╲","∿","▭","▱","◯","▢"];
function paintWin(p){
  const file=(p.id||"sin-titulo")+".bmp";
  openWin("p:"+p.id,`${file} - Paint`,`<div class="paint">
      <div class="tools" aria-hidden="true">${TOOLS.map((t,i)=>`<span class="${i===4?"on":""}">${t}</span>`).join("")}<div class="toolopt"></div></div>
      <div class="canvas">${p.imagen?`<img src="${esc(p.imagen)}" alt="${esc(p.titulo)}" loading="lazy">`:`<div class="blank">${esc(p.titulo)}</div>`}</div>
    </div>
    <div class="palette" aria-hidden="true"><span class="cur"><i></i><i></i></span><span class="cols">${PAL.map(c=>`<i style="background:${c}"></i>`).join("")}</span></div>`,
    {icon:PAINT,cls:"paint-win",menu:["<u>A</u>rchivo","<u>E</u>dición","<u>V</u>er","<u>I</u>magen","<u>O</u>pciones","Ay<u>u</u>da"],
     status:`${p.codigo||""} · ${p.titulo}`,
     info:p.enlace?`<a href="${esc(p.enlace)}">Abrir proyecto ↗</a>`:""});
}
function openItem(p){
  if(!p)return;
  if(p.tipoItem==="acceso"){
    if(p.enlace){window.open(p.enlace,"_blank","noopener");return;}
    if(p.abre==="proyectos"){listWin();return;}
    msgBox(p.titulo,esc(p.texto||"Muy pronto."),{icon:p.icono,key:"a:"+p.id});return;
  }
  if(p.estado==="proximo"){msgBox("Mensaje del sistema",`<b>${esc(p.titulo)}</b><br>Estamos trabajando en este CRTV. Muy pronto vas a poder verlo.`,{key:"w:"+p.id});return;}
  if(p.estado==="sin-material"){msgBox("Mensaje del sistema",`<b>${esc(p.titulo)}</b><br>Este CRTV ya está hecho. Estamos preparando el material para mostrarlo aquí.`,{key:"w:"+p.id});return;}
  paintWin(p);
}

function appWin(a){
  if(a.enlace){window.open(a.enlace,"_blank","noopener");return;}
  if(a.juego==="buscaminas"){minesWin(a);return;}
  if(a.id==="papelera"){
    const ideas=a.ideas||[];
    openWin("app:"+a.id,a.nombre,ideas.length?ideas.map(i=>`<div class="idea"><b>${esc(i.titulo||"")}</b>${i.titulo?"<br>":""}${esc(i.texto||i)}</div>`).join("")
      :`<div class="soon">${iconHTML(a.icono)}<b>Nada por reciclar</b><span>Aquí van a caer las ideas sueltas.</span></div>`,
      {icon:a.icono,info:ideas.length+(ideas.length===1?" idea":" ideas")});return;
  }
  openWin("app:"+a.id,a.nombre,`<div class="soon">${iconHTML(a.icono)}<b>${esc(a.nombre)}</b><span>${esc(a.texto||"Muy pronto.")}</span></div>`,{icon:a.icono});
}
function listWin(){
  const list=ITEMS.filter(p=>p.tipoItem!=="acceso"), n=list.length;
  openWin("proyectos","Creative Playground",n?`<ul class="list">${list.map(p=>`<li><button data-open-p="${esc(p.id)}">${p.estado==="proximo"?iconHTML(WARN,"li-ico"):p.portada?`<img src="${esc(p.portada)}" alt="">`:iconHTML(FOLDER,"li-ico")}<span><b>${esc(p.titulo)}</b><br><small>${esc(p.codigo||"")}${p.estado==="proximo"?" · en construcción":""}</small></span></button></li>`).join("")}</ul>`
    :`<div class="soon">${iconHTML(FOLDER)}<b>Todavía no hay proyectos</b><span>Cada proyecto creativo va a aparecer como un ícono en el escritorio.</span></div>`,
    {icon:"assets/iconos/creatv-paleta.png",info:n+(n===1?" objeto":" objetos")});
}
function aboutWin(){
  openWin("sobre","Sobre CREATV MYNDZ",`<div class="soon"><img class="about-logo" src="assets/img/logo-creatv-blur.webp" alt="CREATV MYNDZ"><b>GLOBAL CREATIVE DEALERS</b><span>El escritorio de CREATV MYNDZ.<br>Proyectos creativos, ideas y procesos.</span><a class="btn95" href="index.html">Ir a creatvmyndz.com</a></div>`,
    {icon:"assets/iconos/cdrom.png",info:"CRTV "+new Date().getFullYear()});
}

// ---------- Buscaminas (9×9, 10 minas). Clic: destapar · clic derecho o modo bandera: marcar.
function minesWin(a){
  const N=9,M=10;let cells,over,started,flagMode=false,t0=0,timer=null;
  const w=openWin("app:"+a.id,"Buscaminas",`<div class="mines"><div class="mn-top"><span class="led" data-left>010</span><button class="face" data-face aria-label="Nuevo juego">🙂</button><span class="led" data-time>000</span></div><div class="mn-grid" style="--n:${N}"></div><button class="btn95 mn-flag" data-flag>Modo bandera: no</button></div>`,
    {icon:a.icono,cls:"mines-win",noStatus:true,menu:["<u>J</u>uego","Ay<u>u</u>da"]});
  const grid=w.querySelector(".mn-grid"), face=w.querySelector("[data-face]"), left=w.querySelector("[data-left]"), time=w.querySelector("[data-time]"), fbtn=w.querySelector("[data-flag]");
  const led=n=>String(Math.max(0,Math.min(999,n))).padStart(3,"0");
  function reset(){
    cells=Array.from({length:N*N},()=>({m:false,o:false,f:false,n:0}));over=false;started=false;clearInterval(timer);time.textContent="000";face.textContent="🙂";
    grid.innerHTML=cells.map((_,i)=>`<button class="mc" data-i="${i}" aria-label="casilla"></button>`).join("");left.textContent=led(M);
  }
  function plant(safe){
    let k=0;while(k<M){const i=Math.floor(Math.random()*N*N);if(i===safe||cells[i].m)continue;cells[i].m=true;k++;}
    cells.forEach((c,i)=>{c.n=nb(i).filter(j=>cells[j].m).length;});
    started=true;t0=Date.now();timer=setInterval(()=>{time.textContent=led(Math.floor((Date.now()-t0)/1000));if(!document.body.contains(w))clearInterval(timer);},1000);
  }
  function nb(i){const x=i%N,y=Math.floor(i/N),r=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&X<N&&Y>=0&&Y<N)r.push(Y*N+X);}return r;}
  function draw(i){const c=cells[i],b=grid.children[i];b.className="mc"+(c.o?" open n"+c.n:"")+(c.f?" flag":"")+(c.o&&c.m?" boom":"");b.textContent=c.o?(c.m?"✹":(c.n||"")):(c.f?"⚑":"");}
  function open(i){const c=cells[i];if(c.o||c.f)return;c.o=true;draw(i);if(!c.m&&c.n===0)nb(i).forEach(open);}
  function check(){if(cells.every(c=>c.m||c.o)){over=true;clearInterval(timer);face.textContent="😎";cells.forEach((c,i)=>{if(c.m){c.f=true;draw(i);}});left.textContent="000";}}
  function act(i,flag){
    if(over)return;const c=cells[i];
    if(flag){if(c.o)return;c.f=!c.f;draw(i);left.textContent=led(M-cells.filter(x=>x.f).length);return;}
    if(!started)plant(i);
    if(c.f)return;
    if(c.m){over=true;clearInterval(timer);face.textContent="😵";cells.forEach((x,j)=>{if(x.m){x.o=true;draw(j);}});return;}
    open(i);check();
  }
  grid.addEventListener("click",e=>{const b=e.target.closest(".mc");if(b)act(+b.dataset.i,flagMode);});
  grid.addEventListener("contextmenu",e=>{const b=e.target.closest(".mc");if(b){e.preventDefault();act(+b.dataset.i,true);}});
  face.addEventListener("click",reset);
  fbtn.addEventListener("click",()=>{flagMode=!flagMode;fbtn.textContent="Modo bandera: "+(flagMode?"sí":"no");fbtn.classList.toggle("on",flagMode);});
  reset();
}

// ---------- menús
function toggleMenu(menu,btn,force){const m=$(menu),b=$(btn),show=force??m.hidden;m.hidden=!show;b.setAttribute("aria-expanded",String(show));return show;}
function closeMenus(){toggleMenu("#fondoMenu","#mbFondo",false);toggleMenu("#startMenu","#startBtn",false);}
function openStart(){
  closeMenus();toggleMenu("#startMenu","#startBtn",true);
  const m=$("#startMenu"),r=$("#startBtn").getBoundingClientRect();
  m.style.left=phone()?"":Math.max(4,r.left)+"px";m.style.bottom=(innerHeight-r.top+8)+"px";
}
function openFondoMenu(fromStart){
  closeMenus();toggleMenu("#fondoMenu","#mbFondo",true);
  const m=$("#fondoMenu");
  if(fromStart&&!phone()){const r=$("#startBtn").getBoundingClientRect();m.style.left=Math.max(4,r.left)+"px";m.style.top="auto";m.style.bottom=(innerHeight-r.top+8)+"px";}
  else{const r=$("#mbFondo").getBoundingClientRect();m.style.left=r.left+"px";m.style.top="";m.style.bottom="";}
}

// ---------- arrastrar íconos y ventanas; doble clic (PC) o toque (celular) para abrir
const itemById=id=>ITEMS.find(x=>x.id===id);
let drag=null;
document.addEventListener("pointerdown",e=>{
  const ico=e.target.closest(".ico"),wbar=e.target.closest(".win .bar");
  document.querySelectorAll(".ico.sel").forEach(x=>x!==ico&&x.classList.remove("sel"));
  const w=e.target.closest(".win");if(w)w.style.zIndex=++zTop;
  if(e.target.closest("[data-close]"))return;
  if(ico){ico.classList.add("sel");drag={el:ico,kind:"ico",sx:e.clientX,sy:e.clientY,ox:parseFloat(ico.style.left),oy:parseFloat(ico.style.top),moved:false};ico.setPointerCapture(e.pointerId);}
  else if(wbar&&!phone()){const r=w.getBoundingClientRect();drag={el:w,kind:"win",sx:e.clientX,sy:e.clientY,ox:r.left,oy:r.top,moved:false};wbar.setPointerCapture(e.pointerId);}
});
document.addEventListener("pointermove",e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!drag.moved&&Math.hypot(dx,dy)<5)return;drag.moved=true;
  if(drag.kind==="ico"){drag.el.classList.add("drag");drag.el.style.left=drag.ox+dx+"px";drag.el.style.top=drag.oy+dy+"px";}
  else{const floor=$("#taskbar").getBoundingClientRect().top-30;drag.el.style.left=Math.max(-200,drag.ox+dx)+"px";drag.el.style.top=Math.min(floor,Math.max(cssPx("--mb"),drag.oy+dy))+"px";}});
document.addEventListener("pointerup",e=>{if(!drag)return;const d=drag;drag=null;
  if(d.kind==="ico"){d.el.classList.remove("drag");
    if(d.moved){const pos=store.get("pos")||{},[W,H]=deskSize();pos[d.el.dataset.p]=[parseFloat(d.el.style.left)/W,parseFloat(d.el.style.top)/H];store.set("pos",pos);}
    else if(phone()||e.pointerType!=="mouse")openItem(itemById(d.el.dataset.p));}});
document.addEventListener("dblclick",e=>{const ico=e.target.closest(".ico");if(ico)openItem(itemById(ico.dataset.p));});
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-close]");if(c){closeWin(c.closest(".win"));return;}
  const a=e.target.closest("[data-app]");if(a){closeMenus();const app=D.dock.find(x=>x&&x.id===a.dataset.app);app&&appWin(app);return;}
  const ao=e.target.closest("[data-app-open]");if(ao){closeMenus();const app=D.dock.find(x=>x&&x.id===ao.dataset.appOpen);app&&appWin(app);return;}
  const op=e.target.closest("[data-open-p]");if(op){openItem(itemById(op.dataset.openP));return;}
  const fm=e.target.closest("[data-fondo]");if(fm){store.del("mio");store.set("fondo",fm.dataset.fondo);applyWall();closeMenus();return;}
  if(e.target.closest("[data-subir]")){closeMenus();$("#wallFile").click();return;}
  if(e.target.closest("[data-quitar]")){store.del("mio");applyWall();closeMenus();return;}
  const bl=e.target.closest("[data-blur]");if(bl){store.set("blur",bl.dataset.blur);applyWall();return;}
  if(e.target.closest("[data-start-fondo]")){openFondoMenu(true);return;}
  if(e.target.closest("#mbFondo")){const open=!$("#fondoMenu").hidden;closeMenus();if(!open)openFondoMenu(false);return;}
  if(e.target.closest("#startBtn")){const open=!$("#startMenu").hidden;closeMenus();if(!open)openStart();return;}
  const wb=e.target.closest("[data-win]");if(wb){closeMenus();wb.dataset.win==="sobre"?aboutWin():listWin();return;}
  if(!e.target.closest(".menu"))closeMenus();
});
$("#wallFile").addEventListener("change",e=>{useOwnWall(e.target.files[0]);e.target.value="";});
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.matches(".ico")){openItem(itemById(e.target.dataset.p));return;}
  if(e.key==="Enter"&&e.target.matches("[data-close]")){closeWin(e.target.closest(".win"));return;}
  if(e.key==="Escape"){if(!$("#fondoMenu").hidden||!$("#startMenu").hidden){closeMenus();return;}
    const ws=[...document.querySelectorAll(".win")].sort((a,b)=>b.style.zIndex-a.style.zIndex);ws[0]&&closeWin(ws[0]);}
});

// ---------- reloj (barra de menú)
function tick(){const d=new Date(),t=d.toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"});
  const day=d.toLocaleDateString("es",{weekday:"short",day:"numeric",month:"short"}).replace(/\./g,"").toUpperCase();
  $("#clock").textContent=phone()?t:`${day}  ${t}`;}
tick();setInterval(tick,15000);

let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{renderDesk();tick();},120);});

// ---------- arranque
fetch("data/escritorio.json",{cache:"no-cache"}).then(r=>r.json()).then(d=>{D=Object.assign(D,d);
  buildItems();applyWall();renderDock();renderDesk();
}).catch(()=>{$("#empty").hidden=false;$("#empty span").textContent="No se pudo cargar el escritorio.";});
})();
