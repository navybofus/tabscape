console.log('Tabscape - Error Warning: The Tabscape extension can import favicons from URLs, which may not be secure. However, the extension does not inject or execute any external scripts. The error is a warning that Chrome blocked a script from a remote site, but it does not affect the extension\'s security or functionality.');

// --- MVP Dashboard Implementation ---
const root = document.getElementById('dashboard-root');

// --- State ---
let state = {
  bg: localStorage.getItem('bg') || '#181c20',
  panelColor: localStorage.getItem('panelColor') || '#23272e,0.95',
  rssPanelColor: localStorage.getItem('rssPanelColor') || '#23272e,0.95',
  fontColor: localStorage.getItem('fontColor') || '#f8f9fa',
  linkColor: localStorage.getItem('linkColor') || '#4da3ff',
  links: JSON.parse(localStorage.getItem('links') || '[]'),
  feeds: JSON.parse(localStorage.getItem('feeds') || '[{"url":"https://www.polygon.com/rss/gaming/index.xml"}]'),
  weather: JSON.parse(localStorage.getItem('weather') || '{"city":"New York"}'),
  weatherUnit: localStorage.getItem('weatherUnit') || 'C', // 'C' or 'F'
  weatherDistance: localStorage.getItem('weatherDistance') || 'kmh', // 'kmh' or 'mph'
};

function saveState() {
  localStorage.setItem('bg', state.bg);
  localStorage.setItem('panelColor', state.panelColor);
  localStorage.setItem('rssPanelColor', state.rssPanelColor);
  localStorage.setItem('fontColor', state.fontColor);
  localStorage.setItem('linkColor', state.linkColor);
  localStorage.setItem('links', JSON.stringify(state.links));
  localStorage.setItem('feeds', JSON.stringify(state.feeds));
  localStorage.setItem('weather', JSON.stringify(state.weather));
  localStorage.setItem('weatherUnit', state.weatherUnit);
  localStorage.setItem('weatherDistance', state.weatherDistance);
}

// --- Theme Shortcuts ---
const THEMES = [
  {
    name: 'Chillwave Blue',
    bg: '#1e1e1f',
    panelColor: '#2492c7,0.08',
    rssPanelColor: '#2492c7,0.13',
    fontColor: '#E0E0E0',
    linkColor: '#4FC3F7',
  },
  {
    name: 'Spicy Sunset',
    bg: '#2d1a1a',
    panelColor: '#e65f2e,0.08',
    rssPanelColor: '#ff7043,0.13',
    fontColor: '#fff3e0',
    linkColor: '#ff7043',
  },
  {
    name: 'Forest Bloom',
    bg: '#1a2d1a',
    panelColor: '#22cc4a,0.08',
    rssPanelColor: '#43ff70,0.13',
    fontColor: '#e0ffe0',
    linkColor: '#43ff70',
  },
  {
    name: 'Twilight Haze',
    bg: '#1a1a2d',
    panelColor: '#4e1eb8,0.08',
    rssPanelColor: '#7043ff,0.13',
    fontColor: '#e0e0ff',
    linkColor: '#7043ff',
  },
  {
    name: 'Bubblegum Dreams',
    bg: '#2d1a2a',
    panelColor: '#ff5cad,0.08',
    rssPanelColor: '#ff85c1,0.13',
    fontColor: '#ffe0f0',
    linkColor: '#ff8dd8',
  }
];


