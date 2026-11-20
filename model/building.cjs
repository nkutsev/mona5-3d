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

  // Base, finishes and continuous floor through the door apertures.
  bounds(shell,-16,-14,-12,961,373,-.4,m.greige);
  bounds(shell,74,371,-12,961,696,-.4,m.greige);
  bounds(shell,74,695,-12,926,730,-.4,m.greige);
  floorRect(0,0,114,190,m.tile);
  floorRect(114,0,344,190,46);
  floorRect(0,190,344,372,m.herring);
  floorRect(344,0,814,366,m.herring);
  floorRect(814,0,950,366,m.outtile,false);
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
  bounds(shell,-.1,220,0,1.9,320,210,m.walnut);
  for (const y of [218,320]) bounds(shell,1.9,y,0,4.6,y+2.5,214,m.oak);
  bounds(shell,1.9,218,210,4.6,322.5,214,m.oak);
  bounds(shell,2,230,95,7.2,245,98,m.metal);

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
    quad(divider,[0,y+1.35,3],[0,y+width-1.35,3],[0,y+width-1.35,247],[0,y+1.35,247],m.glass,g);
    for (const edge of [y+.2,y+width-1.6]) bounds(divider,-1.4,edge,1,1.4,edge+1.4,249,m.metal,g);
    for (const z of [1,246.5]) bounds(divider,-1.4,y+1,z,1.4,y+width-1,z+2.4,m.metal,g);
    if (i===5) {
      bounds(divider,1.4,y+46,97,3.8,y+48,99,m.metal,g);
      bounds(divider,1.4,y+46,115,3.8,y+48,117,m.metal,g);
      bounds(divider,3.1,y+46,97,4.8,y+48,117,m.metal,g);
    }
  }

  buildBathroom();
  buildLaundry();

  function buildBathroom() {
    // Looking in from the hall, the shower is at left (east on the drawing).
    // The vanity and WC share a stepped service wall; glass starts at its return.
    const front=23, showerStart=261;
    bounds(shell,120,0,0,showerStart,front,H,46);
    quad(shell,[120,0,65],[showerStart,0,65],[showerStart,front,65],[120,front,65],46);
    D.walkWalls.push([[120,front],[showerStart,front]],[[showerStart,0],[showerStart,front]]);
    bounds(shell,336,0,0,338,185,H,46);
    bounds(shell,120,0,0,121.2,184,H,46);
    // Smooth large-format floor tiles with subtle, sparse joints.
    for (const x of [175,235,295]) bounds(shell,x,.1,.025,x+.28,184,.075,m.taupe);
    for (const y of [65,125]) bounds(shell,120,y,.025,338,y+.28,.075,m.taupe);
    for (const z of [60,120,180,240]) {
      bounds(shell,336-0.12,.5,z,336,184,z+.25,m.taupe);
      bounds(shell,181,front+.01,z,showerStart,front+.15,z+.25,m.taupe);
    }
    // The shader applies the supplied Tangram tile image to these two walls.
    bounds(shell,121.5,front+.1,0,183,front+.8,H,47);
    bounds(shell,showerStart+1,.3,0,336,1,H,47);
    const bath='Баня';
    // Two working drawers, including their boxes and the inset white basin.
    const vanity=item('Окачен шкаф с умивалник',bath,[152.5,45,39],[60,42,48]);
    for (const x of [-29.2,29.2]) bounds(vanity,x-.8,-21,0,x+.8,21,44,m.oak);
    bounds(vanity,-30,-21,0,30,21,1.8,m.oak);
    bounds(vanity,-30,-21,41.3,30,21,43.5,m.oak);
    bounds(vanity,-28.4,-21,1.8,28.4,-19.8,41.3,m.lightwood);
    for(let n=0;n<2;n++) {
      const z=n*20+.8;
      const g=part(vanity,{type:'slide',vec:[0,30,0],kind:'Чекмедже',w:57,h:19,
        c:[0,21,z+10],n:[0,1,0],id:'БЧ1'});
      bounds(vanity,-28.6,19.6,z,28.6,21.3,z+19,m.kwood,g);
      bounds(vanity,-26.7,-15,z+2.2,26.7,19.8,z+3.6,m.lightwood,g);
      for(const x of [-26.7,25.3]) bounds(vanity,x,-15,z+3.6,x+1.4,19.7,z+13,m.oak,g);
      bounds(vanity,-26.7,-15,z+3.6,26.7,-13.6,z+13,m.oak,g);
      bounds(vanity,-16,21.32,z+16.8,16,22,z+17.65,m.metal,g);
    }
    bounds(vanity,-30,-21,43.5,30,21,46,m.white);
    bounds(vanity,-29,-20.4,45.8,29,-12.4,47.5,m.white);
    bounds(vanity,-29,15,45.8,29,20.4,47.5,m.white);
    bounds(vanity,-29,-12.4,45.8,-23,15,47.5,m.white);
    bounds(vanity,23,-12.4,45.8,29,15,47.5,m.white);
    bounds(vanity,-23,-12,46,23,15,46.25,m.linen);
    cylinder(vanity,[0,-4,46.26],1.5,1.5,.24,m.steel);
    cylinder(vanity,[0,-16,53.3],1.55,1.55,13,m.steel);
    bounds(vanity,-1.5,-16,58,1.5,-7.7,60,m.steel);

    // Circular vertical mirror and warm backlit edge on the dry-zone wall.
    const mirror=item('Кръгло огледало с осветление',bath,[152.5,24.9,109],[55,3.8,55]);
    function diskY(object, radius, y, centreZ, material) {
      for(let i=0;i<64;i++) {
        const a=2*Math.PI*i/64, b=2*Math.PI*(i+1)/64;
        tri(object,[0,y,centreZ],[radius*Math.cos(a),y,centreZ+radius*Math.sin(a)],
          [radius*Math.cos(b),y,centreZ+radius*Math.sin(b)],material);
      }
    }
    diskY(mirror,27.5,.45,27.5,m.led);
    diskY(mirror,26.6,.85,27.5,m.oak);
    diskY(mirror,25.9,1.2,27.5,m.mirror);
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
    bounds(shell,209,front+.1,94,231,front+.9,108,m.steel);
    bounds(shell,211,front+.91,97,219.5,front+1.25,105,m.greige);
    bounds(shell,220.4,front+.91,97,228,front+1.25,105,m.greige);
    const heater=item('Дъбов шкаф с бойлер',bath,[220,41.5,116],[65,36,137]);
    for (const x of [-32.5,30.8]) bounds(heater,x,-18,0,x+1.7,18,137,m.oak);
    for (const z of [0,29.5,135.3]) bounds(heater,-32.5,-18,z,32.5,18,z+1.7,m.lightwood);
    bounds(heater,-31,-18,0,31,-16.8,137,m.oak);
    cylinder(heater,[0,-1.8,83],25.2,14.4,96,m.white);
    cylinder(heater,[0,-1.8,131.2],24.7,14.1,1.8,m.linen);
    bounds(heater,-10,11.9,37,10,13.1,47,m.greige);
    for(let i=0;i<3;i++) {
      bounds(heater,-22,-7,3+i*4.5,11,11,6.9+i*4.5,i===1?m.greige:m.linen);
    }
    for(const side of [-1,1]) {
      const pivot=side*31.6;
      const g=part(heater,{type:'hinge',pivot:[pivot,17.4,2],axis:[0,0,1],angle:-side*98,
        kind:'Врата на шкаф',w:31,h:133,id:'БВ1',c:[side*15.5,18.5,67],n:[0,1,0]});
      bounds(heater,side<0?-31.6:.3,16.7,1.8,side<0?-.3:31.6,18.5,135.1,m.kwood,g);
      bounds(heater,side*2.7-.4,18.5,57,side*2.7+.4,19.65,77,m.metal,g);
    }
    const shower=item('Плъзгащ душ параван',bath,[showerStart,94,0],[3.6,142,207]);
    shower.isFixed=true;
    // Two slender planes overlap where the mobile half runs behind the fixed pane.
    function showerPane(x,y1,y2,g) {
      quad(shower,[x,y1,1.2],[x,y2,1.2],[x,y2,201],[x,y1,201],m.glass,g);
      for (const y of [y1,y2-.65]) bounds(shower,x-.5,y,1.2,x+.5,y+.65,201,m.steel,g);
    }
    showerPane(-.65,-70.9,1.9,-1);
    const sg=part(shower,{type:'slide',vec:[0,-67.4,0],kind:'Плъзгащо стъкло',w:72,h:200,
      c:[1,37,108],n:[1,0,0],id:'БС1'});
    shower.walkLeaf={pivot:[.7,-1.9],end:[.7,70.9],part:sg};
    D.walkWalls.push([[showerStart-.65,23.1],[showerStart-.65,95.9]]);
    showerPane(.7,-1.9,70.9,sg);
    bounds(shower,-1.8,-71,.1,1.8,71,1.2,m.steel);
    bounds(shower,-1.8,-71,200.5,1.8,71,204,m.steel);
    bounds(shower,1.4,59,95,3.5,61,112,m.steel,sg);
    // Mixer, riser, overhead and hand showers on the recessed face.
    const showerX=299;
    cylinder(shell,[showerX,4.6,161],.95,.95,123,m.steel);
    bounds(shell,showerX-.9,4,221,showerX+.9,27,222.8,m.steel);
    cylinder(shell,[showerX,27,218.7],10.5,9.8,2.6,m.steel);
    bounds(shell,showerX-11.5,3,101,showerX+11.5,7.6,104.8,m.steel);
    cylinder(shell,[showerX+10,6.25,138],1.15,1.15,36,m.steel);
    bounds(shell,showerX+6,5.7,155,showerX+14,9,161,m.steel);
    bounds(shell,274,6,.15,324,8.2,.55,m.steel);
    for(let i=0;i<12;i++) bounds(shell,276+i*3.9,6.45,.55,277+i*3.9,7.75,.63,m.metal);
  }

  function buildLaundry() {
    const laundry=item('Пералня и сушилня', 'Склад', [52,32,0],[60,60,170]);
    for(let unit=0;unit<2;unit++) {
      const z=unit*85;
      bounds(laundry,-29.5,-29.5,z,29.5,29.5,z+84.6,m.white);
      bounds(laundry,-28,29.55,z+65,28,30.1,z+81,m.linen);
      bounds(laundry,7,30.12,z+69,25,30.4,z+78,m.tv);
      const rings=[[20.2,30.25,m.steel],[18.9,30.5,m.metal],[15.7,30.7,m.mirror]];
      for(const [r,y,material] of rings) {
        for(let i=0;i<36;i++) {
          const a=i*Math.PI/18,b=(i+1)*Math.PI/18;
          tri(laundry,[0,y,z+38],[r*Math.cos(a),y,z+38+r*Math.sin(a)],
            [r*Math.cos(b),y,z+38+r*Math.sin(b)],material);
        }
      }
    }
  }
};
