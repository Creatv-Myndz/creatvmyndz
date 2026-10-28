// CREATV MYNDZ · el escritorio retro (escritorio.html). Todo sale de data/escritorio.json:
//   fondo / fondos      → fondos de pantalla (el visitante los cambia desde el menú "Fondo")
//   creativePlayground  → true = cada CRTV de assets/projects.js es un ícono del escritorio
//   accesos             → íconos sueltos del escritorio (abren una ventana, la lista de proyectos, un juego o un enlace)
//   buscaminas          → la frase que se destapa al pasar de nivel
//   proyectos           → proyectos extra, además de los CRTV
//   dock                → los programas del dock ("|" = separador)
// Cualquier texto del JSON puede ser "texto" o { "es": "...", "en": "..." }.
// Lo que el visitante cambia (idioma, fondo, blur, su propio fondo, dónde arrastró los íconos) se guarda solo en su navegador.
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

// ---------- idioma (comparte la preferencia con el resto de creatvmyndz.com)
let lang=(()=>{try{return localStorage.getItem("cm-lang")==="en"?"en":"es"}catch(e){return "es"}})();
const I18N={
  es:{m_projects:"<u>P</u>royectos",m_wall:"<u>F</u>ondo",about:"Sobre CREATV MYNDZ",lang_aria:"Cambiar idioma (English)",desk:"Escritorio",
      empty:"Los proyectos van a aparecer aquí, uno por uno.",start:"Inicio",programs:"Programas",
      s_mines:"<u>B</u>uscaminas",s_contact:"<u>C</u>ontáctanos",s_bin:"Por <u>r</u>eciclar",s_about:"<u>S</u>obre CREATV MYNDZ…",
      close:"Cerrar",ready:"Listo",
      menu:["<u>A</u>rchivo","<u>E</u>dición","<u>V</u>er","Ay<u>u</u>da"],
      menuPaint:["<u>A</u>rchivo","<u>E</u>dición","<u>V</u>er","<u>I</u>magen","<u>O</u>pciones","Ay<u>u</u>da"],
      menuGame:["<u>J</u>uego","Ay<u>u</u>da"],
      upload:"Subir mi propio fondo…",remove:"Quitar mi fondo",blur:"BLUR",b_none:"Sin blur",b_soft:"Suave",b_strong:"Fuerte",
      tooHeavy:["No se pudo guardar","La imagen es muy pesada para guardarla en este navegador. Prueba con otra más liviana."],
      notImage:["No se pudo abrir","Ese archivo no parece una imagen."],
      sys:"Mensaje del sistema",ok:"Ok",cancel:"Cancelar",
      soonMsg:"Estamos trabajando en este CRTV. Muy pronto vas a poder verlo.",
      noMaterial:"Este CRTV ya está hecho. Estamos preparando el material para mostrarlo aquí.",
      openProject:"Abrir proyecto ↗",
      binEmpty:"Nada por reciclar",binEmptyTxt:"Aquí van a caer las ideas sueltas.",idea:"idea",ideas:"ideas",
      noProjects:"Todavía no hay proyectos",noProjectsTxt:"Cada proyecto creativo va a aparecer como un ícono en el escritorio.",
      obj:"objeto",objs:"objetos",inBuild:"en construcción",
      aboutTxt:"El escritorio de CREATV MYNDZ.<br>Proyectos creativos, ideas y procesos.",goSite:"Ir a creatvmyndz.com",
      soon:"Muy pronto.",
      mines:"Buscaminas",newGame:"Nuevo juego",flagMode:"Modo bandera",yes:"sí",no:"no",
      won:"¡Ganaste!",nextLevel:"Siguiente nivel ▸",cell:"casilla",
      contact:"Contáctanos",c_intro:"Escríbenos: proyectos, ideas, colaboraciones o un saludo.",c_name:"Nombre",c_mail:"Tu correo",c_msg:"Mensaje",
      c_send:"Enviar",c_sending:"Enviando…",c_ok:"¡Mensaje enviado! Te respondemos pronto.",c_err:"No se pudo enviar. Escríbenos directo a",
      explore:"Explora tu creatividad",exploreSoon:"Muy pronto vas a encontrar aquí ejercicios, ideas y herramientas para despertar tu creatividad.",
      menuBrowser:["<u>A</u>rchivo","<u>E</u>dición","<u>V</u>er","<u>I</u>r","<u>F</u>avoritos","Ay<u>u</u>da"],
      b_back:"Atrás",b_fwd:"Adelante",b_stop:"Detener",b_refresh:"Actualizar",b_home:"Inicio",b_addr:"Dirección",b_zone:"Zona de Internet",done:"Listo",
      pw_bar:"Advertencia",pw_title:"¿ESTÁS EN EL BAÑO?",pw_text:"NUESTRA WEB ES MEJOR EN EL PC. ¡VE A VERLA!",pw_ok:"Ok, ya voy",pw_stay:"Seguir aquí"},
  en:{m_projects:"<u>P</u>rojects",m_wall:"<u>W</u>allpaper",about:"About CREATV MYNDZ",lang_aria:"Change language (Español)",desk:"Desktop",
      empty:"Projects will show up here, one by one.",start:"Start",programs:"Programs",
      s_mines:"<u>M</u>inesweeper",s_contact:"<u>C</u>ontact us",s_bin:"To <u>r</u>ecycle",s_about:"<u>A</u>bout CREATV MYNDZ…",
      close:"Close",ready:"Ready",
      menu:["<u>F</u>ile","<u>E</u>dit","<u>V</u>iew","<u>H</u>elp"],
      menuPaint:["<u>F</u>ile","<u>E</u>dit","<u>V</u>iew","<u>I</u>mage","<u>O</u>ptions","<u>H</u>elp"],
      menuGame:["<u>G</u>ame","<u>H</u>elp"],
      upload:"Upload my own wallpaper…",remove:"Remove my wallpaper",blur:"BLUR",b_none:"No blur",b_soft:"Soft",b_strong:"Strong",
      tooHeavy:["Couldn't save it","That image is too heavy to store in this browser. Try a lighter one."],
      notImage:["Couldn't open it","That file doesn't look like an image."],
      sys:"System message",ok:"Ok",cancel:"Cancel",
      soonMsg:"We're working on this CRTV. You'll be able to see it very soon.",
      noMaterial:"This CRTV is done. We're getting the material ready to show it here.",
      openProject:"Open project ↗",
      binEmpty:"Nothing to recycle",binEmptyTxt:"Loose ideas will land here.",idea:"idea",ideas:"ideas",
      noProjects:"No projects yet",noProjectsTxt:"Every creative project will show up as an icon on the desktop.",
      obj:"object",objs:"objects",inBuild:"under construction",
      aboutTxt:"The CREATV MYNDZ desktop.<br>Creative projects, ideas and processes.",goSite:"Go to creatvmyndz.com",
      soon:"Coming soon.",
      mines:"Minesweeper",newGame:"New game",flagMode:"Flag mode",yes:"on",no:"off",
      won:"You won!",nextLevel:"Next level ▸",cell:"cell",
      contact:"Contact us",c_intro:"Write to us: projects, ideas, collaborations or just to say hi.",c_name:"Name",c_mail:"Your email",c_msg:"Message",
      c_send:"Send",c_sending:"Sending…",c_ok:"Message sent! We'll get back to you soon.",c_err:"Couldn't send it. Write to us directly at",
      explore:"Explore your creativity",exploreSoon:"Very soon you'll find exercises, ideas and tools here to wake up your creativity.",
      menuBrowser:["<u>F</u>ile","<u>E</u>dit","<u>V</u>iew","<u>G</u>o","F<u>a</u>vorites","<u>H</u>elp"],
      b_back:"Back",b_fwd:"Forward",b_stop:"Stop",b_refresh:"Refresh",b_home:"Home",b_addr:"Address",b_zone:"Internet zone",done:"Done",
      pw_bar:"Warning",pw_title:"ARE YOU IN THE BATHROOM?",pw_text:"OUR WEBSITE IS BETTER ON A PC. GO CHECK IT OUT!",pw_ok:"Ok, on my way",pw_stay:"Stay here"}
};
const t=k=>I18N[lang][k]??I18N.es[k]??"";
const L=v=>v&&typeof v==="object"&&!Array.isArray(v)?(v[lang]??v.es??""):(v??"");
function applyStatic(){
  document.documentElement.lang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-html]").forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
  document.querySelectorAll("[data-i18n-aria]").forEach(el=>el.setAttribute("aria-label",t(el.dataset.i18nAria)));
  $("#langCode").textContent=lang.toUpperCase();
}
function setLang(l){
  lang=l;try{localStorage.setItem("cm-lang",l)}catch(e){}
  applyStatic();renderFondoMenu();renderDock();renderDesk();tick();
  // Las ventanas abiertas se vuelven a dibujar en el idioma nuevo (el Buscaminas se deja como está).
  document.querySelectorAll(".win").forEach(w=>w._re&&w._re());
}