function renderThemeShortcuts() {
  const themeDiv = document.createElement('div');
  themeDiv.className = 'theme-shortcuts';
  themeDiv.innerHTML = '<hr><h5 style="margin-top:0;margin-bottom:12px;">Themes</h5>';
  themeDiv.innerHTML += THEMES.map((t, i) =>
    `<button class="btn btn-sm" data-theme="${i}" style="margin-right:8px;margin-bottom:8px;background:none;border:1.5px solid ${state.linkColor};color:${state.linkColor};">${t.name}</button>`
  ).join('');
  themeDiv.innerHTML += '<hr>';
  themeDiv.onclick = e => {
    if (e.target.dataset.theme) {
      const t = THEMES[parseInt(e.target.dataset.theme)];
      state.bg = t.bg;
      state.panelColor = t.panelColor;
      state.rssPanelColor = t.rssPanelColor || t.panelColor;
      state.fontColor = t.fontColor;
      state.linkColor = t.linkColor; 
      saveState();
      // If settings modal is open, re-render its content for consistency
      const modal = document.getElementById('tabscape-settings-modal');
      if (modal && modal.style.display !== 'none') {
        const content = modal.querySelector('#tabscape-settings-content');
        renderSettingsContent(content);
      }
      render();
    }
  };
  return themeDiv;
}





// --- Helper to get hex and alpha from panelColor string ---
function getPanelHex(panelColor) {
  if (!panelColor) return '#23272e';
  const parts = panelColor.split(',');
  return parts[0].startsWith('#') ? parts[0] : '#23272e';
}
function getPanelAlpha(panelColor) {
  if (!panelColor) return 95;
  const parts = panelColor.split(',');
  let a = 1;
  if (parts[1]) a = parseFloat(parts[1]);
  if (isNaN(a)) a = 1;
  return Math.round(a * 100);
}

// --- Background, Panel, Font, and Link Color Picker ---
function renderBackgroundSelector() {
  const bgDiv = document.createElement('div');
  bgDiv.className = 'bg-selector';
  bgDiv.innerHTML = `
    <h5>Customize Appearance</h5>
    <label><input type="color" id="bg-color" value="${state.bg && !state.bg.startsWith('url(') ? state.bg : '#181c20'}"> Background</label>
    <br><label><input type="color" id="panel-color" value="${getPanelHex(state.panelColor)}"> Panel Color</label>
    <br><input type="range" id="panel-alpha" min="0" max="100" value="${getPanelAlpha(state.panelColor)}" style="width:140px;">
    <span id="alpha-val">${getPanelAlpha(state.panelColor)}%</span>
    <br><label><input type="color" id="rss-panel-color" value="${getPanelHex(state.rssPanelColor)}"> RSS Panel Color</label>
    <br><input type="range" id="rss-panel-alpha" min="0" max="100" value="${getPanelAlpha(state.rssPanelColor)}" style="width:140px;">
    <span id="rss-alpha-val">${getPanelAlpha(state.rssPanelColor)}%</span>
    <br><label><input type="color" id="font-color" value="${state.fontColor || '#f8f9fa'}"> Font Color</label>
    <br><label><input type="color" id="link-color" value="${state.linkColor || '#4da3ff'}"> Link Color</label>
  `;
  // Background color picker
  bgDiv.querySelector('#bg-color').onblur = e => {
    state.bg = e.target.value;
    saveState();
    render();
  };
  // Panel color RGBA
  const panelColorInput = bgDiv.querySelector('#panel-color');
  const panelAlphaInput = bgDiv.querySelector('#panel-alpha');
  const alphaVal = bgDiv.querySelector('#alpha-val');
  panelColorInput.oninput = () => {
    state.panelColor = `${panelColorInput.value},${panelAlphaInput.value/100}`;
    saveState();
    render();
  };
  panelAlphaInput.oninput = () => {
    state.panelColor = `${panelColorInput.value},${panelAlphaInput.value/100}`;
    alphaVal.textContent = `${panelAlphaInput.value}%`;
    saveState();
    render();
  };
  // RSS panel color RGBA
  const rssPanelColorInput = bgDiv.querySelector('#rss-panel-color');
  const rssPanelAlphaInput = bgDiv.querySelector('#rss-panel-alpha');
  const rssAlphaVal = bgDiv.querySelector('#rss-alpha-val');
  rssPanelColorInput.oninput = () => {
    state.rssPanelColor = `${rssPanelColorInput.value},${rssPanelAlphaInput.value/100}`;
    saveState();
    render();
  };
  rssPanelAlphaInput.oninput = () => {
    state.rssPanelColor = `${rssPanelColorInput.value},${rssPanelAlphaInput.value/100}`;
    rssAlphaVal.textContent = `${rssPanelAlphaInput.value}%`;
    saveState();
    render();
  };
  // Font color
  bgDiv.querySelector('#font-color').oninput = e => {
    state.fontColor = e.target.value;
    saveState();
    render();
  };
  // Link color
  bgDiv.querySelector('#link-color').oninput = e => {
    state.linkColor = e.target.value;
    saveState();
    render();
  };
  return bgDiv;
}

