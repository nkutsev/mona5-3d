'use strict';

module.exports = function dining(scene, {item, cylinder, tri}, room) {
  const m = scene.mats;
  const centre = [380, 572];
  const table = item('Трапезна маса за четирима', room, [...centre,0], [86,86,76]);
  const roundRing = ([x,y,z], rx, ry, count) => Array.from({length:count}, (_,i) => {
    const angle = 2*Math.PI*i/count;
    return [x+rx*Math.cos(angle),y+ry*Math.sin(angle),z];
  });
  function surface(object, rings, material, cap = true) {
    const count = rings[0].length;
    for(let i=1;i<rings.length;i++) {
      const from=rings[i-1], to=rings[i];
      for(let j=0;j<count;j++) {
        const k=(j+1)%count;
        tri(object,from[j],from[k],to[k],material);
        tri(object,from[j],to[k],to[j],material);
      }
    }
    if(cap) {
      const base=rings[0], end=rings[rings.length-1];
      for(let j=1;j<count-1;j++) {
        tri(object,base[0],base[j+1],base[j],material);
        tri(object,end[0],end[j],end[j+1],material);
      }
    }
  }
  function turned(object, centre, profile, material, segments=40) {
    const [x,y,z]=centre;
    surface(object,profile.map(([height,radius])=>roundRing([x,y,z+height],radius,radius,segments)),material);
  }
  turned(table,[0,0,0],[[0,23],[1,24],[9,23.5],[66,15],[73,16]],m.kitchenTaupe);
  turned(table,[0,0,0],[[72.5,41.5],[73.5,43],[75.3,43],[76,42.3]],m.kitchenVeneer,64);
  // Mark the pedestal and top at their actual heights for movement and selection.
  const nx=11, ny=11;
  const grid={nx,ny,lo:[],hi:[]};
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++) {
    const r=Math.hypot((i+.5)*86/nx-43,(j+.5)*86/ny-43);
    grid.lo.push(r<=25 ? 0 : r<=44 ? 72.5 : -1);
    grid.hi.push(r<=44 ? 76 : -1);
  }
  table.grid=grid;

  // Diagonal seats leave room for the folding panels on the glass side.
  for(const [index,dx,dy] of [[1,-37,-36],[2,-37,36],[3,37,-36],[4,37,36]]) {
    const angle=Math.atan2(dx,-dy)*180/Math.PI;
    const chair=item('Трапезен стол '+index,room,[centre[0]+dx,centre[1]+dy,0],[40,41,82],angle);
    for(const x of [-1,1])for(const y of [-1,1]) {
      surface(chair,[
        roundRing([x*15,y*16,0],1,1,12),
        roundRing([x*12.5,y*12,43],1.65,1.65,12)
      ],m.lightwood);
    }
    surface(chair,[
      roundRing([0,0,41.5],16,16.5,40),
      roundRing([0,0,43.5],19,19,40),
      roundRing([0,0,47],19,19,40),
      roundRing([0,0,49],16.5,16.5,40)
    ],m.boucle);
    for(const x of [-1,1]) {
      surface(chair,[
        roundRing([x*13,-13,44],1.35,1.35,12),
        roundRing([x*14,-12,68],1.45,1.45,12)
      ],m.lightwood);
    }
    const back=Array.from({length:29},(_,i)=>{
      const a=(i/28-.5)*2.62;
      const end=Math.sin(Math.PI*i/28);
      return Array.from({length:16},(_,j)=>{
        const b=2*Math.PI*j/16;
        const radius=19+2.5*Math.cos(b);
        return [radius*Math.sin(a),3-radius*Math.cos(a),70+3*end+(4+5*end)*Math.sin(b)];
      });
    });
    surface(chair,back,m.boucle);
    const offset=Math.hypot(dx,dy);
    const placeSetting=[dx*29/offset,dy*29/offset,76];
    turned(table,placeSetting,[[0,7.9],[.4,8.9],[1,8.3]],m.greige,28);
    turned(table,placeSetting,[[.8,4.5],[1.5,6.5],[3.1,7.0],[3.2,6.4],[2,4.5]],m.linen,28);
  }

  const vase=item('Ваза на трапезната маса',room,[...centre,76],[16,16,27]);
  turned(vase,[0,0,0],[[0,4],[2,5.2],[10,4.7],[14,2.8],[16,2.7]],m.linen,24);
  for(let i=0;i<6;i++) {
    const a=i*2.4, h=21+i%3*2;
    const x=Math.cos(a), y=Math.sin(a);
    cylinder(vase,[x,y,17.4],.22,.22,5,m.olive,-1,8);
    tri(vase,[x,y,18],[x*5-y*1.4,y*5+x*1.4,h-2],[x*8,y*8,h],m.olive);
    tri(vase,[x,y,18],[x*8,y*8,h],[x*5+y*1.4,y*5-x*1.4,h-1],m.plant);
  }
};
