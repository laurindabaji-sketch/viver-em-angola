import * as THREE from 'three';

const game = document.querySelector('#game');
const loading = document.querySelector('#loading');
const startPanel = document.querySelector('#startPanel');
const startButton = document.querySelector('#startButton');
const missionText = document.querySelector('#missionText');
const distanceText = document.querySelector('#distanceText');
const message = document.querySelector('#message');
const isMobile = matchMedia('(pointer: coarse)').matches || innerWidth < 800;
if (isMobile) document.body.classList.add('mobile');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc3d7);
scene.fog = new THREE.Fog(0x9bc3d7, 48, 220);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 500);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
game.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd8edff, 0x65503b, 2.0));
const sun = new THREE.DirectionalLight(0xffe0ad, 2.7);
sun.position.set(-35, 65, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -90; sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
scene.add(sun);

const mat = (color, roughness=0.9, metalness=0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const asphalt = mat(0x343b40), sidewalk = mat(0xb8aa91), sand = mat(0xc6a477);
const glass = new THREE.MeshStandardMaterial({color:0x8bb4c2, roughness:.25, metalness:.15});
const palmTrunk = mat(0x70543a), palmLeaf = mat(0x3d7048);
const world = new THREE.Group(); scene.add(world);

function box(parent,x,y,z,sx,sy,sz,material,cast=true){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);
  mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent,x,y,z,r1,r2,h,material,segments=12){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}

function buildCity(){
  box(world,0,-.25,0,220,.5,220,sand,false);
  box(world,0,.015,0,15,.08,190,asphalt,false);
  box(world,0,.02,0,190,.08,15,asphalt,false);
  box(world,-8.3,.07,0,1.5,.16,190,sidewalk,false);
  box(world,8.3,.07,0,1.5,.16,190,sidewalk,false);
  box(world,0,.07,-8.3,190,.16,1.5,sidewalk,false);
  box(world,0,.07,8.3,190,.16,1.5,sidewalk,false);
  const lineMat=mat(0xe9dfbd);
  for(let z=-85;z<90;z+=12) box(world,0,.07,z,.16,.02,5,lineMat,false);
  for(let x=-85;x<90;x+=12) box(world,x,.07,0,5,.02,.16,lineMat,false);

  const colors=[0xd7b58c,0xe2d5bd,0xc78e68,0xbfc9c5,0xd9c9a7,0x9caeb0,0xe4dfd2];
  for(let gx=-3;gx<=3;gx++) for(let gz=-3;gz<=3;gz++){
    if(gx===0||gz===0) continue;
    const x=gx*24,z=gz*24,w=10+Math.random()*5,d=10+Math.random()*5,h=5+Math.random()*13;
    box(world,x,h/2,z,w,h,d,mat(colors[Math.floor(Math.random()*colors.length)]));
    box(world,x,h+.12,z,w+.25,.25,d+.25,mat(0x8b6e53));
    const rows=Math.max(1,Math.floor(h/2.5));
    for(let r=0;r<rows;r++) for(let c=0;c<3;c++){
      box(world,x-w/2+.9+c*(w-1.8)/2,1.5+r*2.1,z+d/2+.025,.85,1.05,.06,glass,false);
    }
    box(world,x,1,z+d/2+.04,1.1,2,.08,mat(0x654c39),false);
    // Varandas simples para dar profundidade às fachadas.
    if(h>10){
      for(let level=1;level<rows;level+=2){
        box(world,x,2+level*2.1,z+d/2+.35,w*.82,.12,.65,mat(0x777b78));
        box(world,x-w*.41,2.35+level*2.1,z+d/2+.62,.1,.55,.08,mat(0x555e60));
        box(world,x+w*.41,2.35+level*2.1,z+d/2+.62,.1,.55,.08,mat(0x555e60));
      }
    }
  }

  // Pequeno mercado de rua e toldos coloridos.
  const shopColors=[0xc65c3d,0x397b86,0xd2a33f,0x66824f];
  for(let i=0;i<6;i++){
    const x=-60+i*24;
    box(world,x,2.1,-13,9,4.2,7,mat(shopColors[i%shopColors.length]));
    box(world,x,4.35,-13,9.4,.35,7.4,mat(0xeee2c8));
    box(world,x,2,-9.42,3.7,1.3,.08,glass,false);
    box(world,x,3.55,-9.25,4.8,.12,.7,mat(0xf0c16a));
  }
  // Postes de iluminação ao longo das ruas.
  const poleMat=mat(0x4d565b,.65,.35), lampMat=new THREE.MeshStandardMaterial({color:0xffe2a5,emissive:0x6d4a17,emissiveIntensity:.5});
  for(let z=-78;z<=78;z+=26){
    for(const side of [-1,1]){
      const x=side*10.2;
      cylinder(world,x,2.5,z,.09,.12,5,poleMat);
      const arm=box(world,x-side*.65,4.85,z,1.3,.09,.09,poleMat);
      arm.rotation.z=side*.08;
      box(world,x-side*1.15,4.72,z,.55,.16,.32,lampMat,false);
    }
  }
  // Bancos e árvores pequenas em pontos de descanso.
  const wood=mat(0x79563a), metal=mat(0x454e53);
  for(const z of [-55,35,65]){
    for(const x of [-11,11]){
      box(world,x, .65,z,2.2,.16,.65,wood);
      for(const dx of [-.8,.8]) cylinder(world,x+dx,.32,z,.06,.06,.65,metal,8);
    }
  }
  for(let i=0;i<28;i++){
    const x=(i%2?-11:11),z=-88+Math.floor(i/2)*13;
    if(Math.abs(z)<18) continue;
    cylinder(world,x,2.1,z,.22,.32,4.2,palmTrunk);
    const crown=new THREE.Group(); crown.position.set(x,4.1,z); world.add(crown);
    for(let a=0;a<7;a++){
      const leaf=new THREE.Mesh(new THREE.ConeGeometry(.42,4,5),palmLeaf);
      leaf.rotation.z=Math.PI/2; leaf.rotation.y=a*Math.PI/3.5;
      leaf.position.set(Math.cos(a*Math.PI/3.5)*1.15,.05,Math.sin(a*Math.PI/3.5)*1.15);
      leaf.castShadow=true; crown.add(leaf);
    }
  }
}
buildCity();

function makeCar(x,z,color){
  const g=new THREE.Group();g.position.set(x,.2,z);world.add(g);
  const body=mat(color,.35),tire=mat(0x17191b);
  box(g,0,.65,0,2.1,.7,4.2,body);
  box(g,0,1.2,-.15,1.7,.8,2.1,glass);
  for(const wx of [-.9,.9])for(const wz of [-1.35,1.35]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.22,16),tire);
    wheel.rotation.z=Math.PI/2;wheel.position.set(wx,.38,wz);wheel.castShadow=true;g.add(wheel);
  }
  box(g,0,.42,2.12,1.5,.18,.08,mat(0xd8d1bb),false);
}
makeCar(-5,-4,0x9e3030);makeCar(5,4,0x263e68);makeCar(43,-13,0xd2d1c8);