// --- Weather Settings (for Settings Modal) ---
function renderWeatherSettings() {
  const div = document.createElement('div');
  div.className = 'weather-settings';
  div.innerHTML = `
    <h5>Weather Settings</h5>
    <h6 style="margin-bottom:8px;">Location</h6>
    <form id="settings-weather-city-form" style="margin-bottom:12px;display:flex;gap:8px;align-items:center;">
      <input type="text" id="settings-weather-city" value="${state.weather.city}" placeholder="Enter city or zipcode" style="width:70%;max-width:220px;">
      <button type="submit" class="btn btn-sm" style="background:none;border:1.5px solid ${state.linkColor};color:${state.linkColor};">Set</button>
    </form>
    <h6 style="margin-bottom:8px;">Units</h6>
    <div style="margin-bottom:8px;">
      <label style="margin-right:8px;">
        <input type="radio" name="settings-weather-unit" value="C" ${state.weatherUnit === 'C' ? 'checked' : ''}> °C
      </label>
      <label style="margin-right:8px;">
        <input type="radio" name="settings-weather-unit" value="F" ${state.weatherUnit === 'F' ? 'checked' : ''}> °F
      </label>
      <label style="margin-left:16px;margin-right:8px;">
        <input type="radio" name="settings-weather-distance" value="kmh" ${state.weatherDistance === 'kmh' ? 'checked' : ''}> km/h
      </label>
      <label>
        <input type="radio" name="settings-weather-distance" value="mph" ${state.weatherDistance === 'mph' ? 'checked' : ''}> mph
      </label>
    </div>
    <hr>
  `;
  // City/zipcode form
  div.querySelector('#settings-weather-city-form').onsubmit = e => {
    e.preventDefault();
    const city = div.querySelector('#settings-weather-city').value.trim();
    if (city) {
      state.weather.city = city;
      saveState();
      render();
    }
  };
  // Unit toggles
  div.querySelectorAll('input[name="settings-weather-unit"]').forEach(radio => {
    radio.onchange = e => {
      state.weatherUnit = e.target.value;
      saveState();
      render();
    };
  });
  div.querySelectorAll('input[name="settings-weather-distance"]').forEach(radio => {
    radio.onchange = e => {
      state.weatherDistance = e.target.value;
      saveState();
      render();
    };
  });
  return div;
}

