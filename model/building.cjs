'use strict';

// Coordinates follow the architectural drawing: centimetres, +Y toward the top.
// Clear widths, window sills and door heads come from ARCH_PLAN. Unspecified
// joinery and furniture heights are design dimensions for the editable model.
module.exports = function buildApartment(D, kit) {
  const {item, box, tri, part, cylinder} = kit;
  const m = D.mats;
  const H = D.H = 260;
  const shell = item('structure', 'Архитектура', [0, 0, 0], [980, 750, H]);
  shell.isFixed = true;
  D.rooms = [];
  D.walkWalls = [];

  function quad(object, a, b, c, d, material, group = -1) {
    tri(object, a, b, c, material, group);
    tri(object, a, c, d, material, group);
  }
  function bounds(object, x1, y1, z1, x2, y2, z2, material, group = -1) {
    box(object, [(x1+x2)/2, (y1+y2)/2, (z1+z2)/2],
      [x2-x1, y2-y1, z2-z1], material, group);
  }
  function floorRect(x1, y1, x2, y2, material, inside = true) {
    const poly = [[x1,y1], [x2,y1], [x2,y2], [x1,y2]];
    D.rooms.push(poly);
    quad(shell, ...poly.map(([x,y]) => [x,y,0]), material);
    if (inside) quad(shell, ...poly.map(([x,y]) => [x,y,H]).reverse(), m.ceiling);
  }
  function wall(x1, y1, x2, y2, thickness, z0 = 0, z1 = H, material = m.wall, solid = true) {
    // Explicit rectangular section also supports the rounded facade's short chords.
    const dx = x2-x1, dy = y2-y1, len = Math.hypot(dx,dy);
    const nx = -dy*thickness/(2*len), ny = dx*thickness/(2*len);
    const corners = [[x1+nx,y1+ny],[x1-nx,y1-ny],[x2-nx,y2-ny],[x2+nx,y2+ny]];
    const bottom = corners.map(([x,y]) => [x,y,z0]);
    const top = corners.map(([x,y]) => [x,y,z1]);
    for (let i=0;i<4;i++) {
      const j=(i+1)%4;
      quad(shell,bottom[i],bottom[j],top[j],top[i],material);
    }
    quad(shell,...top,material);
    quad(shell,...bottom.reverse(),material);
    // Horizontal interior sections give the original editor's wall cut a solid top.
    for (const z of [65,120]) {
      if (z>z0 && z<z1) quad(shell,...corners.map(([x,y]) => [x,y,z]),m.greige);
    }
    if (solid) D.walkWalls.push([[x1,y1],[x2,y2]]);
  }
  function jambsX(y, x1, x2, top = 210) {
    bounds(shell,x1-.8,y-6,.1,x1+1.7,y+6,top,m.oak);
    bounds(shell,x2-1.7,y-6,.1,x2+.8,y+6,top,m.oak);
    bounds(shell,x1-.8,y-6,top-2.4,x2+.8,y+6,top,m.oak);
  }
  function jambsY(x, y1, y2, top = 210) {
    bounds(shell,x-6,y1-.8,.1,x+6,y1+1.7,top,m.oak);
    bounds(shell,x-6,y2-1.7,.1,x+6,y2+.8,top,m.oak);
    bounds(shell,x-6,y1-.8,top-2.4,x+6,y2+.8,top,m.oak);
  }
  function glassY(x, y1, y2, sill, head, bays = 1) {
    const rail = 3;
    for (let i=0; i<=bays; i++) {
      const y = y1+(y2-y1)*i/bays;
      bounds(shell,x-2,y-rail/2,sill,x+2,y+rail/2,head,m.metal);
    }
    for (const z of [sill,head-rail]) bounds(shell,x-2,y1,z,x+2,y2,z+rail,m.metal);
    quad(shell,[x,y1,sill+rail],[x,y2,sill+rail],[x,y2,head-rail],[x,y1,head-rail],m.glass);
    D.walkWalls.push([[x,y1],[x,y2]]);
  }

  // Continuous oak planks with a stone floor in the bathroom.
  bounds(shell,-16,-14,-12,961,373,-.4,m.greige);
  bounds(shell,74,371,-12,961,696,-.4,m.greige);
  bounds(shell,74,695,-12,926,730,-.4,m.greige);
  floorRect(0,0,114,190,m.herring);
  floorRect(114,0,344,190,m.bathStone);
  floorRect(0,190,344,372,m.herring);
  floorRect(344,0,814,366,m.herring);
  floorRect(814,0,950,366,m.herring,false);
  floorRect(344,366,950,372,m.herring);
  floorRect(90,372,505,720,m.herring);
  floorRect(505,372,925,720,m.herring);
  floorRect(925,372,950,695,m.herring);

  const arc = Array.from({length:13},(_,i) => {
    const a=i*Math.PI/24;
    return [925+25*Math.cos(a),695+25*Math.sin(a)];
  });
  D.rooms.push([[925,695],...arc]);
  for (let i=0; i<arc.length-1; i++) {
    const [x1,y1]=arc[i], [x2,y2]=arc[i+1];
    tri(shell,[925,695,0],[x1,y1,0],[x2,y2,0],m.herring);
    tri(shell,[925,695,H],[x2,y2,H],[x1,y1,H],m.ceiling);
  }
  // Exterior envelope. The entry leaf occupies the entrance portal in the hall.
  wall(-13,-10,960,-10,20);
  wall(-12,0,-12,372,24);
  // Extend the entrance wall to back the hall wardrobe while preserving a
  // 109 cm opening to the kitchen and living area.
  wall(-24,372,235,372,20);
  wall(78,372,78,730,24);
  wall(66,730,925,730,20);
  for (let i=0; i<arc.length-1; i++) {
    const a=i*Math.PI/24, b=(i+1)*Math.PI/24;
    wall(925+35*Math.cos(a),695+35*Math.sin(a),925+35*Math.cos(b),695+35*Math.sin(b),20);
  }
  wall(960,695,960,622,20);
  wall(960,622,960,397,20,0,55);
  wall(960,622,960,397,20,255,H,m.wall,false);
  glassY(954,397,622,55,255,2);
  bounds(shell,946,394,53,965,625,55.2,m.travertine);
  wall(960,397,960,365,20);
  // The loggia is open to the east above its balustrade.
  wall(959,0,959,366,15,0,37,m.greige);
  glassY(955,4,362,37,105,4);
  bounds(shell,952,0,104,960,366,108,m.metal);

  // Bedroom, bath, store, and the two full-height openings to the loggia.
  wall(114,0,114,190,12);
  wall(344,0,344,217,12);
  wall(344,306,344,366,12);
  wall(344,217,344,306,12,210,H,m.wall,false);
  jambsY(344,217,306);
  wall(0,190,12,190,10);
  wall(84,190,133,190,10);
  wall(218,190,344,190,10);
  for (const [left,right] of [[12,84],[133,218]]) {
    wall(left,190,right,190,10,210,H,m.wall,false);
    jambsX(190,left,right);
  }
  wall(338,366,850,366,12);
  wall(940,366,963,366,12);
  wall(850,366,940,366,12,255,H,m.wall,false);
  jambsX(366,850,940,255);
  wall(815,0,815,126,16);
  wall(815,306,815,366,16);
  wall(815,126,815,306,16,255,H,m.wall,false);
  glassY(815,126,216,1,255);
  jambsY(815,216,306,255);
  // Leaves are drawn closed in local space and initially swing clear. Their
  // hinges supply the live walk barriers instead of baking doors into walls.
  hingedDoor('Врата към склада','Склад',[48,190],72,207,0,-90);
  hingedDoor('Врата към банята','Баня',[175.5,190],85,207,0,-90);
  hingedDoor('Врата към спалнята','Спалня',[344,261.5],89,207,-90,90);
  hingedDoor('Остъклена врата от спалнята','Спалня',[815,261],90,252,-90,-90,true);
  hingedDoor('Остъклена врата от дневната','Дневна и кабинет',[895,366],90,252,180,-90,true);
  function hingedDoor(name, room, centre, opening, height, rotation, angle, glazed=false) {
    const leaf=item(name,room,[...centre,0],[opening-3.6,4,height],rotation);
    leaf.isFixed=true;
    leaf.initialOpen=true;
    const left=-(opening-3.6)/2, right=-left;
    const group=part(leaf,{type:'hinge',pivot:[left,0,0],axis:[0,0,1],angle,
      kind:glazed?'Остъклена врата':'Интериорна врата',id:(glazed?'ЛВ':'ИВ')+opening,w:opening-3.6,h:height,
      c:[0,1.9,height/2],n:[0,1,0]});
    leaf.walkLeaf={pivot:[left,0],end:[right,0],part:group};
    if (glazed) {
      for (const x of [left,right-4]) bounds(leaf,x,-1.9,1,x+4,1.9,height,m.metal,group);
      for (const z of [1,height-4]) bounds(leaf,left,-1.9,z,right,1.9,z+4,m.metal,group);
      quad(leaf,[left+4,0,5],[right-4,0,5],[right-4,0,height-4],[left+4,0,height-4],m.glass,group);
    } else {
      bounds(leaf,left,-1.8,.9,right,1.8,height,m.lightwood,group);
    }
    for(const s of [-1,1]) {
      const near=s*1.8, far=s*5.1;
      bounds(leaf,right-8.5,Math.min(near,far),96,right-6.7,Math.max(near,far),98,m.steel,group);
      bounds(leaf,right-17,Math.min(far,s*4.1),96,right-6.7,Math.max(far,s*4.1),98,m.steel,group);
    }
  }
  // Hall entrance, viewed from inside.
  bounds(shell,-.1,220,0,1.9,320,210,m.white);
  for (const y of [218,320]) bounds(shell,1.9,y,0,4.6,y+2.5,214,m.charcoalEdge);
  bounds(shell,1.9,218,210,4.6,322.5,214,m.charcoalEdge);
  bounds(shell,2,230,95,7.2,245,98,m.charcoalEdge);
  bounds(shell,0,196,0,1.2,218,258,m.kitchenVeneer);
  bounds(shell,0,322.5,0,1.2,362,258,m.kitchenVeneer);
  bounds(shell,0,218,214,1.2,322.5,258,m.kitchenVeneer);

  // Fixed upper/lower tracks with one mesh group per folding leaf.
  const divider = item('Сгъваема стъклена преграда','Дневна и кабинет',
    [505,546,0],[5,348,252]);
  divider.isFixed = true;
  divider.fold = {x:505,y:372,length:348,count:6,localStart:-174,angle:87};
  bounds(divider,-2.5,-174,.1,2.5,174,.8,m.steel);
  bounds(divider,-3,-174,249,3,174,253,m.metal);
  for (let i=0; i<6; i++) {
    const y=-174+i*58, width=58;
    const g=part(divider,{type:'fold',foldIndex:i,kind:'Стъклено крило',id:'СП1',w:width,h:248,
      c:[0,y+width/2,124],n:[1,0,0]});
    quad(divider,[0,y+1.35,3],[0,y+width-1.35,3],[0,y+width-1.35,247],[0,y+1.35,247],m.dividerSmoke,g);
    for (const edge of [y+.2,y+width-1.6]) bounds(divider,-1.4,edge,1,1.4,edge+1.4,249,m.metal,g);
    for (const z of [1,246.5]) bounds(divider,-1.4,y+1,z,1.4,y+width-1,z+2.4,m.metal,g);
    if (i===0) {
      // Kitchen face of the free south leaf, opposite the north stacking end.
      bounds(divider,-3.6,y+4,97,.05,y+6.3,99,m.charcoalEdge,g);
      bounds(divider,-3.6,y+4,117,.05,y+6.3,119,m.charcoalEdge,g);
      bounds(divider,-4.8,y+4,97,-3.2,y+6.3,119,m.charcoalEdge,g);
    }
  }

  buildBathroom();
  buildLaundry();

  function buildBathroom() {
    // Looking in from the hall, the shower is at left (east on the drawing).
    // The vanity and WC share a stepped service wall; glass starts at its return.
    const front=23, showerStart=261, showerFront=15;
    const stone=m.bathStone, relief=m.showerRelief, black=m.charcoalEdge;
    // The openings are in two service linings in front of the exterior wall.
    function nicheWall({start,end,face,back,left,right,bottom,top,finish,recess,shelf}) {
      bounds(shell,start,0,0,left,face,H,finish);
      bounds(shell,right,0,0,end,face,H,finish);
      bounds(shell,left,0,0,right,face,bottom,finish);
      bounds(shell,left,0,top,right,face,H,finish);
      bounds(shell,left,0,bottom,right,back,top,recess);
      const led=y=>bounds(shell,left+1,face-1.9,y-.7,right-1,face-.8,y,m.led);
      led(top-.1);
      if(shelf) {
        bounds(shell,left,back,shelf,right,face-.35,shelf+1.5,recess);
        led(shelf-.1);
      }
    }
    nicheWall({start:120,end:showerStart,face:front,back:6,left:190,right:250,
      bottom:120,top:153,finish:stone,recess:m.kitchenVeneer});
    D.walkWalls.push([[120,front],[showerStart,front]],[[showerStart,showerFront],[showerStart,front]],
      [[showerStart,showerFront],[336,showerFront]]);
    bounds(shell,120,0,0,121.2,184,H,stone);
    bounds(shell,336,0,0,338,185,H,stone);
    bounds(shell,120,184.5,0,133,185,H,stone);
    bounds(shell,218,184.5,0,338,185,H,stone);
    bounds(shell,133,184.5,210,218,185,H,stone);
    // Wrap the relief around the two-level stone niche and onto the side wall.
    nicheWall({start:showerStart,end:336,face:showerFront,back:2.5,left:269,right:313,
      bottom:115,top:165,finish:relief,recess:stone,shelf:139});
    bounds(shell,335.6,showerFront,0,336,164,H,relief);
    bounds(shell,showerStart+1,showerFront+.1,254,334.8,showerFront+1.7,255.2,m.led);
    bounds(shell,334,showerFront+1.7,254,335.4,163.3,255.2,m.led);
    const bath='Баня';
    // The ribbed drawer fronts carry their brass knobs and boxes when opened.
    const vanity=item('Окачен шкаф с умивалник',bath,[152.5,45,39],[60,46,70]);
    for (const x of [-29.2,29.2]) bounds(vanity,x-.8,-21,0,x+.8,21,44,m.charcoal);
    bounds(vanity,-30,-21,0,30,21,1.8,m.charcoal);
    bounds(vanity,-30,-21,41.3,30,21,43.5,m.charcoal);
    bounds(vanity,-29,19.5,39.95,29,21,41.3,black);
    bounds(vanity,-28.4,-21,1.8,28.4,-19.8,41.3,m.charcoal);
    for(let n=0;n<2;n++) {
      const z=n*20+.8;
      const g=part(vanity,{type:'slide',vec:[0,30,0],kind:'Чекмедже',w:57,h:19,
        c:[0,21.8,z+10],n:[0,1,0],id:'БЧ1'});
      bounds(vanity,-28.6,19.6,z,28.6,21,z+19,black,g);
      for(let i=0;i<36;i++) {
        const x=-28.2+i*1.6;
        const ridge=[[x,20.95],[x+.26,21.55],[x+.71,21.85],[x+1.16,21.55],[x+1.42,20.95]];
        for(let j=0;j<ridge.length-1;j++) {
          const a=ridge[j],b=ridge[j+1];
          quad(vanity,[...a,z],[...b,z],[...b,z+19],[...a,z+19],m.charcoal,g);
        }
      }
      bounds(vanity,-26.7,-15,z+2.2,26.7,19.8,z+3.6,m.greige,g);
      for(const x of [-26.7,25.3]) bounds(vanity,x,-15,z+3.6,x+1.4,19.7,z+13,m.charcoal,g);
      bounds(vanity,-26.7,-15,z+3.6,26.7,-13.6,z+13,m.charcoal,g);
      bounds(vanity,-2.2,21.83,z+8,2.2,23,z+12.6,m.gold,g);
    }
    bounds(vanity,-30,-21,43.5,30,21,46,m.greige);
    // Rounded rectangular vessel with a recessed bowl and visible drain.
    const basinProfile=[[46,16,10],[47,19,11.5],[52,22,14],[58.1,23,15],
      [59,22.3,14.4],[57.7,21.6,13.6],[53,19.5,11.5],[48.8,14.5,8.5]];
    const basinPoint=([z,rx,ry],i)=>{
      const a=i*Math.PI/32, x=Math.cos(a),y=Math.sin(a);
      return [rx*Math.sign(x)*Math.pow(Math.abs(x),.73),3+ry*Math.sign(y)*Math.pow(Math.abs(y),.73),z];
    };
    for(let i=0;i<64;i++) {
      for(let j=1;j<basinProfile.length;j++) {
        const a=basinProfile[j-1],b=basinProfile[j];
        quad(vanity,basinPoint(a,i),basinPoint(a,i+1),basinPoint(b,i+1),basinPoint(b,i),j<4?black:m.charcoal);
      }
      const bottom=basinProfile[basinProfile.length-1];
      tri(vanity,[0,3,48.8],basinPoint(bottom,i),basinPoint(bottom,i+1),black);
    }
    cylinder(vanity,[0,3,49.15],2.25,2.25,.6,m.metal);
    cylinder(vanity,[0,3,49.72],1.7,1.7,.6,black);
    bounds(vanity,-2,-18.5,46,2,-14,67,black);
    bounds(vanity,-1.55,-16,62.4,1.55,-6,64.5,black);
    bounds(vanity,-1.4,-17.2,67,1.4,-12,68.3,black);

    const mirror=item('Издължено огледало с LED кант',bath,[152.5,25.1,108],[49,3.8,112]);
    function capsule(radius,straight,y) {
      return [1,-1].flatMap((side,k)=>Array.from({length:33},(_,i)=>{
        const angle=(k+i/32)*Math.PI;
        return [radius*Math.cos(angle),y,56+side*straight+radius*Math.sin(angle)];
      }));
    }
    const rimBack=capsule(24.5,31.5,-1.7), rimFront=capsule(24.5,31.5,1.25);
    const light=capsule(22.9,31.5,1.34), pane=capsule(22,31.5,1.45);
    for(let i=0;i<rimFront.length;i++) {
      const j=(i+1)%rimFront.length;
      quad(mirror,rimBack[i],rimBack[j],rimFront[j],rimFront[i],black);
      tri(mirror,[0,1.25,56],rimFront[i],rimFront[j],black);
      tri(mirror,[0,1.34,56],light[i],light[j],m.led);
      tri(mirror,[0,1.45,56],pane[i],pane[j],m.mirror);
    }
    const wc=item('Окачена тоалетна',bath,[220,50.5,19.5],[36,54,23]);
    // The bowl tapers below the closed seat to show the wall-hung silhouette.
    const rings=[[0,9.2,13,-6],[6,13.7,21,-2],[18,17.1,26,0],[21,17.5,26.3,0]];
    for(let n=0;n<rings.length-1;n++) {
      const ringPt=([z,rx,ry,cy],a)=>[Math.cos(a)*rx,cy+Math.sin(a)*ry,z];
      for(let i=0;i<36;i++) {
        const a=i*Math.PI/18,b=(i+1)*Math.PI/18;
        quad(wc,ringPt(rings[n],a),ringPt(rings[n],b),ringPt(rings[n+1],b),ringPt(rings[n+1],a),m.white);
      }
    }
    cylinder(wc,[0,0,21.5],17.4,26.1,.9,m.greige);
    cylinder(wc,[0,0,22.35],17.5,26.2,1.1,m.white);
    bounds(shell,209,front+.1,94,231,front+.9,108,black);
    bounds(shell,211,front+.91,97,219.5,front+1.25,105,m.greige);
    bounds(shell,220.4,front+.91,97,228,front+1.25,105,m.greige);
    // Small towels and bottles make the depth of the two recesses visible.
    for(const [x,z,width,depth,height] of [[211,120,30,13,4.5],[210,124.5,27,12,3.9]]) {
      const y=14, r=1.5;
      const outline=[[-1,-1],[1,-1],[1,1],[-1,1]].flatMap(([sy,sz],k)=>
        Array.from({length:7},(_,i)=>{
          const a=Math.PI+k*Math.PI/2+i*Math.PI/12;
          return [y+sy*(depth/2-r)+r*Math.cos(a),z+height/2+sz*(height/2-r)+r*Math.sin(a)];
        }));
      const left=x-width/2,right=x+width/2;
      for(let i=0;i<outline.length;i++) {
        const a=outline[i],b=outline[(i+1)%outline.length];
        quad(shell,[left,...a],[left,...b],[right,...b],[right,...a],m.linen);
        tri(shell,[left,y,z+height/2],[left,...b],[left,...a],m.linen);
        tri(shell,[right,y,z+height/2],[right,...a],[right,...b],m.linen);
      }
    }
    function bottle(x,y,z,r,height,finish) {
      cylinder(shell,[x,y,z+height/2],r,r*.86,height,finish,-1,20);
      cylinder(shell,[x,y,z+height+1],r*.55,r*.55,2,black,-1,12);
      bounds(shell,x-r*.5,y-.65,z+height+2,x+r,y+.65,z+height+2.6,black);
    }
    bottle(238,14,120,3.15,12,m.linen);
    bottle(279,8,115,3.3,13,m.walnutTop);
    bottle(293,8,115,3.65,15,m.linen);
    bottle(283,8,140.5,3.1,11,m.linen);
    bottle(297,8,140.5,3.4,12,m.walnutTop);
    const shower=item('Плъзгащ душ параван',bath,[showerStart,94,0],[3.6,142,207]);
    shower.isFixed=true;
    // Two slender planes overlap where the mobile half runs behind the fixed pane.
    function showerPane(x,y1,y2,g) {
      quad(shower,[x,y1,1.2],[x,y2,1.2],[x,y2,201],[x,y1,201],m.glass,g);
      for (const y of [y1,y2-.65]) bounds(shower,x-.5,y,1.2,x+.5,y+.72,201,black,g);
    }
    showerPane(-.65,-70.9,1.9,-1);
    const sg=part(shower,{type:'slide',vec:[0,-67.4,0],kind:'Плъзгащо стъкло',w:72,h:200,
      c:[1,37,108],n:[1,0,0],id:'БС1'});
    shower.walkLeaf={pivot:[.7,-1.9],end:[.7,70.9],part:sg};
    D.walkWalls.push([[showerStart-.65,23.1],[showerStart-.65,95.9]]);
    showerPane(.7,-1.9,70.9,sg);
    bounds(shower,-1.8,-71,.1,1.8,71,1.2,black);
    bounds(shower,-1.8,-71,200.5,1.8,71,204,black);
    bounds(shower,1.4,59,95,3.5,61,112,black,sg);
    // Square rain head and separate hand shower, both in matte black.
    const showerX=299, handX=325;
    const fitting=(x1,y1,z1,x2,y2,z2,finish=black)=>
      bounds(shell,x1,showerFront+y1,z1,x2,showerFront+y2,z2,finish);
    fitting(showerX-4,0,222,showerX+4,1.8,233);
    fitting(showerX-1.5,1.6,226,showerX+1.5,29,229);
    fitting(showerX-1.5,26,220,showerX+1.5,29,227);
    fitting(showerX-12,16,219,showerX+12,40,221.5);
    for(let i=0;i<7;i++) for(let j=0;j<7;j++) {
      cylinder(shell,[showerX-9+i*3,showerFront+19+j*3,218.85],.25,.25,.32,m.steel,-1,6);
    }
    fitting(showerX-4,0,99,showerX+4,2.6,113);
    fitting(showerX-2,2.5,103,showerX+2,6,110);
    fitting(handX-1.5,1,122,handX+1.5,4,144);
    fitting(handX-1.5,3.8,137,handX+1.5,6,144);
    const hosePoint=t=>[handX+(showerX-handX)*t,showerFront+3.6+2.5*Math.sin(Math.PI*t),
      121-18*t-54*Math.sin(Math.PI*t)];
    for(let i=0;i<36;i++) {
      const a=hosePoint(i/36),b=hosePoint((i+1)/36);
      quad(shell,[a[0]-.42,a[1],a[2]],[a[0]+.42,a[1]-.25,a[2]],
        [b[0]+.42,b[1]-.25,b[2]],[b[0]-.42,b[1],b[2]],black);
    }
    fitting(274,5,.15,324,7.2,.55);
    for(let i=0;i<12;i++) fitting(276+i*3.9,5.45,.55,277+i*3.9,6.75,.63,m.steel);
  }

  function buildLaundry() {
    const room='Склад', wood=m.lightwood, trim=m.charcoalEdge, finish=m.beige;
    const laundry=item('Пералня и сушилня',room,[33,32,0],[60,64,170]);
    for(let unit=0;unit<2;unit++) {
      const z=unit*85;
      bounds(laundry,-29.5,-29.5,z,29.5,23,z+84.6,m.white);
      bounds(laundry,-29.5,23,z,29.5,29.5,z+3,m.white);
      bounds(laundry,-29.5,23,z+63,29.5,29.5,z+84.6,m.white);
      bounds(laundry,-28,29.55,z+65,28,30.1,z+81,m.linen);
      bounds(laundry,7,30.12,z+69,25,30.4,z+78,m.tv);
      const centre=z+34;
      const g=part(laundry,{type:'hinge',pivot:[-20,30,centre],axis:[0,0,1],
        angle:96,kind:unit===0?'Врата на пералнята':'Врата на сушилнята',id:'СПУ1',
        w:41,h:41,c:[0,31,centre],n:[0,1,0]});
      const round=(r,y,a)=>[r*Math.cos(a),y,centre+r*Math.sin(a)];
      const outside=a=>Math.min(29.5/Math.max(.0001,Math.abs(Math.cos(a))),
        (Math.sin(a)<0?31:29)/Math.max(.0001,Math.abs(Math.sin(a))));
      const corners=[[29.5,29],[-29.5,29],[-29.5,-31],[29.5,-31]];
      const angles=Array.from({length:48},(_,i)=>i*Math.PI/24).concat(
        corners.map(([x,h])=>(Math.atan2(h,x)+2*Math.PI)%(2*Math.PI))).sort((a,b)=>a-b);
      for(let i=0;i<angles.length;i++) {
        const a=angles[i],b=angles[(i+1)%angles.length];
        quad(laundry,round(outside(a),29.5,a),round(outside(b),29.5,b),
          round(17,29.5,b),round(17,29.5,a),m.white);
        quad(laundry,round(17,23.05,a),round(17,23.05,b),round(17,29.5,b),round(17,29.5,a),m.metal);
        tri(laundry,[0,23.05,centre],round(17,23.05,a),round(17,23.05,b),trim);
        quad(laundry,round(20.4,30.9,a),round(20.4,30.9,b),
          round(16,31.15,b),round(16,31.15,a),trim,g);
        quad(laundry,round(20.4,29.6,a),round(20.4,29.6,b),
          round(20.4,30.9,b),round(20.4,30.9,a),m.steel,g);
        tri(laundry,[0,31.05,centre],round(16,31.05,a),round(16,31.05,b),m.mirror,g);
      }
      bounds(laundry,-22,30.12,z+71,-18,30.65,z+75,trim);
    }

    // A common upper shelf, a narrow bay for long tools and a second bay
    // for cleaning supplies, all on the back wall beside the appliance stack.
    const rack=item('Шкаф за принадлежности и пране',room,[54,32,0],[106,64,250]);
    for(const x of [-52,52])bounds(rack,x-1,-32,0,x+1,31,250,wood);
    bounds(rack,-51,-32,0,51,-30,250,finish);
    for(const z of [196,248])bounds(rack,-51,-30,z,51,31,z+2,wood);
    bounds(rack,11,-30,0,12.6,31,196,wood);
    bounds(rack,28.3,-30,0,29.9,30,155,wood);
    for(const z of [1,154])bounds(rack,12.6,-30,z,51,30,z+1.8,wood);
    for(const z of [34,72,110])bounds(rack,29.9,-30,z,51,29,z+1.5,wood);
    bounds(rack,-50,29,193.8,50,30.3,194.8,m.led);
    // Upright broom and a folded ironing board stored in the narrow bay.
    cylinder(rack,[16.5,18,69],.63,.63,128,m.steel,-1,12);
    bounds(rack,13.5,12,3,19.5,24,8,trim);
    bounds(rack,20,-16,7,25,13,143,m.kitchenTaupe);
    for(const y of [-13,10])bounds(rack,25,y,7,26,y+1.3,121,trim);
    for(const [x,y,z,h,color] of [[37,12,2.8,19,m.linen],[44,12,35.5,18,m.olive],
      [38,15,73.5,16,m.walnutTop],[44,13,111.5,17,m.linen],[39,11,155.8,23,m.linen]]) {
      cylinder(rack,[x,y,z+h/2],3.2,2.8,h,color,-1,20);
      cylinder(rack,[x,y,z+h+1],1.52,1.52,2,trim,-1,12);
    }
    // Keep the basket alongside the heater in the common upper compartment.
    const basketLeft=16, basketRight=48;
    bounds(rack,basketLeft,-12,198.1,basketRight,15,200.3,finish);
    for(const z of [207,221]) {
      for(const y of [-12,15])bounds(rack,basketLeft,y-.6,z,basketRight,y+.6,z+1.7,finish);
      for(const x of [basketLeft,basketRight])bounds(rack,x-.6,-12,z,x+.6,15,z+1.7,finish);
    }
    for(let i=0;i<8;i++)for(const y of [-12,15]) {
      const x=basketLeft+i*(basketRight-basketLeft)/7;
      bounds(rack,x-.5,y-.5,200.3,x+.5,y+.5,222.7,finish);
    }
    for(let i=0;i<5;i++)for(const x of [basketLeft,basketRight]) {
      bounds(rack,x-.5,-11+i*6.3,200.3,x+.5,-10+i*6.3,222.7,finish);
    }

    // Compact horizontal tank above the machines, inside the existing shelving.
    for(const x of [-37,-5])bounds(rack,x-1.5,-13,198,x+1.5,-3,201,trim);
    const boiler=item('Хоризонтален бойлер · склад',room,[33,24,200],[56,40,38]);
    const profile=[[-28,11],[-26.5,15.5],[-23,18.4],[-18,19],[18,19],[23,18.4],[26.5,15.5],[28,11]];
    const ringPoint=([x,r],i)=>{
      const angle=i*Math.PI/24;
      return [x,r*Math.cos(angle),19+r*Math.sin(angle)];
    };
    for(let i=0;i<48;i++) {
      for(let j=1;j<profile.length;j++) {
        const a=profile[j-1],b=profile[j];
        quad(boiler,ringPoint(a,i),ringPoint(a,i+1),ringPoint(b,i+1),ringPoint(b,i),m.white);
      }
      const first=profile[0], last=profile[profile.length-1];
      tri(boiler,[first[0],0,19],ringPoint(first,i),ringPoint(first,i+1),m.linen);
      tri(boiler,[last[0],0,19],ringPoint(last,i+1),ringPoint(last,i),m.linen);
    }
    bounds(boiler,9,17.4,14.2,18,19.65,20.6,m.greige);
    bounds(boiler,10.1,19.65,16.1,17,19.85,19.2,trim);
    bounds(boiler,15.1,19.85,17.3,16.2,19.95,18,m.led);

    // The combi boiler faces the aisle from the wall shared with the bathroom.
    // Show the casing only; the gas project will determine the connections.
    const gasBoiler=item('Двуконтурен газов котел',room,[93,106,128],[40,30,71],90);
    const casing=(width,height,radius,y)=>[[1,1],[-1,1],[-1,-1],[1,-1]]
      .flatMap(([sx,sz],corner)=>Array.from({length:7},(_,i)=>{
        const a=(corner+i/6)*Math.PI/2;
        return [sx*(width/2-radius)+radius*Math.cos(a),y,
          35.5+sz*(height/2-radius)+radius*Math.sin(a)];
      }));
    const back=casing(39,70,2.2,-15), body=casing(40,71,2.8,12.8);
    const frontCover=casing(37.8,68.8,2.15,14.6);
    for(let i=0;i<body.length;i++) {
      const j=(i+1)%body.length;
      quad(gasBoiler,back[i],back[j],body[j],body[i],m.white);
      quad(gasBoiler,body[i],body[j],frontCover[j],frontCover[i],m.white);
      tri(gasBoiler,[0,14.6,35.5],frontCover[j],frontCover[i],m.white);
    }
    bounds(gasBoiler,-13.4,14.58,7.7,13.4,14.9,19.1,m.linen);
    bounds(gasBoiler,-7.3,14.88,11.8,7.3,15,16.6,trim);
    for(const x of [-6.3,0,6.3])bounds(gasBoiler,x-1,14.9,8.9,x+1,15,10.1,m.steel);
    bounds(gasBoiler,-3.5,14.99,13.35,-1.45,15,14.35,m.led);
    gasBoiler.grid={nx:1,ny:1,lo:[0],hi:[71]};
  }
};
