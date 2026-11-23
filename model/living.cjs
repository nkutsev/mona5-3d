'use strict';

module.exports = function living(scene,{item,box,cylinder,tri,part},place) {
  const m=scene.mats, room='Дневна и кабинет', oak=m.livingOak;
  const fabric=m.bedroomFabric, dark=m.charcoalEdge;
  function quad(o,a,b,c,d,finish) {
    tri(o,a,b,c,finish);
    tri(o,a,c,d,finish);
  }
  function loft(o,rings,finish) {
    const n=rings[0].length;
    for(let j=0;j<n;j++) {
      const k=(j+1)%n;
      for(let i=1;i<rings.length;i++)quad(o,rings[i-1][j],rings[i-1][k],rings[i][k],rings[i][j],finish);
    }
    const bottom=rings[0], top=rings[rings.length-1];
    for(let i=1;i<n-1;i++) {
      tri(o,bottom[0],bottom[i+1],bottom[i],finish);
      tri(o,top[0],top[i],top[i+1],finish);
    }
  }
  function upholstery(o,centre,[w,d,h],finish,tilt=0) {
    const [x,y,z]=centre, c=Math.cos(tilt), s=Math.sin(tilt);
    const bevel=Math.min(w,d,h)*.23;
    const rings=[[-h/2,bevel],[-h/2+bevel*.45,bevel*.3],[-h/2+bevel,0],
      [h/2-bevel,0],[h/2-bevel*.45,bevel*.3],[h/2,bevel]];
    loft(o,rings.map(([height,inset])=>[[1,1],[-1,1],[-1,-1],[1,-1]].flatMap(([sx,sy],corner)=>
      Array.from({length:7},(_,i)=>{
        const a=(corner+i/6)*Math.PI/2, r=bevel-inset*.5;
        const u=sy*(d/2-inset-r)+r*Math.sin(a);
        return [x+sx*(w/2-inset-r)+r*Math.cos(a),y+u*c+height*s,z-u*s+height*c];
      }))),finish);
  }
  function turned(o,profile,finish,segments=64) {
    loft(o,profile.map(([z,r])=>Array.from({length:segments},(_,i)=>{
      const a=i*2*Math.PI/segments;
      return [r*Math.cos(a),r*Math.sin(a),z];
    })),finish);
  }

  const sofa=item('Ъглов диван с лежанка',room,[659,627,0],[250,168,88]);
  // The chaise faces the media wall and sits on the window side.
  for(const [x,y,w,d] of [[-42,31,164,98],[82,-1,84,164]]) {
    upholstery(sofa,[x,y,20.5],[w,d,29],fabric);
    for(const dx of [-w/2+8,w/2-8])for(const dy of [-d/2+7,d/2-7]) {
      box(sofa,[x+dx,y+dy,4.5],[7,7,9],oak);
    }
  }
  upholstery(sofa,[-64,23,40],[93,78,15],fabric);
  upholstery(sofa,[18,23,40],[68,78,15],fabric);
  upholstery(sofa,[81,-6,40],[77,151,15],fabric);
  upholstery(sofa,[-114,30,48],[21,95,43],fabric);
  upholstery(sofa,[114,47,48],[21,64,43],fabric);
  upholstery(sofa,[0,73,58],[225,19,47],fabric,.09);
  for(const [x,w] of [[-66,86],[19,73],[83,74]])upholstery(sofa,[x,61,64],[w,20,44],fabric,.14);
  for(const [x,y,w,h,finish] of [[-92,48,33,32,m.linen],[-65,45,32,30,m.livingDrape],
    [68,47,32,33,m.linen],[92,52,27,29,m.livingDrape]]) {
    upholstery(sofa,[x,y,59],[w,14,h],finish,.25);
  }
  const nx=15,ny=10;
  const lo=[],hi=[];
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++) {
    const x=(i+.5)*250/nx-125,y=(j+.5)*168/ny-84;
    const occupied=y>=-18||x>=38;
    lo.push(occupied?0:-1);
    hi.push(occupied?88:-1);
  }
  sofa.grid={nx,ny,lo,hi};

  const rug=place('Rug (living room)','Килим в дневната',room,[660,553,.15],0,[278/270,208/270,1.4]);
  rug.mat.fill(m.livingRug);
  const table=item('Кръгла дъбова холна маса',room,[634,532,0],[76,76,36]);
  turned(table,[[0,32],[1.6,33],[33.4,34.9],[35,33]],oak);
  for(let i=0;i<72;i++) {
    const a=i*2*Math.PI/72,b=a+.050;
    const p=(t,r,z)=>[r*Math.cos(t),r*Math.sin(t),z];
    const inner=34, outer=37;
    quad(table,p(a,outer,2.3),p(b,outer,2.3),p(b,outer,33),p(a,outer,33),oak);
    quad(table,p(a,inner,2.3),p(a,outer,2.3),p(a,outer,33),p(a,inner,33),oak);
    quad(table,p(b,outer,2.3),p(b,inner,2.3),p(b,inner,33),p(b,outer,33),oak);
  }
  turned(table,[[32.9,36.7],[33.8,38],[35.3,38],[36,37]],oak);
  table.grid={nx:1,ny:1,lo:[0],hi:[36]};
  const tray=item('Поднос със свещи · хол',room,[633,533,36],[34,34,11]);
  turned(tray,[[0,15.75],[.75,17],[1.65,16.9],[2.3,15.7]],m.walnutTop);
  for(const [x,y,h] of [[-6,-2,5],[4,6,6],[7,-5,8]]) {
    cylinder(tray,[x,y,1.5+h/2],3.1,3.1,h,m.linen);
    cylinder(tray,[x,y,2+h],.36,.36,1.35,m.led,-1,8);
  }

  const console=item('Окачен ТВ шкаф',room,[668,390,20],[272,35,35]);
  for(const z of [1.15,33.85])box(console,[0,0,z],[272,34,2.3],oak);
  box(console,[0,-16.4,17.5],[270,1.4,32.7],oak);
  for(const x of [-134.9,-68,0,68,134.9])box(console,[x,-.3,17.5],[1.95,32.4,31.5],oak);
  for(const x of [-102,-34,34,102]) {
    const g=part(console,{type:'slide',vec:[0,32,0],kind:'Чекмедже на ТВ шкафа',
      id:'TV1',w:65.7,h:30.8,c:[x,16.7,17.5],n:[0,1,0]});
    box(console,[x,16.45,17.5],[65.7,2.1,30.8],oak,g);
    box(console,[x,17.4,32.5],[64.8,.7,.65],m.kitchenTaupe,g);
    box(console,[x,.2,4.5],[62,29.5,1.5],m.lightwood,g);
    box(console,[x,-13.8,14.2],[62,1.5,19],m.lightwood,g);
    for(const dx of [-30,30])box(console,[x+dx,.2,14.2],[1.4,28,19],m.lightwood,g);
  }
  box(console,[0,9,-.24],[266,1.3,.46],m.led);

  const panel=item('Ламели зад телевизора',room,[647,374.6,55],[156,5.2,200]);
  box(panel,[0,-1.05,99.5],[156,2.6,199],m.kitchenTaupe);
  for(let x=-75.5;x<77;x+=3.1)box(panel,[x,.75,99.5],[2.3,2.5,199],oak);
  for(const x of [-77.2,77.2])box(panel,[x,-.9,99.5],[.72,1.8,198],m.led);
  box(panel,[0,-.48,199.45],[154,1.15,.65],m.led);
  const cove=item('Топло скрито осветление · дневна',room,[671,374.5,254],[298,4.6,5.5]);
  cove.isFixed=true;
  box(cove,[0,0,4.15],[298,4.6,2.7],m.wall);
  box(cove,[0,1.72,2],[294,1,.65],m.led);
  place('TV','Телевизор',room,[647,378.7,96],180,[.82,1,.82]);

  const vase=item('Керамична ваза с клони · дневна',room,[778,391,55],[27,22,52]);
  turned(vase,[[0,5.8],[1.5,7.2],[13,8.7],[24,6.4],[26,4.1]],m.kitchenTaupe,32);
  for(let i=0;i<9;i++) {
    const a=i*2.4,x=Math.cos(a),y=Math.sin(a),z=41+i%4*3;
    tri(vase,[x,y,25],[x*12,y*10,z],[x*12+.65,y*10,z-.2],m.walnutTop);
    tri(vase,[x*7,y*6,(z+25)/2],[x*12-y*3,y*10+x*3,z+3],
      [x*12-y*3+.45,y*10+x*3,z+2.6],m.walnutTop);
  }
  const lamp=item('Подова лампа с текстилен абажур',room,[923,500,0],[29,29,151]);
  cylinder(lamp,[0,0,1.3],12,12,2.6,m.gold);
  cylinder(lamp,[0,0,65],.75,.75,129,m.gold,-1,24);
  turned(lamp,[[125,14.5],[150,11.85],[150.2,11.55],[125.2,14.18]],m.linen);
  cylinder(lamp,[0,0,126.6],11.5,11.5,.5,m.led);

  // Keep the curtain folds to the window side of the open balcony door.
  const curtains=item('Завеси и воал · дневна',room,[946.7,509.5,0],[6,225,259]);
  curtains.isFixed=true;
  box(curtains,[0,0,258],[5.8,225,1.6],m.linen);
  function folds(from,to,width,period,depth,x,finish) {
    const intervals=Math.ceil((to-from)/width);
    const point=i=>{
      const y=from+(to-from)*i/intervals;
      return [x+depth*Math.cos((y-from)*2*Math.PI/period),y];
    };
    for(let i=0;i<intervals;i++) {
      const a=point(i),b=point(i+1);
      quad(curtains,[...a,1.4],[...b,1.4],[...b,257.1],[...a,257.1],finish);
    }
  }
  folds(-111,111,.7,4.33,.52,1.8,m.livingSheer);
  for(const [from,to] of [[-111,-73],[73,111]])folds(from,to,.55,5.7,1.45,-.5,m.livingDrape);

  const plant=item('Зелено растение в плетена кашпа',room,[558,581,0],[37,37,68]);
  turned(plant,[[0,10],[1.2,11.2],[19,13.4],[20.2,13.6],[20.9,12.7]],m.lightwood,40);
  for(let z=2;z<19;z+=1.7)cylinder(plant,[0,0,z],11.3+z*.11,11.3+z*.11,.31,m.walnutTop,-1,40);
  for(let i=0;i<11;i++) {
    const a=i*2.4,x=Math.cos(a),y=Math.sin(a),h=39+(i%4)*7,len=12+i%3*2.6;
    tri(plant,[0,0,19],[x*3,y*3,h-7],[x*3+1,y*3,h-7],m.olive);
    const root=[x*3,y*3,h-7],mid=[x*(len*.62),y*(len*.62),h+3],tip=[x*len,y*len,h];
    const left=[mid[0]-y*3.8,mid[1]+x*3.8,h],right=[mid[0]+y*3.5,mid[1]-x*3.5,h];
    quad(plant,root,left,tip,mid,m.plant);
    quad(plant,root,mid,tip,right,m.darkgreen);
  }
};
