const icons = {
  plan: '<path d="M3 3h18v18H3zM3 11h8V3m0 8v10m0-7h10"/>',
  orbit: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9"/>',
  walk: '<circle cx="14.5" cy="4" r="1.8"/><path d="m6 12 4-2 2-4 3 5 4 2M12 9l-2 6 4 3 1 4M10 15l-4 6"/>',
  glass: '<path d="M3 4h18M3 20h18M4 6l5 2v10l-5-2zm5 2 5-2v10l-5 2zm5-2 5 2v10l-5-2z"/>',
  cabinet: '<path d="M3 5h18v14H3zM12 5v14m-3-8v2m6-2v2"/>',
  cut: '<path d="m3 9 8-5 10 5v10l-5 2M3 9v7l8 4m0-5v5m-8-6 8 5 10-6" stroke-dasharray="0"/><path d="m3 9 8 5 10-5"/>',
  ruler: '<path d="m3 15 12-12 6 6-12 12zm9-9 3 3m-6 0 2 2m-5 1 3 3"/>',
  find: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>',
  undo: '<path d="M7 9h7a6 6 0 0 1 0 12M7 9l4-4M7 9l4 4" transform="translate(-1 -2)"/>',
  export: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
  more: '<path d="M4 7h10m4 0h2M4 17h2m4 0h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  fit: '<path d="M3 9V4h5m8 0h5v5m0 6v5h-5m-8 0H3v-5"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.1.8-1.5 1.1-1.5 2.5m0 3h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  back: '<path d="m14 6-6 6 6 6"/>',
  up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 6-6 6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>'
};

function icon(key) {
  return `<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[key]}</svg>`;
}

