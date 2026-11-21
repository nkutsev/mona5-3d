'use strict';

// A connected U layout: the existing west run meets a rear run and a peninsula.
// The front of every base cabinet faces the clear working aisle.
module.exports = function kitchen(scene, kit, place, sources) {
  const {item, box, cylinder, part} = kit;
  const m = scene.mats, room = 'Кухня и трапезария';
  const dark = m.charcoal, edge = m.charcoalEdge, wood = m.walnutTop;
  const stain = object => {
    object.mat = object.mat.map(id => ({[m.kwood]:dark,[m.taupe]:dark,[m.groove]:edge,
      [m.marble]:wood,[m.lightwood]:wood,[m.oak]:wood})[id] ?? id);
    return object;
  };

  // Preserve Vidol's opening drawers and appliance hardware on the west wall.
  const baseAnchor = [627.5, 207.5], west = [124.5, 605], scale = [-1, 226/267, 1];
  function westModule(sourceName, name) {
    const source = sources.get(sourceName);
    const anchor = [west[0]-(source.anchor[0]-baseAnchor[0]),
      west[1]+(source.anchor[1]-baseAnchor[1])*scale[1], source.anchor[2]];
    return stain(place(sourceName, name, room, anchor, 0, scale));
  }
  const westBase = westModule('Base cabinets + worktop (right wall)', 'Долни шкафове · лява линия');
  for (const p of westBase.parts) if (p.kind.includes('мивката')) p.kind = 'Чекмедже';
  const westUpper = westModule('Upper cabinets', 'Горни шкафове · лява линия');
  westUpper.mat = westUpper.mat.map(id => id===m.white ? edge : id);
  const splash = westModule('Splashback', 'Дървен гръб · лява линия');
  splash.mat.fill(m.walnutBack);
  westModule('Hob', 'Индукционен плот · лява линия');
  westModule('Extractor housing', 'Шкаф за аспиратор');
  westModule('Extractor hood', 'Аспиратор');
  const oven = stain(place('Oven tower', 'Колона с фурна', room, [122.65, 461, 0], -90));
  oven.mat = oven.mat.map(id => id===m.white ? edge : id);
  const fridge = place('Fridge', 'Хладилник с две врати', room,
    [122.5, 401, 0], -90, [60/90, 61/74, 1]);
  fridge.mat = fridge.mat.map(id => id===m.steel ? dark : id);

  function rearDrawer(o, x, z, width, height, label) {
    const g = part(o, {type:'slide',vec:[0,-42,0],kind:label,w:width,h:height,
      c:[x,-31.7,z],n:[0,-1,0],id:'D1'});
    box(o,[x,-31.7,z],[width-.7,2,height-.7],dark,g);
    box(o,[x,-15.8,z-height/2+1.7],[width-4,29,1.8],edge,g);
    for (const dx of [-width/2+2,width/2-2])
      box(o,[x+dx,-16,z-4],[1.7,29,height-8],edge,g);
    box(o,[x,-34,z+height/2-3.5],[Math.min(width-17,34),1.3,.9],m.metal,g);
  }
  const rear = item('Долни шкафове · задна линия',room,[286,686,0],[258,66,92]);
  box(rear,[0,0,5],[258,66,10],edge);
  box(rear,[0,30.8,49],[258,2.5,78],edge);
  for (const x of [-128,-68,0,65,128]) box(rear,[x,0,49],[2,63,78],edge);
  // From left to right: integrated dishwasher, sink drawers, pan drawers, corner.
  const dish = part(rear,{type:'hinge',pivot:[-126,-32,10],axis:[0,0,1],angle:-95,
    kind:'Врата на съдомиялна',w:59,h:77,c:[-98,-31.7,49],n:[0,-1,0],id:'D1'});
  box(rear,[-98,-31.7,49],[58.5,2,77],dark,dish);
  box(rear,[-98,-34,79],[27,1.4,1.3],m.metal,dish);
  rearDrawer(rear,-34,29,66,37,'Чекмедже под мивката');
  rearDrawer(rear,-34,67,66,37,'Чекмедже под мивката');
  for (const z of [22,48,74]) rearDrawer(rear,32.5,z,63,25,'Чекмедже за съдове');
  box(rear,[96.5,-31.4,49],[62,2,77],dark);
  box(rear,[0,0,90],[258,66,4],wood);

  // A single rear worktop meets the west worktop at x=157, and the peninsula
  // at y=653. The slabs share their edges without overlapping faces.
  const back = item('Дървен кухненски гръб · задна линия',room,[286,716,92],[258,3,59]);
  box(back,[0,0,29],[258,3,58],m.walnutBack);
  box(back,[0,-2,58],[258,2,1.5],edge);
  const sink = stain(place('Sink','Черна мивка · задна линия',room,[252,686,91.6],-90));
  sink.mat.fill(edge);
  const tap = place('Tap','Черен смесител · задна линия',room,[252,707,92],-90);
  tap.mat.fill(edge);

  const upper = item('Горни шкафове · задна линия',room,[286,704,0],[258,28,250]);
  box(upper,[0,12,205],[258,3,90],edge);
  box(upper,[0,0,151],[258,28,2],edge);
  box(upper,[0,0,249],[258,28,2],edge);
  for(const x of [-128,-68,-6,56,128])box(upper,[x,0,200],[2,27,96],edge);
  // An open walnut niche, matte lower flaps, and a horizontal walnut band.
  box(upper,[-98,-11.3,183],[58,2,61],m.walnutBack);
  for(const z of [153,184,215,247])box(upper,[-98,-12,z],[58,26,2],wood);
  for(const x of [-129,-68])box(upper,[x,-13,201],[2,24,92],wood);
  for(const [x,w] of [[-37,60],[25,60],[92,70]]) {
    const lower=part(upper,{type:'hinge',pivot:[x,-14,213],axis:[1,0,0],angle:-95,
      kind:'Повдигаща врата',w,h:61,c:[x,-14,182],n:[0,-1,0],id:'W1'});
    box(upper,[x,-14,182],[w-1,2,60],dark,lower);
    const band=part(upper,{type:'hinge',pivot:[x,-14,247],axis:[1,0,0],angle:-95,
      kind:'Повдигаща врата',w,h:32,c:[x,-14,230],n:[0,-1,0],id:'W1'});
    box(upper,[x,-14,230],[w-1,2,32],wood,band);
  }
  box(upper,[-98,-14,230],[59,2,33],wood);
  box(upper,[0,-15,214],[258,1.4,1.4],m.brass);

  const pen = item('Полуостров · шкафове към кухнята',room,[383,579.5,0],[65,149,92]);
  box(pen,[0,0,5],[65,149,10],edge);
  box(pen,[30.8,0,49],[2.5,149,78],edge);
  for(const y of [-73.5,-6,73.5])box(pen,[0,y,49],[63,2,78],edge);
  // The U corner is accessed from the working aisle, with a pull-out carousel.
  for(const z of [25,63]) {
    const g=part(pen,{type:'slide',vec:[-47,0,0],kind:'Ъглов изтеглящ се карусел',
      w:64,h:36,c:[-31,-40,z],n:[-1,0,0],id:'CA1'});
    box(pen,[-31,-40,z],[2,65,35],dark,g);
    box(pen,[-2,-40,z-13],[52,58,2],wood,g);
    box(pen,[-33,-40,z+10],[1,26,1],m.metal,g);
  }
  for(const z of [25,63]) {
    const g=part(pen,{type:'slide',vec:[-43,0,0],kind:'Чекмедже за съдове',
      w:63,h:36,c:[-31,35,z],n:[-1,0,0],id:'D1'});
    box(pen,[-31,35,z],[2,72,35],dark,g);
    box(pen,[-12,35,z-14],[35,68,2],edge,g);
    box(pen,[-33,35,z+10],[1,26,1],m.metal,g);
  }
  box(pen,[0,0,90],[65,149,4],wood);
  // The peninsula is a preparation counter, with an optional second hob as
  // in the reference photograph, away from the inner corner.
  const hob=item('Индукционен плот · полуостров',room,[383,542,92],[42,52,1]);
  box(hob,[0,0,.55],[42,52,1.1],edge);
  for(const y of [-11,11])for(const x of [-10,10])
    cylinder(hob,[x,y,1.16],7.5,7.5,.14,m.metal,-1,30);

  for(const [i,y] of [546,608].entries()) {
    const lamp=item('Пендел над полуострова '+(i+1),room,[443,y,0],[12,12,260]);
    cylinder(lamp,[0,0,221],.45,.45,78,edge,-1,10);
    cylinder(lamp,[0,0,179],3.5,3.5,8,edge,-1,16);
    cylinder(lamp,[0,0,172],5.2,5.2,7,m.brass,-1,20);
  }
};
