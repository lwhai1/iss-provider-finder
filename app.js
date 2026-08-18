// ====== 全局状态 ======
let ALL_DATA = [];
let FILTERED_DATA = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data.json');
    ALL_DATA = await res.json();
    FILTERED_DATA = [...ALL_DATA];

    document.getElementById('totalCount').textContent = ALL_DATA.length;

    // 初始化下拉框
    initDropdowns(ALL_DATA);

    // 事件监听
    bindEvents();

    // 初始渲染
    applyFilters();

  } catch (err) {
    console.error('加载 data.json 失败:', err);
    document.getElementById('resultsList').innerHTML = `
      <div style="color:red; text-align:center; padding: 40px;">
        ⚠️ 无法加载数据文件 data.json，请确保在 HTTP 服务模式下运行本页面。
      </div>
    `;
  }
});

// 初始化 County, City, Zip, Entity 类型下拉选项
function initDropdowns(data) {
  const counties = new Set();
  const cities = new Set();
  const entities = new Set();
  const zips = new Set();

  data.forEach(item => {
    if (item.county) counties.add(item.county.trim());
    if (item.city) cities.add(item.city.trim());
    if (item.entity_type) entities.add(item.entity_type.trim());
    if (item.zip) zips.add(item.zip.trim());
  });

  const countySelect = document.getElementById('f-county');
  [...counties].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    countySelect.appendChild(opt);
  });

  const citySelect = document.getElementById('f-city');
  [...cities].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    citySelect.appendChild(opt);
  });

  const zipSelect = document.getElementById('f-zip');
  [...zips].sort().forEach(z => {
    const opt = document.createElement('option');
    opt.value = z;
    opt.textContent = z;
    zipSelect.appendChild(opt);
  });

  const entitySelect = document.getElementById('f-entity');
  [...entities].sort().forEach(e => {
    const opt = document.createElement('option');
    opt.value = e;
    opt.textContent = e;
    entitySelect.appendChild(opt);
  });
}

// 绑定筛选事件
function bindEvents() {
  const inputs = [
    'f-search', 'f-county', 'f-city', 'f-zip', 'f-zip-input',
    'f-program', 'f-entity', 'f-min-capacity',
    'f-has-email', 'f-has-phone', 'f-sort'
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, () => {
        // Zip select 与 Zip input 交互联动
        if (id === 'f-zip' && el.value) {
          document.getElementById('f-zip-input').value = '';
        } else if (id === 'f-zip-input' && el.value) {
          document.getElementById('f-zip').value = '';
        }
        applyFilters();
      });
    }
  });

  document.getElementById('resetBtn').addEventListener('click', resetFilters);
}

// 重置筛选条件
function resetFilters() {
  document.getElementById('f-search').value = '';
  document.getElementById('f-county').value = '';
  document.getElementById('f-city').value = '';
  document.getElementById('f-zip').value = '';
  document.getElementById('f-zip-input').value = '';
  document.getElementById('f-program').value = '';
  document.getElementById('f-entity').value = '';
  document.getElementById('f-min-capacity').value = '';
  document.getElementById('f-has-email').checked = false;
  document.getElementById('f-has-phone').checked = false;
  document.getElementById('f-sort').value = 'name_asc';

  applyFilters();
}

// 应用筛选过滤逻辑
function applyFilters() {
  const search = document.getElementById('f-search').value.trim().toLowerCase();
  const county = document.getElementById('f-county').value;
  const city = document.getElementById('f-city').value;
  const zipSel = document.getElementById('f-zip').value;
  const zipInput = document.getElementById('f-zip-input').value.trim();
  const zipVal = zipSel || zipInput;
  const program = document.getElementById('f-program').value;
  const entity = document.getElementById('f-entity').value;
  const minCap = parseInt(document.getElementById('f-min-capacity').value, 10) || 0;
  const hasEmail = document.getElementById('f-has-email').checked;
  const hasPhone = document.getElementById('f-has-phone').checked;
  const sort = document.getElementById('f-sort').value;

  FILTERED_DATA = ALL_DATA.filter(item => {
    // 搜索词过滤
    if (search) {
      const nameMatch = (item.name || '').toLowerCase().includes(search);
      const adminMatch = (item.admin || '').toLowerCase().includes(search);
      const emailMatch = (item.email || '').toLowerCase().includes(search);
      const ownerMatch = (item.owner || '').toLowerCase().includes(search);
      if (!nameMatch && !adminMatch && !emailMatch && !ownerMatch) return false;
    }

    // County 过滤
    if (county && (item.county || '').trim() !== county) return false;

    // City 过滤
    if (city && (item.city || '').trim() !== city) return false;

    // Zip Code 过滤
    if (zipVal && !(item.zip || '').trim().includes(zipVal)) return false;

    // Program 过滤
    if (program) {
      if (program === 'DAHS' && item.program_type !== 'DAHS') return false;
      if (program === 'DAHS-ISS' && item.program_type !== 'DAHS-ISS') return false;
      if (program === 'DAHS-ISSONLY' && item.program_type !== 'DAHS-ISSONLY') return false;
    }

    // Entity 性质过滤
    if (entity && (item.entity_type || '').trim() !== entity) return false;

    // 容量过滤
    const cap = parseInt(item.capacity, 10) || 0;
    if (minCap > 0 && cap < minCap) return false;

    // Email / Phone 包含过滤
    if (hasEmail && (!item.email || !item.email.trim())) return false;
    if (hasPhone && (!item.phone || !item.phone.trim())) return false;

    return true;
  });

  // 排序逻辑
  sortData(sort);

  // 渲染视图
  renderResults();
}

