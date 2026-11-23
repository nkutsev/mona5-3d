'use strict';

// A connected U layout: the existing west run meets a rear run and a peninsula.
// The front of every base cabinet faces the clear working aisle.
module.exports = function kitchen(scene, kit, place, sources) {
  const {item, box, part, tri} = kit;
  const m = scene.mats, room = 'Кухня и трапезария';
  const edge = m.charcoalEdge, wood = m.kitchenVeneer;
  const matte = m.kitchenTaupe, stone = m.kitchenStone;
  const stain = object => {
    object.mat = object.mat.map(id => ({[m.kwood]:wood,[m.taupe]:wood,[m.groove]:edge,
      [m.marble]:stone,[m.lightwood]:wood,[m.oak]:wood})[id] ?? id);
    return object;
  };

  function vitrineFront(object, [x,y,z], [width,height], group, eastFacing=false) {
    const frame=2.2;
    const rail=(u,v,w,h)=>box(object,eastFacing?[x,y+u,z+v]:[x+u,y,z+v],
      eastFacing?[2,w,h]:[w,2,h],edge,group);
    for(const sign of [-1,1]) {
      rail(sign*(width-frame)/2,0,frame,height);
      rail(0,sign*(height-frame)/2,width-2*frame,frame);
    }
    const hw=width/2-frame, hh=height/2-frame;
    const point=(u,v)=>eastFacing?[x,y+u,z+v]:[x+u,y,z+v];
    const [a,b,c,d]=[point(-hw,-hh),point(hw,-hh),point(hw,hh),point(-hw,hh)];
    tri(object,a,b,c,m.smokedGlass,group);
    tri(object,a,c,d,m.smokedGlass,group);
  }

  // Preserve Vidol's opening drawers and appliance hardware on the west wall.
  const baseAnchor = [627.5, 207.5], west = [124.5, 603.5], scale = [-1, 226/267, 1];
  function westModule(sourceName, name) {
    const source = sources.get(sourceName);
    const anchor = [west[0]-(source.anchor[0]-baseAnchor[0]),
      west[1]+(source.anchor[1]-baseAnchor[1])*scale[1], source.anchor[2]];
    return stain(place(sourceName, name, room, anchor, 0, scale));
  }
  const westBase = westModule('Base cabinets + worktop (right wall)', 'Долни шкафове · лява линия');
  const westEnd=559,westStart=west[1]-113,westLength=westEnd-westStart;
  const westCentre=(westStart+westEnd)/2;
  // Keep Vidol's three D1 drawers beneath the hob. A dedicated sink cabinet
  // replaces the source P1 and DW1 modules between these drawers and the L.
  // Clip triangles rather than squashing the source drawer widths.
  const clipped={pos:[],mat:[],pt:[],par:[]};
  for(let i=0;i<westBase.mat.length;i++) {
    if(sources.get('Base cabinets + worktop (right wall)').mat[i]===m.marble||westBase.pt[i]>=3)continue;
    let polygon=[0,3,6].map(k=>westBase.pos.slice(i*9+k,i*9+k+3));
    const inside=v=>v[1]+westBase.anchor[1]<=westEnd+.001;
    const cut=(a,b)=>{
      const t=(westEnd-westBase.anchor[1]-a[1])/(b[1]-a[1]);
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
  westBase.parts=westBase.parts.slice(0,3);
  for(let i=1;i<westBase.pos.length;i+=3)westBase.pos[i]+=west[1]-westCentre;
  for(const p of westBase.parts) {
    if(p.c)p.c[1]+=west[1]-westCentre;
    if(p.pivot)p.pivot[1]+=west[1]-westCentre;
  }
  westBase.anchor[1]=westCentre;westBase.size[1]=westLength;
  westBase.grid={nx:6,ny:6,lo:Array(36).fill(0),hi:Array(36).fill(92)};
  box(westBase,[0,0,90],[65,westLength,4],stone);
  const westUpper = westModule('Upper cabinets', 'Горни шкафове · лява линия');
  // Keep the same W1/F1 pivots, but replace the solid F1 fronts with glass.
  const upperMesh = {pos:[],mat:[],pt:[],par:[]};
  for(let i=0;i<westUpper.mat.length;i++) {
    if(westUpper.pt[i]>=6)continue;
    let finish=westUpper.mat[i];
    if(finish===m.white)finish=wood;
    if(finish===wood&&westUpper.pt[i]>=0)finish=matte;
    upperMesh.pos.push(...westUpper.pos.slice(i*9,i*9+9));
    upperMesh.mat.push(finish);
    upperMesh.pt.push(westUpper.pt[i]);
    upperMesh.par.push(westUpper.par[i]);
  }
  Object.assign(westUpper,upperMesh);
  for(let i=6;i<westUpper.parts.length;i++) {
    const front=westUpper.parts[i];
    vitrineFront(westUpper,front.c,[front.w-.4,front.h-.4],i,true);
    box(westUpper,[-13,front.c[1],front.c[2]],[2,front.w-.4,front.h],wood);
    box(westUpper,[10,front.c[1],97],[1,front.w-5,1.1],m.led);
  }
  const splash = westModule('Splashback', 'Каменен гръб · лява линия');
  splash.mat.fill(stone);
  westModule('Hob', 'Индукционен плот · лява линия');
  const extractor = westModule('Extractor housing', 'Шкаф за аспиратор');
  extractor.mat = extractor.mat.map(id => id===wood ? matte : id);
  westModule('Extractor hood', 'Аспиратор');
  const oven = stain(place('Oven tower', 'Колона с фурна', room, [122.65, 461, 0], -90));
  oven.mat = oven.mat.map(id => id===m.white ? wood : id);
  const fridge = place('Fridge', 'Хладилник с две врати', room,
    [122.5, 407.5, 0], -90, [45/90, 61/74, 1]);
  fridge.mat = fridge.mat.map((id,i) => id===m.steel ? wood
    : fridge.pt[i]>=0&&id===m.metal ? edge : id);
  // Stop the doors at 90° to keep their sweep between the hall wall and the oven.
  for(const door of fridge.parts) {
    door.angle = Math.sign(door.angle)*90;
    door.pivot[1] = 30.6;
  }
  box(fridge,[0,0,181.8],[45,61,3.5],wood);
  box(fridge,[0,-29,216.5],[45,3,65.5],wood);
  box(fridge,[0,29,216.5],[45,3,65.5],wood);
  for(const x of [-21.5,21.5])box(fridge,[x,0,216.5],[2,57,65.5],wood);
  box(fridge,[0,0,248.25],[45,61,2.5],wood);
  fridge.size[2]=249.5;
  // Include the new enclosure in the original appliance's collision footprint.
  const grid=fridge.grid;
  if(grid) {
    grid.hi=grid.hi.map((height,i)=>height<0 ? height : Math.max(249.5,height));
  }

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
      const material=({[m.kwood]:wood,[m.groove]:edge,[m.white]:m.walnutBack,
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
  // Move the original U1 sink storage to the west wall beside the hob.
  const sinkBase=item('Шкаф под мивката · лява линия',room,[124.5,587.25,0],[65,56.5,92]);
  box(sinkBase,[0,0,5],[65,56.5,10],edge);
  box(sinkBase,[-30.8,0,49],[2.5,56.5,78],edge);
  for(const y of [-27.25,27.25])box(sinkBase,[0,y,49],[63,2,78],edge);
  const sinkPoint=v=>[-v[0],(v[1]-43.5)*56.5/60,v[2]];
  const sinkVector=v=>[-v[0],v[1]*56.5/60,v[2]];
  for(const [sourcePart,kind] of [[7,'Чекмедже под мивката'],
    [6,'U-образно чекмедже под мивката'],[5,'Поставка за гъби']])
    copyMechanism(vidolBase,sourcePart,sinkBase,sinkPoint,sinkVector,56.5,
      vidolBase.parts[sourcePart].h,{kind});
  box(sinkBase,[0,0,90],[65,56.5,4],stone);
  const sink=stain(place('Sink','Черна мивка · лява линия',room,[124.5,587.25,91.6]));
  sink.mat.fill(edge);
  const tap=place('Tap','Черен смесител · лява линия',room,[111.5,587.25,92],180);
  tap.mat.fill(edge);

  // The DW1 bay is removed. The plate and pan drawers occupy its former
  // position; the right bay is the corner joining the shifted peninsula.
  const rear=item('Долни шкафове · задна линия',room,[239.75,686,0],[135.5,66,92]);
  box(rear,[0,0,5],[135.5,66,10],edge);
  box(rear,[0,30.8,49],[135.5,2.5,78],edge);
  for(const x of [-65.75,2.25,65.75])box(rear,[x,0,49],[2,63,78],edge);
  rearMechanism(rear,8,-31.25,29.5,66,39,'Чекмедже за чинии');
  rearMechanism(rear,9,-31.25,68.5,66,39,'Чекмедже за тигани');
  box(rear,[35.75,-31.4,49],[65,2,77],wood);
  box(rear,[0,0,90],[135.5,66,4],stone);

  // Vidol's original corner unit has two linked doors (CD1/CD2) around a
  // square corner and the CA1 carousel behind them. Mirror that complete unit
  // into this L, instead of putting a diagonal front across the work aisle.
  const corner=stain(place('Corner unit (carousel)','Ъглов шкаф · карусел Видол',room,
    [135.2,659.25,10.2],0,[1,-1,1]));
  for(const p of corner.parts) {
    if(p.id==='CD1'||p.id==='CD2')p.kind='Сгъваема ъглова врата';
    if(p.id==='CA1')p.kind='Въртящ се карусел';
  }
  // Two orthogonal slabs meet the straight runs. A small round nose follows
  // the exposed end of Vidol's island top without changing the 90° cabinet.
  const cornerTop=item('Плот с прав ъгъл и заоблен край',room,[132,666.75,88],[80,102.5,4]);
  box(cornerTop,[-7.5,0,2],[65,102.5,4],stone);
  box(cornerTop,[32.5,18.75,2],[15,65,4],stone);
  const cx=25,cy=-13.75,r=8,steps=16;
  for(let i=0;i<steps;i++) {
    const a=-Math.PI/2+i*Math.PI/(2*steps),b=a+Math.PI/(2*steps);
    const p=t=>[cx+r*Math.cos(t),cy+r*Math.sin(t)];
    const u=p(a),v=p(b),c=[cx,cy];
    tri(cornerTop,[...c,4],[...u,4],[...v,4],stone);
    tri(cornerTop,[...c,0],[...v,0],[...u,0],stone);
    tri(cornerTop,[...u,0],[...v,0],[...v,4],stone);
    tri(cornerTop,[...u,0],[...v,4],[...u,4],stone);
  }
  const cornerBack=item('Каменен гръб · ляв ъгъл',room,[124.5,716,92],[65,3,59]);
  box(cornerBack,[0,0,29],[65,3,58],stone);

  // The rear worktop runs from the square west corner to the new peninsula.
  const back=item('Каменен кухненски гръб · задна линия',room,[232.25,716,92],[150.5,3,59]);
  box(back,[0,0,29],[150.5,3,58],stone);
  box(back,[0,-2,58],[150.5,2,1.5],edge);

  const upper=item('Горни шкафове · задна линия',room,[232.25,704,0],[150.5,28,250]);
  box(upper,[0,12,205],[150.5,3,90],edge);
  box(upper,[0,0,151],[150.5,28,2],edge);
  box(upper,[0,0,249],[150.5,28,2],edge);
  for(const x of [-74.25,-15.25,30,74.25])box(upper,[x,0,200],[2,27,96],edge);
  // The two upper tiers retain their lift-up motion and share aligned fronts.
  for(const [x,w,id] of [[7.375,45.25,'W1'],[52.625,45.25,'W1'],[-45.25,59,'НГ1']]) {
    box(upper,[x,9,228],[w-1,2,35],wood);
    box(upper,[x,1,214],[w-1,26,2],wood);
    box(upper,[x,-4,245],[w-6,1.1,1.1],m.led);
    const lower=part(upper,{type:'hinge',pivot:[x,-14,213],axis:[1,0,0],angle:-95,
      kind:'Повдигаща врата',w,h:61,c:[x,-14,182],n:[0,-1,0],id});
    box(upper,[x,-14,182],[w-1,2,60],matte,lower);
    const band=part(upper,{type:'hinge',pivot:[x,-14,247],axis:[1,0,0],angle:-95,
      kind:'Повдигаща витрина',w,h:32,c:[x,-14,230],n:[0,-1,0],id:'ВГ1'});
    vitrineFront(upper,[x,-14,230],[w-1,32],band);
  }
  box(upper,[0,-10,149.8],[148,1.1,.7],m.led);

  // A shallow walnut corner niche bridges the two upper runs. Its usable
  // shelves stay below the west F1 flap's sweep; the dark backing closes the
  // gap above without blocking that flap when it lifts.
  const upperCorner=item('Отворен ъглов шкаф · горна линия',room,[142,704,0],[30,30,250]);
  box(upperCorner,[0,14,200],[30,1.5,100],edge);
  box(upperCorner,[0,11.7,182],[26,1.2,62],m.walnutBack);
  for(const x of [-14,14])box(upperCorner,[x,0,182],[2,28,64],edge);
  for(const z of [151,173,193,214])box(upperCorner,[0,0,z],[30,28,2],wood);

  const display=item('Висока осветена витрина',room,[332,703,0],[46,34,249.5]);
  box(display,[0,15,125],[46,3,245],wood);
  for(const x of [-22,22])box(display,[x,0,125],[2,34,245],edge);
  for(const z of [5,247])box(display,[0,0,z],[46,34,5],edge);
  for(const z of [58,104,150,196])box(display,[0,1,z],[42,30,1.4],wood);
  box(display,[-19,-12,125],[1,1,225],m.led);
  const displayDoor=part(display,{type:'hinge',pivot:[-22,-17,0],axis:[0,0,1],angle:-95,
    kind:'Остъклена врата',w:44,h:237,c:[0,-17,125],n:[0,-1,0],id:'ВВ1'});
  vitrineFront(display,[0,-17,125],[44,237],displayDoor);

  const pen = item('Полуостров · шкафове към кухнята',room,[275,601.5,0],[65,103,92]);
  box(pen,[0,5,5],[65,93,10],edge);
  box(pen,[30.8,5,49],[2.5,93,78],wood);
  box(pen,[0,-40.5,49],[63,2,78],wood);
  for(const y of [-17.5,50.5])box(pen,[0,y,49],[63,2,78],edge);
  // A narrow P1 pull-out makes the shortened preparation counter useful.
  // A matching hinged door and CA1 trays still serve its blind corner.
  peninsulaMechanism(pen,3,-29,49,21,78,{kind:'Изтеглящ се шкаф за бутилки'});
  const cornerDoor=peninsulaMechanism(pen,4,17,49,69,77,{id:'CD3',kind:'Ъглова врата',
    pivot:[-30,-17.5,10],axis:[0,0,1],angle:95});
  const carouselPoint=v=>[v[0]*.75,13+(v[1]+8.75)*.75,v[2]+10.2];
  const carouselVector=v=>[v[0]*.75,v[1]*.75,v[2]];
  copyMechanism(vidolCorner,2,pen,carouselPoint,carouselVector,52.5,72,
    {kind:'Въртящ се карусел',parent:cornerDoor,follow:false});
  // Reuse the rounded exposed end of Vidol's island worktop. Only its top
  // triangles are kept; the D1 and CA1 cabinets above remain independent.
  const originalIsland=sources.get('Island');
  const penTop=place('Island','Заоблен плот на полуострова',room,
    [275,601.5,0],180,[65/64.4,103/152,1]);
  const worktopMesh={pos:[],mat:[],pt:[],par:[]};
  for(let i=0;i<penTop.mat.length;i++)if(originalIsland.mat[i]===m.marble) {
    for(let k=0;k<9;k+=3)worktopMesh.pos.push(penTop.pos[i*9+k],penTop.pos[i*9+k+1],penTop.pos[i*9+k+2]-88);
    worktopMesh.mat.push(stone);worktopMesh.pt.push(-1);worktopMesh.par.push(penTop.par[i]);
  }
  Object.assign(penTop,worktopMesh);
  penTop.anchor[2]=88;penTop.size[2]=4;penTop.parts=[];penTop.grid=null;

  require('./dining.cjs')(scene,kit,room);

  for(const [index,x] of [201,384].entries()) {
    const track=item('Осветителна шина · кухня '+(index+1),room,[x,555,256],[3,238,3]);
    box(track,[0,0,2],[2.5,238,2],m.track);
    for(const y of [-86,0,86])box(track,[0,y,.8],[1.7,22,1.2],m.trackLight);
  }
};
