const LIBERATION_BASE = 'https://liberation.rpg-librarium.de/v1';
const _DEBUG_PRINT = text => thing => (console.debug(text, thing), thing);
const _FORMAT_DATE = date => date.toLocaleString('de-DE', {
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const _ROOT = document.documentElement;
_ROOT.classList.add('loadingTitles');

// load as early as posible
let titlesPromise = fetch(`${LIBERATION_BASE}/titles`)
  .then(response => response.json())
  .then(_DEBUG_PRINT('titles json'))
  .then(data => processTitleData(data))
  .then(_DEBUG_PRINT('titles processed'))

function processTitleData(titlesData) {
  let systemsMap = {};
  let titlesMap = {};
  let titles = titlesData.titles.sort((a,b) => a.name.localeCompare(b.name));
  titles.forEach(t => {
    titlesMap[t.id] = t;
    let sysId = t.system.id;
    if (!systemsMap[sysId]) {
      systemsMap[sysId] = {...t.system};
    }
    let sys = systemsMap[sysId];
    if (!sys.titles) sys.titles = [];
    sys.titles.push(t.id);
  });
  let systems = Object.values(systemsMap)
    .sort((a,b) => a.name.localeCompare(b.name));

  return {
    now: new Date(),
    systems,
    systemsMap,
    titles,
    titlesMap,
  };
}

function doTheMagic(data) {
  const _C = (tag, opts={}) => {
    let el = document.createElement(tag);
    if (opts.classes) opts.classes.forEach(c => el.classList.add(c));
    if (opts.id) el.id = opts.id;
    if (opts.children) opts.children.forEach(c => el.appendChild(c));
    if (opts.text) el.innerText = opts.text;
    if (opts.attrs) Object.keys(opts.attrs).forEach(k=>el.setAttribute(k, opts.attrs[k]));
    return el;
  };
  let container = _C('div', {id:'titleListContainer'});
  container.appendChild(renderFullList());
  document.querySelector('table.titles').replaceWith(container);

  function renderFullList() {
    let table = _C('table', {
      classes:['titles', 'full-list'],
      children: [
        _C('thead', {children:[
          _C('tr', {children:[
            _C('th', {classes:['title'], text:'Titel'}),
            _C('th', {classes:['system'], text:'System'}),
          ]})
        ]}),
      ]
    });
    let tbody = _C('tbody');
    table.appendChild(tbody);
    data.systems.forEach(sys => {
        let displayName = sys.shortname ?
          `[${sys.shortname}] ${sys.name}` :
          sys.name;
        tbody.appendChild(_C('tr', {
          classes: ['system'],
          children:[_C('th', {
            text: displayName,
            attrs: {colspan: 2},
          })]
        }));
        sys.titles.forEach(tId => {
          let title = data.titlesMap[tId];
          tbody.appendChild(_C('tr', {
            classes: ['title'],
            children:[_C('td', {
              text: title.name,
              attrs: {colspan: 2},
            })]
          }));
        })
    })

    return table;
  }
}

document.addEventListener('DOMContentLoaded', evt => {
  titlesPromise
    .then(data => {
      doTheMagic(data);
      let updateTimeNode = document.querySelector('.titles+.updatedAt time, #titleListContainer+.updatedAt time');
      updateTimeNode.datetime = data.now.toISOString();
      updateTimeNode.innerText = _FORMAT_DATE(data.now);
      _ROOT.classList.remove('loadingTitles');
    })
    .catch(e => {
      _ROOT.classList.remove('loadingTitles');
      let statusNode = document.querySelector('.titles+.updatedAt .updating');
      statusNode.classList.add('error');
      statusNode.innerText = `Aktualisierung fehlgeschlagen. (${e})`;
    });
});