// ---------- íconos. Los dibujados en 32×32 son pixel art: se escalan nítidos.
const PIXEL=/\/(paint|notas|carpeta|correo|cdrom|aviso|buho|cursor)\.png$/i;
const iconHTML=(src,cls="")=>src?`<img class="${cls}${PIXEL.test(src)?" px":""}" src="${esc(src)}" alt="" draggable="false">`:"";
const FOLDER="assets/iconos/carpeta.png", WARN="assets/iconos/aviso.png", PAINT="assets/iconos/paint.png";

let D={fondo:"",fondos:[],accesos:[],proyectos:[],dock:[],buscaminas:{}};
let ITEMS=[];

// ---------- los CRTV del Creative Playground (assets/projects.js) como proyectos del escritorio
const code=n=>n==null?"CRTV":"CRTV "+String(n).padStart(2,"0");
function fromPlayground(){
  if(!D.creativePlayground||typeof PROJECTS==="undefined")return [];
  return PROJECTS.map(p=>({
    id:p.id, titulo:p.title, codigo:code(p.num),
    estado:p.status==="soon"?"proximo":(p.link?"listo":"sin-material"),
    portada:p.image||"", imagen:(p.image||"").replace("/thumb/","/"), enlace:p.link||"",
    ...(D.extras?.[p.id]||{})   // ícono propio y videos encima de la imagen (data/escritorio.json → extras)
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
function blurFor(f){const lvl=store.get("blur")||"suave",base=f?.blur??10;return lvl==="sin"?0:lvl==="fuerte"?Math.min(32,Math.max(14,base*2)):base;}
function currentFondo(){const id=store.get("fondo");return D.fondos.find(x=>x.id===id)||D.fondos.find(x=>x.id===D.fondo)||D.fondos[0];}
function applyWall(){
  const mine=store.get("mio"),f=currentFondo(),img=mine||f?.imagen;
  $("#wall").style.backgroundImage=img?`url("${img}")`:"none";
  document.documentElement.style.setProperty("--blur",blurFor(f)+"px");
  renderFondoMenu();
}
function renderFondoMenu(){
  const mine=!!store.get("mio"),cur=currentFondo()?.id,lvl=store.get("blur")||"suave";
  const ck=on=>`<span class="ck">${on?"●":""}</span>`;
  $("#fondoMenu").innerHTML=
    D.fondos.map(f=>`<button role="menuitemradio" aria-checked="${!mine&&f.id===cur}" data-fondo="${esc(f.id)}">${ck(!mine&&f.id===cur)}${esc(L(f.nombre))}</button>`).join("")+
    `<hr><button role="menuitem" data-subir>${ck(mine)}${t("upload")}</button>`+
    `<button role="menuitem" data-quitar aria-disabled="${!mine}"><span class="ck"></span>${t("remove")}</button>`+
    `<hr><div class="mtitle">${t("blur")}</div>`+
    [["sin","b_none"],["suave","b_soft"],["fuerte","b_strong"]].map(([k,n])=>`<button role="menuitemradio" aria-checked="${k===lvl}" data-blur="${k}">${ck(k===lvl)}${t(n)}</button>`).join("");
}
// "Subir mi propio fondo": se reduce en el navegador (máx. 1600 px, JPEG) para que quepa
// en localStorage. No se sube nada a ningún servidor.
function useOwnWall(file){
  if(!file||!/^image\//.test(file.type))return;
  const url=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{
    let saved=false;
    for(const [max,q] of [[1600,.82],[1280,.75],[960,.7],[720,.65]]){
      const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");
      c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      if(store.set("mio",c.toDataURL("image/jpeg",q))){saved=true;break;}
    }
    URL.revokeObjectURL(url);
    if(!saved){msgBox(...t("tooHeavy"));return;}
    applyWall();
  };
  im.onerror=()=>{URL.revokeObjectURL(url);msgBox(...t("notImage"));};
  im.src=url;
}

// ---------- posiciones: una nube desordenada alrededor del centro (como un escritorio moderno lleno),
// "al azar" pero siempre igual para cada id, salvo que traiga x/y o que el visitante lo haya arrastrado.
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19;}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296;};}
function deskSize(){return [innerWidth,innerHeight-cssPx("--mb")-cssPx("--tb")];}
function layout(){
  const [W,H]=deskSize(),moved=store.get("pos")||{},ph=phone();
  const cx=W/2,cy=H*(ph?.55:.52),rx=W*(ph?.46:.40),ry=H*(ph?.44:.38),minD=ph?100:104,placed=[];
  const order=ITEMS.filter(p=>!p.esquina).sort((a,b)=>rng(a.id)()-rng(b.id)());
  return order.map(p=>{
    if(moved[p.id])return {p,x:moved[p.id][0]*W,y:moved[p.id][1]*H};
    if(p.x!=null&&p.y!=null)return {p,x:p.x/100*W,y:p.y/100*H};
    const r=rng(p.id+"·");let best=null,bestD=-1;
    for(let k=0;k<160;k++){
      const a=r()*Math.PI*2,d=Math.sqrt(r());
      const x=cx+Math.cos(a)*d*rx,y=cy+Math.sin(a)*d*ry;
      const dd=Math.min(...placed.map(q=>Math.hypot(q[0]-x,(q[1]-y)*1.15)),1e9);
      if(dd>bestD){best=[x,y];bestD=dd;}if(dd>minD)break;
    }
    // sin tocar las esquinas de arriba (logo + Explora a la izquierda, Duo a la derecha)
    best[0]=Math.min(W-42,Math.max(42,best[0]));best[1]=Math.min(H-50,Math.max(ph?135:130,best[1]));
    placed.push(best);return {p,x:best[0],y:best[1]};
  });
}
function thumbHTML(p){
  if(p.tipoItem==="acceso")return `<span class="th bare">${iconHTML(p.icono)}</span>`;
  if(p.estado==="proximo")return `<span class="th bare">${iconHTML(WARN)}</span>`;
  if(p.icono)return `<span class="th bare custom">${iconHTML(p.icono)}</span>`;
  return `<span class="th">${p.portada?`<img src="${esc(p.portada)}" alt="" draggable="false" loading="lazy">`:iconHTML(FOLDER)}</span>`;
}
function icoHTML(p,style=""){return `<button class="ico ${p.tipoItem} ${p.estado||""}" data-p="${esc(p.id)}"${style} aria-label="${esc(L(p.titulo))}">${thumbHTML(p)}<span class="lb">${esc(L(p.titulo))}</span></button>`;}
function renderDesk(){
  if(!ITEMS.length&&!D.fondos.length)return;
  // Los accesos con "esquina": true van fijos arriba a la izquierda, al lado del logo
  $("#cornerIcons").innerHTML=ITEMS.filter(p=>p.esquina).map(p=>icoHTML(p)).join("");
  $("#desk").innerHTML=layout().map(({p,x,y})=>`<button class="ico ${p.tipoItem} ${p.estado||""}" data-p="${esc(p.id)}" style="left:${x}px;top:${y}px" aria-label="${esc(L(p.titulo))}">${thumbHTML(p)}<span class="lb">${esc(L(p.titulo))}</span></button>`).join("");
  $("#empty").hidden=ITEMS.length>0;
}

// ---------- dock flotante (como un Mac moderno, con íconos retro)
function renderDock(){
  $("#dock").innerHTML=D.dock.map(a=>a==="|"?`<span class="sep" aria-hidden="true"></span>`:`<button class="app" data-app="${esc(a.id)}" aria-label="${esc(L(a.nombre))}">${iconHTML(a.icono)}<span class="tip" role="tooltip">${esc(L(a.nombre))}</span></button>`).join("");
  markDock();
}
const bar=$("#taskbar");
bar.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse"||phone())return;
  bar.querySelectorAll(".app,#startBtn").forEach(el=>{const r=el.getBoundingClientRect(),d=Math.abs(e.clientX-(r.left+r.width/2));el.style.transform=`scale(${(1+Math.max(0,1-d/140)*.5).toFixed(3)})`;});});