// 排序
function sortData(sortType) {
  FILTERED_DATA.sort((a, b) => {
    if (sortType === 'name_asc') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortType === 'capacity_desc') {
      const capA = parseInt(a.capacity, 10) || 0;
      const capB = parseInt(b.capacity, 10) || 0;
      return capB - capA;
    } else if (sortType === 'county_asc') {
      return (a.county || '').localeCompare(b.county || '');
    }
    return 0;
  });
}

// 渲染机构卡片
function renderResults() {
  const container = document.getElementById('resultsList');
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('resultsCount');
  const matchCountEl = document.getElementById('matchCount');

  countEl.textContent = FILTERED_DATA.length;
  matchCountEl.textContent = FILTERED_DATA.length;

  if (FILTERED_DATA.length === 0) {
    container.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');

  const htmlArray = FILTERED_DATA.map(item => {
    // 标注 Badge 样式
    let tagClass = 'tag-dahs';
    let tagText = item.program_type || 'DAHS';
    if (tagText === 'DAHS-ISS') {
      tagClass = 'tag-iss';
    } else if (tagText === 'DAHS-ISSONLY') {
      tagClass = 'tag-issonly';
      tagText = 'ISS-Only 专项社交中心';
    }

    const fullAddr = `${item.address || ''}, ${item.city || ''}, TX ${item.zip || ''}`.trim();
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + fullAddr)}`;

    return `
      <article class="provider-card">
        <div class="card-header">
          <div>
            <span class="badge-tag ${tagClass}">${tagText}</span>
            <h3 class="card-title">${escapeHtml(item.name)}</h3>
          </div>
        </div>

        <div class="card-details">
          <div class="detail-item">
            <span class="icon">📍</span>
            <span><strong>地址：</strong>${escapeHtml(item.address || '未提供')}, ${escapeHtml(item.city || '')}, TX ${escapeHtml(item.zip || '')} (${escapeHtml(item.county || '')} County)</span>
          </div>

          <div class="detail-item">
            <span class="icon">📞</span>
            <span><strong>电话：</strong>${item.phone ? `<a href="tel:${item.phone}">${escapeHtml(item.phone)}</a>` : '未提供'}</span>
          </div>

          <div class="detail-item">
            <span class="icon">✉️</span>
            <span><strong>邮箱：</strong>${item.email ? `<a href="mailto:${item.email}">${escapeHtml(item.email)}</a>` : '未提供'}</span>
          </div>

          <div class="detail-item">
            <span class="icon">👥</span>
            <span><strong>核定服务容量：</strong><strong>${item.capacity || '未标注'}</strong> 人</span>
          </div>

          <div class="detail-item">
            <span class="icon">👤</span>
            <span><strong>负责人：</strong>${escapeHtml(item.admin || '未提供')}</span>
          </div>

          <div class="detail-item">
            <span class="icon">📜</span>
            <span><strong>许可证编号：</strong>${escapeHtml(item.license_no || '暂无')}</span>
          </div>
        </div>

        <div class="card-actions">
          <a href="${mapUrl}" target="_blank" rel="noopener" class="btn btn-outline">🗺️ Google 地图导航</a>
          ${item.phone ? `<a href="tel:${item.phone}" class="btn btn-primary">📞 拨打电话</a>` : ''}
          ${item.email ? `<a href="mailto:${item.email}" class="btn btn-secondary">✉️ 发送邮件</a>` : ''}
        </div>
      </article>
    `;
  });

  container.innerHTML = htmlArray.join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, match => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[match];
  });
}