// --- Weather Widget (fetches Open-Meteo API, no city input) ---
async function renderWeatherWidget() {
  const div = document.createElement('div');
  div.className = 'widget weather';
  div.innerHTML = `
    <div id="weather-data">Loading...</div>
  `;
  // Weather code mapping (Open-Meteo WMO codes)
  const weatherCodeMap = {
    0: { desc: 'Clear sky', emoji: '☀️' },
    1: { desc: 'Mainly clear', emoji: '🌤️' },
    2: { desc: 'Partly cloudy', emoji: '⛅' },
    3: { desc: 'Overcast', emoji: '☁️' },
    45: { desc: 'Fog', emoji: '🌫️' },
    48: { desc: 'Depositing rime fog', emoji: '🌫️' },
    51: { desc: 'Light drizzle', emoji: '🌦️' },
    53: { desc: 'Drizzle', emoji: '🌦️' },
    55: { desc: 'Dense drizzle', emoji: '🌦️' },
    56: { desc: 'Freezing drizzle', emoji: '🌧️' },
    57: { desc: 'Freezing dense drizzle', emoji: '🌧️' },
    61: { desc: 'Slight rain', emoji: '🌦️' },
    63: { desc: 'Rain', emoji: '🌧️' },
    65: { desc: 'Heavy rain', emoji: '🌧️' },
    66: { desc: 'Freezing rain', emoji: '🌧️' },
    67: { desc: 'Heavy freezing rain', emoji: '🌧️' },
    71: { desc: 'Slight snow fall', emoji: '🌨️' },
    73: { desc: 'Snow fall', emoji: '🌨️' },
    75: { desc: 'Heavy snow fall', emoji: '❄️' },
    77: { desc: 'Snow grains', emoji: '❄️' },
    80: { desc: 'Slight rain showers', emoji: '🌦️' },
    81: { desc: 'Rain showers', emoji: '🌧️' },
    82: { desc: 'Violent rain showers', emoji: '⛈️' },
    85: { desc: 'Slight snow showers', emoji: '🌨️' },
    86: { desc: 'Heavy snow showers', emoji: '❄️' },
    95: { desc: 'Thunderstorm', emoji: '⛈️' },
    96: { desc: 'Thunderstorm w/ slight hail', emoji: '⛈️' },
    99: { desc: 'Thunderstorm w/ heavy hail', emoji: '⛈️' },
  };
  // Fetch weather
  const weatherDiv = div.querySelector('#weather-data');
  try {
    const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(state.weather.city)}`);
    const geo = await resp.json();
    if (geo.results && geo.results[0]) {
      const { latitude, longitude, name, country, admin1 } = geo.results[0];
      // Open-Meteo API supports temperature_unit and windspeed_unit
      const tempUnit = state.weatherUnit === 'F' ? 'fahrenheit' : 'celsius';
      const windUnit = state.weatherDistance === 'mph' ? 'mph' : 'kmh';
      const wresp = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${tempUnit}&windspeed_unit=${windUnit}`);
      const wdata = await wresp.json();
      if (wdata.current_weather) {
        console.log(wdata);
        const temp = wdata.current_weather.temperature;
        const wind = wdata.current_weather.windspeed;
        const windDir = wdata.current_weather.winddirection;
        const code = wdata.current_weather.weathercode;
        const tempLabel = state.weatherUnit === 'F' ? '°F' : '°C';
        const windLabel = state.weatherDistance === 'mph' ? 'mph' : 'km/h';
        const codeInfo = weatherCodeMap[code] || { desc: 'Unknown', emoji: '❓' };
        // Wind direction: use upward arrow emoji and rotate by windDir
        function getWindAbbr(deg) {
          const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
          return dirs[Math.round(((deg % 360) / 22.5)) % 16];
        }
        const windAbbr = getWindAbbr(windDir);
        // New layout with rotated arrow
        // Prefer city, state/province if available, else city, country
        let locationLabel = name;
        if (admin1 && admin1 !== country) {
          locationLabel += ", " + admin1;
        } else {
          locationLabel += ", " + country;
        }
        weatherDiv.innerHTML = `
          <div style="font-weight:bold;font-size:1.08em;margin-bottom:2px;">${locationLabel}</div>
          <div style="display:grid;grid-template-columns:100px 1fr;align-items:center;gap:0.5rem 1.2rem;margin-bottom:0.5rem;">
            <div style="font-size:3em;line-height:1.1;text-align:center;">${codeInfo.emoji}</div>
            <div style="font-size:2.5em;font-weight:600;line-height:1.1;">${temp}<span style='font-size:0.5em;font-weight:400;'>${tempLabel}</span></div>
            <div style="text-align:center;max-width:100%;" title="${codeInfo.desc}">${codeInfo.desc}</div>
            <div style="font-size:1.1em;display:flex;align-items:center;gap:0.5em;">
              <span title="${windDir}° ${windAbbr}" style="font-size:1.3em;display:inline-block;transform:rotate(${windDir}deg);">🡱</span>
              <span>${wind} ${windLabel} <span style="font-size:0.95em;color:#aaa;">${windAbbr}</span></span>
            </div>
          </div>
        `;
      } else {
        weatherDiv.innerText = 'Weather unavailable.';
      }
    } else {
      weatherDiv.innerText = 'City not found.';
    }
  } catch {
    weatherDiv.innerText = 'Error fetching weather.';
  }
  return div;
}

