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
  // Earlier kitchen drafts allowed the dining set to be hidden or moved. Reset
  // only those six original pieces once, then preserve subsequent user edits.
  swap("// structure walls (2D segments)",`try {
  const key='mona_d15_dining_between_peninsula_v1';
  if(localStorage.getItem(key)!=='1') {
    const dining=new Set(['Трапезна маса за четирима','Трапезен стол 1',
      'Трапезен стол 2','Трапезен стол 3','Трапезен стол 4',
      'Купа на трапезната маса']);
    for(const s of INST) {
      const ob=OB[s.ob];
      if(dining.has(ob.name)&&s.label===ob.name)
        Object.assign(s,baseState(ob,s.ob),{hidden:false,po:{},open:false});
    }
    save();
    localStorage.setItem(key,'1');
  }
} catch(e) {}
// structure walls (2D segments)`);
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
  swap("uniform vec3 uCol[48];","uniform sampler2D uCream;uniform sampler2D uWalnut;uniform vec3 uCol[59];");
  swap("for(int k=0;k<48;k++)","for(int k=0;k<59;k++)");
  swap("new Float32Array(48*3)","new Float32Array(59*3)");
  swap("uHideCeil>.5&&m==2","uHideCeil>.5&&(m==2||m==56||m==57)");
  swap("if(m==30){gl_FragColor","if(m==30||m==57){gl_FragColor");
  swap("if((m==44)!=(uPass>.5))discard;", "if((m==44||m==55)!=(uPass>.5))discard;");
  swap("if(m==44){vec3 nn=", "if(m==44||m==55){vec3 nn=");
  swap("vec4(mix(vec3(.09,.075,.06),vec3(.35,.32,.29),fr*.3),.55+.25*fr)",
    "m==55?vec4(mix(vec3(.28,.23,.19),vec3(.70,.64,.55),fr),.29+.19*fr):vec4(mix(vec3(.44,.64,.65),vec3(.83,.94,.96),fr),.115+.19*fr)");
  // Long, staggered oak boards use global apartment coordinates, so their
  // grain and joints remain continuous through every doorway.
  swap("vec3 colOf(int i){",`vec3 planks(vec2 xy){
  const float width=17., boardLength=162.;
  float lane=floor(xy.x/width), across=fract(xy.x/width);
  float position=(xy.y+mod(lane,4.)*40.5)/boardLength;
  float board=floor(position), along=fract(position);
  vec2 id=vec2(lane,board);
  float wave=nz(xy.y*.25,lane*19.+board*4.,3.);
  float grain=.97+.035*sin(across*36.+wave*2.)+.015*sin(across*104.+wave*5.);
  float tone=.85+.27*hsh(id)+.035*nz(xy.y*.18,across*6.+lane*13.,7.);
  vec2 knot=vec2(.24+.52*hsh(id+vec2(11.,5.)),.16+.67*hsh(id+vec2(7.,19.)));
  float radius=length(vec2((across-knot.x)*3.5,(along-knot.y)*7.5));
  float figuring=1.-.16*exp(-radius*radius*7.)+.03*sin(radius*32.)*exp(-radius*3.);
  float edge=min(min(across,1.-across)*width,min(along,1.-along)*boardLength);
  float joint=mix(.68,1.,smoothstep(.08,.42,edge));
  return vec3(.79,.55,.31)*tone*grain*figuring*joint;
}
float stoneNoise(vec2 p){
  vec2 cell=floor(p), t=fract(p);
  t=t*t*(3.-2.*t);
  float a=mix(hsh(cell),hsh(cell+vec2(1.,0.)),t.x);
  float b=mix(hsh(cell+vec2(0.,1.)),hsh(cell+vec2(1.,1.)),t.x);
  return mix(a,b,t.y);
}
vec3 colOf(int i){`);
  swap("if(m==3)c=herring(vO.xy,vPar);",`if(m==46||m==47){
    vec2 span=m==46?vec2(120.,60.):vec2(100.,32.);
    vec2 tile=fract(vec2(A,B)/span);
    vec2 edge=min(tile,1.-tile)*span;
    vec3 texel=m==46?texture2D(uCream,vec2(tile.x,.254+tile.y*.486)).rgb:
                        texture2D(uWalnut,vec2(tile.x,.415+tile.y*.36)).rgb;
    c=mix(texel*.8,texel,smoothstep(.04,.23,min(edge.x,edge.y)));
  }else if(m==50||m==51){
    float grain=nz(vW.x*.21+vW.y*.04,vW.y*.08+vW.z*.04,5.);
    float line=sin(vW.x*.14+grain*.45);
    c=vec3(.55,.35,.21)*(.96+.022*line+.018*grain);
    if(m==51)c*=.86;
  }else if(m==52||m==58){
    float warp=nz(A*1.9,B*.26,7.4);
    float grain=sin(A*1.25+warp*2.)+.33*sin(A*5.8+warp*3.)+.23*sin(A*13.2+warp*3.6);
    c*=.98+.035*grain+.04*nz(A*2.,B*.43,3.);
    if(m==58){
      float side=min(abs(vO.x-3.),abs(vO.x-44.));
      float glow=.65*exp(-side/4.)+.35*exp(-abs(vO.z-256.)/12.);
      c+=vec3(.33,.20,.064)*glow;
    }
  }else if(m==54){
    vec2 p=vec2(A,B);
    c*=.93+.09*stoneNoise(p*.28)+.055*stoneNoise(p*1.8);
    if(an.z<.7)c+=vec3(.055,.032,.007)*smoothstep(0.,58.,B);
  }else if(m==3)c=planks(vO.xy);`);
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