const css = `
:root{color-scheme:light;--sidebar:clamp(320px,25vw,384px);--panel:#f9f8f3;--paper:#fefdf9;--ink:#282b26;--muted:#666b61;--line:#dcdcd2;--tint:#e9eee5;--green:#34483b;--accent:#8d5d37;--mono:ui-monospace,"Cascadia Mono","Consolas",monospace;font-family:Inter,"Segoe UI",Arial,sans-serif;color:var(--ink);font-size:16px}
*{box-sizing:border-box}html,body{height:100%;margin:0;overflow:hidden}body{background:#deddd5;line-height:1.4}button,input,summary{font:inherit}button,summary{cursor:pointer}button{border:1px solid var(--line);border-radius:8px;background:var(--paper);color:var(--ink);font-size:.875rem;font-weight:550;line-height:1.2;min-height:36px;padding:7px 11px;touch-action:manipulation}button:hover,summary:hover{background:#eeefe8}button:focus-visible,summary:focus-visible,input:focus-visible,.it:focus-visible,.lg:focus-visible{outline:2px solid #487059;outline-offset:2px}.ui-icon{width:18px;height:18px;flex:none;vertical-align:middle}
#gl{position:fixed;inset:0 auto auto 0;width:calc(100% - var(--sidebar));height:100%;display:block;cursor:grab;touch-action:none}#gl.drag{cursor:grabbing}#gl.move{cursor:move}
.viewer-top,.viewer-bottom{position:fixed;left:22px;right:calc(var(--sidebar) + 22px);display:flex;align-items:flex-start;justify-content:space-between;gap:10px;pointer-events:none;z-index:3}
.viewer-top{top:20px}.viewer-bottom{bottom:18px;align-items:flex-end}.viewer-top>* ,.viewer-bottom>*{pointer-events:auto}
.glassbar{background:#fafaf6f5;border:1px solid #ffffffad;border-radius:10px;box-shadow:0 2px 12px #24281b16,0 0 0 1px #3b3c3010}
#modes,.camera-tools{display:flex;align-items:center;gap:2px;padding:3px}#modes button,.camera-tools button,#helpButton{display:inline-flex;align-items:center;justify-content:center;border:0;background:transparent}
#modes button{gap:7px;min-height:37px;padding:8px 13px}#modes button.on{background:var(--green);color:#fff;box-shadow:0 1px 3px #17271b30}#modes button:not(.on):hover,.camera-tools button:hover,#helpButton:hover{background:#e8eae1}
.camera-tools button,#helpButton{width:34px;height:34px;min-height:34px;padding:6px}.camera-tools .split{margin-left:3px;border-left:1px solid var(--line);border-radius:0 7px 7px 0}
.help-panel{position:relative;background:#fdfdf8f5;border-radius:50%;box-shadow:0 1px 6px #30312724}#helpButton{border-radius:50%}.help-content{position:absolute;right:0;top:43px;background:var(--paper);width:min(295px,80vw);border:1px solid var(--line);border-radius:10px;padding:14px 17px;box-shadow:0 4px 24px #1d231721;font-size:.875rem}.help-content strong{display:block;margin:0 0 8px}.help-content p{margin:5px 0;color:var(--muted)}
#help{color:#484d42;font-size:.8125rem;line-height:1.42;align-self:flex-end;background:#fafaf3e8;border:1px solid #ffffff88;border-radius:8px;padding:7px 10px;max-width:min(68%,460px);box-shadow:0 1px 8px #24281b0d}#help b{font-weight:650}
#toast{position:fixed;top:73px;left:calc((100% - var(--sidebar))/2);transform:translateX(-50%);opacity:0;pointer-events:none;transition:opacity .18s;z-index:6;background:#29362d;color:white;border-radius:8px;padding:8px 14px;font-size:.875rem;max-width:min(440px,75vw);text-align:center;box-shadow:0 2px 10px #17251922}
#side{z-index:4;position:fixed;right:0;top:0;bottom:0;width:var(--sidebar);display:flex;flex-direction:column;background:var(--panel);border-left:1px solid #c7c9bd;overflow:hidden}
.project-head{padding:24px 22px 17px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:13px}.mark{background:var(--green);width:43px;height:43px;border-radius:11px;display:grid;place-items:center;color:#f9f8e9;flex:none}.mark svg{width:26px;height:26px;stroke-width:1.4}
.project-name{font-size:.6875rem;letter-spacing:.17em;color:#566550;font-weight:750;text-transform:uppercase}.project-head h1{font-size:clamp(1.45rem,2vw,1.75rem);letter-spacing:-.045em;font-weight:650;line-height:1.12;margin:3px 0 0}
.side-scroll{overflow-y:auto;overscroll-behavior:contain;scrollbar-color:#bec2b4 transparent;scrollbar-width:thin;flex:1;min-height:0}
.scene-controls,#catalog,#props,#variants{padding:16px 20px}.scene-controls,#variants{border-bottom:1px solid var(--line)}.section-title{font-size:1rem;line-height:1.3;font-weight:650;margin:0}
.scene-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;margin-top:10px}.scene-grid>button{display:flex;align-items:center;justify-content:flex-start;text-align:left;gap:7px;line-height:1.18;min-height:40px;font-size:.8125rem;padding:7px 9px}.scene-grid .ui-icon{width:16px;height:16px}
.scene-grid>button:first-child{border-color:#b7c4b5;background:#ecf1e9}.scene-grid button.on,.settings-row button.on{color:#263e2c;background:#e1eadc;border-color:#afc1ab}
.scene-grid button .ui-icon{color:#556753}.scene-grid #bFold,.scene-grid #mDoors{position:relative;padding-left:32px}
.scene-grid #bFold::before,.scene-grid #mDoors::before{content:"";position:absolute;left:10px;top:50%;width:13px;height:14px;transform:translateY(-50%);border:1.4px solid #526651;border-radius:1px;background:linear-gradient(90deg,transparent 45%,#526651 46%,#526651 55%,transparent 56%)}.scene-grid #bFold::before{transform:translateY(-50%) skewY(-12deg);background:repeating-linear-gradient(90deg,transparent 0 3px,#526651 3px 4px)}
.advanced>summary{list-style:none;font-weight:550;font-size:.8125rem;color:#54614f;display:inline-flex;align-items:center;gap:6px;border-radius:5px;padding:4px 2px;margin-top:7px}.advanced summary::-webkit-details-marker{display:none}.advanced>summary::after{content:"";width:6px;height:6px;border:solid currentColor;border-width:0 1.5px 1.5px 0;transform:rotate(45deg);margin:-3px 2px 0 5px}.advanced[open]>summary::after{transform:rotate(225deg);margin-top:3px}.advanced summary .ui-icon{width:15px;height:15px}.settings-row{margin-top:6px;display:flex;gap:5px;flex-wrap:wrap}.settings-row button{font-size:.8125rem}#variants:empty{display:none}
.catalog-head{display:flex;align-items:center;justify-content:space-between;gap:6px}.units{font: .6875rem var(--mono);color:var(--muted)}
.search{margin:10px 0 8px;display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--paper);border-radius:7px;padding:0 10px;color:#677063}.search .ui-icon{width:16px}.search input{height:35px;width:100%;min-width:0;border:0;background:transparent;color:var(--ink);font-size:.875rem}.search:focus-within{outline:2px solid #739175;outline-offset:1px}.search input:focus-visible{outline:0}.search input::placeholder{color:#70766d}
#list .grp{color:#586853;font-size:.75rem;font-weight:650;text-transform:uppercase;letter-spacing:.055em;margin:14px 0 4px}
#list .it{border-bottom:1px solid #e5e5dc;cursor:pointer;display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 3px;min-height:35px;line-height:1.25;font-size:.875rem}
#list .it:hover,#list .it.sel{background:#e8eee4}.it.hid b{text-decoration:line-through;opacity:.58}.it span,.lg span:nth-child(3){font: .6875rem var(--mono);letter-spacing:-.025em;color:#60675f}.it[hidden],.grp[hidden],[hidden]{display:none!important}
#legend{display:none;border-bottom:1px solid var(--line);padding:0 0 12px}.lg{display:grid;grid-template-columns:35px 1fr 66px 24px;align-items:center;gap:4px;padding:4px 0;cursor:pointer;font-size:.8125rem}.lg:hover{background:var(--tint)}.empty-result{font-size:.875rem;color:var(--muted)}
#props{display:none}#side:has(#props[style*="display: block"]) #catalog{display:none}.back{display:flex;align-items:center;gap:3px;background:transparent;border:0;color:#556550;padding:0;min-height:28px;margin:0 0 7px}.back svg{width:14px}.room{font-size:.8125rem;color:var(--muted);margin:3px 0 12px}#pName{font-size:1.25rem;line-height:1.2;margin:0;letter-spacing:-.025em}.part-actions:has(button:not([style*="display: none"])){margin:8px 0 13px}.part-actions button{color:#fff;background:var(--green);border-color:var(--green)}.row{display:grid;grid-template-columns:90px minmax(30px,1fr) 62px;gap:8px;align-items:center;margin:6px 0}.row label{font-size:.8125rem;color:var(--muted)}.row input[type=number]{font:.8125rem var(--mono);width:62px;border:1px solid var(--line);background:var(--paper);border-radius:5px;color:var(--ink);padding:5px;text-align:right}.row input[type=range]{width:100%;accent-color:var(--green);min-width:0}.btns{display:flex;flex-wrap:wrap;gap:5px;margin:12px 0 0}.btns button{font-size:.8125rem}button.warn{color:#854f40}
#foot{background:var(--panel);border-top:1px solid var(--line);padding:10px 15px max(10px,env(safe-area-inset-bottom));display:flex;gap:5px;align-items:center;justify-content:space-between}
#foot button{display:flex;align-items:center;justify-content:center;gap:5px;white-space:normal;text-align:center;font-size:.8125rem;padding:6px 8px;min-height:34px}#foot .ui-icon{width:15px;height:15px}#bAll{color:var(--muted);background:transparent;border:0}#bExp{background:var(--green);border-color:var(--green);color:#fff}
.dim,.pl{position:fixed;transform:translate(-50%,-50%);z-index:2;pointer-events:none;white-space:nowrap;font:.6875rem var(--mono);border-radius:5px;padding:3px 5px;box-shadow:0 1px 4px #29302122}.dim,.pl.hl{background:#825a39;color:#fff}.pl{background:#f9f9f1f0;color:#35392f}.pl b{color:#805535}.pl.hl b{color:#fff}
#walk-pad{display:none;grid-template-columns:repeat(3,39px);grid-template-rows:repeat(2,39px);gap:3px;position:fixed;bottom:20px;left:18px;z-index:3}#walk-pad button{background:#fafbf5ed;box-shadow:0 1px 5px #26341e30;min-height:0;padding:0;touch-action:none;user-select:none;border:1px solid #ffffffaa}#walk-pad button:active,#walk-pad button.pressed{background:#cddac5}#walk-pad [data-key=w]{grid-column:2}#walk-pad [data-key=a]{grid-column:1;grid-row:2}#walk-pad [data-key=s]{grid-column:2;grid-row:2}#walk-pad [data-key=d]{grid-column:3;grid-row:2}
#gl-error{position:fixed;z-index:7;inset:0 var(--sidebar) 0 0;display:grid;place-content:center;text-align:center;padding:30px;background:#edece4}#gl-error h2{font-size:1.4rem}#gl-error p{max-width:350px;color:var(--muted);margin:0 auto}
@media(pointer:coarse){body[data-mode=walk] #walk-pad{display:grid}body[data-mode=walk] #help{display:none}}
@media(min-width:701px) and (max-height:670px){.project-head{padding-top:12px;padding-bottom:12px}.scene-controls,#catalog,#props{padding-top:10px;padding-bottom:10px}}
@media(max-width:700px){:root{--view:54vh;--view:54dvh}#gl{width:100%;height:var(--view)}#side{top:var(--view);left:0;width:100%;border:0;border-top:1px solid #b9bdb0}.project-head{padding:8px 16px;gap:10px}.mark{width:31px;height:31px;border-radius:7px}.mark .ui-icon{width:20px;height:20px}.project-head h1{font-size:1.2rem;margin:0}.project-head>div:last-child{display:flex;align-items:baseline;gap:11px;flex-direction:row-reverse}.project-name{font-size:.625rem;letter-spacing:.11em}.viewer-top,.viewer-bottom{left:10px;right:10px}.viewer-top{top:max(9px,env(safe-area-inset-top))}.viewer-bottom{bottom:calc(100% - var(--view) + 8px)}#modes button{font-size:.8125rem;min-height:34px;padding:6px 10px}.camera-tools button{width:29px;height:29px;min-height:29px}#help{font-size:.6875rem;max-width:62%}#toast{left:50%;top:57px;max-width:90vw}.scene-controls,#catalog,#props,#variants{padding:10px 15px}.scene-grid{margin-top:6px}.scene-grid>button{min-height:36px}.section-title{font-size:.9375rem}.advanced>summary{margin-top:5px}.scene-controls:has(+ #variants + #props[style*="display: block"]){display:none}#foot{padding:5px 12px max(5px,env(safe-area-inset-bottom))}#foot button{flex:1;min-height:31px}#gl-error{inset:0 0 auto;height:var(--view)}#walk-pad{bottom:calc(100% - var(--view) + 10px);left:12px}body[data-mode=walk] #walk-pad{display:grid}body[data-mode=walk] #help{display:none}body[data-mode=walk] .viewer-bottom{justify-content:flex-end}}
@media(max-width:380px){.viewer-bottom #help{display:none}.viewer-bottom{justify-content:flex-end}.scene-grid>button{font-size:.75rem}#modes button{padding:6px 8px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`;

