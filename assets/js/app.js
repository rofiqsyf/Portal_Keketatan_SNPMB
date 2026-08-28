/* ======================================================================
   APP.JS : Main Application Logic
   Portal Keketatan SNPMB
   ====================================================================== */

// =====================================================================
// STORES (Simple state management)
// =====================================================================
const BookmarkStore = (() => {
  const KEY = 'snpmb_bookmarks';

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch { return []; }
  }

  function save(bookmarks) {
    localStorage.setItem(KEY, JSON.stringify(bookmarks));
  }

  function has(univId, prodiNama, jenjang = '') {
    if (jenjang) {
      return getAll().some(b => b.univId === univId && b.prodiNama === prodiNama && (b.jenjang === jenjang || !b.jenjang));
    }
    return getAll().some(b => b.univId === univId && b.prodiNama === prodiNama);
  }

  function toggle(univId, prodiNama, univNama, keketatan, jenjang = '') {
    let bookmarks = getAll();
    const idx = bookmarks.findIndex(b => b.univId === univId && b.prodiNama === prodiNama && (!jenjang || b.jenjang === jenjang));
    if (idx >= 0) {
      bookmarks.splice(idx, 1);
      save(bookmarks);
      return false; // removed
    } else {
      bookmarks.push({ univId, prodiNama, univNama, keketatan, jenjang });
      save(bookmarks);
      return true; // added
    }
  }

  function count() {
    return getAll().length;
  }

  return { getAll, has, toggle, count };
})();

const CompareStore = (() => {
  let items = [];
  const MAX = 4;

  function has(univId, prodiNama) {
    return items.some(i => i.univId === univId && i.prodiNama === prodiNama);
  }

  function toggle(univId, prodiNama, univNama, keketatan, dayaTampung, peminat, jenjang) {
    const idx = items.findIndex(i => i.univId === univId && i.prodiNama === prodiNama);
    if (idx >= 0) {
      items.splice(idx, 1);
      return false;
    } else if (items.length < MAX) {
      items.push({ univId, prodiNama, univNama, keketatan, daya_tampung: dayaTampung, peminat, jenjang });
      return true;
    }
    return null; // max reached
  }

  function remove(univId, prodiNama) {
    items = items.filter(i => !(i.univId === univId && i.prodiNama === prodiNama));
  }

  function clear() { items = []; }
  function getAll() { return [...items]; }
  function count() { return items.length; }

  return { has, toggle, remove, clear, getAll, count };
})();

