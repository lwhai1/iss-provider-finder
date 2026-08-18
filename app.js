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

// 初始化 County, City, Entity 类型下拉选项
function initDropdowns(data) {
  const counties = new Set();
  const cities = new Set();
  const entities = new Set();

  data.forEach(item => {
    if (item.county) counties.add(item.county.trim());
    if (item.city) cities.add(item.city.trim());
    if (item.entity_type) entities.add(item.entity_type.trim());
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
  const filterInputs = [
    'f-search', 'f-county', 'f-city', 'f-program',
    'f-entity', 'f-min-capacity', 'f-has-email', 'f-has-phone', 'f-sort'
  ];

  filterInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });

  document.getElementById('resetBtn').addEventListener('click', resetFilters);
}

// 执行筛选逻辑
function applyFilters() {
  const searchStr = document.getElementById('f-search').value.toLowerCase().trim();
  const selectedCounty = document.getElementById('f-county').value;
  const selectedCity = document.getElementById('f-city').value;
  const selectedProgram = document.getElementById('f-program').value;
  const selectedEntity = document.getElementById('f-entity').value;
  const minCap = parseInt(document.getElementById('f-min-capacity').value, 10) || 0;
  const mustHaveEmail = document.getElementById('f-has-email').checked;
  const mustHavePhone = document.getElementById('f-has-phone').checked;
  const sortMode = document.getElementById('f-sort').value;

  FILTERED_DATA = ALL_DATA.filter(item => {
    // 文本模糊匹配
    if (searchStr) {
      const nameMatch = item.name.toLowerCase().includes(searchStr);
      const adminMatch = item.admin.toLowerCase().includes(searchStr);
      const emailMatch = item.email.toLowerCase().includes(searchStr);
      if (!nameMatch && !adminMatch && !emailMatch) return false;
    }

    // County 匹配
    if (selectedCounty && item.county !== selectedCounty) return false;

    // City 匹配
    if (selectedCity && item.city !== selectedCity) return false;

    // Program 匹配
    if (selectedProgram && item.program_type !== selectedProgram) return false;

    // Entity 匹配
    if (selectedEntity && item.entity_type !== selectedEntity) return false;

    // 容量匹配
    const capNum = parseInt(item.capacity, 10) || 0;
    if (minCap > 0 && capNum < minCap) return false;

    // 联系方式过滤
    if (mustHaveEmail && !item.email) return false;
    if (mustHavePhone && !item.phone) return false;

    return true;
  });

  // 排序
  FILTERED_DATA.sort((a, b) => {
    if (sortMode === 'name_asc') {
      return a.name.localeCompare(b.name);
    } else if (sortMode === 'capacity_desc') {
      return (parseInt(b.capacity, 10) || 0) - (parseInt(a.capacity, 10) || 0);
    } else if (sortMode === 'county_asc') {
      return a.county.localeCompare(b.county);
    }
    return 0;
  });

  renderResults(FILTERED_DATA);
}

// 重置条件
function resetFilters() {
  document.getElementById('f-search').value = '';
  document.getElementById('f-county').value = '';
  document.getElementById('f-city').value = '';
  document.getElementById('f-program').value = '';
  document.getElementById('f-entity').value = '';
  document.getElementById('f-min-capacity').value = '';
  document.getElementById('f-has-email').checked = false;
  document.getElementById('f-has-phone').checked = false;
  document.getElementById('f-sort').value = 'name_asc';

  applyFilters();
}

// 渲染结果
function renderResults(list) {
  const container = document.getElementById('resultsList');
  const noResults = document.getElementById('noResults');

  document.getElementById('matchCount').textContent = list.length;
  document.getElementById('resultsCount').textContent = list.length;

  if (list.length === 0) {
    container.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');

  container.innerHTML = list.map(item => {
    const isIssOnly = item.program_type === 'DAHS-ISSONLY';
    const tagClass = isIssOnly ? 'tag-program tag-issonly' : 'tag-program';

    const mapQuery = encodeURIComponent(`${item.name} ${item.address} ${item.city} TX ${item.zip}`);

    return `
      <div class="provider-card">
        <div class="card-header">
          <div class="card-title">${escapeHtml(item.name)}</div>
          <span class="${tagClass}">${item.program_type || 'DAHS/ISS'}</span>
        </div>

        <div class="card-details">
          <div class="detail-item">📍 <strong>地址：</strong>${escapeHtml(item.address)}, ${escapeHtml(item.city)}, TX ${item.zip}</div>
          <div class="detail-item">🏛️ <strong>所属 County：</strong>${escapeHtml(item.county)}</div>
          <div class="detail-item">👤 <strong>负责人/Admin：</strong>${escapeHtml(item.admin || '暂未提供')}</div>
          <div class="detail-item">👥 <strong>服务核定容量：</strong>${item.capacity || 'N/A'} 人</div>
          <div class="detail-item">🆔 <strong>License No / ID：</strong>${item.license_no || item.id}</div>
          <div class="detail-item">🏢 <strong>机构性质：</strong>${escapeHtml(item.entity_type || '其他')}</div>
        </div>

        <div class="card-actions">
          ${item.phone ? `<a href="tel:${item.phone}" class="action-btn btn-phone">📞 电话：${item.phone}</a>` : ''}
          ${item.email ? `<a href="mailto:${item.email}" class="action-btn btn-email">✉️ 发邮件：${item.email}</a>` : ''}
          <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" class="action-btn btn-map">🗺️ Google 地图导航</a>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