// Personagem low-poly visível quando a câmara está em terceira pessoa.
const player={position:new THREE.Vector3(0,0,16),yaw:0};
const avatar=new THREE.Group();world.add(avatar);
const skin=mat(0x8c573b), shirt=mat(0x315b68), pants=mat(0x252d37), shoes=mat(0x171b20), hair=mat(0x171412);
const torso=box(avatar,0,1.12,0,.62,.72,.32,shirt);
const head=new THREE.Group();head.position.set(0,1.72,0);avatar.add(head);
const headMesh=new THREE.Mesh(new THREE.SphereGeometry(.23,12,10),skin);headMesh.scale.set(.86,1.08,.9);head.add(headMesh);
const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.235,12,8,0,Math.PI*2,0,Math.PI*.48),hair);hairCap.position.y=.06;head.add(hairCap);
const armPivots=[],legPivots=[];
for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.39,1.38,0);avatar.add(arm);armPivots.push(arm);
  const upper=cylinder(arm,0,-.22,0,.105,.13,.48,shirt);
  const fore=cylinder(arm,0,-.58,0,.085,.105,.38,skin);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),skin);hand.position.y=-.79;arm.add(hand);
  const leg=new THREE.Group();leg.position.set(side*.19,.78,0);avatar.add(leg);legPivots.push(leg);
  cylinder(leg,0,-.22,0,.13,.16,.5,pants);
  box(leg,0,-.51,.08,.25,.16,.42,shoes);
}
avatar.visible=false;

