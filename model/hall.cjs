'use strict';

module.exports = function hall(scene, {item, box, cylinder, tri, part}) {
  const m=scene.mats, room='Антре';
  const oak=m.lightwood, wood=m.kitchenVeneer, face=m.beige, dark=m.charcoalEdge;
  // The kitchen wall runs from X=0 to X=235 at Y=362.
  const layout={mirrorEnd:54,benchEnd:157,end:235};
  const {mirrorEnd,benchEnd,end}=layout;
  const benchX=(mirrorEnd+benchEnd)/2;
  const closetX=(benchEnd+end)/2;

  function door(object,{x,z,w,h,y,pivot,angle,id}) {
    const group=part(object,{type:'hinge',pivot:[pivot,y,0],axis:[0,0,1],angle,
      kind:'Врата на шкаф',id,w,h,c:[x,y,z],n:[0,-1,0]});
    box(object,[x,y,z],[w-1,1.8,h],face,group);
    const at=x+Math.sign(x-pivot)*(w/2-4);
    if(h>100) box(object,[at,y-1.25,z-40],[1.15,.8,13],dark,group);
    else cylinder(object,[at,y-1.35,z-h/2+4.5],1.05,.8,1.9,dark,group,16);
  }
  function drawer(object,x,y,z,w,depth,h,id) {
    const group=part(object,{type:'slide',vec:[0,-22,0],kind:'Чекмедже за обувки',
      id,w,h,c:[x,y,z],n:[0,-1,0]});
    box(object,[x,y,z],[w-1,1.8,h],face,group);
    box(object,[x,y-1.1,z+h/2-3.6],[12,1,.85],dark,group);
    box(object,[x,y+depth/2,z-h/2+1.4],[w-4,depth-2,1.4],oak,group);
    for(const dx of [-1,1])box(object,[x+dx*(w/2-2.4),y+depth/2,z-1.8],[1.35,depth-2,h-5],oak,group);
    box(object,[x,y+depth-1.5,z-1.8],[w-4,1.35,h-5],oak,group);
  }

  const mirror=item('Огледало до пода · антре',room,[27,360,0],[54,5,206]);
  box(mirror,[0,.8,103],[54,2.4,206],oak);
  function outline(w,h,r,y,z) {
    return [[1,1],[-1,1],[-1,-1],[1,-1]].flatMap(([sx,sz],k)=>
      Array.from({length:9},(_,i)=>{
        const a=(k+i/8)*Math.PI/2;
        return [sx*(w/2-r)+r*Math.cos(a),y,z+sz*(h/2-r)+r*Math.sin(a)];
      }));
  }
  for(const [w,h,r,y,z,finish] of [[46,201,4,-1.2,100.5,dark],[44,199,3.2,-1.48,100.5,m.mirror]]) {
    const ring=outline(w,h,r,y,z);
    for(let i=0;i<ring.length;i++)tri(mirror,[0,y,z],ring[i],ring[(i+1)%ring.length],finish);
  }
  box(mirror,[-24,-1.2,100],[.7,.65,196],m.led);
  box(mirror,[0,-1.2,202.5],[48,.65,.65],m.led);

  const bench=item('Пейка с ламели и закачалки',room,[benchX,342,0],[103,40,206]);
  box(bench,[0,18.7,126],[103,2.4,158],dark);
  for(let i=0;i<19;i++)box(bench,[-48.6+i*5.4,17.1,127],[4.7,2.8,156],wood);
  for(const x of [-50.5,50.5])box(bench,[x,0,24],[2,40,48],oak);
  box(bench,[0,0,3.25],[103,39,6.5],oak);
  box(bench,[0,0,40.5],[103,40,2.4],oak);
  box(bench,[0,16.75,203.7],[100,1.2,1],m.led);
  box(bench,[0,.4,44],[99,36,5.1],m.bedroomMatte);
  for(const x of [-37,-12.4,12.4,37]) {
    box(bench,[x,15.05,151.5],[1.5,1.4,13],dark);
    box(bench,[x,12.9,146],[1.5,4.1,1.7],dark);
    box(bench,[x,10.8,148],[1.5,1.25,5.4],dark);
  }
  for(const x of [-25.6,25.6])drawer(bench,x,-19.8,23,49,32,31,'АО2');

  const closet=item('Светъл гардероб · антре',room,[closetX,336,0],[78,52,206]);
  box(closet,[0,24.8,104],[78,2.4,204],oak);
  box(closet,[0,0,3.1],[78,52,6.2],oak);
  for(const x of [-38,0,38])box(closet,[x,0,106],[1.8,52,200],oak);
  for(const z of [7.1,43,204.7])box(closet,[0,0,z],[78,51.5,1.8],oak);
  box(closet,[-19.1,0,179],[36,44,2],oak);
  box(closet,[-19.1,0,170],[35,1.8,1.8],dark);
  for(const z of [75,113,151,184])box(closet,[19.1,1,z],[36,46,1.8],oak);
  for(const [x,pivot,angle] of [[-19.45,-38,-90],[19.45,38,90]]) {
    door(closet,{x,z:124.6,w:37.6,h:160,y:-25.15,pivot,angle,id:'АГ2'});
    drawer(closet,x,-25.15,24.4,37.1,43,34,'АО3');
  }

  const overhead=item('Горни шкафове · антре',room,[117.5,336,206],[235,52,52]);
  box(overhead,[0,24.9,26],[235,2.2,52],oak);
  for(const z of [1.05,50.95])box(overhead,[0,0,z],[235,51.5,2.1],oak);
  const breaks=[0,54,105.5,157,196,235];
  for(let i=0;i<breaks.length;i++) {
    const x=Math.max(1,Math.min(234,breaks[i]))-117.5;
    box(overhead,[x,.25,26],[2,49.5,49.6],oak);
  }
  for(let i=1;i<breaks.length;i++){
    const left=breaks[i-1]-117.5, right=breaks[i]-117.5;
    const hingeLeft=i%2===1;
    door(overhead,{x:(left+right)/2,z:26,w:right-left-.6,h:48.2,y:-25.15,
      pivot:hingeLeft?left+1.4:right-1.4,angle:hingeLeft?-90:90,id:'АГ3'});
  }
  box(overhead,[benchX-117.5,11,-.25],[100,1,.55],m.led);
};