bar.addEventListener("pointerleave",()=>bar.querySelectorAll(".app,#startBtn").forEach(el=>el.style.transform=""));

// ---------- ventanas
let zTop=25,openCount=0;
function openWin(key,title,html,{icon=FOLDER,status,info="",cls="",menu,noMenu=false,noStatus=false}={}){
  let w=document.querySelector(`.win[data-k="${CSS.escape(key)}"]`);
  if(!w){
    w=document.createElement("section");w.dataset.k=key;w.setAttribute("role","dialog");$("#wins").appendChild(w);
    w.className="win "+cls;
    const off=(openCount++%6)*26,ww=Math.min(cls.includes("dialog")?380:cls.includes("paint")||cls.includes("browser")?760:cls.includes("mines")?300:620,innerWidth-32);
    w.style.left=Math.max(16,(innerWidth-ww)/2+off-60)+"px";w.style.top=(cssPx("--mb")+innerHeight*.06+off)+"px";
  }
  w.setAttribute("aria-label",title);
  w.innerHTML=`<div class="bar">${iconHTML(icon,"wi")}<b>${esc(title)}</b><span class="ctl"><i aria-hidden="true">_</i><i aria-hidden="true">□</i><i class="x" data-close role="button" tabindex="0" aria-label="${t("close")}">×</i></span></div>
    ${noMenu?"":`<div class="menurow" aria-hidden="true">${(menu||t("menu")).map(m=>`<span>${m}</span>`).join("")}</div>`}
    <div class="body">${html}</div>
    ${noStatus?"":`<div class="status"><span>${esc(status??t("ready"))}</span>${info?`<span>${info}</span>`:""}</div>`}`;
  w.style.zIndex=++zTop;markDock();keepAboveDock(w);
  if(!w._ro&&"ResizeObserver" in window){w._ro=new ResizeObserver(()=>keepAboveDock(w));w._ro.observe(w);}
  return w;
}
// Ninguna ventana tapa el dock. Se mide con offsetHeight (la altura real, sin la animación de entrada).
function keepAboveDock(w){if(phone())return;requestAnimationFrame(()=>{const floor=$("#taskbar").getBoundingClientRect().top-10,h=w.offsetHeight,top=parseFloat(w.style.top)||0;
  if(top+h>floor)w.style.top=Math.max(cssPx("--mb")+6,floor-h)+"px";});}