// --- Quick Link Gallery ---
function renderLinkGallery() {
  const div = document.createElement('div');
  div.className = 'widget links';
  div.style.background = 'transparent';
  div.style.color = 'inherit';
  const panelBg = hexToRgba(getPanelHex(state.panelColor), getPanelAlpha(state.panelColor)/100);
  div.innerHTML = `<div class="links-header"><b>Quick Links</b> <button id="add-link" title="Add Link" style="background:${panelBg};border:none;color:inherit;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:1.1em;">+</button></div><div class="links-list"></div>`;
  const list = div.querySelector('.links-list');
  state.links.forEach((link, i) => {
    const item = document.createElement('div');
    item.className = 'link-item d-flex align-items-center mb-2';
    // Drag handle
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.innerHTML = '&#9776;'; // Unicode triple bar ≡
    handle.style = 'cursor:grab;font-size:1.5em;margin-right:10px;user-select:none;';
    // Favicon as clickable link (32px)
    const faviconLink = document.createElement('a');
    faviconLink.href = link.url;
    faviconLink.target = '_blank';
    faviconLink.style = 'display:inline-block;margin-right:10px;';
    const favicon = document.createElement('img');
    favicon.src = link.logo || ('https://www.google.com/s2/favicons?sz=32&domain=' + link.url);
    favicon.width = 32;
    favicon.height = 32;
    favicon.style = 'vertical-align:middle;border-radius:6px;background:transparent;object-fit:contain;box-shadow:0 1px 4px #0002;';
    favicon.onerror = function() {
      if (favicon.src.indexOf('icon48.png') === -1) {
        favicon.src = 'icons/icon48.png';
      }
    };
    faviconLink.appendChild(favicon);
    // Name input
    const nameInput = document.createElement('input');
    nameInput.value = link.name;
    nameInput.setAttribute('data-idx', i);
    // Match input border to panel background
    const panelBg = hexToRgba(getPanelHex(state.panelColor), getPanelAlpha(state.panelColor)/100);
    nameInput.style = `width:40%;margin-right:10px;background:transparent;color:inherit;border:1.5px solid ${panelBg};border-radius:4px;padding:2px 6px;`;
    nameInput.onchange = e => {
      state.links[i].name = e.target.value;
      saveState();
    };
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.innerText = '🗑️';
    delBtn.title = 'Remove (permanent)';
    delBtn.setAttribute('data-del', i);
    // Style button to match panel background and be flat
    delBtn.style.background = panelBg;
    delBtn.style.border = 'none';
    delBtn.style.color = 'inherit';
    delBtn.style.padding = '4px 8px';
    delBtn.style.borderRadius = '4px';
    delBtn.style.cursor = 'pointer';
    delBtn.onmouseover = () => { delBtn.style.background = '#0002'; };
    delBtn.onmouseout = () => { delBtn.style.background = panelBg; };
    delBtn.onclick = () => {
      state.links.splice(i, 1);
      saveState();
      render();
    };
    // Assemble
    item.appendChild(handle);
    item.appendChild(faviconLink);
    item.appendChild(nameInput);
    item.appendChild(delBtn);
    list.appendChild(item);
  });
  const addLinkBtn = div.querySelector('#add-link');
  addLinkBtn.onmouseover = () => { addLinkBtn.style.background = '#0002'; };
  addLinkBtn.onmouseout = () => { addLinkBtn.style.background = panelBg; };
  addLinkBtn.onclick = async () => {
    const url = prompt('Enter URL:');
    if (!url) return;
    let name = '';
    let logo = '';
    try {
      const resp = await fetch(url);
      const html = await resp.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      name = titleMatch ? titleMatch[1] : url;
      const logoMatch = html.match(/<link[^>]+rel=["'].*icon.*["'][^>]+href=["']([^"']+)["']/i);
      logo = logoMatch ? (logoMatch[1].startsWith('http') ? logoMatch[1] : new URL(logoMatch[1], url).href) : '';
    } catch {
      name = url;
    }
    state.links.push({ url, name, logo });
    saveState();
    render();
  };
  return div;
}

// --- RSS Feed Panels ---
function renderRSSFeeds() {
  const div = document.createElement('div');
  div.className = 'widget feeds';
  div.style.background = 'transparent';
  div.style.color = 'inherit';
  const rssPanelBg = hexToRgba(getPanelHex(state.rssPanelColor), getPanelAlpha(state.rssPanelColor)/100);
  div.innerHTML = `<div class="feeds-header"><b>RSS Feeds</b> <button id="add-feed" title="Add Feed" style="background:${rssPanelBg};border:none;color:inherit;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:1.1em;">+</button></div><div class="feeds-list"></div>`;
  const list = div.querySelector('.feeds-list');
  state.feeds.forEach((feed, i) => {
    const panel = document.createElement('div');
    panel.className = 'feed-panel';
    panel.style.background = 'transparent';
    panel.style.color = 'inherit';
    panel.style.flexDirection = 'column';
    panel.style.alignItems = 'stretch';
    panel.innerHTML = `
      <div class="feed-panel-top" style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
        <input value="${feed.url}" data-idx="${i}" style="width:100%;min-width:120px;background:transparent;color:inherit;border:1.5px solid ${hexToRgba(getPanelHex(state.rssPanelColor), getPanelAlpha(state.rssPanelColor)/100)};border-radius:4px;padding:2px 6px;">
        <button title="Remove (permanent)" data-del="${i}" style="background:${hexToRgba(getPanelHex(state.rssPanelColor), getPanelAlpha(state.rssPanelColor)/100)};border:none;color:inherit;padding:4px 8px;border-radius:4px;cursor:pointer;">🗑️</button>
      </div>
      <div class="feed-title" style="font-weight:bold;font-size:1.15em;margin-bottom:0.5rem;display:none;"></div>
      <div class="feed-items" style="width:100%;"></div>
    `;
    panel.querySelector('input').onchange = e => {
      state.feeds[i].url = e.target.value;
      saveState();
      render();
    };
    const rssDelBtn = panel.querySelector('button[data-del]');
    rssDelBtn.onmouseover = () => { rssDelBtn.style.background = '#0002'; };
    rssDelBtn.onmouseout = () => { rssDelBtn.style.background = hexToRgba(getPanelHex(state.rssPanelColor), getPanelAlpha(state.rssPanelColor)/100); };
    rssDelBtn.onclick = () => {
      state.feeds.splice(i, 1);
      saveState();
      render();
    };
    // Fetch RSS (use rss2json public API for MVP)
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`)
      .then(r => r.json())
      .then(data => {
        // Set feed title if available
        if (data.feed && data.feed.title) {
          const titleDiv = panel.querySelector('.feed-title');
          titleDiv.textContent = data.feed.title;
          titleDiv.style.display = '';
        }
        if (data.items) {
          panel.querySelector('.feed-items').innerHTML = data.items.slice(0,5).map(item => {
            const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleString() : '';
            const author = item.author || '';
            let description = item.description || '';
            let imgHtml = '';
            if (item.enclosure && item.enclosure.thumbnail) {
              imgHtml = `<img src='${item.enclosure.thumbnail}' style='max-width:100%;max-height:120px;display:block;margin-bottom:8px;border-radius:6px;'>`;
            } else {
              const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
              if (imgMatch) {
                imgHtml = `<img src='${imgMatch[1]}' style='max-width:100%;max-height:120px;display:block;margin-bottom:8px;border-radius:6px;'>`;
              }
            }
            description = description.replace(/<img[^>]*>/gi, '').replace(/(<([^>]+)>)/gi, '').replace(/\s+/g, ' ').trim();
            // Use rssPanelColor and fontColor from state
            const rssPanelBg = hexToRgba(getPanelHex(state.rssPanelColor), getPanelAlpha(state.rssPanelColor)/100);
            const rssPanelFont = state.fontColor || '#f8f9fa';
            return `
              <div style='min-width:220px;background:${rssPanelBg};color:${rssPanelFont};padding:1rem;border-radius:10px;box-shadow:0 4px 24px #0008;font-size:0.98em;margin-bottom:1.2rem;width:100%;'>
                <div style='font-weight:bold;font-size:1.08em;margin-bottom:4px;'>
                  <a href='${item.link}' target='_blank' style='color:inherit;text-decoration:none;'>${item.title || ''}</a>
                </div>
                ${imgHtml}
                ${description ? `<div style='margin-bottom:6px;'>${description}</div>` : ''}
                ${pubDate ? `<div style='margin-bottom:2px;'>${pubDate}</div>` : ''}
                ${author ? `<div style='margin-bottom:2px;'>${author}</div>` : ''}
              </div>
            `;
          }).join('');
        } else {
          panel.querySelector('.feed-items').innerText = 'No items.';
        }
      }).catch(() => {
        panel.querySelector('.feed-items').innerText = 'Error loading feed.';
      });
    list.appendChild(panel);
  });
  const addFeedBtn = div.querySelector('#add-feed');
  addFeedBtn.onmouseover = () => { addFeedBtn.style.background = '#0002'; };
  addFeedBtn.onmouseout = () => { addFeedBtn.style.background = rssPanelBg; };
  addFeedBtn.onclick = () => {
    const url = prompt('Enter RSS feed URL:');
    if (!url) return;
    state.feeds.push({ url });
    saveState();
    render();
  };
  return div;
}

// --- Drag-and-drop MVP (reorder widgets) ---
// Drag-and-drop logic removed

// --- Header Toolbar ---
function renderHeaderToolbar() {
  const bar = document.createElement('div');
  bar.className = 'header-toolbar d-flex align-items-center justify-content-between';
  bar.style = 'padding: 0.5rem 1rem; background: rgba(0,0,0,0.15); border-radius: 0 0 12px 12px; margin-bottom: 1rem;';
  // Match settings button background to panel color
  const panelBg = hexToRgba(getPanelHex(state.panelColor), getPanelAlpha(state.panelColor)/100);
  bar.innerHTML = `
    <div class="toolbar-left">
      <span style="font-weight:bold;font-size:1.2em;letter-spacing:0.5px;font-style:italic;">Tabscape</span>
    </div>
    <div class="toolbar-right">
      <button id="tabscape-settings-btn" style="background:${panelBg};border:none;color:inherit;padding:4px 12px;border-radius:4px;cursor:pointer;font-size:1.1em;">⚙️ Settings</button>
    </div>
  `;
  setTimeout(() => {
    const btn = bar.querySelector('#tabscape-settings-btn');
    if (btn) {
      btn.onclick = () => {
        const modal = document.getElementById('tabscape-settings-modal');
        if (modal) modal.style.display = 'flex';
        // Render settings content
        const content = modal.querySelector('#tabscape-settings-content');
        renderSettingsContent(content);
      };
    }
  }, 0);
  return bar;
}

// --- Settings Modal Content Renderer ---
function renderSettingsContent(content) {
  if (content) content.innerHTML = '';
  content.appendChild(renderThemeShortcuts());
  content.appendChild(renderWeatherSettings());
  content.appendChild(renderBackgroundSelector());
}

// --- Main Render ---

async function render() {
  root.innerHTML = '';
  // Set background (color or image)
  document.body.style.background = state.bg || '#181c20';
  document.body.style.color = state.fontColor || '#f8f9fa';
  document.body.style.fontFamily = 'system-ui, sans-serif';
  // Set link color globally
  let styleTag = document.getElementById('tabscape-link-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'tabscape-link-style';
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = `a, .feed-items a { color: ${state.linkColor || '#4da3ff'} !important; }`;


  // --- Header Toolbar ---
  root.appendChild(renderHeaderToolbar());

  // --- Settings Modal (hidden by default) ---
  if (!document.getElementById('tabscape-settings-modal')) {
    const modal = document.createElement('div');
    modal.id = 'tabscape-settings-modal';
    modal.style = 'display:none;position:fixed;z-index:1000;left:0;top:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);align-items:center;justify-content:center;';
    // Use overall background color for modal background
    const modalBg = state.bg && !state.bg.startsWith('url(') ? state.bg : '#181c20';
    modal.innerHTML = `
      <div class="container" id="tabscape-settings-container" style="background:${modalBg};padding:2rem 1.5rem;border-radius:12px;min-width:340px;max-width:540px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 8px 32px #0008;position:relative;display:flex;flex-direction:column;align-items:stretch;">
        <button id="tabscape-settings-close" style="position:absolute;top:10px;right:14px;font-size:1.5em;background:none;border:none;color:#fff;">&times;</button>
        <h4 class="mb-3" style="margin-top:0">Settings</h4>
        <div id="tabscape-settings-content"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('tabscape-settings-close').onclick = () => {
      modal.style.display = 'none';
    };
  } else {
    // If modal already exists, update its background to match panel color
    const modalBg = state.bg && !state.bg.startsWith('url(') ? state.bg : '#181c20';
    const container = document.getElementById('tabscape-settings-container');
    if (container) {
      container.style.background = modalBg;
      container.style.boxShadow = '0 8px 32px #0008';
    }
  }

  // Render settings content if modal is open
  const modal = document.getElementById('tabscape-settings-modal');
  if (modal && modal.style.display !== 'none') {
    const content = modal.querySelector('#tabscape-settings-content');
    if (content) content.innerHTML = '';
    renderSettingsContent(content);
  }

  // Static two-column layout: left = weather + RSS, right = links
  const layoutDiv = document.createElement('div');
  layoutDiv.className = 'dashboard dashboard-static';
  const row = document.createElement('div');
  row.className = 'row';
  // Helper to create a styled panel
  function createPanel(child) {
    const panel = document.createElement('div');
    panel.className = 'dashboard-panel';
    panel.style.background = hexToRgba(getPanelHex(state.panelColor), getPanelAlpha(state.panelColor)/100);
    panel.style.color = state.fontColor || '#f8f9fa';
    panel.style.borderRadius = '12px';
    panel.style.padding = '1.2rem 1.2rem 1.2rem 1.2rem';
    panel.style.margin = '0 0 1.5rem 0';
    panel.style.boxShadow = '0 1px 8px #0002';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.alignItems = 'stretch';
    panel.appendChild(child);
    return panel;
  }
  // Left column: RSS Feeds only
  const leftCol = document.createElement('div');
  leftCol.className = 'col';
  leftCol.style.minHeight = '100vh';
  leftCol.style.display = 'flex';
  leftCol.style.flexDirection = 'column';
  leftCol.style.justifyContent = 'flex-start';
  leftCol.style.alignItems = 'stretch';
  leftCol.appendChild(createPanel(renderRSSFeeds()));
  // Right column: Weather, then Quick Links
  const rightCol = document.createElement('div');
  rightCol.className = 'col';
  rightCol.style.minHeight = '100vh';
  rightCol.style.display = 'flex';
  rightCol.style.flexDirection = 'column';
  rightCol.style.justifyContent = 'flex-start';
  rightCol.style.alignItems = 'stretch';
  rightCol.appendChild(createPanel(await renderWeatherWidget()));
  rightCol.appendChild(createPanel(renderLinkGallery()));
  row.appendChild(leftCol);
  row.appendChild(rightCol);
  layoutDiv.appendChild(row);
  root.appendChild(layoutDiv);
}

function hexToRgba(hex, alpha) {
  if (hex.startsWith('rgba')) return hex; // already rgba
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  let a = typeof alpha === 'string' ? parseFloat(alpha) : (typeof alpha === 'number' ? alpha : 1);
  if (isNaN(a)) a = 1;
  return `rgba(${r},${g},${b},${a})`;
}

render();