// Braços em primeira pessoa: deixam o avatar presente no enquadramento sem tapar o centro.
const viewArms=new THREE.Group();camera.add(viewArms);
for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.38,-.43,-.72);viewArms.add(arm);
  cylinder(arm,0,-.19,0,.105,.13,.48,shirt);
  cylinder(arm,0,-.53,-.02,.085,.105,.28,skin);
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),skin);hand.position.set(0,-.69,-.03);arm.add(hand);
  arm.userData.side=side;arm.userData.base=arm.position.clone();armPivots[side===-1?0:1].userData.viewArm=arm;
}
viewArms.visible=true;

// Marcador da primeira atividade.
const marker=new THREE.Group();marker.position.set(0,0,-35);world.add(marker);
const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5,.12,12,48),
  new THREE.MeshStandardMaterial({color:0xffc45c,emissive:0x8a4c08,emissiveIntensity:1.5}));
ring.rotation.x=Math.PI/2;ring.position.y=.16;marker.add(ring);
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,4,12),
  new THREE.MeshBasicMaterial({color:0xffc45c,transparent:true,opacity:.22}));
beam.position.y=2;marker.add(beam);
const beacon=new THREE.PointLight(0xffb84d,2,9);beacon.position.y=2;marker.add(beacon);

let started=false,completed=false,running=false,thirdPerson=false,pitch=0;
const keys={};let joy={x:0,y:0},lookPointer=null,lastTouch=null;
const clock=new THREE.Clock();

function showMessage(text){
  message.textContent=text;message.classList.add('show');
  clearTimeout(showMessage.timer);showMessage.timer=setTimeout(()=>message.classList.remove('show'),2700);
}
function toggleCamera(){
  thirdPerson=!thirdPerson;avatar.visible=thirdPerson;viewArms.visible=!thirdPerson;
  showMessage(thirdPerson?'Câmara em terceira pessoa':'Câmara em primeira pessoa');
}
function begin(){
  started=true;startPanel.classList.add('hidden');
  if(!isMobile)renderer.domElement.requestPointerLock?.();
  showMessage('Bem-vindo! Explora Luanda e encontra o marcador dourado.');
}
startButton.addEventListener('click',begin);
document.addEventListener('mousemove',e=>{
  if(document.pointerLockElement===renderer.domElement&&started){
    player.yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;
    pitch=THREE.MathUtils.clamp(pitch,-1.35,1.35);
  }
});
document.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='ShiftLeft'||e.code==='ShiftRight')running=true;
  if(e.code==='KeyV'&&!e.repeat)toggleCamera();
  if(e.code==='KeyE')interact();
});
document.addEventListener('keyup',e=>{
  keys[e.code]=false;
  if(e.code==='ShiftLeft'||e.code==='ShiftRight')running=false;
});
renderer.domElement.addEventListener('click',()=>{
  if(started&&!isMobile&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.();
});

// Controlos tácteis.
const mobileControls=document.querySelector('#mobileControls');
const viewButton=document.createElement('button');viewButton.id='viewButton';viewButton.textContent='VISTA';
viewButton.style.cssText='position:absolute;right:20px;bottom:56px;width:82px;height:42px;padding:5px;font-size:9px;pointer-events:auto;background:#e6b45b';
mobileControls.appendChild(viewButton);viewButton.addEventListener('click',toggleCamera);
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');let joyId=null;
joystick.addEventListener('pointerdown',e=>{joyId=e.pointerId;joystick.setPointerCapture(joyId);updateJoy(e);});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyId)updateJoy(e);});
function updateJoy(e){
  const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy;const max=34,len=Math.hypot(dx,dy);
  if(len>max){dx=dx/len*max;dy=dy/len*max;}
  joy.x=dx/max;joy.y=dy/max;stick.style.transform=`translate(${dx}px,${dy}px)`;
}
function releaseJoy(){joyId=null;joy={x:0,y:0};stick.style.transform='translate(0,0)';}
joystick.addEventListener('pointerup',releaseJoy);joystick.addEventListener('pointercancel',releaseJoy);
renderer.domElement.addEventListener('pointerdown',e=>{
  if(!isMobile||!started)return;lookPointer=e.pointerId;lastTouch={x:e.clientX,y:e.clientY};
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(!isMobile||e.pointerId!==lookPointer||!lastTouch)return;
  const dx=e.clientX-lastTouch.x,dy=e.clientY-lastTouch.y;
  player.yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-1.35,1.35);
  lastTouch={x:e.clientX,y:e.clientY};
});
function endLook(e){if(e.pointerId===lookPointer){lookPointer=null;lastTouch=null;}}
renderer.domElement.addEventListener('pointerup',endLook);renderer.domElement.addEventListener('pointercancel',endLook);
const runButton=document.querySelector('#runButton');
runButton.addEventListener('pointerdown',()=>{running=true;runButton.classList.add('active');});
function stopRun(){running=false;runButton.classList.remove('active');}
runButton.addEventListener('pointerup',stopRun);runButton.addEventListener('pointercancel',stopRun);runButton.addEventListener('pointerleave',stopRun);
document.querySelector('#interactButton').addEventListener('click',interact);

