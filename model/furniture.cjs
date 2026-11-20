'use strict';

// Meshes and articulated hardware come from Vidol Vidolov's MIT-licensed
// Apartment 103A. Coordinates below belong to the D15 architectural drawing, in cm.
const frontNames = {
  'Dishwasher door': 'Врата на съдомиялна', 'Door': 'Вратичка',
  'Drawer': 'Чекмедже', 'Fridge door': 'Врата на хладилник',
  'Inner cutlery drawer': 'Вътрешно чекмедже за прибори', 'Jewellery & belt tray': 'Вътрешен органайзер',
  'Lid tray': 'Поставка за капаци', 'Lift-up flap': 'Повдигаща врата',
  'Mirror sliding door': 'Огледална плъзгаща врата', 'Pan drawer': 'Чекмедже за тигани',
  'Plate drawer': 'Чекмедже за чинии', 'Pot drawer': 'Чекмедже за съдове',
  'Pull-down arms': 'Рамена на механизма', 'Pull-down lift': 'Спускащ механизъм',
  'Pull-down rail': 'Спускащ лост', 'Pull-out bin': 'Изтеглящ се кош',
  'Pull-out shelf': 'Изтеглящ се рафт', 'Sliding door': 'Плъзгаща врата',
  'Sponge tray (U)': 'Поставка под мивката', 'TV drawer': 'Чекмедже на ТВ шкафа',
  'U-drawer (sink)': 'Чекмедже под мивката', 'Wall door': 'Врата на горен шкаф',
  'Wall door (lift inside)': 'Врата с вътрешен механизъм', 'Wardrobe drawer': 'Чекмедже на гардероба',
  'Bench drawer': 'Чекмедже на пейката', 'Glass door': 'Остъклена врата',
  'Bottle pull-out': 'Изтеглящ се шкаф за бутилки',
};

const rounded = value => Math.round(value * 1000) / 1000;

// A mirrored installation needs mirrored pivots, drawer travel and collision
// cells as well as mirrored triangles. Keep the reference object immutable.
function fit(source, name, room, anchor, rot0, scale = [1, 1, 1]) {
  const [sx, sy, sz] = scale;
  const map = point => point.map((n, axis) => rounded(n * scale[axis]));
  const hand = Math.sign(sx * sy * sz);
  const pos = source.pos.map((n, i) => rounded(n * scale[i % 3]));
  if (hand < 0) {
    for (let i = 0; i < pos.length; i += 9) {
      for (let axis = 0; axis < 3; axis++) {
        [pos[i + 3 + axis], pos[i + 6 + axis]] = [pos[i + 6 + axis], pos[i + 3 + axis]];
      }
    }
  }
  const parts = source.parts.map(part => {
    const result = {...part};
    for (const key of ['vec', 'pivot', 'c']) if (part[key]) result[key] = map(part[key]);
    if (part.axis) result.axis = part.axis.map((n, i) => hand * Math.sign(scale[i]) * n);
    if (part.n) result.n = part.n.map((n, i) => Math.sign(scale[i]) * n);
    if (part.w && part.n) result.w = rounded(part.w * (Math.abs(part.n[0]) > .5 ? Math.abs(sy) : Math.abs(sx)));
    if (part.h) result.h = rounded(part.h * sz);
    if (part.kind) result.kind = frontNames[part.kind] || part.kind;
    return result;
  });
  let grid = null;
  if (source.grid) {
    const {nx, ny} = source.grid;
    const remap = heights => heights.map((_, i) => {
      const x = i % nx, y = Math.floor(i / nx);
      const index = (sy < 0 ? ny - 1 - y : y) * nx + (sx < 0 ? nx - 1 - x : x);
      return heights[index] < 0 ? -1 : rounded(heights[index] * sz);
    });
    grid = {nx, ny, lo: remap(source.grid.lo), hi: remap(source.grid.hi)};
  }
  return {...source, name, room, anchor: anchor.map(rounded), rot0, pos, parts, grid,
    pt: source.pt.slice(), mat: source.mat.slice(), par: source.par.slice(),
    size: map(source.size).map(Math.abs), slide: source.slide ? map(source.slide) : null};
}

