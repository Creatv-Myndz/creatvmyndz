import * as THREE from 'three';
import {MarchingCubes} from 'https://unpkg.com/three@0.182.0/examples/jsm/objects/MarchingCubes.js';
import {mergeGeometries} from 'https://unpkg.com/three@0.182.0/examples/jsm/utils/BufferGeometryUtils.js';
// Same crystalline membrane, dendrites and decorative web as the standalone study.
export function createCrystalTemplate(){
const glass=new THREE.MeshPhysicalMaterial({color:'#44434a',metalness:0,roughness:.23,transmission:.94,transparent:true,opacity:.65,depthWrite:false,thickness:.1,ior:1.18,clearcoat:.16,clearcoatRoughness:.3,envMapIntensity:.22});
glass.onBeforeCompile=shader=>{
 shader.vertexShader='varying vec3 vCrystal;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCrystal=position;');
 shader.fragmentShader='varying vec3 vCrystal;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
  float veins=pow(max(0.0,1.0-abs(sin(vCrystal.x*32.0+sin(vCrystal.y*21.0)+vCrystal.z*17.0))),28.0);
  float fleck=pow(max(0.0,sin(vCrystal.x*231.0)*sin(vCrystal.y*197.0)*sin(vCrystal.z*213.0)),18.0);
  float core=exp(-dot(vCrystal,vCrystal)*34.0);
  totalEmissiveRadiance+=vec3(1.0,.42,.09)*(veins*.07+fleck*.8+core*.1);
 `);
};
const neuron=new THREE.Group();
// A continuous star-shaped membrane gives the soma a readable organic silhouette.
const branchLengths=[.82,.36,.58,.69,.29,.76,.47,.61,.34,.87,.52,.39,.73,.45,.64,.31];
const branchWidths=[.059,.024,.041,.032,.019,.052,.029,.047,.023,.063,.035,.021,.044,.031,.054,.025];
const directions=Array.from({length:16},(_,i)=>{
 const y=1-2*(i+.5)/16,r=Math.sqrt(1-y*y),angle=i*Math.PI*(3-Math.sqrt(5));
 return new THREE.Vector3(Math.cos(angle)*r,y,Math.sin(angle)*r);
});
const somaGeometry=new THREE.SphereGeometry(1,96,64),somaVertices=somaGeometry.attributes.position;
for(let i=0;i<somaVertices.count;i++){
 const d=new THREE.Vector3().fromBufferAttribute(somaVertices,i).normalize();
 let extension=0;for(let j=0;j<directions.length;j++)extension+=(.04+branchWidths[j]*1.4)*Math.exp((d.dot(directions[j])-1)*45);
 const radius=.20+extension+.008*Math.sin(d.x*19)*Math.sin(d.y*23)*Math.sin(d.z*17);
 const v=d.multiplyScalar(radius);somaVertices.setXYZ(i,v.x,v.y,v.z);
}
somaGeometry.dispose();
const branchSegments=[];
let seed=1031;function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
const paths=[],terminalPositions=[];const gold=new THREE.MeshBasicMaterial({color:new THREE.Color('#ffb64f').multiplyScalar(1.5),transparent:true,opacity:.55,toneMapped:false,depthWrite:false,depthTest:false});
function grow(start,direction,length,width,depth){
 const bend=start.clone().addScaledVector(direction,length*.48).add(new THREE.Vector3((random()-.5)*length*.28,(random()-.5)*length*.28,(random()-.5)*length*.28));
 const end=start.clone().addScaledVector(direction,length);const curve=new THREE.CatmullRomCurve3([start,bend,end]);paths.push(curve);
 for(let k=0;k<32;k++){
  const t=k/32,u=(k+1)/32;
  branchSegments.push({a:curve.getPointAt(t),b:curve.getPointAt(u),ra:Math.max(.004,width*(1-.88*t)),rb:Math.max(.004,width*(1-.88*u))});
 }
 neuron.add(new THREE.Mesh(new THREE.TubeGeometry(curve,16,.0013,3,false),gold));
 if(depth===0)terminalPositions.push(end.clone());
 if(depth)for(let j=0;j<2;j++){
  const attachment=.65+random()*.15;
  const childDirection=curve.getTangent(attachment).normalize().add(new THREE.Vector3((random()-.5)*.7,(random()-.5)*.7,(random()-.5)*.7)).normalize();
  grow(curve.getPoint(attachment),childDirection,length*(.28+random()*.18),width*(1-.88*attachment)*(.5+random()*.25),depth-1);
 }
}
// Keep the approved directions; give each primary branch its own proportions.


directions.forEach((d,i)=>{
 grow(d.clone().multiplyScalar(.19),d,branchLengths[i],branchWidths[i],branchLengths[i]>.55?3:2);
});
// Smooth implicit union: soma and every dendrite share a single watertight skin.
const resolution=128,extent=1.25,step=extent*2/resolution;
const fused=new MarchingCubes(resolution,glass,false,false,600000);
fused.isolation=0;fused.field.fill(-10);fused.scale.setScalar(extent);
const field=fused.field;
function index(x,y,z){return x+resolution*(y+resolution*z)}
function blendInside(oldValue,newValue,k){const h=Math.max(k-Math.abs(oldValue-newValue),0)/k;return Math.max(oldValue,newValue)+h*h*k*.25}
const somaLimit=Math.ceil(.5/step),mid=resolution/2;
for(let z=mid-somaLimit;z<=mid+somaLimit;z++)for(let y=mid-somaLimit;y<=mid+somaLimit;y++)for(let x=mid-somaLimit;x<=mid+somaLimit;x++){
 const v=new THREE.Vector3((x-mid)*step,(y-mid)*step,(z-mid)*step),length=v.length(),d=v.clone().normalize();
 let extension=0;for(let j=0;j<directions.length;j++)extension+=(.04+branchWidths[j]*1.4)*Math.exp((d.dot(directions[j])-1)*45);
 field[index(x,y,z)]=.20+extension-length;
}
for(const segment of branchSegments){
 const {a,b,ra,rb}=segment,ab=b.clone().sub(a),length2=ab.lengthSq();
 const smoothing=Math.max(.003,ra*.3),padding=Math.max(ra,rb)+smoothing+step*2;
 const low=a.clone().min(b).addScalar(-padding),high=a.clone().max(b).addScalar(padding);
 const lo=low.toArray().map(v=>Math.max(1,Math.floor((v+extent)/step))),hi=high.toArray().map(v=>Math.min(resolution-2,Math.ceil((v+extent)/step)));
 for(let z=lo[2];z<=hi[2];z++)for(let y=lo[1];y<=hi[1];y++)for(let x=lo[0];x<=hi[0];x++){
  const px=(x-mid)*step-a.x,py=(y-mid)*step-a.y,pz=(z-mid)*step-a.z;
  const t=Math.max(0,Math.min(1,(px*ab.x+py*ab.y+pz*ab.z)/length2));
  const distance=Math.hypot(px-ab.x*t,py-ab.y*t,pz-ab.z*t),inside=ra+(rb-ra)*t-distance,i=index(x,y,z);
  field[i]=blendInside(field[i],inside,smoothing);
 }
}
fused.update();neuron.add(fused);
// Fine secondary dendrites grow from the soma, tapering into transparent tips.
const wisps=[];
function addWisp(start,direction,length,radius,depth){
 const axis=direction.clone().normalize();
 const side=axis.clone().cross(Math.abs(axis.y)<.9?new THREE.Vector3(0,1,0):new THREE.Vector3(1,0,0)).normalize();
 const up=side.clone().cross(axis).normalize(),phase=random()*Math.PI*2;
 const path=[];
 for(let k=0;k<=6;k++){
  const t=k/6;
  path.push(start.clone().addScaledVector(axis,length*t)
   .addScaledVector(side,Math.sin(t*4.2+phase)*Math.sin(t*Math.PI*.8)*length*.17)
   .addScaledVector(up,Math.sin(t*3.4-phase)*Math.sin(t*Math.PI)*length*.11));
 }
 const curve=new THREE.CatmullRomCurve3(path);
 const geometry=new THREE.TubeGeometry(curve,20,radius,5,false),vertices=geometry.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const t=geometry.attributes.uv.getX(i),center=curve.getPointAt(t);
  const around=geometry.attributes.uv.getY(i)*Math.PI*2;
  const taper=.08+.92*Math.pow(1-t,.85);
  const rootFlare=1+.45*Math.exp(-t*16);
  const organicRelief=1+.10*Math.sin(t*45+phase)+.06*Math.sin(around*3+t*18);
  const v=new THREE.Vector3().fromBufferAttribute(vertices,i).sub(center).multiplyScalar(taper*rootFlare*organicRelief).add(center);
  vertices.setXYZ(i,v.x,v.y,v.z);
 }
 geometry.computeVertexNormals();wisps.push(geometry);
 if(depth)for(let j=0;j<(random()>.55?2:1);j++){
  const t=.38+random()*.4;
  const next=curve.getTangent(t).add(new THREE.Vector3((random()-.5)*.9,(random()-.5)*.9,(random()-.5)*.9)).normalize();
  addWisp(curve.getPoint(t),next,length*(.22+random()*.37),radius*(.32+random()*.2),depth-1);
 }
}
for(let i=0;i<80;i++){
 const y=1-2*(i+.5)/80,r=Math.sqrt(1-y*y),angle=i*Math.PI*(3-Math.sqrt(5));
 const direction=new THREE.Vector3(Math.cos(angle)*r,y,Math.sin(angle)*r);
 let rootRadius=.20;
 for(let j=0;j<directions.length;j++)rootRadius+=(.04+branchWidths[j]*1.4)*Math.exp((direction.dot(directions[j])-1)*45);
 addWisp(direction.clone().multiplyScalar(rootRadius-.009),direction,.08+random()*.22,.0025+random()*.0025,i%3===0?2:1);
}
const wispGeometry=mergeGeometries(wisps);wisps.forEach(g=>g.dispose());
const wispMaterial=new THREE.MeshStandardMaterial({color:'#8e829e',roughness:.5,metalness:.05,emissive:'#685279',emissiveIntensity:.3,transparent:true,opacity:.96,depthWrite:true});
wispMaterial.onBeforeCompile=shader=>{
 shader.vertexShader='varying vec2 vWispUv;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWispUv=uv;');
 shader.fragmentShader='varying vec2 vWispUv;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`
 #include <emissivemap_fragment>
 float ribs=.5+.5*sin(vWispUv.x*180.0+sin(vWispUv.y*19.0));
 diffuseColor.rgb*=.8+.2*ribs;
 float sparkle=pow(max(0.0,sin(vWispUv.x*183.0+sin(vWispUv.x*37.0)*4.0)),22.0);
 totalEmissiveRadiance+=vec3(1.0,.68,.30)*sparkle*.8;
 `);
 shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
 diffuseColor.a*=1.0-smoothstep(.88,1.0,vWispUv.x);
 #include <opaque_fragment>
 `);
};
const fineDendrites=new THREE.Mesh(wispGeometry,wispMaterial);fineDendrites.name='Ramitas del núcleo · puntas desvanecidas';neuron.add(fineDendrites);
// Fine decorative webs connect nearby branches in true three-dimensional space.
const webParts=[],webAnchors=[];
for(const curve of paths){webAnchors.push(curve.getPoint(.4),curve.getPoint(.85))}
const webPairs=new Set();let webCount=0;
for(let i=0;i<webAnchors.length&&webCount<110;i+=2){
 const a=webAnchors[i];
 const nearby=webAnchors.map((b,j)=>({b,j,d:a.distanceTo(b)})).filter(item=>item.j!==i&&item.d>.035&&item.d<.18).sort((a,b)=>a.d-b.d);
 const neighbor=nearby.find(item=>!webPairs.has([Math.min(i,item.j),Math.max(i,item.j)].join(':')));
 if(!neighbor)continue;
 webPairs.add([Math.min(i,neighbor.j),Math.max(i,neighbor.j)].join(':'));
 const b=neighbor.b,mid=a.clone().lerp(b,.5);
 const sag=new THREE.Vector3(-a.y,a.x,.3).normalize().multiplyScalar(neighbor.d*.2);
 mid.add(sag);
 const webCurve=new THREE.CatmullRomCurve3([a,mid,b]);
 webParts.push(new THREE.TubeGeometry(webCurve,10,.00035+random()*.00025,3,false));
 if(webCount%3===0){
  const c=webCurve.getPoint(.55),target=webAnchors[Math.min(i+1,webAnchors.length-1)];
  webParts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([c,c.clone().lerp(target,.5).addScaledVector(sag,.3),target]),16,.0003,3,false));
 }
 webCount++;
}
if(webParts.length){
 const webGeometry=mergeGeometries(webParts);webParts.forEach(g=>g.dispose());
 const webMaterial=new THREE.MeshPhysicalMaterial({color:'#a7a0ba',roughness:.45,metalness:.05,transparent:true,opacity:.38,depthWrite:false,emissive:'#655477',emissiveIntensity:.22});
 const webs=new THREE.Mesh(webGeometry,webMaterial);webs.name='Filamentos decorativos · tejido tridimensional';neuron.add(webs);
}
// Arcing filaments occupy the cell volume instead of crossing its center as spokes.
for(let i=0;i<28;i++){
 const angle=random()*Math.PI*2,span=.8+random()*2.1;
 const radius=.13+random()*.095,z=(random()-.5)*.22;
 const points=[];
 for(let j=0;j<=8;j++){
  const t=j/8,a=angle+span*t,r=radius*(.85+.15*Math.sin(t*Math.PI+i));
  points.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,z+.035*Math.sin(t*Math.PI*2+i)));
 }
 const curve=new THREE.CatmullRomCurve3(points);
 const filament=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.00045+random()*.00065,5,false),gold);
 neuron.add(filament);paths.push(curve);
 if(i%3===0){
  const start=curve.getPoint(.55),tip=start.clone().multiplyScalar(.55).add(new THREE.Vector3(.02,-.01,.025));
  const branch=new THREE.CatmullRomCurve3([start,start.clone().lerp(tip,.45).add(new THREE.Vector3(.015,.025,0)),tip]);
  neuron.add(new THREE.Mesh(new THREE.TubeGeometry(branch,12,.0005,4,false),gold));
 }
}
const core=new THREE.Mesh(new THREE.SphereGeometry(.011,24,16),new THREE.MeshBasicMaterial({color:new THREE.Color('#ffe4a5').multiplyScalar(3),toneMapped:false}));core.position.set(.015,-.02,.025);neuron.add(core);

return neuron;
}
