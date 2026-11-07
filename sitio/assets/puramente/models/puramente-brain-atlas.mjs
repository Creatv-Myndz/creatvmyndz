/* PURAMENTE — carga compartida del atlas anatómico.
   La usan el mapa (puramente-neural-brain-preview.html) y los viajes Llegar
   y Volver. El ajuste, el material mate y el muestreo de las 50 neuronas son
   los mismos: 10 por módulo, semilla fija, color por posición en pantalla.
   Llegar es la primera neurona de m1 (lección 0) y Volver la segunda. */

export const THREE_VERSION = '0.182.0';
export const ATLAS_FILE = 'puramente-neural-brain-atlas.glb';
export const DRACO_DECODER = `https://unpkg.com/three@${THREE_VERSION}/examples/jsm/libs/draco/`;
export const ATLAS_FIT = 2.6;

export const MODULE_TARGETS = [[.16,-.18],[-.30,.02],[.02,.36],[-.20,-.18],[.32,.02]];

export const VISIBLE_CATEGORIES = ['cortex','cerebellum','brainstem','tracts','white_matter','deep_grey','diencephalon','ventricles'];

export function createModuleDefs(THREE){
  return [
    {id:'m1',label:'Calma',color:new THREE.Color('#4de2d8'),center:new THREE.Vector3(.48,-.65,.68),normal:new THREE.Vector3(0,0,1)},
    {id:'m2',label:'Foco',color:new THREE.Color('#4e9cff'),center:new THREE.Vector3(.82,.48,.38),normal:new THREE.Vector3(0,0,1)},
    {id:'m3',label:'Ideas',color:new THREE.Color('#ba79ff'),center:new THREE.Vector3(.38,.60,.90),normal:new THREE.Vector3(0,0,1)},
    {id:'m4',label:'Intuición',color:new THREE.Color('#ffc66e'),center:new THREE.Vector3(.80,-.30,.45),normal:new THREE.Vector3(0,0,1)},
    {id:'m5',label:'Acción',color:new THREE.Color('#ff806d'),center:new THREE.Vector3(.36,.13,1.16),normal:new THREE.Vector3(0,0,1)}
  ];
}

export function metadataFor(object){
  let category, core;
  for(let node=object; node; node=node.parent){
    if(category===undefined && node.userData?.bx_cat!==undefined) category=node.userData.bx_cat;
    if(core===undefined && node.userData?.bx_core!==undefined) core=node.userData.bx_core;
  }
  return {category:category||'other', core};
}

export function fitAtlasRoot(THREE, root){
  root.updateMatrixWorld(true);
  const coreBounds=new THREE.Box3();
  root.traverse(object=>{
    if(!object.isMesh) return;
    const metadata=metadataFor(object);
    if(metadata.core===1 || metadata.core===true) coreBounds.expandByObject(object);
  });
  if(coreBounds.isEmpty()) coreBounds.setFromObject(root);
  const center=coreBounds.getCenter(new THREE.Vector3());
  const dimensions=coreBounds.getSize(new THREE.Vector3());
  const scale=ATLAS_FIT/Math.max(dimensions.x, dimensions.y, dimensions.z);
  root.scale.setScalar(scale);
  root.position.copy(center.multiplyScalar(-scale));
  root.rotation.y=-.25;
  root.updateMatrixWorld(true);
  return {scale, dimensions};
}

export function collectAnatomy(root, visibleCategories){
  const allowed=visibleCategories || new Set(VISIBLE_CATEGORIES);
  const cortexMeshes=[];
  const counts=new Map();
  root.traverse(object=>{
    if(!object.isMesh) return;
    const category=metadataFor(object).category;
    counts.set(category, (counts.get(category)||0)+1);
    object.visible=allowed.has(category);
    if(object.visible && category==='cortex') cortexMeshes.push(object);
  });
  return {cortexMeshes, counts};
}

