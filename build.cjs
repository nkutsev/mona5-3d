'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const kitFor=require('./model/geometry.cjs');
const adaptEngine=require('./model/engine.cjs');
const transformInterface=require('./model/interface.cjs');

function read(relative,encoding='utf8') {
  return fs.readFileSync(path.join(__dirname,relative),encoding);
}
const template=read('reference/apart103.html');
const embedded=/^const D=(.+);\r?$/m;
const reference=JSON.parse(template.match(embedded)[1]);
const scene={
  objects:[],rooms:[],H:260,
  mats:{...reference.mats,serena:46,tangram:47,charcoal:48,charcoalEdge:49,walnutTop:50,walnutBack:51,
    kitchenVeneer:52,kitchenTaupe:53,kitchenStone:54,smokedGlass:55,track:56,trackLight:57},
  cols:[...reference.cols.slice(0,46),[.84,.80,.71],[.66,.46,.32],
    [.11,.15,.17],[.07,.10,.12],[.52,.31,.16],[.43,.25,.13],
    [.56,.42,.32],[.71,.66,.59],[.89,.81,.68],[.24,.20,.17],[.07,.10,.12],[1,.86,.62]],
  tileSources:['serena-cream','tangram-walnut'].map(n=>
    'data:image/jpeg;base64,'+read('materials/tile-'+n+'-reference.jpg',null).toString('base64'))
};
const kit=kitFor(scene);
require('./model/building.cjs')(scene,kit);
require('./model/furniture.cjs')(scene,kit,reference);
kit.complete();
const names=new Set();
for(const o of scene.objects) {
  if(names.has(o.name))throw new Error('Duplicate name: '+o.name);
  names.add(o.name);
  if(!o.pos.length||o.pos.length!==o.mat.length*9||o.pt.length!==o.mat.length||o.par.length!==o.mat.length)
    throw new Error('Incomplete mesh: '+o.name);
  if(!o.pos.every(Number.isFinite)||!o.size.every(s=>s>0)||!o.mat.every(m=>Number.isInteger(m)&&m>=0&&m<scene.cols.length))
    throw new Error('Invalid geometry or material: '+o.name);
  if(!o.pt.every(p=>p>=-1&&p<o.parts.length))throw new Error('Invalid moving part: '+o.name);
}
let html=template.replace(embedded,'const D=__D15_MODEL__;');
html=transformInterface(adaptEngine(html)).replace('__D15_MODEL__',()=>JSON.stringify(scene));
const license=read('reference/LICENSE.txt');
html=html.replace('</head>','<!-- Adapted from Apartment 103A.\n'+license.replaceAll('--','—')+' -->\n</head>');
for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
fs.mkdirSync(path.join(__dirname,'docs'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'docs/LICENSE.txt'),license);
fs.writeFileSync(path.join(__dirname,'docs/index.html'),html);
console.log('D15: '+scene.objects.length+' objects, '+scene.objects.reduce((sum,o)=>sum+o.mat.length,0)+' triangles, '+Buffer.byteLength(html)+' bytes.');
