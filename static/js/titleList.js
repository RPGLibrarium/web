'use strict';

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
  const _LIST_STYLES = [
    {
      id: 'static',
      renderFn: renderStaticLikeList,
      name: 'Einfach Alles',
      description: 'eine einfache Liste mit allen Titeln',
    },{
      id: 'grouped',
      renderFn: renderFullList,
      name: 'Gruppiert',
      description: 'eine etwas weniger einfache Liste, gruppiert nach Systemen',
    },
  ];
  const _C = (tag, opts={}) => {
    let el = document.createElement(tag);
    if (opts.classes) opts.classes.forEach(c => el.classList.add(c));
    if (opts.id) el.id = opts.id;
    if (opts.children) opts.children.forEach(c => el.appendChild(c));
    if (opts.text) el.innerText = opts.text;
    if (opts.attrs) Object.keys(opts.attrs).forEach(k=>el.setAttribute(k, opts.attrs[k]));
    return el;
  };
  const titlesRoot = document.querySelector('.titlesTable');
  let activeStyle = _LIST_STYLES[0].id; // default style
  let activeStyleNode = null;
  const styleSelector = renderStyleSelector();
  let container = _C('div', {id:'titleListContainer'});
  changeStyle(activeStyle);
  titlesRoot.querySelector('table.titles').replaceWith(container);
  titlesRoot.prepend(styleSelector);

  function changeStyle(newStyleId) {
    // retrieve style info
    let filtered = _LIST_STYLES.filter(s => s.id === newStyleId);
    if (filtered.length !== 1) {
      console.debug('could not find list style ', newStyleId);
      changeStyle(activeStyle);
      return false;
    }
    let newStyle = filtered[0];
    let previousStyle = activeStyle;
    activeStyle = newStyle;

    // update selector
    styleSelector
      .querySelector(`input[type=radio][value=${newStyle.id}]`)
      .checked = true;

    // apply style, if not already active
    let prevNode = container.querySelector('.titles');
    if (previousStyle.id === newStyle.id && prevNode) {
      return true;
    }
    let newNode = newStyle.renderFn();
    if (prevNode) {
      prevNode.replaceWith(newNode);
    } else {
      container.appendChild(newNode);
    }
  }

  function renderStyleSelector() {
    let element = _C('div', {
      classes:['styleSelect'],
      children: [
        _C('span', {text: 'Ansicht:'}),
        ... _LIST_STYLES.flatMap(style => {
          let inputId = `_listStyleSelect_${style.id}`;
          let input = _C('input', {
            id: inputId,
            attrs: {
              type: 'radio',
              name: '_listStyleSelect',
              value: style.id,
            },
          });
          let label = _C('label', {
            attrs: {
              for: inputId,
              title: style.description,
              tabindex: 0,
              role: 'button',
            },
            text: style.name,
          });
          let labelListener = evt => {
            let target = evt.target;
            if (evt.type === 'click'
                || (evt.type === 'keydown'
                  && [' ', 'Enter'].includes(evt.key))) {
              evt.preventDefault();
              input.checked = true;
              changeStyle(style.id);
            }
          };
          label.addEventListener('click', labelListener);
          label.addEventListener('keydown', labelListener);
          input.addEventListener('change', evt => {
            if (input.checked) {
              changeStyle(style.id);
            }
          });
          return [input, label];
        })
      ],
    });
    return element;
  }

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

  function renderStaticLikeList() {
    let table = _C('table', {
      classes:['titles', 'static-like-list'],
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
    data.titles
      .sort((a,b) => a.name.localeCompare(b.name))
      .forEach(title => {
        let sys = title.system;
        tbody.appendChild(_C('tr', {children:[
          _C('td', {
            classes: ['title'],
            text: title.name,
          }),
          _C('td', {
            classes: ['system'],
            text: sys.name,
          }),
        ]}));
      });

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