function closeWin(w){w._ro&&w._ro.disconnect();w._stop&&w._stop();w.remove();markDock();}
function markDock(){const open=[...document.querySelectorAll(".win")].map(w=>w.dataset.k);bar.querySelectorAll(".app").forEach(b=>b.classList.toggle("on",open.includes("app:"+b.dataset.app)));}
const reg=(w,fn)=>{w._re=fn;return w;};

// Mensaje del sistema (Ok / Cancelar)
function msgBox(title,text,{icon=WARN,key="msg",html=false}={}){
  return openWin(key,title,`<div class="msg">${iconHTML(icon)}<p>${html?text:esc(text)}</p></div><div class="msg-btns"><button class="btn95" data-close>${t("ok")}</button><button class="btn95" data-close>${t("cancel")}</button></div>`,
    {icon,cls:"dialog",noMenu:true,noStatus:true});
}

// Un CRTV terminado se abre como un archivo en Paint
const PAL=["#000","#808080","#800000","#808000","#008000","#008080","#000080","#800080","#808040","#004040","#0080ff","#004080","#8000ff","#804000",
           "#fff","#c0c0c0","#f00","#ff0","#0f0","#0ff","#00f","#f0f","#ffff80","#00ff80","#80ffff","#8080ff","#ff0080","#ff8040"];
