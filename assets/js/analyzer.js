/* ======================================================================
   ANALYZER.JS — Modul Analisis Peluang SNBT & SNBP
   Portal Keketatan SNPMB
   ====================================================================== */

/**
 * Model Probabilistik:
 * Kelulusan SNBT/SNBP berbasis peringkat (ranking), bukan nilai absolut.
 * Jika keketatan prodi = K%, maka hanya top K% pendaftar yang diterima.
 * Strategi: konversi skor siswa → estimasi persentil nasional →
 *           bandingkan dengan keketatan tiap prodi → hitung peluang.
 *
 * Data Resmi UTBK-SNBT 2025 (SNPMB):
 *   Mean nasional = 545.78, Min = 200, Max = 819.85
 *   SD diestimasi ≈ 90 (dikalibrasi dari range & distribusi umum IRT)
 */

const AnalyzerUtils = (() => {
  'use strict';

  // =====================================================================
  // CONSTANTS — UTBK SNBT (Skala 0–100)
  // =====================================================================
  const SNBT_MEAN = 50;
  const SNBT_SD   = 12.8;
  const SNBT_MIN  = 0;
  const SNBT_MAX  = 100;

  // 7 Subtest UTBK-SNBT 2025
  const SNBT_SUBTESTS = [
    { key: 'pu',    label: 'Penalaran Umum',                group: 'TPS',      abbr: 'PU'    },
    { key: 'pbm',   label: 'Pemahaman Bacaan & Menulis',    group: 'TPS',      abbr: 'PBM'   },
    { key: 'ppu',   label: 'Pengetahuan & Pemahaman Umum',  group: 'TPS',      abbr: 'PPU'   },
    { key: 'pk',    label: 'Pengetahuan Kuantitatif',       group: 'TPS',      abbr: 'PK'    },
    { key: 'lbi',   label: 'Literasi Bahasa Indonesia',     group: 'Literasi', abbr: 'LBI'   },
    { key: 'lbing', label: 'Literasi Bahasa Inggris',       group: 'Literasi', abbr: 'LBIng' },
    { key: 'pm',    label: 'Penalaran Matematika',          group: 'PM',       abbr: 'PM'    },
  ];

  // =====================================================================
  // CONSTANTS — SNBP
  // =====================================================================
  const SNBP_MEAN = 82;
  const SNBP_SD   = 7;

  // Akreditasi sekolah → multiplier estimasi kompetensi relatif
  const AKREDITASI_MULTIPLIER = { A: 1.00, B: 0.97, C: 0.93 };

  // Mapel pendukung per tipe prodi (sesuai Kepmendikdasmen 102/M/2025)
  const MAPEL_PENDUKUNG = {
    saintek: [
      { key: 'matematika', label: 'Matematika' },
      { key: 'fisika',     label: 'Fisika' },
      { key: 'kimia',      label: 'Kimia' },
      { key: 'biologi',    label: 'Biologi' },
    ],
    soshum: [
      { key: 'ekonomi',    label: 'Ekonomi' },
      { key: 'geografi',   label: 'Geografi' },
      { key: 'sejarah',    label: 'Sejarah' },
      { key: 'sosiologi',  label: 'Sosiologi' },
    ],
    campuran: [
      { key: 'matematika', label: 'Matematika' },
      { key: 'ekonomi',    label: 'Ekonomi' },
      { key: 'bahasa_ind', label: 'Bahasa Indonesia' },
      { key: 'bahasa_ing', label: 'Bahasa Inggris' },
    ],
  };

  // Pemetaan nama prodi keywords → tipe SAINTEK/SOSHUM (heuristic)
  const SAINTEK_KEYWORDS = [
    'teknik', 'informatika', 'komputer', 'kedokteran', 'farmasi', 'biologi',
    'kimia', 'fisika', 'matematika', 'statistika', 'geologi', 'pertanian',
    'peternakan', 'kehutanan', 'kelautan', 'perikanan', 'kesehatan', 'gizi',
    'kebidanan', 'keperawatan', 'kesehatan masyarakat', 'lingkungan', 'arsitektur',
    'sipil', 'mesin', 'elektro', 'industri', 'material', 'nuklir', 'aeronautika',
    'penerbangan', 'astronomi', 'biokimia', 'biomedik', 'agroteknologi',
  ];

  const SOSHUM_KEYWORDS = [
    'hukum', 'ekonomi', 'manajemen', 'akuntansi', 'administrasi', 'bisnis',
    'komunikasi', 'sosiologi', 'antropologi', 'sejarah', 'geografi', 'psikologi',
    'ilmu politik', 'hubungan internasional', 'filsafat', 'sastra', 'bahasa',
    'pendidikan', 'kependidikan', 'perpustakaan', 'kesejahteraan', 'kriminologi',
    'jurnalistik', 'periklanan', 'pariwisata', 'perhotelan',
  ];

  // Peluang category definitions
  const PELUANG_LEVELS = [
    { key: 'sangat-berpeluang', label: 'Sangat Berpeluang', emoji: '✅', color: '#22c55e', threshold: 0.5  },
    { key: 'berpeluang',        label: 'Berpeluang',        emoji: '🔵', color: '#3b82f6', threshold: 0.8  },
    { key: 'kompetitif',        label: 'Kompetitif',        emoji: '🟡', color: '#eab308', threshold: 1.2  },
    { key: 'perlu-peningkatan', label: 'Perlu Peningkatan', emoji: '🟠', color: '#f97316', threshold: 2.0  },
    { key: 'kurang-berpeluang', label: 'Kurang Berpeluang', emoji: '🔴', color: '#ef4444', threshold: Infinity },
  ];

  // =====================================================================
  // MATH UTILITIES
  // =====================================================================

  /**
   * Approximate standard normal CDF using Horner's method
   * Accurate to ~5 decimal places
   */
  function normalCDF(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const poly = t * (0.319381530
      + t * (-0.356563782
      + t * (1.781477937
      + t * (-1.821255978
      + t * 1.330274429))));
    const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    const cdf = 1 - pdf * poly;
    return z >= 0 ? cdf : 1 - cdf;
  }

  /**
   * Convert a score to estimated top-X% percentile
   * Returns value 0–100: "you are in the top X% of test-takers"
   * Lower = better (top 1% = excellent)
   */
  function scoreToPercentile(score, mean, sd) {
    const z = (score - mean) / sd;
    const topPercent = (1 - normalCDF(z)) * 100;
    return Math.max(0.1, Math.min(99.9, topPercent));
  }

  // =====================================================================
  // UTBK-SNBT ANALYSIS
  // =====================================================================

  /**
   * Normalisasi skor UTBK SNBT ke Skala 0–100:
   * Jika dimasukkan angka > 100 (misal 650), otomatis diubah ke 0–100.
   */
  function normalizeSnbtScore(raw) {
    if (raw == null || raw === '') return null;
    const num = Number(raw);
    if (isNaN(num)) return null;

    if (num > 100) {
      return Math.min(100, Math.max(0, (num - 200) / 7));
    }
    return Math.min(100, Math.max(0, num));
  }

  /**
   * Hitung skor komposit SNBT dari 7 subtest
   * Menggunakan rata-rata sederhana (IRT membuat seluruh subtest setara)
   * Optional: weighted average berdasarkan tipe prodi
   */
  function calcSnbtComposite(scores, prodiType = 'semua') {
    const keys = Object.keys(scores).filter(k => scores[k] != null && scores[k] !== '');
    if (keys.length === 0) return null;

    // Normalisasi tiap skor (mendukung skala 0-100 maupun 200-1000)
    const normalizedScores = {};
    keys.forEach(k => {
      normalizedScores[k] = normalizeSnbtScore(scores[k]);
    });

    const values = keys.map(k => normalizedScores[k]).filter(v => v != null);
    if (values.length === 0) return null;
    const base = values.reduce((a, b) => a + b, 0) / values.length;

    // Weighted adjustment based on prodi type (subtle boost for relevant subtests)
    if (prodiType === 'saintek') {
      const saintek_boost = ['pm', 'pk'].filter(k => normalizedScores[k] != null);
      if (saintek_boost.length > 0) {
        const boostAvg = saintek_boost.map(k => normalizedScores[k]).reduce((a, b) => a + b, 0) / saintek_boost.length;
        return base * 0.7 + boostAvg * 0.3;
      }
    } else if (prodiType === 'soshum') {
      const soshum_boost = ['pbm', 'ppu', 'lbi'].filter(k => normalizedScores[k] != null);
      if (soshum_boost.length > 0) {
        const boostAvg = soshum_boost.map(k => normalizedScores[k]).reduce((a, b) => a + b, 0) / soshum_boost.length;
        return base * 0.7 + boostAvg * 0.3;
      }
    }

    return base;
  }

  /**
   * Analisis SNBT: match prodi berdasarkan peluang
   */
  function analyzeSnbt(snbtScores, allProdi, filters = {}) {
    const { prodiType = 'semua', jenjang = '', wilayah = '' } = filters;

    const composite = calcSnbtComposite(snbtScores, prodiType);
    if (!composite) return { composite: null, percentile: null, results: [] };

    const percentile = scoreToPercentile(composite, SNBT_MEAN, SNBT_SD);

    let filtered = allProdi;

    // Filter by prodi type (SAINTEK/SOSHUM)
    if (prodiType === 'saintek') {
      filtered = filtered.filter(p => classifyProdiType(p.nama) === 'saintek');
    } else if (prodiType === 'soshum') {
      filtered = filtered.filter(p => classifyProdiType(p.nama) === 'soshum');
    }

    // Filter by jenjang
    if (jenjang) {
      filtered = filtered.filter(p => (p.jenjang || '').toLowerCase().includes(jenjang.toLowerCase()));
    }

    // Filter by wilayah
    if (wilayah) {
      filtered = filtered.filter(p => p.wilayah === wilayah);
    }

    // Only include prodi with valid keketatan data
    filtered = filtered.filter(p => p.keketatan > 0 && p.keketatan <= 100);

    // Calculate peluang for each prodi
    const results = filtered.map(p => {
      const peluang = calcPeluang(percentile, p.keketatan);
      return { ...p, peluang, studentPercentile: percentile, composite };
    });

    // Sort: best peluang first, then by keketatan ascending
    results.sort((a, b) => {
      const orderA = PELUANG_LEVELS.findIndex(l => l.key === a.peluang.key);
      const orderB = PELUANG_LEVELS.findIndex(l => l.key === b.peluang.key);
      if (orderA !== orderB) return orderA - orderB;
      return b.keketatan - a.keketatan; // within same tier: easier prodi first
    });

    return { composite, percentile, results };
  }

  // =====================================================================
  // SNBP ANALYSIS
  // =====================================================================

  /**
   * Hitung skor tertimbang SNBP
   * Formula resmi: min 50% rata-rata semua mapel + maks 50% mapel pendukung
   */
  function calcSnbpScore(rataRapor, nilaiMapelPendukung, akreditasi = 'A') {
    const multiplier = AKREDITASI_MULTIPLIER[akreditasi] || 1.0;
    const pendukungArr = Object.values(nilaiMapelPendukung).filter(v => v != null && v !== '');
    const avgPendukung = pendukungArr.length > 0
      ? pendukungArr.map(Number).reduce((a, b) => a + b, 0) / pendukungArr.length
      : rataRapor;

    const tertimbang = (0.5 * Number(rataRapor) + 0.5 * avgPendukung) * multiplier;
    return Math.min(100, Math.max(0, tertimbang));
  }

  /**
   * Analisis SNBP: match prodi berdasarkan peluang
   */
  function analyzeSnbp(rataRapor, nilaiMapelPendukung, akreditasi, allProdi, filters = {}) {
    const { prodiType = 'semua', jenjang = '', wilayah = '' } = filters;

    const scoreTertimbang = calcSnbpScore(rataRapor, nilaiMapelPendukung, akreditasi);
    const percentile = scoreToPercentile(scoreTertimbang, SNBP_MEAN, SNBP_SD);

    let filtered = allProdi;

    if (prodiType === 'saintek') {
      filtered = filtered.filter(p => classifyProdiType(p.nama) === 'saintek');
    } else if (prodiType === 'soshum') {
      filtered = filtered.filter(p => classifyProdiType(p.nama) === 'soshum');
    }

    if (jenjang) {
      filtered = filtered.filter(p => (p.jenjang || '').toLowerCase().includes(jenjang.toLowerCase()));
    }

    if (wilayah) {
      filtered = filtered.filter(p => p.wilayah === wilayah);
    }

    filtered = filtered.filter(p => p.keketatan > 0 && p.keketatan <= 100);

    const results = filtered.map(p => {
      const peluang = calcPeluang(percentile, p.keketatan);
      return { ...p, peluang, studentPercentile: percentile, scoreTertimbang };
    });

    results.sort((a, b) => {
      const orderA = PELUANG_LEVELS.findIndex(l => l.key === a.peluang.key);
      const orderB = PELUANG_LEVELS.findIndex(l => l.key === b.peluang.key);
      if (orderA !== orderB) return orderA - orderB;
      return b.keketatan - a.keketatan;
    });

    return { scoreTertimbang, percentile, results };
  }

  // =====================================================================
  // SHARED UTILITIES
  // =====================================================================

  /**
   * Hitung level peluang berdasarkan perbandingan studentPercentile vs keketatanProdi
   * studentPercentile: "top X%" — semakin kecil semakin bagus
   * keketatanProdi: "hanya X% yang diterima" — semakin kecil semakin sulit
   * Rasio = studentPercentile / keketatanProdi
   *   Rasio ≤ 0.5 → jauh lebih baik dari yang dibutuhkan → Sangat Berpeluang
   *   Rasio 0.5-0.8 → Berpeluang
   *   Rasio 0.8-1.2 → Kompetitif (borderline)
   *   Rasio 1.2-2.0 → Perlu Peningkatan
   *   Rasio > 2.0 → Kurang Berpeluang
   */
  function calcPeluang(studentPercentile, keketatanProdi) {
    const ratio = studentPercentile / keketatanProdi;

    for (const level of PELUANG_LEVELS) {
      if (ratio <= level.threshold) {
        return level;
      }
    }
    return PELUANG_LEVELS[PELUANG_LEVELS.length - 1];
  }

  /**
   * Klasifikasi tipe prodi berdasarkan nama (heuristic)
   * Returns: 'saintek' | 'soshum' | 'campuran'
   */
  function classifyProdiType(namaProdi) {
    const lower = namaProdi.toLowerCase();
    const isSaintek = SAINTEK_KEYWORDS.some(k => lower.includes(k));
    const isSoshum  = SOSHUM_KEYWORDS.some(k => lower.includes(k));
    if (isSaintek && !isSoshum) return 'saintek';
    if (isSoshum && !isSaintek) return 'soshum';
    return 'campuran';
  }

  /**
   * Format percentile untuk display
   * "top 12.5%" atau "top 1%" (di-floor ke 1 decimal)
   */
  function formatPercentile(p) {
    if (p < 1) return `top ${p.toFixed(1)}%`;
    if (p < 10) return `top ${p.toFixed(1)}%`;
    return `top ${Math.round(p)}%`;
  }

  /**
   * Hitung skor komposit SNBT display
   */
  function formatSnbtComposite(composite) {
    return composite ? composite.toFixed(2) : '—';
  }

  /**
   * Get subtest groups for display
   */
  function getSnbtSubtestGroups() {
    const groups = {};
    for (const s of SNBT_SUBTESTS) {
      if (!groups[s.group]) groups[s.group] = [];
      groups[s.group].push(s);
    }
    return groups;
  }

  return {
    SNBT_SUBTESTS,
    SNBT_MEAN,
    SNBT_SD,
    SNBT_MIN,
    SNBT_MAX,
    SNBP_MEAN,
    SNBP_SD,
    MAPEL_PENDUKUNG,
    PELUANG_LEVELS,
    normalCDF,
    scoreToPercentile,
    calcSnbtComposite,
    calcSnbpScore,
    analyzeSnbt,
    analyzeSnbp,
    calcPeluang,
    classifyProdiType,
    formatPercentile,
    formatSnbtComposite,
    getSnbtSubtestGroups,
  };
})();
