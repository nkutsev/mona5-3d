'use strict';

function geometry(scene) {
  const boxes = new WeakMap();
  function item(name, room, anchor, size, rotation = 0) {
    const object = {name, room, anchor, size, rot0: rotation, pos: [], mat: [], par: [], pt: [], parts: []};
    scene.objects.push(object);
    boxes.set(object, []);
    return object;
  }
  function tri(object, a, b, c, material, part = -1, parameter = 0) {
    object.pos.push(...a, ...b, ...c);
    object.mat.push(material);
    object.par.push(parameter);
    object.pt.push(part);
  }
  function box(object, centre, size, material, part = -1) {
    const points = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]
      .map(corner => corner.map((s, i) => centre[i] + s * size[i] / 2));
    for (const [a,b,c,d] of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]) {
      tri(object, points[a], points[b], points[c], material, part);
      tri(object, points[a], points[c], points[d], material, part);
    }
    boxes.get(object)?.push({centre, size});
  }
  function cylinder(object, centre, rx, ry, height, material, part = -1, segments = 32) {
    const [x,y,z] = centre, bottom = z - height/2, top = z + height/2;
    for (let i = 0; i < segments; i++) {
      const point = (n,h) => [x+rx*Math.cos(n*2*Math.PI/segments),y+ry*Math.sin(n*2*Math.PI/segments),h];
      const a=point(i,bottom), b=point(i+1,bottom), c=point(i+1,top), d=point(i,top);
      tri(object,a,b,c,material,part); tri(object,a,c,d,material,part);
      tri(object,[x,y,top],d,c,material,part); tri(object,[x,y,bottom],b,a,material,part);
    }
    boxes.get(object)?.push({centre, size:[2*rx,2*ry,height]});
  }
  function part(object, definition) {
    return object.parts.push(definition)-1;
  }
  // The editor tests occupied vertical intervals inside each footprint cell.
  function complete() {
    for (const o of scene.objects) {
      if (o.grid || o.name==='structure' || o.isFixed) continue;
      const [w,d,h] = o.size, nx=Math.max(1,Math.ceil(w/12)), ny=Math.max(1,Math.ceil(d/12));
      const lo=[], hi=[], solids=boxes.get(o)||[];
      for(let j=0;j<ny;j++) for(let i=0;i<nx;i++) {
        const x=(i+.5)*w/nx-w/2, y=(j+.5)*d/ny-d/2;
        const hits=solids.filter(({centre:c,size:s})=>Math.abs(c[0]-x)<=(s[0]+w/nx)/2 && Math.abs(c[1]-y)<=(s[1]+d/ny)/2);
        lo.push(hits.length?Math.min(...hits.map(b=>b.centre[2]-b.size[2]/2)):solids.length?-1:0);
        hi.push(hits.length?Math.max(...hits.map(b=>b.centre[2]+b.size[2]/2)):solids.length?-1:h);
      }
      o.grid={nx,ny,lo,hi};
    }
  }
  return {item,box,tri,cylinder,part,complete};
}
module.exports = geometry;