const TOOLS=["✧","⬚","⌫","◈","✎","⌕","✐","▲","∿","A","╲","∿","▭","▱","◯","▢"];
// Videos encima de la imagen del proyecto (posición en % de la imagen)
function overlays(p){
  return (p.videos||[]).map(v=>{
    const pos=`left:${+v.x||0}%;top:${+v.y||0}%;width:${+v.w||30}%;`;
    if(v.tipo==="youtube"&&v.id)return `<div class="ov yt" style="${pos}"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?start=${+v.inicio||0}&rel=0&playsinline=1" title="${esc(L(p.titulo))} · video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>`;
    if(v.tipo==="video"&&v.src)return `<div class="ov vid" style="${pos}height:${+v.h||20}%"><video src="${esc(v.src)}" controls playsinline loop preload="metadata"></video></div>`;
    return "";
  }).join("");
}
function paintWin(p){
  const w=openWin("p:"+p.id,`${p.id}.bmp - Paint`,`<div class="paint">
      <div class="tools" aria-hidden="true">${TOOLS.map((x,i)=>`<span class="${i===4?"on":""}">${x}</span>`).join("")}<div class="toolopt"></div></div>
      <div class="canvas">${p.imagen?`<div class="art"><img src="${esc(p.imagen)}" alt="${esc(L(p.titulo))}" loading="lazy">${overlays(p)}</div>`:`<div class="blank">${esc(L(p.titulo))}</div>`}</div>
    </div>
    <div class="palette" aria-hidden="true"><span class="cur"><i></i><i></i></span><span class="cols">${PAL.map(c=>`<i style="background:${c}"></i>`).join("")}</span></div>`,
    {icon:PAINT,cls:"paint-win",menu:t("menuPaint"),status:`${p.codigo||""} · ${L(p.titulo)}`,info:p.enlace?`<a href="${esc(p.enlace)}">${t("openProject")}</a>`:""});
  reg(w,()=>paintWin(p));
}
function openItem(p){
  if(!p)return;
  if(p.tipoItem==="acceso"){
    if(p.enlace){window.open(p.enlace,"_blank","noopener");return;}
    if(p.abre==="proyectos"){listWin();return;}
    if(p.abre==="explora"){exploraWin(p);return;}
    if(p.juego==="buscaminas"){minesWin();return;}
    reg(msgBox(L(p.titulo),L(p.texto)||t("soon"),{icon:p.icono,key:"a:"+p.id}),()=>openItem(p));return;
  }
  if(p.estado==="proximo"||p.estado==="sin-material"){
    reg(msgBox(t("sys"),`<b>${esc(L(p.titulo))}</b><br>${t(p.estado==="proximo"?"soonMsg":"noMaterial")}`,{key:"w:"+p.id,html:true}),()=>openItem(p));return;
  }
  paintWin(p);
}
function appWin(a){
  if(a.enlace){window.open(a.enlace,"_blank","noopener");return;}
  if(a.juego==="buscaminas"){minesWin();return;}
  if(a.contacto){contactWin(a);return;}
  let w;
  if(a.id==="papelera"){
    const ideas=a.ideas||[];
    w=openWin("app:"+a.id,L(a.nombre),ideas.length?ideas.map(i=>`<div class="idea"><b>${esc(L(i.titulo)||"")}</b>${i.titulo?"<br>":""}${esc(L(i.texto)||L(i))}</div>`).join("")
      :`<div class="soon">${iconHTML(a.icono)}<b>${t("binEmpty")}</b><span>${t("binEmptyTxt")}</span></div>`,
      {icon:a.icono,info:ideas.length+" "+t(ideas.length===1?"idea":"ideas")});
  }else w=openWin("app:"+a.id,L(a.nombre),`<div class="soon">${iconHTML(a.icono)}<b>${esc(L(a.nombre))}</b><span>${esc(L(a.texto)||t("soon"))}</span></div>`,{icon:a.icono});
  reg(w,()=>appWin(a));
}
function listWin(){
  const list=ITEMS.filter(p=>p.tipoItem!=="acceso"),n=list.length;
  const w=openWin("proyectos","Creative Playground",n?`<ul class="list">${list.map(p=>`<li><button data-open-p="${esc(p.id)}">${p.estado==="proximo"?iconHTML(WARN,"li-ico"):p.portada?`<img src="${esc(p.portada)}" alt="">`:iconHTML(FOLDER,"li-ico")}<span><b>${esc(L(p.titulo))}</b><br><small>${esc(p.codigo||"")}${p.estado==="proximo"?" · "+t("inBuild"):""}</small></span></button></li>`).join("")}</ul>`
    :`<div class="soon">${iconHTML(FOLDER)}<b>${t("noProjects")}</b><span>${t("noProjectsTxt")}</span></div>`,
    {icon:"assets/iconos/creatv-paleta.png",info:n+" "+t(n===1?"obj":"objs")});
  reg(w,listWin);
}
function aboutWin(){
  const w=openWin("sobre",t("about"),`<div class="soon"><img class="about-logo" src="assets/img/logo-creatv-blur.webp" alt="CREATV MYNDZ"><b>GLOBAL CREATIVE DEALERS</b><span>${t("aboutTxt")}</span><a class="btn95" href="index.html">${t("goSite")}</a></div>`,
    {icon:"assets/iconos/cdrom.png",info:"CRTV "+new Date().getFullYear()});
  reg(w,aboutWin);
}

