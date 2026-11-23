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
  const {box, cylinder, item, tri} = kit;
  const m = scene.mats;
  const living = 'Дневна и кабинет';
  function place(sourceName, name, room, anchor, angle = 0, scale) {
    const source = sources.get(sourceName);
    if (!source) throw new Error('Missing furniture mesh: ' + sourceName);
    const result = fit(source, name, room, anchor, angle, scale);
    scene.objects.push(result);
    return result;
  }

  require('./kitchen.cjs')(scene, kit, place, sources);

  require('./living.cjs')(scene,kit,place);

  const desk = place('Desk (bedroom 2)', 'Работно бюро с монитор', living, [861, 682, 0], 90, [1, .85, 1]);
  desk.mat=desk.mat.map(finish=>finish===m.oak?m.livingOak:finish);
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
  const chair = item('Работен стол', living, [861, 623, 0], [53, 54, 96], 0);
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
  cylinder(chair, [0, 0, 48], 23, 22, 8, m.livingDrape, -1, 28);
  box(chair, [0, -20, 69], [6, 4, 42], m.black);
  box(chair, [0, -22.5, 76], [40, 7, 39], m.livingDrape);
  for (const x of [-24, 24]) {
    box(chair, [x, 0, 52.5], [2.5, 3, 21], m.black);
    box(chair, [x, 0, 64], [4, 21, 3], m.black);
  }

  require('./bedroom.cjs')(scene,kit);
  require('./hall.cjs')(scene,kit);
};
