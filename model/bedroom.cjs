'use strict';

module.exports = function bedroom(scene, {item, box, cylinder, part, tri}) {
  const room='Спалня', m=scene.mats;
  const wood=m.kitchenVeneer, black=m.charcoalEdge;

  function quad(o,a,b,c,d,finish,group=-1) {
    tri(o,a,b,c,finish,group);
    tri(o,a,c,d,finish,group);
  }
  function rounded(width,depth,radius) {
    return [[1,1],[-1,1],[-1,-1],[1,-1]].flatMap(([x,y],corner)=>
      Array.from({length:9},(_,i)=>{
        const a=(corner+i/8)*Math.PI/2;
        return [x*(width/2-radius)+radius*Math.cos(a),y*(depth/2-radius)+radius*Math.sin(a)];
      }));
  }
  function loft(o,rings,finish) {
    const count=rings[0].length;
    for(let j=0;j<count;j++) {
      const next=(j+1)%count;
      for(let i=1;i<rings.length;i++) {
        const a=rings[i-1], b=rings[i];
        quad(o,a[j],a[next],b[next],b[j],finish);
      }
    }
    const first=rings[0], last=rings[rings.length-1];
    for(let j=1;j<count-1;j++) {
      tri(o,first[0],first[j+1],first[j],finish);
      tri(o,last[0],last[j],last[j+1],finish);
    }
  }
  function turned(o,profile,finish) {
    loft(o,profile.map(([z,r])=>Array.from({length:48},(_,i)=>{
      const a=i*Math.PI/24;
      return [r*Math.cos(a),r*Math.sin(a),z];
    })),finish);
  }

  const wall=item('Орехова стена с LED осветление',room,[608,2,0],[400,5,260]);
  wall.isFixed=true;
  box(wall,[0,-1.1,127],[400,1.8,254],black);
  for(let i=0;i<8;i++) {
    box(wall,[-175+i*50,.2,126.8],[49.5,2.4,253.6],m.bedroomVeneer);
  }
  box(wall,[0,.7,255.7],[398,2.4,.8],m.led);
  box(wall,[0,0,258.8],[400,4,2.4],m.wall);
  for(const x of [500,736]) {
    const local=x-wall.anchor[0];
    box(wall,[local,1.7,65],[24,1,7.5],black);
    for(const dx of [-7,-2,3,8])box(wall,[local+dx,2.25,65],[3.15,.2,3.15],m.charcoal);
  }

  // Keep the bed centred on the existing axis and its foot behind the passage.
  const bed=item('Двойно легло с тапицирана табла',room,[618,112,0],[181,210,114]);
  function cushion(x,y,profile,color) {
    loft(bed,profile.map(([z,w,d,r])=>rounded(w,d,r).map(([a,b])=>[x+a,y+b,z])),color);
  }
  cushion(0,3,[[1,169,194,8],[5,171,195,9]],black);
  cushion(0,3,[[4,173,196,9],[8,180,200,12],[31,180,200,12],[35,176,196,10]],m.bedroomFabric);
  cushion(0,5,[[35,174,194,10],[40,178,198,12],[57,178,198,12],[62,174,194,10]],m.linen);
  // The two soft covers in the reference meet along a narrow centre seam.
  for(const x of [-44,44]) {
    cushion(x,23,[[60.8,84,157,7],[62,87.4,161,9],[65,87.4,161,9],[66,85.3,159,8]],m.bedroomFabric);
    cushion(x,-67,[[61.5,69,33,10],[63.5,73,37,11],[66,75,38,12],
      [69.5,74,37,12],[72,70,34,11],[74,61,27,9]],m.linen);
  }
  const paddedBack=[[1,168,103,14],[4,180,112,19],[11,181,114,21],[16,171,108,19]];
  loft(bed,paddedBack.map(([depth,w,h,r])=>rounded(w,h,r)
    .map(([x,z])=>[x,-106+depth,z+57])),m.bedroomFabric);
  bed.grid={nx:1,ny:1,lo:[0],hi:[114]};

  for(const [name,x] of [['ляво',500],['дясно',736]]) {
    const hasLamp=name==='дясно';
    const table=item('Кръгла нощна масичка · '+name,room,[x,33,0],[38,38,hasLamp?73:46]);
    turned(table,[[0,13.9],[1.4,14.5],[6,13.8],[40,8.8],[43,9.5]],wood);
    turned(table,[[41.8,16.8],[42.5,19],[45,19],[45.8,18.5],[45.5,17.5],[44.2,17.3]],m.walnutTop);
    if(hasLamp) {
      cylinder(table,[0,0,46.6],7,7,1.8,m.olive);
      cylinder(table,[0,0,54.8],.7,.7,16,m.olive);
      turned(table,[[62,9],[64.5,9.2],[68.1,7.8],[71.4,4.5],[72.6,1.4]],m.olive);
      cylinder(table,[0,0,62.2],7.7,7.7,.5,m.led);
    }
    table.grid={nx:1,ny:1,lo:[0],hi:[46]};
  }
  for(const [i,x,y,tip] of [[1,490,39,101],[2,507,47,120]]) {
    const pendant=item('Черен пендел · спалня '+i,room,[x,y,tip],[6,6,260-tip]);
    cylinder(pendant,[0,0,258-tip],3,3,4,black);
    cylinder(pendant,[0,0,(255-tip+44)/2],.22,.22,255-tip-44,black,-1,12);
    cylinder(pendant,[0,0,22.2],1.45,1.45,44,black);
    cylinder(pendant,[0,0,.25],1.16,1.16,.5,m.led);
  }
  const rail=item('Линейно осветление · спалня',room,[609,186,257],[3,210,3]);
  box(rail,[0,0,2],[2.5,210,2],m.track);
  for(const y of [-59,55])box(rail,[0,y,.85],[1.8,39,.7],m.trackLight);

  const ac=item('Климатик · спалня',room,[472,13,216],[77,18,27]);
  loft(ac,[[0,70,14,4],[3,75,17,5],[22,77,18,5],[25,73,16,4]]
    .map(([z,w,d,r])=>rounded(w,d,r).map(([x,y])=>[x,y,z])),m.white);
  box(ac,[0,8.2,5],[69,1,3.6],m.greige);
  box(ac,[0,8.7,4.8],[65,.4,1.15],m.charcoal);
  box(ac,[28,9,13],[1.25,.2,.7],m.led);

  const wardrobe=item('Гардероб с осветена витрина',room,[381.5,113,0],[216,63,256],-90);
  box(wardrobe,[0,0,4],[216,62,8],black);
  for(const z of [9.3,254.7])box(wardrobe,[0,0,z],[216,62,2.6],black);
  box(wardrobe,[0,-29,132],[215,3,244],wood);
  for(const x of [-106.7,-53.6,0,53.6,106.7])box(wardrobe,[x,-.75,132],[2,58,244],wood);
  for(const x of [-80.3,-26.8,26.8,80.3]) {
    box(wardrobe,[x,0,205],[51,57,2],wood);
  }
  for(const x of [-80.3,-26.8]) {
    box(wardrobe,[x,0,66],[51,57,2],wood);
    box(wardrobe,[x,3.5,193],[50,2.1,2.1],black);
    box(wardrobe,[x,20,247],[48,1.1,1.2],m.led);
    box(wardrobe,[x-22.2,26,130],[1,1.25,227],m.led);
  }
  for(const z of [42,81,120,159])box(wardrobe,[80.3,0,z],[51,55,2],wood);

  const fronts=[];
  for(const [x,pivot,angle,glazed] of [[-80.3,-106.4,90,true],[-26.8,-.8,-90,true],
    [26.8,.8,90,false],[80.3,106.4,-90,false]]) {
    const g=part(wardrobe,{type:'hinge',pivot:[pivot,30,0],axis:[0,0,1],angle,
      kind:glazed?'Остъклена врата':'Матова врата',w:52.4,h:245,
      c:[x,30,131],n:[0,1,0],id:glazed?'СО1':'СМ1'});
    fronts.push(g);
    if(glazed) {
      for(const dx of [-25,25])box(wardrobe,[x+dx,30,131],[2.4,2.2,245],black,g);
      for(const z of [9.7,252.3])box(wardrobe,[x,30,z],[48,2.2,2.4],black,g);
      quad(wardrobe,[x-24,30,11],[x+24,30,11],[x+24,30,251],[x-24,30,251],m.smokedGlass,g);
    } else {
      box(wardrobe,[x,30,131],[52.4,2.2,245],m.bedroomMatte,g);
    }
    const handle=x+Math.sign(x-pivot)*(glazed?23.3:24.2);
    box(wardrobe,[handle,31.3,109],[1.05,.65,glazed?19:24],black,g);
  }

  for(const [i,x] of [-80.3,-26.8].entries()) {
    for(const z of [19,37,55]) {
      const g=part(wardrobe,{type:'slide',vec:[0,36,0],parent:fronts[i],follow:false,
        kind:'Вътрешно чекмедже',w:48,h:15,c:[x,26,z],n:[0,1,0],id:'СЧ1'});
      box(wardrobe,[x,25.5,z],[48,1.7,15],m.charcoal,g);
      box(wardrobe,[x,26.15,z+6.8],[47,.75,1.1],black,g);
      box(wardrobe,[x,1,z-6],[45,46,1.5],wood,g);
      box(wardrobe,[x,-21.5,z],[45,1.5,12],wood,g);
      for(const dx of [-22,22])box(wardrobe,[x+dx,1,z],[1.5,46,12],wood,g);
    }
  }
  const lift=part(wardrobe,{type:'slide',vec:[0,28,-34],parent:fronts[2],follow:false,
    kind:'Спускащ се лост за дрехи',w:46,h:43,c:[26.8,13,183],n:[0,1,0],id:'СЛ1'});
  box(wardrobe,[26.8,12,192],[47,2,2],black,lift);
  for(const dx of [-23,23])box(wardrobe,[26.8+dx,12,174],[1.25,2,39],m.metal,lift);
  box(wardrobe,[26.8,12,163],[1.1,1.4,56],black,lift);
};