const fields = [
  ['W','Ширина','см'], ['D','Дълбочина','см'], ['H','Височина','см'],
  ['X','Позиция X','см'], ['Y','Позиция Y','см'], ['Z','От пода','см'], ['R','Ъгъл','°']
];

const prefix = `<!doctype html>
<html lang="bg"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#34483b"><title>Апартамент Д15 · МОНА 5</title>
<style>${css}</style></head><body>
<canvas id="gl" tabindex="0" aria-label="Интерактивен триизмерен модел на апартамент Д15"></canvas>
<div class="viewer-top"><nav id="modes" class="glassbar" aria-label="Режим на камерата">
<button id="mOrbit" class="on" aria-pressed="true">${icon('orbit')}Общ изглед</button><button id="mWalk" aria-pressed="false">${icon('walk')}Разходка</button></nav>
<div class="help-panel"><button id="helpButton" title="Управление" aria-label="Управление" aria-expanded="false" aria-controls="helpContent">${icon('question')}</button><div class="help-content" id="helpContent" hidden><strong>Управление</strong>
<p>В общ изглед W и S местят камерата напред и назад, а A и D — наляво и надясно. Влачи, за да завъртиш. Приближи с колелцето или с бутоните + и −.</p><p>Избери мебел, после я премести с влачене или със стрелките. Натисни вратичка или чекмедже, за да ги отвориш.</p><p>При разходка се движи с W, A, S, D, стрелките или екранните бутони. Влачи, за да се огледаш.</p></div></div></div>
<div class="viewer-bottom"><div id="help"></div><div class="camera-tools glassbar" aria-label="Мащаб и кадриране"><button id="bFar" title="Отдалечи" aria-label="Отдалечи">${icon('minus')}</button><button id="bNear" title="Приближи" aria-label="Приближи">${icon('plus')}</button><button id="bFit" class="split" title="Покажи целия апартамент" aria-label="Покажи целия апартамент">${icon('fit')}</button></div></div>
<div id="walk-pad" aria-label="Движение при разходка">${[['w','up','Напред'],['a','left','Наляво'],['s','down','Назад'],['d','right','Надясно']].map(([key,dir,word])=>`<button type="button" data-key="${key}" aria-label="${word}">${icon(dir)}</button>`).join('')}</div>
<aside id="side" aria-label="Инструменти на редактора"><header class="project-head"><div class="mark" aria-hidden="true">${icon('plan')}</div><div><div class="project-name">МОНА 5</div><h1>Апартамент Д15</h1></div></header>
<div class="side-scroll">
<section class="scene-controls" aria-labelledby="scene-controls-title"><h2 class="section-title" id="scene-controls-title">Управление на модела</h2>
<div class="scene-grid"><button id="bFold" aria-pressed="false">Отвори преградата</button><button id="mDoors">Отвори шкафовете</button><button id="mCut">${icon('cut')}Срез на стените</button><button id="mDims" class="on">${icon('ruler')}Отстояния</button></div>
<details class="advanced"><summary>${icon('more')}Настройки на изгледа</summary><div class="settings-row"><button id="mIds">Номера и размери</button><button id="mOver">Разреши застъпване</button></div></details></section>
<div id="variants"></div>
<section id="props"><button class="back" id="backToObjects">${icon('back')}Към мебелите</button><h2 id="pName"></h2><div class="room" id="pRoom"></div>
<div class="part-actions"><button id="bOpen" style="display:none">Отвори</button><button id="bDoors" style="display:none">Отвори вратичките</button></div>
${fields.map(([key,label,unit])=>`<div class="row"><label for="n${key}">${label}</label><input type="range" id="r${key}" aria-label="${label} (${unit})"><input type="number" id="n${key}" aria-label="${label} (${unit})" title="${label} (${unit})"></div>`).join('')}
<div class="btns"><button id="bRot">Завърти 90°</button><button id="bDup">Дублирай</button><button id="bRes">Възстанови</button><button id="bDel" class="warn">Скрий</button></div></section>
<section id="catalog"><div class="catalog-head"><h2 class="section-title">Обзавеждане</h2><span class="units" title="Ширина × дълбочина × височина в сантиметри">Ш × Д × В, см</span></div>
<label class="search">${icon('find')}<input id="pieceSearch" type="search" placeholder="Намери мебел или стая" aria-label="Намери мебел или стая" autocomplete="off"></label>
<div id="list"><div id="legend"></div><div id="items"></div><p class="empty-result" id="noPieces" hidden>Няма съвпадения.</p></div></section></div>
<footer id="foot"><button id="bUndo" title="Отмени последната промяна">${icon('undo')}Отмени</button><button id="bAll">Нулирай</button><button id="bExp" title="Изтегли промените като JSON">${icon('export')}Експорт</button></footer></aside>
<div id="toast" role="status"></div><div id="gl-error" hidden><div><h2>Триизмерният изглед е недостъпен</h2><p>Отвори модела в браузър с включено графично ускорение и поддръжка на WebGL.</p></div></div>
<noscript><p style="position:fixed;inset:20px;z-index:8;background:white;padding:20px">Включи JavaScript, за да отвориш 3D редактора.</p></noscript>
`;

