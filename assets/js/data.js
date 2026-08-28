/* ======================================================================
   DATA.JS — Data Processing Utilities
   Portal Keketatan SNPMB
   ====================================================================== */

const DataUtils = (() => {
  'use strict';

  // Keketatan thresholds (PRD §3.2)
  const THRESHOLDS = {
    SANGAT_KETAT: 5,   // <5%
    KETAT: 15,          // 5-15%
    KOMPETITIF: 30,     // 15-30%
    // >30% = longgar
  };

  /**
   * Classify keketatan level
   * @param {number} rasio - Keketatan percentage (e.g. 2.70)
   * @returns {{ level: string, label: string, cssClass: string }}
   */
  function classifyKeketatan(rasio) {
    if (rasio < THRESHOLDS.SANGAT_KETAT) {
      return { level: 'sangat-ketat', label: 'Sangat Ketat', cssClass: 'sangat-ketat' };
    }
    if (rasio < THRESHOLDS.KETAT) {
      return { level: 'ketat', label: 'Ketat', cssClass: 'ketat' };
    }
    if (rasio < THRESHOLDS.KOMPETITIF) {
      return { level: 'kompetitif', label: 'Kompetitif', cssClass: 'kompetitif' };
    }
    return { level: 'longgar', label: 'Longgar', cssClass: 'longgar' };
  }

  /**
   * Get tooltip text for keketatan level
   */
  function getKeketanTooltip(level) {
    const tooltips = {
      'sangat-ketat': 'Rasio < 5% — Sangat kompetitif, peluang kecil',
      'ketat': 'Rasio 5-15% — Cukup kompetitif',
      'kompetitif': 'Rasio 15-30% — Persaingan moderat',
      'longgar': 'Rasio > 30% — Peluang relatif besar',
    };
    return tooltips[level] || '';
  }

  /**
   * Format number with thousand separator
   */
  function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  /**
   * Resolve prodi metrics for a specific year (2025, 2024, 2023)
   */
  function getProdiDataForYear(prodi, activeTahun = '2025') {
    if (!prodi) return null;

    let dt = prodi.daya_tampung;
    let pem = prodi.peminat;
    let kek = prodi.keketatan;

    if (prodi.history && prodi.history[activeTahun]) {
      dt = prodi.history[activeTahun].daya_tampung;
      pem = prodi.history[activeTahun].peminat;
      kek = prodi.history[activeTahun].keketatan;
    }

    // Trend vs previous year
    const prevYear = activeTahun === '2025' ? '2024' : activeTahun === '2024' ? '2023' : null;
    let trendDiff = 0;
    if (prevYear && prodi.history && prodi.history[prevYear]) {
      const prevKek = prodi.history[prevYear].keketatan;
      trendDiff = parseFloat((kek - prevKek).toFixed(2));
    }

    return {
      ...prodi,
      daya_tampung: dt,
      peminat: pem,
      keketatan: kek,
      tahun_aktif: activeTahun,
      trendDiff
    };
  }

  /**
   * Build search index from university data
   */
  function buildSearchIndex(universities) {
    const index = [];

    universities.forEach(univ => {
      index.push({
        type: 'universitas',
        text: univ.nama,
        searchText: `${univ.nama} ${univ.singkatan} ${univ.wilayah}`.toLowerCase(),
        univId: univ.id,
        univNama: univ.nama,
        univSingkatan: univ.singkatan,
        logoUrl: univ.logo_url,
        wilayah: univ.wilayah,
        jumlahProdi: univ.jumlah_prodi_snbt,
      });

      if (univ.prodi && univ.prodi.snbt) {
        univ.prodi.snbt.forEach(prodi => {
          index.push({
            type: 'prodi',
            text: prodi.nama,
            searchText: `${prodi.nama} ${univ.nama} ${univ.singkatan}`.toLowerCase(),
            univId: univ.id,
            univNama: univ.nama,
            univSingkatan: univ.singkatan,
            logoUrl: univ.logo_url,
            prodiNama: prodi.nama,
            jenjang: prodi.jenjang,
            keketatan: prodi.keketatan,
          });
        });
      }
    });

    return index;
  }

  /**
   * Fuzzy search through index
   */
  function search(index, query, limit = 12) {
    if (!query || query.length < 2) return [];

    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);

    const scored = index
      .map(item => {
        let score = 0;
        const st = item.searchText;

        if (st.includes(q)) {
          score += 100;
          if (st.startsWith(q)) score += 50;
        }

        let allWordsMatch = true;
        words.forEach(word => {
          if (st.includes(word)) {
            score += 20;
          } else {
            allWordsMatch = false;
          }
        });

        if (!allWordsMatch) score = 0;
        if (item.type === 'universitas' && score > 0) score += 10;

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  /**
   * Sort prodi data
   */
  function sortProdi(prodiList, sortBy = 'nama', ascending = true) {
    const sorted = [...prodiList];
    sorted.sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'nama':
          valA = a.nama.toLowerCase();
          valB = b.nama.toLowerCase();
          return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        case 'keketatan':
          valA = a.keketatan;
          valB = b.keketatan;
          break;
        case 'peminat':
          valA = a.peminat;
          valB = b.peminat;
          break;
        case 'daya_tampung':
          valA = a.daya_tampung;
          valB = b.daya_tampung;
          break;
        default:
          return 0;
      }
      return ascending ? valA - valB : valB - valA;
    });
    return sorted;
  }

  /**
   * Filter prodi by search keyword, keketatan tier, and jenjang
   */
  function filterProdi(prodiList, keyword = '', tier = '', jenjang = '') {
    let result = prodiList;

    if (keyword) {
      const q = keyword.toLowerCase().trim();
      result = result.filter(p => p.nama.toLowerCase().includes(q));
    }

    if (tier) {
      result = result.filter(p => {
        const info = classifyKeketatan(p.keketatan);
        return info.level === tier;
      });
    }

    if (jenjang) {
      result = result.filter(p => (p.jenjang || '').toLowerCase().includes(jenjang.toLowerCase()));
    }

    return result;
  }

  const ALL_PROVINCES = [
    "Aceh",
    "Bali",
    "Banten",
    "Bengkulu",
    "D.I. Yogyakarta",
    "DKI Jakarta",
    "Gorontalo",
    "Jambi",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Kalimantan Barat",
    "Kalimantan Selatan",
    "Kalimantan Tengah",
    "Kalimantan Timur",
    "Kalimantan Utara",
    "Kepulauan Bangka Belitung",
    "Kepulauan Riau",
    "Lampung",
    "Maluku",
    "Maluku Utara",
    "Nusa Tenggara Barat (NTB)",
    "Nusa Tenggara Timur (NTT)",
    "Papua",
    "Papua Barat",
    "Papua Barat Daya",
    "Papua Pegunungan",
    "Papua Selatan",
    "Papua Tengah",
    "Riau",
    "Sulawesi Barat",
    "Sulawesi Selatan",
    "Sulawesi Tengah",
    "Sulawesi Tenggara",
    "Sulawesi Utara",
    "Sumatera Barat",
    "Sumatera Selatan",
    "Sumatera Utara"
  ];

  /**
   * Get all 38 official provinces of Indonesia
   */
  function getRegions(universities) {
    return ALL_PROVINCES;
  }

  /**
   * Calculate aggregate stats for selected year and jalur
   */
  function getStats(universities, activeTahun = '2025', activeJalur = 'snbt') {
    let totalProdi = 0;
    let totalPeminat = 0;
    let totalDayaTampung = 0;
    let totalKeketatan = 0;

    universities.forEach(u => {
      const prodiList = u.prodi[activeJalur] || [];
      totalProdi += prodiList.length;
      prodiList.forEach(p => {
        const yearData = getProdiDataForYear(p, activeTahun);
        totalPeminat += yearData.peminat || 0;
        totalDayaTampung += yearData.daya_tampung || 0;
        totalKeketatan += yearData.keketatan || 0;
      });
    });

    const avgKeketatan = totalProdi > 0 ? (totalKeketatan / totalProdi).toFixed(2) : 0;

    return {
      totalUniversitas: universities.length,
      totalProdi,
      totalPeminat,
      totalDayaTampung,
      avgKeketatan,
      tahun: activeTahun
    };
  }

  /**
   * Get flattened list of all prodi across all universities for selected year
   */
  function getAllProdi(universities, jalur = 'snbt', activeTahun = '2025') {
    const list = [];
    if (!universities) return list;

    universities.forEach(univ => {
      const prodiList = univ.prodi[jalur] || [];
      prodiList.forEach(p => {
        const yearData = getProdiDataForYear(p, activeTahun);
        list.push({
          ...yearData,
          univId: univ.id,
          univNama: univ.nama,
          univSingkatan: univ.singkatan,
          wilayah: univ.wilayah,
          logoUrl: univ.logo_url
        });
      });
    });

    return list;
  }

  // Public API
  return {
    classifyKeketatan,
    getKeketanTooltip,
    formatNumber,
    getProdiDataForYear,
    buildSearchIndex,
    search,
    sortProdi,
    filterProdi,
    getAllProdi,
    getRegions,
    getStats,
    THRESHOLDS,
  };
})();