module.exports = function furniture(scene, kit, reference) {
  const sources = new Map(reference.objects.map(object => [object.name, object]));
  const {box, cylinder, item, part, tri} = kit;
  const m = scene.mats;
  const kitchen = 'Кухня и трапезария', living = 'Дневна и кабинет', bedroom = 'Спалня';
  function place(sourceName, name, room, anchor, angle = 0, scale) {
    const source = sources.get(sourceName);
    if (!source) throw new Error('Missing furniture mesh: ' + sourceName);
    const result = fit(source, name, room, anchor, angle, scale);
    scene.objects.push(result);
    return result;
  }

  // Keep the internals, splashback, sink cut-out and extractor aligned when
  // installing the entire cabinet run on the opposite wall.
  const base = sources.get('Base cabinets + worktop (right wall)');
  const runCentre = [124.5, 604], runScale = [-1, 226 / 267, 1];
  function kitchenModule(sourceName, name) {
    const original = sources.get(sourceName);
    const anchor = [runCentre[0] - (original.anchor[0] - base.anchor[0]),
      runCentre[1] + (original.anchor[1] - base.anchor[1]) * runScale[1], original.anchor[2]];
    return place(sourceName, name, kitchen, anchor, 0, runScale);
  }
  const westRun = kitchenModule('Base cabinets + worktop (right wall)', 'Долни кухненски шкафове с плот');
  // Replace the reference run's two top triangles with one continuous U top.
  const keep=[];
  for(let t=0;t<westRun.mat.length;t++) {
    const z=[westRun.pos[t*9+2],westRun.pos[t*9+5],westRun.pos[t*9+8]];
    if(!(westRun.mat[t]===m.marble&&z.every(v=>Math.abs(v-92)<.01)))keep.push(t);
  }
  westRun.pos=keep.flatMap(t=>westRun.pos.slice(t*9,t*9+9));
  for(const field of ['mat','par','pt'])westRun[field]=keep.map(t=>westRun[field][t]);
  kitchenModule('Upper cabinets', 'Горни кухненски шкафове');
  kitchenModule('Splashback', 'Кухненски гръб');
  kitchenModule('Sink', 'Кухненска мивка');
  kitchenModule('Tap', 'Смесител на мивката');
  kitchenModule('Hob', 'Индукционен плот');
  kitchenModule('Extractor housing', 'Шкаф за аспиратор');
  kitchenModule('Extractor hood', 'Аспиратор');
  place('Oven tower', 'Колона с фурна', kitchen, [122.65, 461, 0], -90);
  place('Fridge', 'Хладилник с две врати', kitchen, [122.5, 401, 0], -90, [60 / 90, 61 / 74, 1]);

  // The west run, north run and connected southward return form the U in the
  // reference. The dining set sits east of the return, beside the glass.
  const north = item('Северен ред кухненски шкафове', kitchen,
    [228.75, 685, 0], [217.5, 65, 94]);
  box(north, [0, 0, 4], [209.5, 57, 8], m.oak);
  box(north, [0, 0, 49], [213.5, 61, 80], m.oak);
  for (const x of [-71, 0, 71]) for(const z of [29,65]) {
    const g=part(north,{type:'slide',vec:[0,-30,0],kind:'Чекмедже',
      id:'КС1',w:68,h:34,c:[x,-31,z],n:[0,-1,0]});
    box(north,[x,-31,z],[68,2,34],m.kwood,g);
    box(north,[x,-1,z-15],[64,55,2],m.oak,g);
    box(north,[x,-32,z+10],[18,1.5,1.5],m.steel,g);
  }

  const peninsula = item('Свързан кухненски полуостров', kitchen,
    [305, 577, 0], [65, 152, 94]);
  box(peninsula, [0, 0, 4], [57, 144, 8], m.oak);
  box(peninsula, [0, 0, 49], [61, 148, 80], m.oak);
  box(peninsula, [31.5, 0, 49], [2, 148, 80], m.kwood);
  for (const y of [-50, 0, 50]) for (const z of [29, 65]) {
    const g=part(peninsula,{type:'slide',vec:[-30,0,0],kind:'Чекмедже',
      id:'КП1',w:47,h:34,c:[-32,y,z],n:[-1,0,0]});
    box(peninsula,[-32,y,z],[2,47,34],m.kwood,g);
    box(peninsula,[1,y,z-15],[57,43,2],m.oak,g);
    box(peninsula,[-34,y,z+10],[1.5,18,1.5],m.steel,g);
  }
  const worktop=item('Непрекъснат П-образен кухненски плот', kitchen,
    [214.75,604.25,88],[245.5,226.5,4]);
  box(worktop,[-90.25,-32.5,2],[65,161.5,4],m.marble);
  box(worktop,[0,80.75,2],[245.5,65,4],m.marble);
  box(worktop,[90.25,-27.5,2],[65,151.5,4],m.marble);

  place('Dining table', 'Трапезна маса', kitchen, [450, 590, 0], 0, [.84, 130 / 140, 1]);
  for (const [index, x, y, rotation] of [
    [1, 392, 559, 0], [2, 392, 621, 0], [3, 508, 559, 180], [4, 508, 621, 180]
  ]) place('Dining chair 1', 'Трапезен стол ' + index, kitchen, [x, y, 0], rotation);
  place('Bowl (dining table)', 'Купа на трапезната маса', kitchen, [450, 590, 76]);
  for (const [i, y] of [559, 622].entries()) {
    place('Pendant light 1', 'Пендел ' + (i + 1), kitchen, [450, y, 168], 0, [1, 1, (scene.H - 168) / 81.5]);
  }

  place('Sofa', 'Ъглов диван с лежанка', living, [800, 628, 0], 180, [.96, 165 / 185, 1]);
  place('Rug (living room)', 'Килим в дневната', living, [797, 553, .15], 0, [248 / 270, 172 / 270, .7]);
  place('Coffee table', 'Холна маса от травертин', living, [767, 547, 0], 0, [.82, .82, 1]);
  place('Vase & candle (coffee table)', 'Ваза и свещ', living, [766.5, 545.4, 38], 0, [.85, .85, .9]);
  place('TV slat wall', 'Ламели зад телевизора', living, [706, 375, 61], 180);
  place('TV', 'Телевизор', living, [652, 377.5, 130], 180, [.82, 1, .82]);
  place('Wall art', 'Картина над дивана', living, [791, 718.2, 112], 180);

  const desk = place('Desk (bedroom 2)', 'Работно бюро с монитор', living, [652, 430, 0], 90, [1, .85, 1]);
  box(desk, [12, 0, 76], [22, 30, 2], m.black);
  box(desk, [12.5, 0, 86], [4, 6, 21], m.metal);
  box(desk, [7.3, 0, 110], [.55, 65, 27.5], m.tv);
  box(desk, [-15, -1, 75.65], [13, 39, 1.3], m.black);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 13; col++) {
      box(desk, [-19.5 + row * 2.8, -18 + col * 2.8, 76.45], [2.3, 2.3, .42], m.metal);
    }
  }
  cylinder(desk, [-12, 28, 76], 4.8, 3.1, 2, m.black, -1, 12);
  const chair = item('Работен стол', living, [652, 495, 0], [53, 54, 96], 0);
  cylinder(chair, [0, 0, 25], 3, 3, 35, m.metal, -1, 16);
  for (let leg = 0; leg < 5; leg++) {
    const a = Math.PI * 2 * leg / 5;
    const direction = [Math.cos(a), Math.sin(a)];
    const spoke = (length, side, z) => [direction[0] * length - direction[1] * side,
      direction[1] * length + direction[0] * side, z];
    const nearA = spoke(0, -2.2, 9), nearB = spoke(0, 2.2, 9);
    const farA = spoke(22, -1.6, 5), farB = spoke(22, 1.6, 5);
    tri(chair, nearA, farA, farB, m.black); tri(chair, nearA, farB, nearB, m.black);
    cylinder(chair, [direction[0] * 22, direction[1] * 22, 3.5], 3.2, 3.2, 7, m.black, -1, 12);
  }
  cylinder(chair, [0, 0, 48], 23, 22, 8, m.olive, -1, 28);
  box(chair, [0, -20, 69], [6, 4, 42], m.black);
  box(chair, [0, -22.5, 76], [40, 7, 39], m.olive);
  for (const x of [-24, 24]) {
    box(chair, [x, 0, 52.5], [2.5, 3, 21], m.black);
    box(chair, [x, 0, 64], [4, 21, 3], m.black);
  }

  place('Bed (bedroom 1)', 'Двойно легло с тапицирана табла', bedroom, [618, 110, 0], 90);
  place('Rug (bedroom 1)', 'Килим под леглото', bedroom, [618, 134, .15], 90, [1, .93, .7]);
  place('Wardrobe (Bedroom 1)', 'Гардероб с плъзгащи врати', bedroom, [385, 116, 0], -90, [.98, 1, 1]);
  for (const [letter, x] of [['ляво', 500], ['дясно', 736]]) {
    const table = item('Нощно шкафче · ' + letter, bedroom, [x, 32, 0], [44, 40, 49], 0);
    for (const legX of [-17, 17]) for (const legY of [-14, 14]) {
      cylinder(table, [legX, legY, 5], 2, 1.8, 10, m.oak, -1, 12);
    }
    buildNightstand(table);
  }
  function buildNightstand(table) {
    for (const z of [10, 47.5]) box(table, [0, 0, z], [44, 40, 3], m.oak);
    for (const x of [-20.8, 20.8]) box(table, [x, 0, 29], [2.4, 40, 37], m.oak);
    box(table, [0, -18.8, 29], [39, 2.4, 37], m.oak);
    for (const z of [20, 37.3]) {
      const front = part(table, {type:'slide', vec:[0, 28, 0], kind:'Чекмедже', id:'NS1',
        w:39, h:16.4, c:[0, 19.5, z], n:[0, 1, 0]});
      box(table, [0, 18.8, z], [38.8, 2.4, 16.4], m.kwood, front);
      box(table, [0, .4, z - 6.8], [36, 34.8, 1.6], m.lightwood, front);
      box(table, [0, -16.5, z - .8], [36, 1.4, 12], m.lightwood, front);
      for (const x of [-17.4, 17.4]) box(table, [x, 0, z - .8], [1.4, 34, 12], m.lightwood, front);
      box(table, [0, 20.7, z + 4], [10, 1.7, 1.2], m.brass, front);
    }
  }
  place('Hall storage bench', 'Пейка за обувки', 'Антре', [46, 342, 0], -90, [1, .87, 1]);
  place('Wardrobe (Bedroom 1)', 'Гардероб в антрето', 'Антре',
    [160, 327, 0], 180, [140 / 226, 1, 1]);
};