// =====================================================================
// APP : Main Controller
// =====================================================================
const App = (() => {
  'use strict';

  // State
  let universityData = null;
  let searchIndex = [];
  let activeTahun = '2025';
  let activeJalur = 'snbt';
  let activeUnivId = null;
  let activeRegion = '';
  let activeTier = '';
  let activeJenjang = '';
  let simulasiPil1Key = '';
  let simulasiPil2Key = '';
  let currentTab = 'ptn'; // 'ptn' | 'master' | 'terketat' | 'simulasi'
  let sortState = { by: 'nama', asc: true };
  let masterSortState = { by: 'keketatan', asc: true };
  let masterSearchKeyword = '';
  let showAllCampus = false;
  const CAMPUS_LIMIT_MOBILE = 9;
  const CAMPUS_LIMIT_DESKTOP = 12;
  let debounceTimer = null;

  // Analyzer State
  let snbtState = {
    scores: {},
    prodiType: 'semua',
    jenjang: '',
    wilayah: '',
    results: null,
    allProdiCache: null,
  };
  let snbpState = {
    rataRapor: '',
    akreditasi: 'A',
    prodiType: 'saintek',
    jenjang: '',
    wilayah: '',
    nilaiMapelPendukung: {},
    results: null,
    allProdiCache: null,
  };
  // Store full results for load-more
  let analyzerFullResults = { snbt: [], snbp: [] };

  // =====================================================================
  // INITIALIZATION
  // =====================================================================
  async function init() {
    // Theme
    initTheme();

    // Load data
    try {
      const resp = await fetch('assets/data/universities.json');
      if (!resp.ok) throw new Error('Failed to load data');
      universityData = await resp.json();
      searchIndex = DataUtils.buildSearchIndex(universityData.universitas);

      renderStats();
      renderFilters();
      renderPopularPills();
      renderCampusGrid();
      updateBookmarkCount();
    } catch (err) {
      console.error('Data load error:', err);
      document.getElementById('campus-grid').innerHTML =
        Components.renderEmptyState('Gagal Memuat Data', 'Pastikan file universities.json tersedia.');
    }

    // Events
    bindEvents();
  }

  // =====================================================================
  // THEME (Dark Mode)
  // =====================================================================
  function initTheme() {
    const saved = localStorage.getItem('snpmb_theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    updateThemeIcon();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('snpmb_theme', next);
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const btn = document.getElementById('btn-theme');
    if (!btn) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? Icons.sun : Icons.moon;
    btn.title = isDark ? 'Mode Terang' : 'Mode Gelap';
  }

  // =====================================================================
  // EVENTS
  // =====================================================================
  function bindEvents() {
    // Search
    const searchInput = document.getElementById('search-main');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => handleSearch(e.target.value), 150);
      });
      searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) handleSearch(searchInput.value);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAutocomplete();
          searchInput.blur();
        }
      });
    }

    // Close autocomplete on outside click
    document.addEventListener('click', (e) => {
      const wrapper = document.querySelector('.search-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        closeAutocomplete();
      }
    });

    // Close panels on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetail();
        closeBookmarkPanel();
        closeCompareModal();
      }
      // Ctrl+K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const search = document.getElementById('search-main');
        if (search) search.focus();
      }
    });

    // Overlay click (smart handler for dual drawer)
    document.getElementById('detail-overlay')?.addEventListener('click', () => {
      const detailPanel = document.getElementById('detail-panel');
      const bookmarkPanel = document.getElementById('bookmark-panel');

      if (detailPanel && detailPanel.classList.contains('active')) {
        closeDetail();
      } else if (bookmarkPanel && bookmarkPanel.classList.contains('active')) {
        closeBookmarkPanel();
      }
    });

    // Nav tabs scroll buttons state listener
    const navTabsContainer = document.getElementById('nav-tabs-container');
    if (navTabsContainer) {
      navTabsContainer.addEventListener('scroll', updateNavScrollButtons);
      setTimeout(updateNavScrollButtons, 500);
    }

    // Window resize for campus grid & nav tabs
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!showAllCampus && currentTab === 'ptn') renderCampusGrid();
        updateNavScrollButtons();
      }, 250);
    });
  }

  // =====================================================================
  // NAV TABS SCROLL CONTROLLER
  // =====================================================================
  function scrollNavTabs(direction) {
    const container = document.getElementById('nav-tabs-container');
    if (!container) return;
    const amount = direction === 'left' ? -240 : 240;
    container.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(updateNavScrollButtons, 350);
  }

  function updateNavScrollButtons() {
    const container = document.getElementById('nav-tabs-container');
    const btnLeft = document.getElementById('nav-scroll-left');
    const btnRight = document.getElementById('nav-scroll-right');
    if (!container || !btnLeft || !btnRight) return;

    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    btnLeft.classList.toggle('visible', scrollLeft > 10);
    btnRight.classList.toggle('visible', maxScroll - scrollLeft > 10);
  }

  // =====================================================================
  // REAL-TIME POPULAR SEARCH STORE
  // =====================================================================
  const PopularSearchStore = (() => {
    const KEY = 'snpmb_popular_searches';
    const DEFAULTS = {
      'Kedokteran': 25,
      'Ilmu Komputer': 22,
      'Manajemen': 18,
      'Hukum': 15,
      'UI': 12,
      'UGM': 10,
      'ITB': 8
    };

    function getCounts() {
      try {
        const saved = localStorage.getItem(KEY);
        return saved ? JSON.parse(saved) : { ...DEFAULTS };
      } catch (e) {
        return { ...DEFAULTS };
      }
    }

    function track(term) {
      if (!term) return;
      const clean = term.trim();
      if (clean.length < 2) return;

      const counts = getCounts();
      const existingKey = Object.keys(counts).find(k => k.toLowerCase() === clean.toLowerCase()) || clean;
      counts[existingKey] = (counts[existingKey] || 0) + 1;

      try {
        localStorage.setItem(KEY, JSON.stringify(counts));
      } catch (e) {}

      renderPopularPills();
    }

    function getTop(limit = 7) {
      const counts = getCounts();
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0]);
    }

    return { track, getTop };
  })();

  function renderPopularPills() {
    const container = document.getElementById('quick-search-pills');
    if (!container) return;
    const topTerms = PopularSearchStore.getTop(7);
    container.innerHTML = topTerms.map(term =>
      `<button class="quick-pill" onclick="App.quickSearch('${Components.escapeAttr(term)}')">${Components.escapeHtml(term)}</button>`
    ).join('');
  }

  // =====================================================================
  // SEARCH & AUTOCOMPLETE & QUICK SEARCH
  // =====================================================================
  function handleSearch(query) {
    const dropdown = document.getElementById('autocomplete-dropdown');
    if (!dropdown) return;

    if (!query || query.length < 2) {
      closeAutocomplete();
      return;
    }

    const results = DataUtils.search(searchIndex, query);
    dropdown.innerHTML = Components.renderAutocompleteResults(results, query);
    dropdown.classList.add('active');
  }

  function closeAutocomplete() {
    const dropdown = document.getElementById('autocomplete-dropdown');
    if (dropdown) dropdown.classList.remove('active');
  }

  function quickSearch(term) {
    const searchMain = document.getElementById('search-main');
    if (searchMain) {
      searchMain.value = term;
      handleSearch(term);
      searchMain.focus();
    }
    PopularSearchStore.track(term);
  }

  // =====================================================================
  // MAIN TAB SWITCHING ('ptn' | 'master' | 'terketat' | 'simulasi')
  // =====================================================================
  function switchMainTab(tab) {
    currentTab = tab;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));

    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    const viewPtn       = document.getElementById('view-ptn');
    const viewMaster    = document.getElementById('view-master');
    const viewSimulasi  = document.getElementById('view-simulasi');
    const viewSnbt      = document.getElementById('view-analyzer-snbt');
    const viewSnbp      = document.getElementById('view-analyzer-snbp');

    // Hide all views first
    viewPtn?.classList.add('hidden');
    viewMaster?.classList.add('hidden');
    viewSimulasi?.classList.add('hidden');
    viewSnbt?.classList.add('hidden');
    viewSnbp?.classList.add('hidden');

    if (tab === 'ptn') {
      viewPtn?.classList.remove('hidden');
      renderCampusGrid();
    } else if (tab === 'master') {
      viewMaster?.classList.remove('hidden');
      document.getElementById('master-view-title').textContent = 'Eksplorasi Program Studi';
      document.getElementById('master-view-subtitle').textContent = `Menampilkan seluruh program studi PTN di Indonesia (${activeTahun})`;
      masterSortState = { by: 'keketatan', asc: true };
      renderMasterProdi();
    } else if (tab === 'terketat') {
      viewMaster?.classList.remove('hidden');
      document.getElementById('master-view-title').textContent = 'Top Program Studi Terketat';
      document.getElementById('master-view-subtitle').textContent = `Diurutkan berdasarkan rasio keketatan penerimaan terkecil (${activeTahun})`;
      masterSortState = { by: 'keketatan', asc: true };
      renderMasterProdi();
    } else if (tab === 'simulasi') {
      viewSimulasi?.classList.remove('hidden');
      renderSimulasi();
    } else if (tab === 'analyzer-snbt') {
      viewSnbt?.classList.remove('hidden');
      renderSnbtAnalyzer();
    } else if (tab === 'analyzer-snbp') {
      viewSnbp?.classList.remove('hidden');
      renderSnbpAnalyzer();
    }
  }

  // =====================================================================
  // RENDERING & STATS (Multi-Year Synced)
  // =====================================================================
  function renderStats() {
    const container = document.getElementById('stats-container');
    if (!container || !universityData) return;

    const stats = DataUtils.getStats(universityData.universitas, activeTahun, activeJalur);
    container.innerHTML = Components.renderStatsBar(stats, universityData.meta);
  }

  function renderFilters() {
    const container = document.getElementById('filter-container');
    if (!container || !universityData) return;

    const regions = DataUtils.getRegions(universityData.universitas);
    const years = universityData.meta.tahun_tersedia || ['2025', '2024', '2023'];

    let html = `
      <div class="filter-bar">
        <!-- Tahun Select -->
        <div class="filter-group">
          <span class="filter-label">Tahun:</span>
          <select class="filter-select" id="filter-tahun" onchange="App.setTahun(this.value)">
            ${years.map(y => `<option value="${y}" ${y === activeTahun ? 'selected' : ''}>Tahun ${y}</option>`).join('')}
          </select>
        </div>

        <!-- Jalur Toggle -->
        <div class="filter-group">
          <span class="filter-label">Jalur:</span>
          <button class="filter-chip ${activeJalur === 'snbt' ? 'active' : ''}" data-jalur="snbt" onclick="App.setJalur('snbt')">
            <span class="chip-icon">${Icons.pen}</span> SNBT
          </button>
          <button class="filter-chip ${activeJalur === 'snbp' ? 'active' : ''}" data-jalur="snbp" onclick="App.setJalur('snbp')">
            <span class="chip-icon">${Icons.chart}</span> SNBP
          </button>
        </div>

        <!-- Keketatan Tier Select -->
        <div class="filter-group">
          <span class="filter-label">Tingkat Keketatan:</span>
          <select class="filter-select" id="filter-tier" onchange="App.setTier(this.value)">
            <option value="">Semua Keketatan</option>
            <option value="sangat-ketat" ${activeTier === 'sangat-ketat' ? 'selected' : ''}>Sangat Ketat (< 5%)</option>
            <option value="ketat" ${activeTier === 'ketat' ? 'selected' : ''}>Ketat (5 - 15%)</option>
            <option value="kompetitif" ${activeTier === 'kompetitif' ? 'selected' : ''}>Kompetitif (15 - 30%)</option>
            <option value="longgar" ${activeTier === 'longgar' ? 'selected' : ''}>Longgar (> 30%)</option>
          </select>
        </div>

        <!-- Jenjang Select -->
        <div class="filter-group">
          <span class="filter-label">Jenjang:</span>
          <select class="filter-select" id="filter-jenjang" onchange="App.setJenjang(this.value)">
            <option value="">Semua Jenjang</option>
            <option value="Sarjana" ${activeJenjang === 'Sarjana' ? 'selected' : ''}>Sarjana (S1)</option>
            <option value="Sarjana Terapan" ${activeJenjang === 'Sarjana Terapan' ? 'selected' : ''}>Sarjana Terapan (D4)</option>
            <option value="Diploma" ${activeJenjang === 'Diploma' ? 'selected' : ''}>Diploma Tiga (D3)</option>
          </select>
        </div>

        <!-- Wilayah Select -->
        <div class="filter-group">
          <span class="filter-label">Wilayah:</span>
          <select class="filter-select" id="filter-region" onchange="App.setRegion(this.value)">
            <option value="">Semua Wilayah</option>
            ${regions.map(r => `<option value="${r}" ${r === activeRegion ? 'selected' : ''}>${r}</option>`).join('')}
          </select>
        </div>

        <!-- Reset Button -->
        <button class="btn-reset-filter" onclick="App.resetFilters()" title="Reset Semua Filter">
          ${Icons.close} Reset Filter
        </button>
      </div>
    `;
    container.innerHTML = html;
  }

  function renderCampusGrid() {
    const container = document.getElementById('campus-grid');
    const countEl = document.getElementById('campus-count');
    const showMoreBtn = document.getElementById('btn-show-more');
    if (!container || !universityData) return;

    let filtered = universityData.universitas;

    if (activeRegion) {
      filtered = filtered.filter(u => u.wilayah === activeRegion);
    }

    filtered = filtered.filter(u => {
      if (activeJalur === 'snbt') return u.prodi.snbt.length > 0;
      if (activeJalur === 'snbp') return u.prodi.snbp.length > 0;
      return true;
    });

    filtered.sort((a, b) => a.singkatan.localeCompare(b.singkatan));

    const isMobile = window.innerWidth <= 768;
    const limit = isMobile ? CAMPUS_LIMIT_MOBILE : CAMPUS_LIMIT_DESKTOP;
    const display = showAllCampus ? filtered : filtered.slice(0, limit);

    if (countEl) {
      countEl.textContent = `${filtered.length} PTN (${activeTahun})`;
    }

    if (filtered.length === 0) {
      container.innerHTML = Components.renderEmptyState(
        'Tidak Ada Data',
        activeJalur === 'snbp'
          ? 'Data SNBP belum tersedia. Silakan pilih jalur SNBT.'
          : 'Tidak ditemukan PTN untuk filter yang dipilih.'
      );
      if (showMoreBtn) showMoreBtn.classList.add('hidden');
      return;
    }

    container.innerHTML = display.map(u =>
      Components.renderCampusCard(u, u.id === activeUnivId)
    ).join('');

    if (showMoreBtn) {
      if (filtered.length > limit && !showAllCampus) {
        showMoreBtn.classList.remove('hidden');
        showMoreBtn.innerHTML = `Lihat Semua PTN (${filtered.length}) ▼`;
      } else if (showAllCampus && filtered.length > limit) {
        showMoreBtn.classList.remove('hidden');
        showMoreBtn.innerHTML = `Tampilkan Lebih Sedikit ▲`;
      } else {
        showMoreBtn.classList.add('hidden');
      }
    }
  }

  // =====================================================================
  // MASTER PRODI EXPLORER (View 2 & 3)
  // =====================================================================
  function renderMasterProdi() {
    if (!universityData) return;
    const tbody = document.getElementById('master-prodi-tbody');
    const countEl = document.getElementById('master-prodi-count');
    if (!tbody) return;

    let allProdi = DataUtils.getAllProdi(universityData.universitas, activeJalur, activeTahun);

    // Filter region if selected
    if (activeRegion) {
      allProdi = allProdi.filter(p => p.wilayah === activeRegion);
    }

    // Filter by tier & jenjang & keyword
    allProdi = DataUtils.filterProdi(allProdi, masterSearchKeyword, activeTier, activeJenjang);

    // Sort master prodi
    allProdi = DataUtils.sortProdi(allProdi, masterSortState.by, masterSortState.asc);

    if (countEl) {
      countEl.textContent = `${DataUtils.formatNumber(allProdi.length)} Prodi (${activeTahun})`;
    }

    if (allProdi.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;">
        ${activeJalur === 'snbp'
          ? Components.renderEmptyState('Data SNBP Belum Tersedia', 'Data jalur SNBP belum tersedia.')
          : Components.renderEmptyState('Tidak Ada Prodi Found', 'Tidak ada program studi yang sesuai filter.')}
      </td></tr>`;
      return;
    }

    const displayList = allProdi.slice(0, 100);

    tbody.innerHTML = displayList.map((p, i) =>
      Components.renderMasterProdiRow(p, i)
    ).join('');

    updateMasterSortButtons();
  }

  function filterMasterProdi(keyword) {
    masterSearchKeyword = keyword;
    renderMasterProdi();
  }

  function sortMasterProdiBy(field) {
    if (masterSortState.by === field) {
      masterSortState.asc = !masterSortState.asc;
    } else {
      masterSortState.by = field;
      masterSortState.asc = field === 'nama';
    }
    renderMasterProdi();
  }

  function updateMasterSortButtons() {
    document.querySelectorAll('.sort-btn[data-mastersort]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mastersort === masterSortState.by);
    });
  }

  // =====================================================================
  // FILTER HANDLERS (Tahun, Jalur, Region, Tier, Jenjang, Reset)
  // =====================================================================
  function setTahun(tahun) {
    activeTahun = tahun;
    renderStats();
    renderFilters();

    if (currentTab === 'ptn') {
      renderCampusGrid();
    } else {
      renderMasterProdi();
    }

    if (activeUnivId) {
      renderDetailProdi(activeUnivId);
    }
    showToast(`Data disinkronkan ke Tahun ${tahun}`);
  }

  function setJalur(jalur) {
    activeJalur = jalur;
    renderStats();

    document.querySelectorAll('.filter-chip[data-jalur]').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.jalur === jalur);
    });

    showAllCampus = false;
    if (currentTab === 'ptn') {
      renderCampusGrid();
    } else {
      renderMasterProdi();
    }

    if (activeUnivId) {
      renderDetailProdi(activeUnivId);
    }
  }

  function setRegion(region) {
    activeRegion = region;
    showAllCampus = false;
    if (currentTab === 'ptn') {
      renderCampusGrid();
    } else {
      renderMasterProdi();
    }
  }

  function setTier(tier) {
    activeTier = tier;
    if (currentTab !== 'ptn') {
      renderMasterProdi();
    } else if (tier) {
      // Automatically switch to master view when tier filter is selected for clarity
      switchMainTab('master');
    }
  }

  function setJenjang(jenjang) {
    activeJenjang = jenjang;
    if (currentTab !== 'ptn') {
      renderMasterProdi();
    } else if (jenjang) {
      switchMainTab('master');
    }
  }

  function resetFilters() {
    activeTahun = '2025';
    activeJalur = 'snbt';
    activeRegion = '';
    activeTier = '';
    activeJenjang = '';
    masterSearchKeyword = '';

    const searchMain = document.getElementById('search-main');
    if (searchMain) searchMain.value = '';

    const searchMaster = document.getElementById('search-master-prodi');
    if (searchMaster) searchMaster.value = '';

    renderStats();
    renderFilters();

    if (currentTab === 'ptn') {
      renderCampusGrid();
    } else {
      renderMasterProdi();
    }

    if (activeUnivId) {
      renderDetailProdi(activeUnivId);
    }

    showToast('Semua filter di-reset ke standar');
  }

  function toggleShowAll() {
    showAllCampus = !showAllCampus;
    renderCampusGrid();
  }

  // =====================================================================
  // DETAIL PANEL
  // =====================================================================
  function openDetail(univId, initialProdiSearch = '', initialJenjang = '') {
    activeUnivId = univId;
    const univ = universityData.universitas.find(u => u.id === univId);
    if (!univ) return;

    // Close autocomplete & clear main search
    closeAutocomplete();
    const searchMain = document.getElementById('search-main');
    if (searchMain) searchMain.value = '';

    const panel = document.getElementById('detail-panel');
    const overlay = document.getElementById('detail-overlay');
    const bookmarkPanel = document.getElementById('bookmark-panel');

    // Check if bookmark panel is active for side-by-side positioning
    if (bookmarkPanel && bookmarkPanel.classList.contains('active')) {
      panel.classList.add('with-bookmark');
    } else {
      panel.classList.remove('with-bookmark');
    }

    // Update header
    document.getElementById('detail-logo').src = univ.logo_url;
    document.getElementById('detail-title').textContent = univ.nama;
    document.getElementById('detail-subtitle').textContent = `${univ.wilayah} · Jalur ${activeJalur.toUpperCase()} (${activeTahun})`;

    // Activate
    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set search input value immediately before rendering table
    const searchProdi = document.getElementById('search-prodi');
    if (searchProdi) searchProdi.value = initialProdiSearch;

    // Render table instantly with exact prodi & jenjang filter
    renderDetailProdi(univId, initialProdiSearch, initialJenjang);

    // Update campus grid active state
    document.querySelectorAll('.campus-card').forEach(card => {
      card.classList.toggle('active', card.dataset.univId === univId);
    });
  }

  function openDetailAndHighlight(univId, prodiNama, jenjang = '') {
    openDetail(univId, prodiNama, jenjang);
  }

  function closeDetail() {
    activeUnivId = null;
    const panel = document.getElementById('detail-panel');
    const overlay = document.getElementById('detail-overlay');
    const bookmarkPanel = document.getElementById('bookmark-panel');

    panel.classList.remove('active');
    panel.classList.remove('with-bookmark');

    if (!bookmarkPanel || !bookmarkPanel.classList.contains('active')) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.campus-card').forEach(card => {
      card.classList.remove('active');
    });
  }

  function renderDetailProdi(univId, searchKeyword = '', targetJenjang = '') {
    const univ = universityData.universitas.find(u => u.id === univId);
    if (!univ) return;

    const tbody = document.getElementById('prodi-tbody');
    if (!tbody) return;

    let rawList = univ.prodi[activeJalur] || [];

    // Map each prodi to active year metrics
    let prodiList = rawList.map(p => DataUtils.getProdiDataForYear(p, activeTahun));

    // Filter by search, tier, jenjang
    prodiList = DataUtils.filterProdi(prodiList, searchKeyword, activeTier, targetJenjang || activeJenjang);

    // Sort
    prodiList = DataUtils.sortProdi(prodiList, sortState.by, sortState.asc);

    if (prodiList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;">
        ${activeJalur === 'snbp'
          ? Components.renderEmptyState('Data SNBP Belum Tersedia', 'Data jalur SNBP untuk universitas ini belum tersedia.')
          : Components.renderEmptyState('Tidak Ada Prodi', searchKeyword ? `Tidak ditemukan prodi "${searchKeyword}"` : 'Tidak ada data prodi.')
        }
      </td></tr>`;
      return;
    }

    tbody.innerHTML = prodiList.map((p, i) =>
      Components.renderProdiRow(p, univId, univ.nama, i)
    ).join('');

    // Update sort buttons
    updateSortButtons();
  }

  function filterDetailProdi(keyword) {
    if (activeUnivId) {
      renderDetailProdi(activeUnivId, keyword);
    }
  }

  function sortDetailProdiBy(field) {
    if (sortState.by === field) {
      sortState.asc = !sortState.asc;
    } else {
      sortState.by = field;
      sortState.asc = field === 'nama'; // default asc for nama, desc for numbers
    }

    if (activeUnivId) {
      const searchProdi = document.getElementById('search-prodi');
      renderDetailProdi(activeUnivId, searchProdi ? searchProdi.value : '');
    }
  }

  function updateSortButtons() {
    document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sort === sortState.by);
    });
  }

  // =====================================================================
  // BOOKMARKS & COMPARE ACTIONS
  // =====================================================================
  function toggleBookmark(univId, prodiNama, univNama, keketatanVal = null, jenjangVal = '') {
    // Get keketatan & jenjang if not passed
    const univ = universityData.universitas.find(u => u.id === univId);
    const prodi = univ?.prodi[activeJalur]?.find(p => p.nama === prodiNama);
    const keketatan = keketatanVal !== null ? keketatanVal : (prodi?.keketatan || 0);
    const jenjang = jenjangVal || (prodi?.jenjang || '');

    const added = BookmarkStore.toggle(univId, prodiNama, univNama, keketatan, jenjang);
    updateBookmarkCount();
    showToast(added ? `${prodiNama} disimpan` : `Bookmark ${prodiNama} dihapus`);

    // Re-render table if detail open
    if (activeUnivId) {
      const searchProdi = document.getElementById('search-prodi');
      renderDetailProdi(activeUnivId, searchProdi?.value || '');
    }

    // Re-render master view if active
    if (currentTab !== 'ptn') {
      renderMasterProdi();
    }

    // Re-render bookmark panel if open
    renderBookmarkPanel();
  }

  function updateBookmarkCount() {
    const badge = document.getElementById('bookmark-count');
    const count = BookmarkStore.count();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function openBookmarkPanel() {
    const panel = document.getElementById('bookmark-panel');
    const overlay = document.getElementById('detail-overlay');
    const detailPanel = document.getElementById('detail-panel');

    if (panel) {
      panel.classList.add('active');
      if (detailPanel && detailPanel.classList.contains('active')) {
        detailPanel.classList.add('with-bookmark');
      }
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      renderBookmarkPanel();
    }
  }

  function closeBookmarkPanel() {
    const panel = document.getElementById('bookmark-panel');
    const overlay = document.getElementById('detail-overlay');
    const detailPanel = document.getElementById('detail-panel');

    if (panel) {
      panel.classList.remove('active');
      if (detailPanel) {
        detailPanel.classList.remove('with-bookmark');
      }
      if (!detailPanel || !detailPanel.classList.contains('active')) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  }

  function renderBookmarkPanel() {
    const list = document.getElementById('bookmark-list');
    if (!list) return;
    list.innerHTML = Components.renderBookmarkList(BookmarkStore.getAll());
  }

  // =====================================================================
  // COMPARE
  // =====================================================================
  function toggleCompare(univId, prodiNama, univNama, keketatan, dayaTampung, peminat, jenjang) {
    const result = CompareStore.toggle(univId, prodiNama, univNama, keketatan, dayaTampung, peminat, jenjang);

    if (result === null) {
      showToast('Maksimal 4 prodi untuk perbandingan');
      return;
    }

    updateCompareBar();

    // Re-render table
    if (activeUnivId) {
      const searchProdi = document.getElementById('search-prodi');
      renderDetailProdi(activeUnivId, searchProdi?.value || '');
    }

    if (currentTab !== 'ptn') {
      renderMasterProdi();
    }

    showToast(result
      ? `${prodiNama} ditambahkan ke perbandingan`
      : `${prodiNama} dihapus dari perbandingan`
    );
  }

  function updateCompareBar() {
    const bar = document.getElementById('compare-bar');
    const itemsEl = document.getElementById('compare-items');
    const compareBtn = document.getElementById('btn-compare-action');
    if (!bar) return;

    const items = CompareStore.getAll();

    if (items.length === 0) {
      bar.classList.remove('active');
      return;
    }

    bar.classList.add('active');

    itemsEl.innerHTML = items.map(item => `
      <div class="compare-chip">
        <span>${item.prodiNama.length > 20 ? item.prodiNama.slice(0,20) + '…' : item.prodiNama}</span>
        <span class="remove-compare"
              onclick="App.removeCompare('${item.univId}', '${Components.escapeAttr(item.prodiNama)}')"
              role="button">×</span>
      </div>
    `).join('');

    if (compareBtn) {
      compareBtn.disabled = items.length < 2;
      compareBtn.textContent = `Bandingkan (${items.length})`;
    }
  }

  function removeCompare(univId, prodiNama) {
    CompareStore.remove(univId, prodiNama);
    updateCompareBar();

    if (activeUnivId) {
      const searchProdi = document.getElementById('search-prodi');
      renderDetailProdi(activeUnivId, searchProdi?.value || '');
    }

    if (currentTab !== 'ptn') {
      renderMasterProdi();
    }
  }

  function openCompareModal() {
    const items = CompareStore.getAll();
    if (items.length < 2) return;

    const modal = document.getElementById('compare-modal');
    const content = document.getElementById('compare-content');

    if (modal && content) {
      content.innerHTML = Components.renderCompareTable(items);
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCompareModal() {
    const modal = document.getElementById('compare-modal');
    if (modal) {
      modal.classList.remove('active');
      const detailPanel = document.getElementById('detail-panel');
      const bookmarkPanel = document.getElementById('bookmark-panel');
      const anyPanelOpen = (detailPanel && detailPanel.classList.contains('active')) ||
                           (bookmarkPanel && bookmarkPanel.classList.contains('active'));
      if (!anyPanelOpen) {
        document.body.style.overflow = '';
      }
    }
  }

  function clearCompare() {
    CompareStore.clear();
    updateCompareBar();
    closeCompareModal();

    if (activeUnivId) {
      const searchProdi = document.getElementById('search-prodi');
      renderDetailProdi(activeUnivId, searchProdi?.value || '');
    }

    if (currentTab !== 'ptn') {
      renderMasterProdi();
    }
  }

  // =====================================================================
  // TOAST
  // =====================================================================
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // =====================================================================
  // STRATEGY SIMULATOR & PRINT REPORTS
  // =====================================================================
  function renderSimulasi() {
    if (!universityData) return;
    const container = document.getElementById('simulasi-container');
    if (!container) return;

    const allProdiList = DataUtils.getAllProdi(universityData.universitas, activeJalur, activeTahun);
    container.innerHTML = Components.renderSimulasiView(allProdiList, simulasiPil1Key, simulasiPil2Key, activeTahun);
  }

  function setSimulasiPilihan(pilihanNum, key) {
    if (pilihanNum === 1) {
      simulasiPil1Key = key;
    } else if (pilihanNum === 2) {
      simulasiPil2Key = key;
    }
    renderSimulasi();
  }

  function printCompareReport() {
    const items = CompareStore.getAll();
    if (items.length === 0) return;

    const html = Components.generatePrintReportHTML(
      'compare',
      'Laporan Perbandingan Program Studi PTN',
      `Data Resmi SNPMB ${activeTahun} : Jalur ${activeJalur.toUpperCase()}`,
      items
    );

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
    }
  }

  function printSimulasiReport() {
    if (!simulasiPil1Key || !simulasiPil2Key || !universityData) return;

    const allProdiList = DataUtils.getAllProdi(universityData.universitas, activeJalur, activeTahun);

    const [uId1, pName1] = simulasiPil1Key.split(':::');
    const [uId2, pName2] = simulasiPil2Key.split(':::');

    const p1 = allProdiList.find(p => p.univId === uId1 && p.nama === pName1);
    const p2 = allProdiList.find(p => p.univId === uId2 && p.nama === pName2);

    if (!p1 || !p2) return;

    const k1 = p1.keketatan;
    const k2 = p2.keketatan;
    let desc = '';
    let tips = [];

    if (k2 < k1) {
      desc = `PERINGATAN: Pilihan 2 (${p2.nama} : ${k2.toFixed(2)}%) lebih ketat daripada Pilihan 1 (${p1.nama} : ${k1.toFixed(2)}%). Urutan disarankan untuk dibalik.`;
      tips = ['Tukarkan posisi Pilihan 1 dan Pilihan 2.'];
    } else if (k1 < 5 && k2 < 5) {
      desc = `RISIKO TINGGI: Kedua pilihan (${p1.nama} dan ${p2.nama}) tergolong Sangat Ketat (< 5%).`;
      tips = ['Ganti Pilihan 2 dengan prodi bersesuaian yang memiliki keketatan > 10% atau > 15%.'];
    } else {
      desc = `STRATEGI OPTIMAL: Pilihan 1 (${p1.nama}) sebagai Target Impian dan Pilihan 2 (${p2.nama}) sebagai Safety Net.`;
      tips = ['Fokus tingkatkan latihan UTBK untuk meraih Pilihan 1!'];
    }

    const html = Components.generatePrintReportHTML(
      'simulasi',
      'Laporan Strategi Kombinasi Pilihan SNBT/SNBP',
      `Hasil Analisis Kelolosan Pilihan 1 & Pilihan 2 (${activeTahun})`,
      [p1, p2],
      { desc, tips }
    );

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
    }
  }

  // =====================================================================
  // ANALYZER : SNBT & SNBP
  // =====================================================================

  function getAnalyzerRegions() {
    return universityData ? DataUtils.getRegions(universityData.universitas) : [];
  }

  function renderSnbtAnalyzer() {
    const container = document.getElementById('view-analyzer-snbt');
    if (!container) return;
    container.innerHTML = Components.renderSnbtAnalyzer(snbtState, getAnalyzerRegions());
  }

  function renderSnbpAnalyzer() {
    const container = document.getElementById('view-analyzer-snbp');
    if (!container) return;
    container.innerHTML = Components.renderSnbpAnalyzer(snbpState, getAnalyzerRegions());
  }

  function setSnbtScore(subtest, value) {
    const numVal = value === '' ? '' : Number(value);
    snbtState.scores[subtest] = numVal;
    // Live re-render input panel only (update filled state)
    const input = document.getElementById(`snbt-${subtest}`);
    if (input) {
      input.classList.toggle('filled', value !== '' && value != null);
    }
  }

  function setSnbpData(key, value) {
    snbpState[key] = value;
    // Re-render full form so mapel grid updates when prodiType changes
    renderSnbpAnalyzer();
  }

  function setSnbpMapel(mapelKey, value) {
    snbpState.nilaiMapelPendukung[mapelKey] = value === '' ? '' : Number(value);
  }

  function setAnalyzerFilter(mode, key, value) {
    if (mode === 'snbt') {
      snbtState[key] = value;
      // If prodiType changed, re-render form to update button states
      renderSnbtAnalyzer();
    } else if (mode === 'snbp') {
      snbpState[key] = value;
      // Clear mapel scores when switching prodiType
      if (key === 'prodiType') snbpState.nilaiMapelPendukung = {};
      renderSnbpAnalyzer();
    }
  }

  function runSnbtAnalysis() {
    if (!universityData) return;
    showToast('⏳ Menganalisis...');

    // Get all prodi for jalur SNBT
    const allProdi = DataUtils.getAllProdi(universityData.universitas, 'snbt', activeTahun);
    snbtState.allProdiCache = allProdi;

    const filters = {
      prodiType: snbtState.prodiType,
      jenjang: snbtState.jenjang,
      wilayah: snbtState.wilayah,
    };

    const results = AnalyzerUtils.analyzeSnbt(snbtState.scores, allProdi, filters);
    snbtState.results = results;
    analyzerFullResults.snbt = results.results || [];

    // Re-render results only
    const panel = document.getElementById('snbt-results-panel');
    if (panel) {
      panel.innerHTML = Components.renderAnalyzerResults(results, 'snbt');
    }

    const total = results.results?.length || 0;
    showToast(`✅ Ditemukan ${total.toLocaleString('id')} prodi sesuai profilmu`);
  }

  function runSnbpAnalysis() {
    if (!universityData || !snbpState.rataRapor) return;
    showToast('⏳ Menganalisis...');

    const allProdi = DataUtils.getAllProdi(universityData.universitas, 'snbp', activeTahun);
    snbpState.allProdiCache = allProdi;

    const filters = {
      prodiType: snbpState.prodiType === 'campuran' ? 'semua' : snbpState.prodiType,
      jenjang: snbpState.jenjang,
      wilayah: snbpState.wilayah,
    };

    const results = AnalyzerUtils.analyzeSnbp(
      snbpState.rataRapor,
      snbpState.nilaiMapelPendukung,
      snbpState.akreditasi,
      allProdi,
      filters
    );
    snbpState.results = results;
    analyzerFullResults.snbp = results.results || [];

    const panel = document.getElementById('snbp-results-panel');
    if (panel) {
      panel.innerHTML = Components.renderAnalyzerResults(results, 'snbp');
    }

    const total = results.results?.length || 0;
    if (total === 0) {
      showToast('⚠️ Tidak ada data SNBP. Coba jalur SNBT atau kurangi filter.');
    } else {
      showToast(`✅ Ditemukan ${total.toLocaleString('id')} prodi sesuai profilmu`);
    }
  }

  function loadMorePeluang(levelKey, currentCount, mode) {
    const allResults = analyzerFullResults[mode] || [];
    const levelResults = allResults.filter(p => p.peluang.key === levelKey);
    const nextBatch = levelResults.slice(currentCount, currentCount + 50);
    const level = AnalyzerUtils.PELUANG_LEVELS.find(l => l.key === levelKey);

    const listEl = document.getElementById(`list-${levelKey}`);
    if (!listEl || !level) return;

    // Append new cards
    nextBatch.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'peluang-card';
      card.onclick = () => openDetail(p.univId);
      card.innerHTML = `
        <div class="peluang-card-rank">#${currentCount + i + 1}</div>
        <div class="peluang-card-info">
          <div class="peluang-card-prodi">${Components.escapeHtml(p.nama)}</div>
          <div class="peluang-card-univ">${Components.escapeHtml(p.univNama || '')} (${Components.escapeHtml(p.univSingkatan || '')})</div>
          ${p.jenjang ? `<span class="peluang-card-jenjang">${Components.escapeHtml(p.jenjang)}</span>` : ''}
        </div>
        <div class="peluang-card-meta">
          <span class="peluang-indicator ${levelKey}"><span class="status-dot-pulse"></span> ${level.label}</span>
          <span class="peluang-keketatan"><span class="icon-inline-sm">${Components.Icons.zap}</span> Keketatan ${p.keketatan.toFixed(2)}%</span>
        </div>
      `;
      listEl.appendChild(card);
    });

    // Update or remove the load-more button
    const newCount = currentCount + nextBatch.length;
    const btn = listEl.nextElementSibling;
    if (btn && btn.classList.contains('btn-load-more-peluang')) {
      if (newCount >= levelResults.length) {
        btn.remove();
      } else {
        btn.textContent = `Tampilkan ${Math.min(50, levelResults.length - newCount)} lagi dari ${levelResults.length} prodi ▼`;
        btn.onclick = () => loadMorePeluang(levelKey, newCount, mode);
      }
    }
  }

  // =====================================================================
  // PUBLIC API
  // =====================================================================
  return {
    init,
    toggleTheme,
    quickSearch,
    switchMainTab,
    scrollNavTabs,
    setTahun,
    setJalur,
    setRegion,
    setTier,
    setJenjang,
    resetFilters,
    toggleShowAll,
    openDetail,
    openDetailAndHighlight,
    closeDetail,
    filterDetailProdi,
    sortProdiBy: sortDetailProdiBy,   // alias for backward-compat with index.html
    sortDetailProdiBy,
    filterMasterProdi,
    sortMasterProdiBy,
    toggleBookmark,
    openBookmarkPanel,
    closeBookmarkPanel,
    toggleCompare,
    removeCompare,
    openCompareModal,
    closeCompareModal,
    clearCompare,
    renderSimulasi,
    setSimulasiPilihan,
    printCompareReport,
    printSimulasiReport,
    setSnbtScore,
    setSnbpData,
    setSnbpMapel,
    setAnalyzerFilter,
    runSnbtAnalysis,
    runSnbpAnalysis,
    loadMorePeluang,
  };
})();

// Boot
document.addEventListener('DOMContentLoaded', App.init);