// ---------- Explora: una ventana de navegador retro con "Explora tu creatividad"
function exploraWin(p){
  const txt=L(p.texto)||t("explore");
  const w=openWin("a:"+p.id,`${txt} - CREATV Explorer`,`<div class="browser">
      <div class="b-tools" aria-hidden="true">${["back","fwd","stop","refresh","home"].map(k=>`<span><i>${{back:"⇦",fwd:"⇨",stop:"⊗",refresh:"⟳",home:"⌂"}[k]}</i>${t("b_"+k)}</span>`).join("")}</div>
      <div class="b-addr"><span>${t("b_addr")}</span><span class="b-url">${iconHTML(p.icono)}creatvmyndz.com/explora</span></div>
      <div class="b-page"><img src="${esc(p.icono)}" alt="" class="b-logo"><h2>${esc(txt.toUpperCase())}</h2><p>${t("exploreSoon")}</p></div>
    </div>`,{icon:p.icono,cls:"browser-win",menu:t("menuBrowser"),status:t("done"),info:`${iconHTML(p.icono,"z-ico")} ${t("b_zone")}`});
  reg(w,()=>exploraWin(p));
}

// ---------- Contáctanos: el mensaje llega al correo de SITE.leadEmail (assets/projects.js) vía FormSubmit
function contactWin(a){
  const site=typeof SITE!=="undefined"?SITE:{},to=site.contactEmail||site.leadEmail||"";
  const w=openWin("app:"+a.id,t("contact"),`<form class="contact" novalidate>
      <p class="c-intro">${iconHTML(a.icono,"c-ico")}<span>${t("c_intro")}</span></p>
      <label>${t("c_name")}<input name="name" required autocomplete="name"></label>
      <label>${t("c_mail")}<input name="email" type="email" required autocomplete="email"></label>
      <label>${t("c_msg")}<textarea name="message" rows="4" required></textarea></label>
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="c-row"><button class="btn95" type="submit">${t("c_send")}</button><span class="c-state" role="status"></span></div>
    </form>`,{icon:a.icono,info:"Instagram: @creatvmyndz"});
  reg(w,()=>contactWin(a));
  const f=w.querySelector("form"),st=w.querySelector(".c-state");
  f.addEventListener("submit",e=>{
    e.preventDefault();
    if(!f.reportValidity())return;
    const data=Object.fromEntries(new FormData(f));if(data._honey)return;
    st.textContent=t("c_sending");
    fetch("https://formsubmit.co/ajax/"+encodeURIComponent(site.leadEmail||to),{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({name:data.name,email:data.email,message:data.message,_subject:"Mensaje desde el escritorio CREATV MYNDZ",_cc:site.ccEmail||undefined,_template:"table"})})
      .then(r=>r.ok?r.json():Promise.reject()).then(()=>{f.reset();st.textContent=t("c_ok");})
      .catch(()=>{st.innerHTML=`${t("c_err")} <a href="mailto:${esc(to)}">${esc(to)}</a>`;});
  });
}

