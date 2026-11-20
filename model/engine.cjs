'use strict';
const fs = require('node:fs');
const path = require('node:path');

module.exports = function adaptEngine(source) {
  function swap(before,after) {
    if(!source.includes(before))throw new Error('Unexpected editor revision: '+before.slice(0,90));
    source=source.replace(before,()=>after);
  }
  source=source.replaceAll('apt103a_editor_v1','mona_d15_layout_v1');
  source=source.replaceAll('Apartment_103A_changes.json','MONA_D15_changes.json');
  swap("apartment:'103A'","apartment:'Д15 · МОНА 5'");
  swap("fixed:o.name==='structure'", "fold:o.fold, walkLeaf:o.walkLeaf, initialOpen:o.initialOpen, fixed:o.name==='structure'||!!o.isFixed");
  swap("hidden:!!(ob.variant&&!ob.variant.default),label:ob.name","hidden:!!(ob.variant&&!ob.variant.default),po:ob.initialOpen?Object.fromEntries(ob.parts.map((_,n)=>[n,1])):{},label:ob.name");
  swap("open:false})","open:!!x.open,po:x.po&&typeof x.po==='object'?x.po:{}})");
  swap("out.sort((a,b)=>a.ob-b.ob||(a.label>b.label?1:-1));INST=out", "const originals=OB.map((o,j)=>out.find(s=>s.ob===j&&s.label===o.name)||baseState(o,j));INST=originals.concat(out.filter(s=>s.label!==OB[s.ob].name))");
  swap("function save(){try","function save(){syncFoldControl();try");
  swap("if(g>=0){const p0=ob.parts[g];",`if(g>=0 && ob.fold){
    const pose=panelPose(ob,ob.parts[g].foldIndex,partVal(i,0));
    gl.uniform3fv(pg.u.uPv,pose.pivot);gl.uniform3f(pg.u.uAx,0,0,1);
    gl.uniform1f(pg.u.uAn,pose.angle);gl.uniform3fv(pg.u.uSl,pose.shift);return;
  }
  if(g>=0){const p0=ob.parts[g];`);
  swap("function togglePart(i,g){const s=INST[i]", "function togglePart(i,g){if(OB[INST[i].ob].fold){toggleDivider();return}pushUndo();const s=INST[i]");
  swap("if(p.type==='hinge'){const a=p.angle*Math.PI/180*e,k=p.axis",`if(ob.fold){
    const pose=panelPose(ob,p.foldIndex,partVal(i,0)),c=Math.cos(pose.angle),sn=Math.sin(pose.angle);
    const x=v[0]-(!isN?pose.pivot[0]:0),y=v[1]-(!isN?pose.pivot[1]:0);
    v=[c*x-sn*y+(isN?0:pose.pivot[0]+pose.shift[0]),sn*x+c*y+(isN?0:pose.pivot[1]+pose.shift[1]),v[2]];
  }else if(p.type==='hinge'){const a=p.angle*Math.PI/180*e,k=p.axis`);
  swap("setAllParts(sel,!anyOpen);fillProps()", "pushUndo();setAllParts(sel,!anyOpen);fillProps()");
  swap("const any=INST.some(s=>s.po&&Object.values(s.po).some(v=>v));INST.forEach((s,i)=>{if(OB[s.ob].parts.length)setAllParts(i,!any)})",
    "const cabinets=INST.map((s,i)=>({s,i,o:OB[s.ob]})).filter(({s,o})=>!s.hidden&&!o.fixed&&!o.walkLeaf&&o.parts.length);const any=cabinets.some(({s})=>s.po&&Object.values(s.po).some(Boolean));pushUndo();cabinets.forEach(({i})=>setAllParts(i,!any))");
  swap("ob.fixed?1:(G.part+1)/255","ob.fixed&&!ob.parts.length?1:(G.part+1)/255");
  swap("select(drag.hit);","select(drag.hit>=0&&OB[INST[drag.hit].ob].fixed?-1:drag.hit);");
  swap("$('mCut').style.display=m==='orbit'?'':'none';","");
  swap("$('mCut').onclick=()=>{cut=cut?0:120;$('mCut').classList.toggle('on',!!cut);dirty=true};","");
  swap("placeWalker();setMode('walk')","startWalk();setMode('walk')");
  swap("cam.ex+=Math.cos(cam.wy)*k;cam.ey+=Math.sin(cam.wy)*k","walkBy(Math.cos(cam.wy)*k,Math.sin(cam.wy)*k)");
  swap("const sp=170*dt;cam.ex+=(Math.cos(cam.wy)*f+Math.sin(cam.wy)*s)*sp;cam.ey+=(Math.sin(cam.wy)*f-Math.cos(cam.wy)*s)*sp;dirty=true", "const sp=170*dt/Math.hypot(f,s);walkBy((Math.cos(cam.wy)*f+Math.sin(cam.wy)*s)*sp,(Math.sin(cam.wy)*f-Math.cos(cam.wy)*s)*sp)");
  swap("keys[e.key.toLowerCase()]=1;", "if(!e.ctrlKey&&!e.metaKey&&!e.altKey)keys[movementKey(e)]=1;");
  swap("keys[e.key.toLowerCase()]=0","keys[movementKey(e)]=0");
  swap("  if(mode==='walk'){let f=0,s=0;".trimStart(),"if(mode==='orbit')panFromKeyboard(dt);\n if(mode==='walk'){let f=0,s=0;");
  swap("const segs=WALLSEG.slice();","const segs=usedWalls();const wallCount=segs.length;");
  swap("si<WALLSEG.length","si<wallCount");
  swap("let L=0;for(const [p,q] of WALLSEG)", "let L=0;for(const [p,q] of usedWalls())");
  swap("const WALLSEG=[];(()=>{", "const WALLSEG=D.walkWalls||[];(()=>{if(WALLSEG.length)return;");
  swap("X:[-50,900],Y:[-50,1300],Z:[0,260]","X:[-50,1020],Y:[-50,780],Z:[0,D.H]");
  swap("const same=i<OB.length&&","const same=i<OB.length&&JSON.stringify(s.po||{})===JSON.stringify(b.po||{})&&!!s.open===!!b.open&&");
  swap("removed:s.hidden,added_copy:i>=OB.length","removed:s.hidden,added_copy:i>=OB.length,open_parts:ob.parts.map((p,g)=>s.po?.[g]?g:null).filter(g=>g!==null)");
  swap("if(ob.fixed)return;const b=baseState(ob,s.ob)","if(ob.fixed&&!ob.parts.length)return;const b=baseState(ob,s.ob)");
  swap("uniform vec3 uCol[48];","uniform sampler2D uCream;uniform sampler2D uWalnut;uniform vec3 uCol[48];");
  swap("vec4(mix(vec3(.09,.075,.06),vec3(.35,.32,.29),fr*.3),.55+.25*fr)",
    "vec4(mix(vec3(.44,.64,.65),vec3(.83,.94,.96),fr),.115+.19*fr)");
  swap("if(m==3)c=herring(vO.xy,vPar);",`if(m==46||m==47){
    vec2 span=m==46?vec2(120.,60.):vec2(100.,32.);
    vec2 tile=fract(vec2(A,B)/span);
    vec2 edge=min(tile,1.-tile)*span;
    vec3 texel=m==46?texture2D(uCream,vec2(tile.x,.254+tile.y*.486)).rgb:
                        texture2D(uWalnut,vec2(tile.x,.415+tile.y*.36)).rgb;
    c=mix(texel*.8,texel,smoothstep(.04,.23,min(edge.x,edge.y)));
  }else if(m==3)c=herring(vO.xy,vPar);`);
  swap("const P=prog(VS,FS),PK=prog(PVS,PFS),PL=prog(LVS,LFS);",`const P=prog(VS,FS),PK=prog(PVS,PFS),PL=prog(LVS,LFS);
const tileTextures=D.tileSources.map((uri,index)=>{
  const tex=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array(index?[168,126,92]:[217,204,180]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const img=new Image();img.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);dirty=true};img.src=uri;return tex;
});`);
  swap("gl.useProgram(P.p);gl.uniformMatrix4fv",`gl.useProgram(P.p);
  tileTextures.forEach((t,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t)});
  gl.uniform1i(P.u.uCream,0);gl.uniform1i(P.u.uWalnut,1);gl.activeTexture(gl.TEXTURE0);
  gl.uniformMatrix4fv`);
  const navigation=fs.readFileSync(path.join(__dirname,'navigation.js'),'utf8');
  swap("setMode('orbit');buildVariants();",navigation+"\nsetMode('orbit');buildVariants();");
  return source;
};