const translations = [
  ["'Open doors'", "'Отвори вратичките'"], ["'Close doors'", "'Затвори вратичките'"],
  ["'Open all doors'", "'Отвори шкафовете'"], ["'Close all doors'", "'Затвори шкафовете'"],
  ["'Open'", "'Отвори'"], ["'Close'", "'Затвори'"], ["'against'", "'допир'"],
  ["' cm'", "' см'"], ["} cm", "} см"], [" · removed", " · скрита"],
  ["Openable fronts · ID = same kind & size", "Вратички и чекмеджета по размер"],
  [" · try a design", " · варианти"], ["'a wall'", "'стена'"],
  ["Stopped: it would run into ", "Достигнато препятствие — "],
  ["Can't rotate here: it would overlap ", "Завъртането е ограничено от "],
  ["Can\\'t rotate here: it would overlap ", "Завъртането е ограничено от "],
  ["Blocked by ", "Движението е ограничено от "],
  ["No free spot nearby — the copy overlaps something", "Копието се застъпва със съседен обект"],
  ["Removed — click it in the list to bring it back", "Мебелта е скрита"],
  ["'Restored'", "'Мебелта е показана'"], ["Nothing to undo", "Няма промяна за отмяна"],
  ["Click again to reset", "Потвърди"], ["Reset all", "Нулирай"],
  ["Changes copied — paste them to Claude", "Промените са копирани"],
  ["No changes yet", "Все още няма промени"], ["Pieces can now overlap", "Застъпването е разрешено"],
  ["Pieces can no longer overlap", "Застъпването е изключено"],
  ["(copy", "(копие"]
];