function interact(){
  const dist=camera.position.distanceTo(marker.position);
  if(dist<4.8&&!completed){
    completed=true;missionText.textContent='Atividade concluída!';
    distanceText.textContent='Primeiro destino visitado';
    showMessage('Muito bem! Concluíste a primeira atividade de Viver em Angola.');
    ring.material.color.set(0x70e0a0);ring.material.emissive.set(0x145c36);
  }else if(dist>=4.8)showMessage('Ainda estás longe. Aproxima-te do marcador dourado.');
  else showMessage('Atividade concluída. Novas missões em breve!');
}

function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
  if(started){
    const forward=(keys.KeyW?1:0)-(keys.KeyS?1:0)-joy.y;
    const side=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;
    const inputLen=Math.hypot(forward,side);
    const moving=inputLen>.08;
    const speed=(running?8.5:4.6)*dt;
    const f=forward/(inputLen||1),s=side/(inputLen||1);
    const sin=Math.sin(player.yaw),cos=Math.cos(player.yaw);
    player.position.x+=(s*cos+f*sin)*speed;
    player.position.z+=(-s*sin-f*cos)*speed;
    player.position.x=THREE.MathUtils.clamp(player.position.x,-95,95);
    player.position.z=THREE.MathUtils.clamp(player.position.z,-95,95);

    const stride=moving?Math.sin(t*(running?13:8))*.65:0;
    avatar.position.copy(player.position);avatar.rotation.y=player.yaw;
    legPivots.forEach((p,i)=>p.rotation.x=stride*(i===0?1:-1));
    armPivots.forEach((p,i)=>p.rotation.x=-stride*(i===0?1:-1)*.65);
    viewArms.children.forEach((arm,i)=>{
      const sideSign=i===0?-1:1;
      arm.position.y=-.43+(moving?Math.abs(stride)*.035:0);
      arm.rotation.x=moving?stride*(i===0?-.16:.16):Math.sin(t*1.4)*.012;
      arm.rotation.z=sideSign*.04;
    });

    if(thirdPerson){
      const behind=new THREE.Vector3(-Math.sin(player.yaw)*5,2.65,Math.cos(player.yaw)*5);
      camera.position.set(player.position.x+behind.x,player.position.y+behind.y,player.position.z+behind.z);
      camera.lookAt(player.position.x,player.position.y+1.15,player.position.z);
    }else{
      camera.position.set(player.position.x,player.position.y+1.68,player.position.z);
      camera.rotation.set(pitch,player.yaw,0,'YXZ');
    }
    const dist=camera.position.distanceTo(marker.position);
    if(!completed)distanceText.textContent=dist<4.8?'Pressiona E / INTERAGIR':`Marcador a ${Math.round(dist)} m`;
    marker.scale.setScalar(1+Math.sin(t*3)*.06);
  }
  renderer.render(scene,camera);
}
animate();
loading.classList.add('hidden');

window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
});
