'use strict';

module.exports = function hall(scene, {item, box, cylinder, tri, part}) {
  const m = scene.mats;
  const room = 'Антре';
  const wood = m.kitchenVeneer, trim = m.charcoalEdge;

  // The hall face of the kitchen wall is at Y=362 and ends at X=235.
  const panel = item('Дървесна облицовка с високо огледало',room,[47,360,0],[94,4,258]);
  box(panel,[0,.7,129],[94,2.6,258],m.hallVeneer);
  box(panel,[-21,-.9,128],[44,.8,252],trim);
  box(panel,[-21,-1.5,128],[43,.6,251],m.mirror);
  box(panel,[3,-1.28,133],[.75,.55,234],m.led);
  box(panel,[44,-1.28,133],[.75,.55,234],m.led);
  box(panel,[0,-1.3,255.8],[91,1.05,.65],m.led);

  function drawer(object,x,y,z,width,depth,height,travel,id,extra={}) {
    const g = part(object,{type:'slide',vec:[0,-travel,0],kind:'Чекмедже',id,
      w:width,h:height,c:[x,y,z],n:[0,-1,0],...extra});
    box(object,[x,y+.85,z],[width,1.7,height-.55],wood,g);
    box(object,[x,y+1,z+height/2-.55],[width-1,1.9,.7],trim,g);
    box(object,[x,y+depth/2,z-height/2+1.5],[width-3,depth-2,1.2],m.lightwood,g);
    for(const side of [-1,1]) {
      box(object,[x+side*(width/2-2),y+depth/2,z-1.7],[1.1,depth-2,height-4],wood,g);
    }
    box(object,[x,y+depth-1.25,z-1.7],[width-4,1.2,height-4],wood,g);
  }

  const console = item('Окачена конзола с две чекмеджета',room,[49,348.5,83],[78,23,18]);
  for(const z of [1,17])box(console,[0,0,z],[78,23,2],wood);
  for(const x of [-38.1,0,38.1])box(console,[x,.7,9],[1.8,21.5,14],wood);
  box(console,[0,10.5,9],[74,2,14],wood);
  for(const x of [-19.25,19.25])drawer(console,x,-11.5,9,37,19,14.5,16,'АК1');

  const seat = item('Тапицирана пейка за обувки',room,[48,321,0],[71,34,45]);
  box(seat,[0,0,3],[67,30,6],trim);
  box(seat,[0,15.5,18],[70,2,25],wood);
  for(const x of [-34.3,0,34.3])box(seat,[x,0,18],[1.4,34,25],wood);
  for(const x of [-17.15,17.15])drawer(seat,x,-17,18,32.5,27,23,22,'АО1');
  box(seat,[0,0,32],[71,34,4],m.boucle);
  // Rounded padded channels along the upholstered seat.
  for(let rib=0;rib<7;rib++) {
    const x=(rib-3)*10;
    const segments=24;
    const ring=(y,rx,rz)=>Array.from({length:segments},(_,n)=>{
      const a=n*2*Math.PI/segments;
      return [x+rx*Math.cos(a),y,36+rz*Math.sin(a)];
    });
    const section=[
      ring(-17,1.5,2.3),ring(-16,3.9,5.8),ring(-13.5,5.05,8.5),
      ring(13.5,5.05,8.5),ring(16,3.9,5.8),ring(17,1.5,2.3)
    ];
    for(let k=1;k<section.length;k++)for(let n=0;n<segments;n++) {
      const j=(n+1)%segments, a=section[k-1], b=section[k];
      tri(seat,a[n],a[j],b[j],m.boucle);
      tri(seat,a[n],b[j],b[n],m.boucle);
    }
    for(const end of [0,section.length-1]) {
      const row=section[end];
      for(let n=1;n<segments-1;n++)tri(seat,row[0],row[n],row[n+1],m.boucle);
    }
  }

  const closet = item('Вграден гардероб · антре',room,[164.5,335,0],[141,54,258]);
  box(closet,[0,0,4],[141,54,8],trim);
  for(const z of [9,256.5])box(closet,[0,0,z],[141,54,3],wood);
  box(closet,[0,26,132],[141,2,246],wood);
  for(const x of [-69.5,0,69.5])box(closet,[x,1,132],[2,52,245],wood);
  for(const x of [-34.5,34.5])box(closet,[x,1,216],[67,48,2],wood);
  box(closet,[-34.5,1,34],[67,48,2],wood);
  box(closet,[-34.5,2,202],[65,1.8,1.8],m.steel);
  for(const z of [76,112,148,184])box(closet,[34.5,1,z],[67,48,2],wood);
  const doors=[];
  for(const [x,hinge,angle] of [[-52,-69,-94],[-17.2,-.8,94],[17.2,.8,-94],[52,69,94]]) {
    const front=part(closet,{type:'hinge',pivot:[hinge,-26,0],axis:[0,0,1],angle,
      kind:'Врата на гардероба',id:'АГ1',w:34,h:246,c:[x,-27,132],n:[0,-1,0],
      ...(x===52 ? {parent:doors[2],link:true,follow:false} : {})});
    doors.push(front);
    box(closet,[x,-26,132],[33.6,2,246],wood,front);
    const pullX=x+Math.sign(x-hinge)*13;
    box(closet,[pullX,-27,105],[.75,.24,16],trim,front);
  }
  for(const z of [23,43,63]) {
    drawer(closet,34.5,-23.5,z,65,42,17,33,'АЧ1',{parent:doors[2],follow:false});
  }

  const vase = item('Керамична ваза · антре',room,[63,350,101],[14,12,39]);
  for(const [z,rx,ry,h] of [[4,4.3,3.3,8],[9,5.1,3.8,6],[14,3.4,2.7,5],[17,2,1.7,3]]) {
    cylinder(vase,[0,0,z],rx,ry,h,m.linen,-1,24);
  }
  for(let n=0;n<7;n++) {
    const x=(n-3)*1.8, y=Math.sin(n*1.9)*4, z=30+n%3*4;
    tri(vase,[0,0,17],[x+.35,y,z],[x,y,z+2],m.olive);
    tri(vase,[x*.55,y*.55,(z+17)*.5],[x,y,z-1],[x-1,y+1,z],m.walnutTop);
  }
};