// ---------- Buscaminas: nivel fácil (6×6, 3 minas; el primer clic nunca es mina y abre una zona grande).
// Al ganar, "Siguiente nivel" ya no es un juego: se destapa la frase de data/escritorio.json.
function minesWin(){
  const N=6,M=3;let cells,over,started,flagMode=false,t0=0,timer=null;
  const icon="assets/iconos/buscaminas.png";
  const w=openWin("app:buscaminas",t("mines"),`<div class="mines"><div class="mn-top"><span class="led" data-left></span><button class="face" data-face aria-label="${t("newGame")}">🙂</button><span class="led" data-time>000</span></div><div class="mn-grid"></div><div class="mn-foot"></div></div>`,
    {icon,cls:"mines-win",noStatus:true,menu:t("menuGame")});
  const grid=w.querySelector(".mn-grid"),face=w.querySelector("[data-face]"),left=w.querySelector("[data-left]"),time=w.querySelector("[data-time]"),foot=w.querySelector(".mn-foot");
  const led=n=>String(Math.max(0,Math.min(999,n))).padStart(3,"0");
  const stop=()=>clearInterval(timer);w._stop=stop;
  const flagLabel=()=>`${t("flagMode")}: ${flagMode?t("yes"):t("no")}`;
  function reset(){
    stop();cells=Array.from({length:N*N},()=>({m:false,o:false,f:false,n:0}));over=false;started=false;flagMode=false;
    face.textContent="🙂";time.textContent="000";left.textContent=led(M);grid.className="mn-grid";grid.style.setProperty("--n",N);
    grid.innerHTML=cells.map((_,i)=>`<button class="mc" data-i="${i}" aria-label="${t("cell")}"></button>`).join("");
    foot.innerHTML=`<button class="btn95 mn-flag" data-flag>${flagLabel()}</button>`;
  }
  const nb=i=>{const x=i%N,y=Math.floor(i/N),r=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&X<N&&Y>=0&&Y<N)r.push(Y*N+X);}return r;};
  function plant(safe){
    const keep=new Set([safe,...nb(safe)]);let k=0;
    while(k<M){const i=Math.floor(Math.random()*N*N);if(keep.has(i)||cells[i].m)continue;cells[i].m=true;k++;}
    cells.forEach((c,i)=>c.n=nb(i).filter(j=>cells[j].m).length);
    started=true;t0=Date.now();timer=setInterval(()=>{time.textContent=led(Math.floor((Date.now()-t0)/1000));if(!document.body.contains(w))stop();},1000);
  }
  function draw(i){const c=cells[i],b=grid.children[i];b.className="mc"+(c.o?" open n"+c.n:"")+(c.f?" flag":"")+(c.o&&c.m?" boom":"");b.textContent=c.o?(c.m?"✹":(c.n||"")):(c.f?"⚑":"");}
  function open(i){const c=cells[i];if(c.o||c.f)return;c.o=true;draw(i);if(!c.m&&c.n===0)nb(i).forEach(open);}
  function win(){
    over=true;stop();face.textContent="😎";left.textContent="000";
    cells.forEach((c,i)=>{if(c.m){c.f=true;draw(i);}});
    foot.innerHTML=`<p class="mn-won">${t("won")}</p><button class="btn95" data-next>${t("nextLevel")}</button>`;
  }
  function act(i,flag){
    if(over)return;const c=cells[i];
    if(flag){if(c.o)return;c.f=!c.f;draw(i);left.textContent=led(M-cells.filter(x=>x.f).length);return;}
    if(!started)plant(i);
    if(c.f)return;
    if(c.m){over=true;stop();face.textContent="😵";cells.forEach((x,j)=>{if(x.m){x.o=true;draw(j);}});return;}
    open(i);if(cells.every(x=>x.m||x.o))win();
  }
  // Nivel 2: ya no es juego. La frase se destapa casilla por casilla.
  function phrase(){
    const lines=(L(D.buscaminas?.frase)||["I'M","HAPPY","I","KNOW","YOU"]).map(s=>String(s).toUpperCase());
    const C=Math.max(10,...lines.map(s=>[...s].length+2)),R=lines.length*2+3,COLORS=["#e00000","#0000d0","#008000"];
    const map=new Map();let ci=0;
    lines.forEach((s,li)=>{const ch=[...s],row=2+li*2,start=Math.floor((C-ch.length)/2);ch.forEach((l,k)=>{map.set(row*C+start+k,{l,c:COLORS[ci++%3]});});});
    grid.className="mn-grid phrase";grid.style.setProperty("--n",C);
    grid.innerHTML=Array.from({length:C*R},()=>`<span class="mc"></span>`).join("");
    face.textContent="🙂";foot.innerHTML="";
    const d=new Date();left.textContent=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");time.textContent=d.getFullYear();
    [...map.entries()].forEach(([i,{l,c}],k)=>setTimeout(()=>{const b=grid.children[i];if(!b)return;b.className="mc open letter";b.style.color=c;b.textContent=l;},120+k*90));
  }
  grid.addEventListener("click",e=>{const b=e.target.closest("button.mc");if(b)act(+b.dataset.i,flagMode);});
  grid.addEventListener("contextmenu",e=>{const b=e.target.closest("button.mc");if(b){e.preventDefault();act(+b.dataset.i,true);}});
  face.addEventListener("click",reset);
  foot.addEventListener("click",e=>{
    const fb=e.target.closest("[data-flag]");if(fb){flagMode=!flagMode;fb.textContent=flagLabel();fb.classList.toggle("on",flagMode);}
    if(e.target.closest("[data-next]"))phrase();
  });
  reset();
}

// ---------- aviso del baño: solo para quien entra desde el celular (una vez por visita)
function phoneWarning(){
  const isPhone=matchMedia("(pointer:coarse)").matches&&Math.min(screen.width,screen.height)<=820;
  let seen=false;try{seen=sessionStorage.getItem("cm-desk-bano")==="1"}catch(e){}
  if(!isPhone||seen)return;
  $("#phoneWarn").hidden=false;
  try{sessionStorage.setItem("cm-desk-bano","1")}catch(e){}
}
document.addEventListener("click",e=>{if(e.target.closest("[data-pw-close]"))$("#phoneWarn").hidden=true;},true);