// The reference editor redraws the list after a copy, removal or undo.
function wireInterface() {
  const search = document.getElementById('pieceSearch');
  const items = document.getElementById('items');
  const scroller = document.querySelector('.side-scroll');
  const props = document.getElementById('props');
  const folded = document.getElementById('bFold');
  const drawer = document.getElementById('mDoors');
  const mobile = matchMedia('(max-width:700px)');
  function filterList() {
    const phrase = search.value.trim().toLocaleLowerCase('bg');
    let group = null;
    let count = 0;
    for (const row of items.children) {
      if (row.classList.contains('grp')) {
        group = row;
        group.hidden = true;
        continue;
      }
      const groupText = group ? group.textContent : '';
      const matches = (groupText + ' ' + row.textContent).toLocaleLowerCase('bg').includes(phrase);
      row.hidden = !matches;
      row.setAttribute('role','button');
      row.tabIndex = matches ? 0 : -1;
      if (matches) {
        if (group) group.hidden = false;
        count++;
      }
    }
    document.getElementById('noPieces').hidden = count > 0;
  }
  search.addEventListener('input',filterList);
  new MutationObserver(filterList).observe(items,{childList:true});
  filterList();
  items.addEventListener('keydown',event=>{
    if ((event.key==='Enter'||event.key===' ') && event.target.matches('.it')) {
      event.preventDefault();
      event.target.click();
    }
  });
  const back = document.getElementById('backToObjects');
  let previouslyShowing = false;
  let previousScroll = 0;
  let previousItem = '';
  function inspectorChanged() {
    const showing = props.style.display==='block';
    if (showing && !previouslyShowing) {
      previousScroll = scroller.scrollTop;
      previousItem = String(sel);
      if (mobile.matches) scroller.scrollTop = 0;
      else scroller.scrollTop = Math.max(0, props.offsetTop - scroller.offsetTop - 6);
    } else if (!showing && previouslyShowing) {
      scroller.scrollTop = previousScroll;
    }
    if (showing && sel >= 0) {
      document.getElementById('bDel').textContent = INST[sel].hidden ? 'Покажи' : 'Скрий';
    }
    previouslyShowing = showing;
  }
  new MutationObserver(inspectorChanged).observe(props,{attributes:true,attributeFilter:['style']});
  back.addEventListener('click',()=>{
    select(-1);
    requestAnimationFrame(()=>{
      const previous = items.querySelector('.it[data-i="'+previousItem+'"]');
      if(previous) previous.focus({preventScroll:true});
    });
  });
  const helpButton = document.getElementById('helpButton');
  const helpContent = document.getElementById('helpContent');
  function showHelp(open) {
    helpContent.hidden = !open;
    helpButton.setAttribute('aria-expanded',String(open));
  }
  helpButton.addEventListener('click',()=>showHelp(helpContent.hidden));
  document.addEventListener('pointerdown',event=>{
    if (!event.target.closest('.help-panel')) showHelp(false);
  });
  function clearWalkKeys() {
    for (const button of document.querySelectorAll('#walk-pad button')) {
      delete keys[button.dataset.key];
      button.classList.remove('pressed');
    }
  }
  addEventListener('blur',clearWalkKeys);
  document.addEventListener('visibilitychange',()=>{if (document.hidden) clearWalkKeys()});
  for (const button of document.querySelectorAll('#walk-pad button')) {
    const release = ()=>{delete keys[button.dataset.key];button.classList.remove('pressed')};
    button.addEventListener('pointerdown',event=>{
      if (mode!=='walk') return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      keys[button.dataset.key]=1;
      button.classList.add('pressed');
    });
    button.addEventListener('pointerup',release);
    button.addEventListener('pointercancel',release);
    button.addEventListener('lostpointercapture',release);
  }
  for (const [id,delta] of [['bNear',-115],['bFar',115]]) {
    document.getElementById(id).addEventListener('click',()=>{
      cv.dispatchEvent(new WheelEvent('wheel',{deltaY:delta,cancelable:true}));
    });
  }
  document.getElementById('bFit').addEventListener('click',()=>{
    if (typeof window.d15FitView==='function') window.d15FitView();
    else document.getElementById('mOrbit').click();
  });
  const buttons = ['mOrbit','mWalk','mIds','mOver','mCut','mDims'];
  function updateMode() {
    document.body.dataset.mode = mode;
    if (mode!=='walk') clearWalkKeys();
    for (const [id, overview, walking] of [['bNear','Приближи','Стъпка напред'],['bFar','Отдалечи','Стъпка назад']]) {
      const button = document.getElementById(id);
      button.title = mode==='walk' ? walking : overview;
      button.setAttribute('aria-label',button.title);
    }
    for (const id of buttons) {
      const button = document.getElementById(id);
      button.setAttribute('aria-pressed',String(button.classList.contains('on')));
    }
  }
  for (const id of buttons) {
    new MutationObserver(updateMode).observe(document.getElementById(id),{attributes:true,attributeFilter:['class']});
  }
  updateMode();
  if (typeof window.d15SyncFold==='function') window.d15SyncFold();
  folded.title = 'Сгъваема стъклена преграда между кухнята и дневната';
  drawer.title = 'Отваряне и затваряне на вратичките и чекмеджетата';
}

module.exports = function transform(html) {
  const scriptOffset = html.search(/<script\b/i);
  if (scriptOffset < 0) throw new Error('Missing editor script');
  let script = html.slice(scriptOffset);
  for (const [source,target] of translations) script = script.split(source).join(target);
  script = script.replace(/<b>Overview<\/b> · drag:[^']+/,
    'W A S D местят камерата. Влачи, за да завъртиш.');
  script = script.replace(/<b>Walk inside<\/b> · W\/A\/S\/D[^']+/,
    'W A S D или стрелки за движение. Влачи, за да се огледаш.');
  const fallback = "<script>if(!document.getElementById('gl').getContext('webgl',{antialias:true,preserveDrawingBuffer:false})){document.getElementById('gl-error').hidden=false;document.getElementById('side').inert=true}</script>";
  const init = '<script>if(document.getElementById("gl-error").hidden){('+wireInterface.toString()+')()}</script>';
  return prefix + fallback + script.replace(/<\/body>/i,init + '</body>');
};