export function createCorticalRelief(THREE, renderer){
  const size=1024, data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const u=x/size*Math.PI*2, v=y/size*Math.PI*2;
    const ridges=Math.sin(u*8+Math.sin(v*3.2)*1.15)+.78*Math.sin(v*7+Math.sin(u*2.8)*1.2)+.36*Math.sin((u-v)*13+Math.sin(u*4+v*2));
    const value=Math.max(0, Math.min(255, 128+ridges*29+3*Math.sin(u*49+Math.sin(v*17))*Math.sin(v*43)));
    const index=(y*size+x)*4;
    data[index]=data[index+1]=data[index+2]=value;
    data[index+3]=255;
  }
  const texture=new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.colorSpace=THREE.NoColorSpace;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps=true;
  texture.anisotropy=Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate=true;
  texture.name='PURAMENTE procedural cortical microrelief';
  return texture;
}

/* Material mate carbón del mapa: Lambert, sin brillo especular, relieve en la
   corteza y un halo regional alrededor de las neuronas activas. */
export function applyMatteAnatomy(THREE, root, {
  corticalRelief, activationClock, activationPulses, activationDensity,
  neuralGlowPositions, neuralGlowColors, inspectionCenter, inspectionRadius,
  opaqueSolids=false,
}){
  root.traverse(object=>{
    if(!object.isMesh || !object.visible) return;
    const category=metadataFor(object).category;
    const isCortex=category==='cortex';
    const isCerebellum=category==='cerebellum';
    const solidAnatomy=isCortex || isCerebellum || category==='brainstem';
    if(opaqueSolids && !solidAnatomy){ object.visible=false; return; }
    const material=new THREE.MeshLambertMaterial({
      color:isCortex?'#454e5a':'#38424f',
      emissive:0x000000,
      side:THREE.DoubleSide,
    });
    material.name=`PURAMENTE matte charcoal anatomy · ${category}`;
    material.onBeforeCompile=shader=>{
      shader.uniforms.activationClock=activationClock;
      shader.uniforms.activationPulses=activationPulses;
      shader.uniforms.activationDensity=activationDensity;
      shader.uniforms.neuralGlowPositions=neuralGlowPositions;
      shader.uniforms.neuralGlowColors=neuralGlowColors;
      shader.uniforms.inspectionCenter=inspectionCenter;
      shader.uniforms.inspectionRadius=inspectionRadius;
      shader.vertexShader='varying vec3 vAnatomyWorld;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\nvAnatomyWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
      shader.fragmentShader='uniform float activationDensity; uniform vec4 activationPulses[50]; uniform float activationClock; uniform vec3 neuralGlowPositions[50]; uniform vec3 neuralGlowColors[50]; uniform vec3 inspectionCenter; uniform float inspectionRadius; varying vec3 vAnatomyWorld;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>', `
            #include <emissivemap_fragment>
            vec3 regionalLight=vec3(0.0);
            for(int n=0;n<50;n++){
              vec3 offset=vAnatomyWorld-neuralGlowPositions[n];
              float distanceSquared=dot(offset,offset);
              if(distanceSquared>.36 || dot(neuralGlowColors[n],neuralGlowColors[n])<.0001)continue;
              float radius=sqrt(distanceSquared);
              float pulse=activationPulses[n].y;
              float ringDistance=(radius-activationPulses[n].x)/(.035+activationDensity*.025);
              float ring=exp(-ringDistance*ringDistance);
              float secondDistance=(radius-activationPulses[n].z)/(.035+activationDensity*.025);
              float secondRing=exp(-secondDistance*secondDistance)*activationPulses[n].w;
              float influence=.025*exp(-radius*radius/.035)+(ring*pulse+secondRing*activationDensity)*(.65+activationDensity*.85);
              regionalLight+=neuralGlowColors[n]*influence;
            }
            totalEmissiveRadiance+=(inspectionRadius>0.001 ? .025 : 1.0)*regionalLight/(vec3(1.0)+regionalLight)*(.38+activationDensity*.42);
          `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>', `
            #include <clipping_planes_fragment>
            if(inspectionRadius>0.001){
              vec3 axis=normalize(inspectionCenter-cameraPosition);
              vec3 offset=vAnatomyWorld-cameraPosition;
              float along=dot(offset,axis);
              float radial=length(offset-axis*along);
              float targetDistance=distance(inspectionCenter,cameraPosition);
              if(along>0.0 && along<targetDistance+0.12 && radial<inspectionRadius) discard;
            }
          `);
    };
    material.customProgramCacheKey=()=>'puramente-density-activation-v6';
    if(isCortex && object.geometry.attributes.uv){
      material.bumpMap=corticalRelief;
      material.bumpScale=.012;
    }
    object.castShadow=solidAnatomy && !opaqueSolids;
    object.receiveShadow=solidAnatomy && !opaqueSolids;
    material.transparent=!solidAnatomy;
    material.opacity=category==='tracts'?.06:category==='white_matter'?.08:.10;
    if(solidAnatomy){
      material.opacity=isCortex?.82:.9;
      material.transparent=true;
      if(opaqueSolids){ material.opacity=1; material.transparent=false; }
    }
    material.depthWrite=opaqueSolids && solidAnatomy;
    material.side=THREE.FrontSide;
    object.renderOrder=-2;
    material.needsUpdate=true;
    object.material=material;
  });
}

export function createSeededRandom(seed=0x50555241){
  let state=seed;
  return ()=>{state=(state*1664525+1013904223)>>>0; return state/4294967296;};
}

function moduleColorAt(camera, moduleDefs, moduleTargets, point){
  const projected=point.clone().project(camera);
  let index=0, distance=Infinity;
  for(let i=0;i<moduleTargets.length;i++){
    const dx=projected.x-moduleTargets[i][0], dy=projected.y-moduleTargets[i][1], next=dx*dx+dy*dy;
    if(next<distance){distance=next; index=i;}
  }
  return {module:moduleDefs[index], weight:Math.min(.96, .96*Math.exp(-distance/.14))};
}

function worldNormal(THREE, mesh, normal){
  return normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)).normalize();
}

/* Misma selección que el mapa: 720 muestras de corteza, 10 neuronas por módulo
   por punto más lejano, luego hundidas hacia el volumen. `surface` conserva el
   punto de corteza antes de hundirlas. El orden final es el de los audios. */
export function sampleCourseNeurons(THREE, MeshSurfaceSampler, {
  surfaceMeshes, camera, target, moduleDefs, moduleTargets, random,
}){
  const rng=random || createSeededRandom();
  const samplers=surfaceMeshes.map(mesh=>{
    if(!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
    return {mesh, sampler:new MeshSurfaceSampler(mesh).build(), weight:1};
  });
  const totalWeight=samplers.reduce((sum,item)=>sum+item.weight, 0);
  const samples=[], point=new THREE.Vector3(), normal=new THREE.Vector3();
  for(const item of samplers) item.sampler.setRandomGenerator(rng);
  const pickSampler=()=>{
    let value=rng()*totalWeight;
    for(const item of samplers){value-=item.weight; if(value<=0) return item;}
    return samplers[samplers.length-1];
  };
  for(let i=0;i<720;i++){
    let accepted=null;
    for(let attempt=0; attempt<36 && !accepted; attempt++){
      const {mesh, sampler}=pickSampler();
      sampler.sample(point, normal);
      const world=mesh.localToWorld(point.clone());
      const outward=worldNormal(THREE, mesh, normal);
      const radial=world.clone().sub(target);
      const facing=outward.dot(radial.clone().normalize());
      if(radial.length()>.68 && facing>-.05) accepted={position:world, normal:outward};
    }
    if(!accepted){
      const {mesh, sampler}=pickSampler();
      sampler.sample(point, normal);
      accepted={position:mesh.localToWorld(point.clone()), normal:worldNormal(THREE, mesh, normal)};
    }
    accepted.position.addScaledVector(accepted.normal, -.006);
    const region=moduleColorAt(camera, moduleDefs, moduleTargets, accepted.position);
    samples.push({...accepted, color:region.module.color.clone(), module:region.module.id, focus:region.weight});
  }
  const chosen=[];
  for(const module of moduleDefs){
    const candidates=samples.filter(sample=>sample.module===module.id);
    for(let n=0;n<10;n++){
      let best=null, score=-Infinity;
      for(const sample of candidates){
        if(chosen.includes(sample)) continue;
        const distance=chosen.length?Math.min(...chosen.map(other=>other.position.distanceToSquared(sample.position))):sample.focus;
        if(distance>score){score=distance; best=sample;}
      }
      if(best) chosen.push(best);
    }
  }
  chosen.forEach(sample=>{
    sample.surface=sample.position.clone();
    sample.surfaceNormal=sample.normal.clone();
  });
  chosen.forEach((sample,i)=>sample.position.multiplyScalar(.62+.15*((i*17)%11)/10));
  chosen.sort((a,b)=>b.focus-a.focus);
  return chosen;
}

/* Índice dentro del módulo, con las muestras ya ordenadas como en el mapa. */
export function moduleLesson(samples, moduleId, lessonIndex){
  return samples.filter(sample=>sample.module===moduleId)[lessonIndex] || null;
}

export function createAtlasLoader(GLTFLoader, DRACOLoader, decoderPath=DRACO_DECODER){
  const draco=new DRACOLoader();
  draco.setDecoderPath(decoderPath);
  const loader=new GLTFLoader();
  loader.setDRACOLoader(draco);
  return {loader, draco};
}

export function loadAtlas(loader, url){
  return new Promise((resolve, reject)=>{
    loader.load(url, resolve, undefined, reject);
  });
}

/* Cámara con la que el mapa asigna módulos. Hay que repetirla al muestrear
   para que Llegar y Volver caigan en el mismo punto. */
export function previewPlacementCamera(THREE, aspect){
  const camera=new THREE.PerspectiveCamera(34, aspect||1, .1, 100);
  camera.position.set(3.25, 1.65, 4.1);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return camera;
}

/* Une las piezas visibles en un mesh por categoría, en espacio de mundo,
   para que el viaje no pague cientos de mallas transparentes superpuestas. */
export function consolidateAtlas(THREE, mergeGeometries, root){
  root.updateMatrixWorld(true);
  const buckets=new Map();
  const doomed=[];
  root.traverse(object=>{
    if(!object.isMesh || !object.visible) return;
    const category=metadataFor(object).category;
    let geometry=object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    for(const name of [...Object.keys(geometry.attributes)]){
      if(name!=='position' && name!=='normal' && name!=='uv') geometry.deleteAttribute(name);
    }
    if(!geometry.attributes.normal) geometry.computeVertexNormals();
    if(!geometry.attributes.uv){
      geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count*2), 2));
    }
    if(!buckets.has(category)) buckets.set(category, []);
    buckets.get(category).push(geometry);
    doomed.push(object);
  });
  const group=new THREE.Group();
  group.name='PURAMENTE atlas consolidated';
  for(const [category, geometries] of buckets){
    let geometry=geometries[0];
    if(geometries.length>1){
      try { geometry=mergeGeometries(geometries, false); geometries.forEach(g=>g.dispose()); }
      catch { geometry=null; }
    }
    const meshes=geometry ? [new THREE.Mesh(geometry)] : geometries.map(g=>new THREE.Mesh(g));
    for(const mesh of meshes){
      mesh.userData.bx_cat=category;
      mesh.name=category;
      mesh.frustumCulled=false;
      group.add(mesh);
    }
  }
  doomed.forEach(object=>{
    object.removeFromParent();
    object.geometry?.dispose();
  });
  return group;
}

export function addAtlasLights(THREE, scene){
  scene.add(new THREE.HemisphereLight(0xd9e3ef, 0x08090b, 1.15));
  for(const [color, intensity, pos] of [[0xe5edf7,7,[3,2,4]],[0xbdcadc,5,[-3,1,-2]],[0xd4dce5,3,[0,-2,1]],[0xffffff,5,[-2,2,4]]]){
    const light=new THREE.PointLight(color, intensity, 10);
    light.position.set(...pos);
    scene.add(light);
  }
  const softKey=new THREE.DirectionalLight(0xdce4ef, 1.05);
  softKey.position.set(-3, 4, 5);
  softKey.castShadow=true;
  softKey.shadow.mapSize.set(2048, 2048);
  Object.assign(softKey.shadow.camera, {left:-2, right:2, top:2, bottom:-2, near:.1, far:15});
  softKey.shadow.bias=-.00015;
  softKey.shadow.normalBias=.008;
  scene.add(softKey);
  const rimLight=new THREE.DirectionalLight(0xabbdd8, .85);
  rimLight.position.set(2, 1, -4);
  scene.add(rimLight);
  return {softKey, rimLight};
}