// ---------- menús
function toggleMenu(menu,btn,force){const m=$(menu),b=$(btn),show=force??m.hidden;m.hidden=!show;b.setAttribute("aria-expanded",String(show));return show;}
function closeMenus(){$("#fondoMenu").hidden=true;toggleMenu("#startMenu","#startBtn",false);}
function openStart(){closeMenus();toggleMenu("#startMenu","#startBtn",true);const m=$("#startMenu"),r=$("#startBtn").getBoundingClientRect();
  m.style.left=phone()?"":Math.max(4,r.left)+"px";m.style.bottom=(innerHeight-r.top+8)+"px";}
function openFondoMenu(){
  closeMenus();const m=$("#fondoMenu");m.hidden=false;
  const r=$("#startBtn").getBoundingClientRect();
  m.style.left=phone()?"":Math.max(4,r.left)+"px";m.style.top="auto";m.style.bottom=(innerHeight-r.top+8)+"px";
}

// ---------- arrastrar íconos y ventanas; doble clic (PC) o toque (celular) para abrir
const itemById=id=>ITEMS.find(x=>x.id===id);
let drag=null;
document.addEventListener("pointerdown",e=>{
  const ico=e.target.closest(".ico"),wbar=e.target.closest(".win .bar");
  document.querySelectorAll(".ico.sel").forEach(x=>x!==ico&&x.classList.remove("sel"));
  const w=e.target.closest(".win");if(w)w.style.zIndex=++zTop;
  if(e.target.closest("[data-close]"))return;
  if(ico&&ico.closest("#cornerIcons")){ico.classList.add("sel");return;}
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
// Los íconos de la esquina se abren con un clic (doble clic también sirve)
document.addEventListener("click",e=>{const c=e.target.closest("#cornerIcons .ico");if(c)openItem(itemById(c.dataset.p));});
document.addEventListener("dblclick",e=>{const ico=e.target.closest("#desk .ico");if(ico)openItem(itemById(ico.dataset.p));});
document.addEventListener("click",e=>{
  const c=e.target.closest("[data-close]");if(c){closeWin(c.closest(".win"));return;}
  if(e.target.closest("#langBtn")){closeMenus();setLang(lang==="es"?"en":"es");return;}
  const a=e.target.closest("[data-app]");if(a){closeMenus();const app=D.dock.find(x=>x&&x.id===a.dataset.app);app&&appWin(app);return;}
  const ao=e.target.closest("[data-app-open]");if(ao){closeMenus();const app=D.dock.find(x=>x&&x.id===ao.dataset.appOpen);app&&appWin(app);return;}
  const op=e.target.closest("[data-open-p]");if(op){openItem(itemById(op.dataset.openP));return;}
  const fm=e.target.closest("[data-fondo]");if(fm){store.del("mio");store.set("fondo",fm.dataset.fondo);applyWall();closeMenus();return;}
  if(e.target.closest("[data-subir]")){closeMenus();$("#wallFile").click();return;}
  if(e.target.closest("[data-quitar]")){store.del("mio");applyWall();closeMenus();return;}
  const bl=e.target.closest("[data-blur]");if(bl){store.set("blur",bl.dataset.blur);applyWall();return;}
  if(e.target.closest("[data-start-fondo]")){openFondoMenu();return;}
  if(e.target.closest("#startBtn")){const open=!$("#startMenu").hidden;closeMenus();if(!open)openStart();return;}
  const wb=e.target.closest("[data-win]");if(wb){closeMenus();wb.dataset.win==="sobre"?aboutWin():listWin();return;}
  if(!e.target.closest(".menu"))closeMenus();
});
$("#wallFile").addEventListener("change",e=>{useOwnWall(e.target.files[0]);e.target.value="";});
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.matches(".ico")){openItem(itemById(e.target.dataset.p));return;}
  if(e.key==="Enter"&&e.target.matches("[data-close]")){closeWin(e.target.closest(".win"));return;}
  if(e.key==="Escape"){if(!$("#phoneWarn").hidden){$("#phoneWarn").hidden=true;return;}
    if(!$("#fondoMenu").hidden||!$("#startMenu").hidden){closeMenus();return;}
    const ws=[...document.querySelectorAll(".win")].sort((a,b)=>b.style.zIndex-a.style.zIndex);ws[0]&&closeWin(ws[0]);}
});

// ---------- reloj (barra de menú)
function tick(){const d=new Date(),loc=lang==="en"?"en":"es",tm=d.toLocaleTimeString(loc,{hour:"2-digit",minute:"2-digit"});
  const day=d.toLocaleDateString(loc,{weekday:"short",day:"numeric",month:"short"}).replace(/\./g,"").toUpperCase();
  $("#clock").textContent=phone()?tm:`${day}  ${tm}`;}
setInterval(tick,15000);

let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{renderDesk();tick();},120);});

// ---------- arranque
applyStatic();tick();
fetch("data/escritorio.json",{cache:"no-cache"}).then(r=>r.json()).then(d=>{D=Object.assign(D,d);
  buildItems();applyWall();renderDock();renderDesk();phoneWarning();
}).catch(()=>{$("#empty").hidden=false;$("#empty span").textContent="No se pudo cargar el escritorio.";});
})();
