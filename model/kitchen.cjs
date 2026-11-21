'use strict';

// A connected U layout: the existing west run meets a rear run and a peninsula.
// The front of every base cabinet faces the clear working aisle.
module.exports = function kitchen(scene, kit, place, sources) {
  const {item, box, cylinder, part, tri} = kit;
  const m = scene.mats, room = 'Кухня и трапезария';
  const dark = m.charcoal, edge = m.charcoalEdge, wood = m.walnutTop;
  const stain = object => {
    object.mat = object.mat.map(id => ({[m.kwood]:dark,[m.taupe]:dark,[m.groove]:edge,
      [m.marble]:wood,[m.lightwood]:wood,[m.oak]:wood})[id] ?? id);
    return object;
  };

  // Preserve Vidol's opening drawers and appliance hardware on the west wall.
  const baseAnchor = [627.5, 207.5], west = [124.5, 605], scale = [-1, 226/267, 1];
  function westModule(sourceName, name) {
    const source = sources.get(sourceName);
    const anchor = [west[0]-(source.anchor[0]-baseAnchor[0]),
      west[1]+(source.anchor[1]-baseAnchor[1])*scale[1], source.anchor[2]];
    return stain(place(sourceName, name, room, anchor, 0, scale));
  }
  const westBase = westModule('Base cabinets + worktop (right wall)', 'Долни шкафове · лява линия');
  // The original straight run carried on behind the rear cabinets. Trim it
  // just after DW1; the sink hardware belongs under the new rear-wall sink.
  // Clip triangles rather than squashing the drawer widths in the source run.
  const clipped={pos:[],mat:[],pt:[],par:[]};
  for(let i=0;i<westBase.mat.length;i++) {
    if(sources.get('Base cabinets + worktop (right wall)').mat[i]===m.marble||westBase.pt[i]>=5)continue;
    let polygon=[0,3,6].map(k=>westBase.pos.slice(i*9+k,i*9+k+3));
    const inside=v=>v[1]+westBase.anchor[1]<=617.001;
    const cut=(a,b)=>{
      const t=(617-westBase.anchor[1]-a[1])/(b[1]-a[1]);
      return a.map((n,j)=>n+(b[j]-n)*t);
    };
    const before=polygon;polygon=[];
    for(let j=0;j<before.length;j++) {
      const a=before[j],b=before[(j+1)%before.length];
      if(inside(a))polygon.push(a);
      if(inside(a)!==inside(b))polygon.push(cut(a,b));
    }
    for(let j=1;j+1<polygon.length;j++) {
      clipped.pos.push(...polygon[0],...polygon[j],...polygon[j+1]);
      clipped.mat.push(westBase.mat[i]);clipped.pt.push(westBase.pt[i]);clipped.par.push(westBase.par[i]);
    }
  }
  Object.assign(westBase,clipped);
  westBase.parts=westBase.parts.slice(0,5);
  for(let i=1;i<westBase.pos.length;i+=3)westBase.pos[i]+=50;
  for(const p of westBase.parts) {
    if(p.c)p.c[1]+=50;
    if(p.pivot)p.pivot[1]+=50;
  }
  westBase.anchor[1]=555;westBase.size[1]=124;
  westBase.grid={nx:6,ny:11,lo:Array(66).fill(0),hi:Array(66).fill(92)};
  box(westBase,[0,0,90],[65,124,4],wood);
  const westUpper = westModule('Upper cabinets', 'Горни шкафове · лява линия');
  westUpper.mat = westUpper.mat.map(id => id===m.white ? edge : id);
  const splash = westModule('Splashback', 'Дървен гръб · лява линия');
  splash.mat.fill(m.walnutBack);
  westModule('Hob', 'Индукционен плот · лява линия');
  westModule('Extractor housing', 'Шкаф за аспиратор');
  westModule('Extractor hood', 'Аспиратор');
  const oven = stain(place('Oven tower', 'Колона с фурна', room, [122.65, 461, 0], -90));
  oven.mat = oven.mat.map(id => id===m.white ? edge : id);
  const fridge = place('Fridge', 'Хладилник с две врати', room,
    [122.5, 401, 0], -90, [60/90, 61/74, 1]);
  fridge.mat = fridge.mat.map(id => id===m.steel ? dark : id);

  const vidolBase = sources.get('Base cabinets + worktop (right wall)');
  const vidolCorner = sources.get('Corner unit (carousel)');
  // Copy the original moving mesh and its pivot, then resize it into a bay.
  // This keeps the D1/DW1 recessed face, groove and drawer box construction.
  function copyMechanism(source, sourcePart, target, point, vector, width, height, extra={}) {
    const original = source.parts[sourcePart];
    const unit = v => {
      const q=vector(v),length=Math.hypot(...q);
      return q.map(n=>n/length);
    };
    const definition={...original,c:point(original.c),w:width,h:height,...extra};
    if(original.pivot)definition.pivot=point(original.pivot);
    if(original.vec)definition.vec=vector(original.vec);
    if(original.axis)definition.axis=unit(original.axis);
    if(original.n)definition.n=unit(original.n);
    if(extra.pivot)definition.pivot=extra.pivot;
    if(extra.axis)definition.axis=extra.axis;
    if(extra.parent===undefined)delete definition.parent;
    const group=part(target,definition);
    source.pt.forEach((owner,i)=>{
      if(owner!==sourcePart)return;
      const vertex=k=>point(source.pos.slice(i*9+k,i*9+k+3));
      const material=({[m.kwood]:dark,[m.groove]:edge,[m.white]:m.walnutBack,
        [m.cushion]:edge})[source.mat[i]] ?? source.mat[i];
      tri(target,vertex(0),vertex(3),vertex(6),material,group,source.par[i]);
    });
    return group;
  }
  function rearMechanism(o, sourcePart, x, z, width, height, kind) {
    const p=vidolBase.parts[sourcePart], [cx,cy,cz]=p.c;
    const by=width/p.w,bz=height/p.h;
    const point=v=>[x-(v[1]-cy)*by,-31.7+(v[0]-cx),z+(v[2]-cz)*bz];
    const vector=v=>[-v[1]*by,v[0],v[2]*bz];
    return copyMechanism(vidolBase,sourcePart,o,point,vector,width,height,{kind});
  }
  function peninsulaMechanism(o, sourcePart, y, z, width, height, extra={}) {
    const p=vidolBase.parts[sourcePart], [cx,cy,cz]=p.c;
    const by=width/p.w,bz=height/p.h;
    const point=v=>[-31+(v[0]-cx),y+(v[1]-cy)*by,z+(v[2]-cz)*bz];
    const vector=v=>[v[0],v[1]*by,v[2]*bz];
    return copyMechanism(vidolBase,sourcePart,o,point,vector,width,height,extra);
  }
  const rear = item('Долни шкафове · задна линия',room,[316,686,0],[198,66,92]);
  box(rear,[0,0,5],[198,66,10],edge);
  box(rear,[0,30.8,49],[198,2.5,78],edge);
  for (const x of [-98,-30,35,98]) box(rear,[x,0,49],[2,63,78],edge);
  // U1 and its sponge tray sit beneath the actual sink, clear of the corner.
  rearMechanism(rear,7,-64,25,66,30,'Чекмедже под мивката');
  rearMechanism(rear,6,-64,55,66,30,'U-образно чекмедже под мивката');
  rearMechanism(rear,5,-64,79,66,18,'Поставка за гъби');
  for (const z of [22,48,74]) rearMechanism(rear,0,2.5,z,63,25,'Чекмедже за съдове');
  box(rear,[66.5,-31.4,49],[62,2,77],dark);
  box(rear,[0,0,90],[198,66,4],wood);

  // A 45-degree face bridges the west and rear cabinet fronts. The carousel
  // reaches the space behind both runs, avoiding a dead or colliding corner.
  const corner=item('Диагонален ъглов шкаф с карусел',room,[154.5,667.5,0],[125,101,92]);
  const nx=13,ny=11,lo=[],hi=[];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++) {
    const x=92+(i+.5)*125/nx,y=617+(j+.5)*101/ny;
    const inside=x<=157+(Math.min(y,654)-617)*60/37;
    lo.push(inside?0:-1);hi.push(inside?92:-1);
  }
  corner.grid={nx,ny,lo,hi};
  box(corner,[-61.5,0,49],[2,101,78],edge);
  box(corner,[0,49.5,49],[125,2,78],edge);
  box(corner,[61.5,18.5,49],[2,64,78],edge);
  function polygonSlab(points,lo,hi,material) {
    const local=points.map(([x,y])=>[x-154.5,y-667.5]);
    for(let j=1;j+1<local.length;j++) {
      const p=(k,z)=>[...local[k],z];
      tri(corner,p(0,hi),p(j,hi),p(j+1,hi),material);
      tri(corner,p(0,lo),p(j+1,lo),p(j,lo),material);
    }
    for(let j=0;j<local.length;j++) {
      const a=local[j],b=local[(j+1)%local.length];
      tri(corner,[...a,lo],[...b,lo],[...b,hi],material);
      tri(corner,[...a,lo],[...b,hi],[...a,hi],material);
    }
  }
  const cornerOutline=[[92,617],[157,617],[217,654],[217,718],[92,718]];
  polygonSlab(cornerOutline,0,10,edge);
  polygonSlab(cornerOutline,88,92,wood);
  const diagPart=vidolBase.parts[4], [dcx,dcy,dcz]=diagPart.c;
  const along=[63/73,37/73], inward=[-37/73,63/73];
  const diagPoint=v=>[31+(v[0]-dcx)*inward[0]+(v[1]-dcy)*(73/45)*along[0],
    -32+(v[0]-dcx)*inward[1]+(v[1]-dcy)*(73/45)*along[1],49+(v[2]-dcz)*(77/78)];
  const diagVector=v=>[v[0]*inward[0]+v[1]*(73/45)*along[0],
    v[0]*inward[1]+v[1]*(73/45)*along[1],v[2]*(77/78)];
  const diagonalDoor=copyMechanism(vidolBase,4,corner,diagPoint,diagVector,73,77,
    {kind:'Диагонална ъглова врата',pivot:[-.5,-50.5,10],axis:[0,0,1],angle:-95});
  const cornerPoint=v=>[10.5+v[0]*.85,8.5+(v[1]+8.75)*.85,v[2]+10.2];
  const cornerVector=v=>[v[0]*.85,v[1]*.85,v[2]];
  copyMechanism(vidolCorner,2,corner,cornerPoint,cornerVector,59.5,72,
    {kind:'Въртящ се карусел',parent:diagonalDoor,follow:false});
  const cornerBack=item('Дървен гръб · диагонален ъгъл',room,[124.5,716,92],[65,3,59]);
  box(cornerBack,[0,0,29],[65,3,58],m.walnutBack);

  // The rear worktop meets the diagonal corner at x=217 and the peninsula
  // at y=653. The slabs share their edges without overlapping faces.
  const back = item('Дървен кухненски гръб · задна линия',room,[286,716,92],[258,3,59]);
  box(back,[0,0,29],[258,3,58],m.walnutBack);
  box(back,[0,-2,58],[258,2,1.5],edge);
  const sink = stain(place('Sink','Черна мивка · задна линия',room,[252,686,91.6],-90));
  sink.mat.fill(edge);
  const tap = place('Tap','Черен смесител · задна линия',room,[252,707,92],-90);
  tap.mat.fill(edge);

  const upper = item('Горни шкафове · задна линия',room,[286,704,0],[258,28,250]);
  box(upper,[0,12,205],[258,3,90],edge);
  box(upper,[0,0,151],[258,28,2],edge);
  box(upper,[0,0,249],[258,28,2],edge);
  for(const x of [-128,-68,-6,56,128])box(upper,[x,0,200],[2,27,96],edge);
  // An open walnut niche, matte lower flaps, and a horizontal walnut band.
  box(upper,[-98,-11.3,183],[58,2,61],m.walnutBack);
  for(const z of [153,184,215,247])box(upper,[-98,-12,z],[58,26,2],wood);
  for(const x of [-129,-68])box(upper,[x,-13,201],[2,24,92],wood);
  for(const [x,w] of [[-37,60],[25,60],[92,70]]) {
    const lower=part(upper,{type:'hinge',pivot:[x,-14,213],axis:[1,0,0],angle:-95,
      kind:'Повдигаща врата',w,h:61,c:[x,-14,182],n:[0,-1,0],id:'W1'});
    box(upper,[x,-14,182],[w-1,2,60],dark,lower);
    const band=part(upper,{type:'hinge',pivot:[x,-14,247],axis:[1,0,0],angle:-95,
      kind:'Повдигаща врата',w,h:32,c:[x,-14,230],n:[0,-1,0],id:'W1'});
    box(upper,[x,-14,230],[w-1,2,32],wood,band);
  }
  box(upper,[-98,-14,230],[59,2,33],wood);
  box(upper,[0,-15,214],[258,1.4,1.4],m.brass);

  const pen = item('Полуостров · шкафове към кухнята',room,[383,579.5,0],[65,149,92]);
  box(pen,[0,0,5],[65,149,10],edge);
  box(pen,[30.8,0,49],[2.5,149,78],edge);
  for(const y of [-73.5,-6,73.5])box(pen,[0,y,49],[63,2,78],edge);
  // D1 drawers are on the open end. A DW1-style corner door and the actual
  // Vidol CA1 rotating trays serve the blind corner next to the rear run.
  for(const z of [25,63]) {
    peninsulaMechanism(pen,0,-40,z,67,36,{kind:'Чекмедже за съдове'});
  }
  const cornerDoor=peninsulaMechanism(pen,4,34,49,78,77,{kind:'Ъглова врата',
    pivot:[-30,-5,10],axis:[0,0,1],angle:95});
  const carouselPoint=v=>[v[0]*.75,35+(v[1]+8.75)*.75,v[2]+10.2];
  const carouselVector=v=>[v[0]*.75,v[1]*.75,v[2]];
  copyMechanism(vidolCorner,2,pen,carouselPoint,carouselVector,52.5,72,
    {kind:'Въртящ се карусел',parent:cornerDoor,follow:false});
  box(pen,[0,0,90],[65,149,4],wood);
  // The peninsula is a preparation counter, with an optional second hob as
  // in the reference photograph, away from the inner corner.
  const hob=item('Индукционен плот · полуостров',room,[383,542,92],[42,52,1]);
  box(hob,[0,0,.55],[42,52,1.1],edge);
  for(const y of [-11,11])for(const x of [-10,10])
    cylinder(hob,[x,y,1.16],7.5,7.5,.14,m.metal,-1,30);

  for(const [i,y] of [546,608].entries()) {
    const lamp=item('Пендел над полуострова '+(i+1),room,[443,y,0],[12,12,260]);
    cylinder(lamp,[0,0,221],.45,.45,78,edge,-1,10);
    cylinder(lamp,[0,0,179],3.5,3.5,8,edge,-1,16);
    cylinder(lamp,[0,0,172],5.2,5.2,7,m.brass,-1,20);
  }
};
