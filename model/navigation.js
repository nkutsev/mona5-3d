// The six panels share one opening fraction and park at the north end.
// Successive hinges stay connected throughout the animation.
function panelPose(ob, index, fraction) {
  const f=ob.fold, span=f.length/f.count, base=f.localStart;
  const angle=ease(fraction)*f.angle*Math.PI/180;
  const fromNorth=f.count-1-index;
  const hingeY=base+index*span;
  return {
    angle: (fromNorth%2===0?1:-1)*angle,
    pivot: [0,hingeY,0],
    shift: [fromNorth%2===0?span*Math.sin(angle):0,
            (fromNorth+1)*span*(1-Math.cos(angle)),0]
  };
}
function foldingSegments() {
  const i=INST.findIndex(s=>OB[s.ob].fold);
  if(i<0)return [];
  const s=INST[i], ob=OB[s.ob], f=ob.fold;
  const result=[];
  for(let n=0;n<f.count;n++) {
    const pose=panelPose(ob,n,partVal(i,n)), span=f.length/f.count;
    const a=[s.x+pose.shift[0],s.y+pose.pivot[1]+pose.shift[1]];
    result.push([a,[a[0]-span*Math.sin(pose.angle),a[1]+span*Math.cos(pose.angle)]]);
  }
  return result;
}
function doorSegments() {
  const result=[];
  INST.forEach((s,i)=>{
    const leaf=OB[s.ob].walkLeaf;
    if(!leaf || s.hidden)return;
    const a=partXf(i,leaf.part,[...leaf.pivot,0],false);
    const b=partXf(i,leaf.part,[...leaf.end,0],false);
    result.push([a.slice(0,2),b.slice(0,2)]);
  });
  return result;
}
function usedWalls() { return WALLSEG.concat(foldingSegments(),doorSegments()); }
function syncFoldControl() {
  const i=INST.findIndex(s=>OB[s.ob].fold), b=$('bFold');
  if(i<0||!b)return;
  const open=!!INST[i].po?.[0];
  b.textContent=open?'Затвори преградата':'Отвори преградата';
  b.setAttribute('aria-pressed',String(open));
  b.classList.toggle('on',open);
}
function toggleDivider() {
  const i=INST.findIndex(s=>OB[s.ob].fold);
  if(i<0)return;
  pushUndo();
  setAllParts(i,!INST[i].po?.[0]);
  syncFoldControl();
}
function pointSegmentGap(x,y,[[ax,ay],[bx,by]]) {
  const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
  const t=len?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/len)):0;
  return Math.hypot(x-ax-t*dx,y-ay-t*dy);
}
function insideExterior(x,y) {
  if(D.walkBoundary)return inFoot(D.walkBoundary,[x,y]);
  return inRoom(x,y);
}
function walkable(x,y,walls) {
  const radius=12;
  if(!insideExterior(x,y)||walls.some(seg=>pointSegmentGap(x,y,seg)<radius))return false;
  for(const s of INST) {
    const ob=OB[s.ob];
    if(s.hidden||ob.fixed||ob.fold||s.z>172||s.z+ob.size[2]*s.sz<15)continue;
    const a=-s.rot*Math.PI/180,c=Math.cos(a),sn=Math.sin(a);
    const dx=x-s.x,dy=y-s.y;
    const u=(c*dx-sn*dy)/s.sx,v=(sn*dx+c*dy)/s.sy;
    const [w,d]=ob.size;
    if(Math.abs(u)>w/2+radius/s.sx||Math.abs(v)>d/2+radius/s.sy)continue;
    if(!ob.grid)return false;
    const g=ob.grid;
    const ix=Math.max(0,Math.min(g.nx-1,Math.floor((u/w+.5)*g.nx)));
    const iy=Math.max(0,Math.min(g.ny-1,Math.floor((v/d+.5)*g.ny)));
    const k=iy*g.nx+ix;
    if(g.hi[k]>=0 && s.z+g.hi[k]*s.sz>15 && s.z+g.lo[k]*s.sz<172)return false;
  }
  return true;
}
function walkBy(dx,dy) {
  const walls=usedWalls(), steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));
  for(let i=0;i<steps;i++) {
    if(walkable(cam.ex+dx/steps,cam.ey,walls))cam.ex+=dx/steps;
    if(walkable(cam.ex,cam.ey+dy/steps,walls))cam.ey+=dy/steps;
  }
  dirty=true;
}
function panFromKeyboard(dt) {
  const forward=Number(!!keys.w)-Number(!!keys.s);
  const right=Number(!!keys.d)-Number(!!keys.a);
  if(!forward&&!right)return;
  const scale=dt*cam.dist*.48/Math.hypot(forward,right);
  const c=Math.cos(cam.yaw),s=Math.sin(cam.yaw);
  cam.tx+=(-c*forward-s*right)*scale;
  cam.ty+=(-s*forward+c*right)*scale;
  dirty=true;
}
function movementKey(event) {
  // Physical positions also work with an active Bulgarian keyboard layout.
  if(['KeyW','KeyA','KeyS','KeyD'].includes(event.code))return event.code.slice(-1).toLowerCase();
  return event.key.toLowerCase();
}
function startWalk() {
  const walls=usedWalls();
  let target=sel>=0?[INST[sel].x,INST[sel].y]:null;
  if(target) {
    for(const distance of [130,170,210]) {
      for(let n=0;n<16;n++) {
        const a=n*Math.PI/8,x=target[0]+Math.cos(a)*distance,y=target[1]+Math.sin(a)*distance;
        if(walkable(x,y,walls)&&clearPath([x,y],target)) {
          Object.assign(cam,{ex:x,ey:y,wy:Math.atan2(target[1]-y,target[0]-x),wp:-.08});return;
        }
      }
    }
  }
  for(const [x,y] of [[135,300],[175,324],[226,316],[200,415],[525,425]]) {
    if(walkable(x,y,walls)){Object.assign(cam,{ex:x,ey:y,wy:.76,wp:-.06});return;}
  }
  for(let y=215;y<690;y+=25)for(let x=32;x<925;x+=25) {
    if(walkable(x,y,walls)){Object.assign(cam,{ex:x,ey:y,wy:.76,wp:-.06});return;}
  }
}
function fitApartment() {
  const aspect=cv.clientWidth/Math.max(1,cv.clientHeight);
  Object.assign(cam,{tx:470,ty:350,tz:70,yaw:-1.23,pitch:.99,dist:Math.max(1170,1340/Math.max(.35,aspect))});
  const outline=[[-24,-14],[-24,383],[66,383],[66,740],[927,740],[969,708],[969,-14]];
  const points=outline.flatMap(([x,y])=>[[x,y,-12],[x,y,D.H]]);
  for(const s of INST) {
    if(!s.hidden&&!OB[s.ob].fixed&&inRoom(s.x,s.y))points.push(...corners(s).flat());
  }
  const w=cv.clientWidth,h=cv.clientHeight,margin=Math.max(12,w*.035);
  const top=Math.min(70,h*.14),bottom=Math.min(66,h*.16);
  for(let n=0;n<5;n++) {
    setupCam();
    const screen=points.map(project).filter(Boolean);
    if(!screen.length)break;
    const xs=screen.map(p=>p[0]),ys=screen.map(p=>p[1]);
    const l=Math.min(...xs),r=Math.max(...xs),t=Math.min(...ys),b=Math.max(...ys);
    const px=2*cam.dist*Math.tan(cam.fov/2)/h;
    const cx=(l+r-w)/2,cy=(t+b-(h+top-bottom))/2;
    cam.tx+=px*(cx*RGT[0]-cy*UPV[0]);
    cam.ty+=px*(cx*RGT[1]-cy*UPV[1]);
    cam.tz+=px*(cx*RGT[2]-cy*UPV[2]);
    cam.dist*=Math.max(.8,Math.min(1.25,Math.max((r-l)/(w-2*margin),(b-t)/(h-top-bottom))));
  }
  dirty=true;
}
window.d15FitView=()=>{setMode('orbit');fitApartment();};
window.d15SyncFold=syncFoldControl;
$('bFold')?.addEventListener('click',toggleDivider);
window.addEventListener('blur',()=>{Object.keys(keys).forEach(key=>delete keys[key]);});
fitApartment();
syncFoldControl();
