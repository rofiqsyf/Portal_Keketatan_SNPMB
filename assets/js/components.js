/* ======================================================================
   COMPONENTS.JS — UI Component Renderers
   Portal Keketatan SNPMB
   ====================================================================== */

const Icons = {
  gradCap: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  bookmarkOutline: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  bookmarkFilled: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M20 6 9 17l-5-5"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  scale: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/></svg>`,
  pen: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`
};

const Components = (() => {
  'use strict';

  /**
   * Render a campus card
   */
  function renderCampusCard(univ, isActive = false) {
    const prodiCount = univ.jumlah_prodi_snbt || 0;
    return `
      <div class="campus-card ${isActive ? 'active' : ''}"
           data-univ-id="${univ.id}"
           onclick="App.openDetail('${univ.id}')"
           role="button"
           tabindex="0"
           aria-label="Lihat data ${univ.nama}">
        <img class="card-logo" src="${univ.logo_url}" alt="${univ.singkatan}" loading="lazy"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect fill=%22%23E2E8F0%22 width=%2264%22 height=%2264%22 rx=%228%22/%3E%3Ctext x=%2232%22 y=%2236%22 text-anchor=%22middle%22 fill=%22%2394A3B8%22 font-size=%2216%22 font-weight=%22bold%22%3E${univ.singkatan.slice(0,3)}%3C/text%3E%3C/svg%3E'">
        <div class="card-name">${univ.singkatan}</div>
        <div class="card-meta">${univ.wilayah}</div>
        ${prodiCount > 0 ? `<div class="card-prodi-count">${Icons.book} <span>${prodiCount} prodi</span></div>` : ''}
      </div>
    `;
  }

  /**
   * Render keketatan badge (ONLY primary percentage badge)
   */
  function renderKeketanBadge(rasio) {
    const info = DataUtils.classifyKeketatan(rasio);

    return `
      <div class="keketatan-cell">
        <span class="keketatan-badge ${info.cssClass}">
          <span class="dot"></span>
          ${rasio.toFixed(2)}%
        </span>
      </div>
    `;
  }

  /**
   * Render a single prodi table row
   */
  function renderProdiRow(prodi, univId, univNama, index) {
    const isBookmarked = BookmarkStore.has(univId, prodi.nama, prodi.jenjang);
    const isCompared = CompareStore.has(univId, prodi.nama);

    return `
      <tr data-index="${index}">
        <td class="prodi-name">${prodi.nama}</td>
        <td class="prodi-jenjang">${prodi.jenjang || '-'}</td>
        <td class="prodi-number">${DataUtils.formatNumber(prodi.daya_tampung)}</td>
        <td class="prodi-number">${DataUtils.formatNumber(prodi.peminat)}</td>
        <td>${renderKeketanBadge(prodi.keketatan, prodi.trendDiff)}</td>
        <td>
          <div class="prodi-actions">
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}"
                    onclick="App.toggleBookmark('${univId}', '${escapeAttr(prodi.nama)}', '${escapeAttr(univNama)}', ${prodi.keketatan}, '${escapeAttr(prodi.jenjang || '')}')"
                    aria-label="${isBookmarked ? 'Hapus bookmark' : 'Bookmark'} ${prodi.nama}"
                    title="${isBookmarked ? 'Hapus bookmark' : 'Bookmark prodi ini'}">
              ${isBookmarked ? Icons.bookmarkFilled : Icons.bookmarkOutline}
            </button>
            <button class="btn-compare-add ${isCompared ? 'added' : ''}"
                    onclick="App.toggleCompare('${univId}', '${escapeAttr(prodi.nama)}', '${escapeAttr(univNama)}', ${prodi.keketatan}, ${prodi.daya_tampung}, ${prodi.peminat}, '${escapeAttr(prodi.jenjang)}')"
                    aria-label="Bandingkan ${prodi.nama}"
                    title="Tambah ke perbandingan">
              ${isCompared ? Icons.check : Icons.plus}
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Render master prodi explorer table row
   */
  function renderMasterProdiRow(prodi, index) {
    const isBookmarked = BookmarkStore.has(prodi.univId, prodi.nama, prodi.jenjang);
    const isCompared = CompareStore.has(prodi.univId, prodi.nama);

    return `
      <tr data-index="${index}">
        <td class="prodi-name">
          <div class="prodi-title">${prodi.nama}</div>
          <div class="prodi-univ-subtitle" onclick="App.openDetail('${prodi.univId}')">
            <img src="${prodi.logoUrl}" class="mini-logo" alt="" onerror="this.style.display='none'">
            <span>${prodi.univNama} (${prodi.univSingkatan})</span>
          </div>
        </td>
        <td class="prodi-jenjang">${prodi.jenjang || '-'}</td>
        <td class="prodi-number">${DataUtils.formatNumber(prodi.daya_tampung)}</td>
        <td class="prodi-number">${DataUtils.formatNumber(prodi.peminat)}</td>
        <td>${renderKeketanBadge(prodi.keketatan, prodi.trendDiff)}</td>
        <td>
          <div class="prodi-actions">
            <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}"
                    onclick="App.toggleBookmark('${prodi.univId}', '${escapeAttr(prodi.nama)}', '${escapeAttr(prodi.univNama)}', ${prodi.keketatan}, '${escapeAttr(prodi.jenjang || '')}')"
                    aria-label="${isBookmarked ? 'Hapus bookmark' : 'Bookmark'} ${prodi.nama}"
                    title="${isBookmarked ? 'Hapus bookmark' : 'Bookmark prodi ini'}">
              ${isBookmarked ? Icons.bookmarkFilled : Icons.bookmarkOutline}
            </button>
            <button class="btn-compare-add ${isCompared ? 'added' : ''}"
                    onclick="App.toggleCompare('${prodi.univId}', '${escapeAttr(prodi.nama)}', '${escapeAttr(prodi.univNama)}', ${prodi.keketatan}, ${prodi.daya_tampung}, ${prodi.peminat}, '${escapeAttr(prodi.jenjang)}')"
                    aria-label="Bandingkan ${prodi.nama}"
                    title="Tambah ke perbandingan">
              ${isCompared ? Icons.check : Icons.plus}
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  /**
   * Render skeleton loading rows
   */
  function renderSkeletonRows(count = 8) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-row">
          <div class="skeleton skeleton-cell w-40" style="height:16px"></div>
          <div class="skeleton skeleton-cell w-15" style="height:16px"></div>
          <div class="skeleton skeleton-cell w-15" style="height:16px"></div>
          <div class="skeleton skeleton-cell w-15" style="height:16px"></div>
          <div class="skeleton skeleton-cell w-15" style="height:16px"></div>
        </div>
      `;
    }
    return html;
  }

  /**
   * Render empty state
   */
  function renderEmptyState(title, description) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${Icons.search}</div>
        <div class="empty-title">${title}</div>
        <div class="empty-desc">${description}</div>
      </div>
    `;
  }

  /**
   * Render stats bar (synced dynamically with selected year and filters!)
   */
  function renderStatsBar(stats, meta) {
    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalUniversitas}</div>
          <div class="stat-label">Perguruan Tinggi</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${DataUtils.formatNumber(stats.totalProdi)}</div>
          <div class="stat-label">Program Studi</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${DataUtils.formatNumber(stats.totalPeminat)}</div>
          <div class="stat-label">Total Peminat (${stats.tahun})</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.avgKeketatan}%</div>
          <div class="stat-label">Rerata Keketatan (${stats.tahun})</div>
        </div>
      </div>
    `;
  }

  /**
   * Render autocomplete items grouped
   */
  function renderAutocompleteResults(results, query) {
    if (results.length === 0) {
      return `<div style="padding:16px;text-align:center;color:var(--text-tertiary);font-size:14px;">
        Tidak ditemukan hasil untuk "<strong>${escapeHtml(query)}</strong>"
      </div>`;
    }

    const univResults = results.filter(r => r.type === 'universitas');
    const prodiResults = results.filter(r => r.type === 'prodi');

    let html = '';

    if (univResults.length > 0) {
      html += `<div class="autocomplete-group-label">Perguruan Tinggi</div>`;
      univResults.forEach(r => {
        html += `
          <div class="autocomplete-item" onclick="App.openDetail('${r.univId}')" role="option">
            <img class="ac-icon" src="${r.logoUrl}" alt="${r.univSingkatan}" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="ac-text">
              <div class="ac-name">${highlightMatch(r.univNama, query)}</div>
              <div class="ac-meta">${r.wilayah} · ${r.jumlahProdi} prodi</div>
            </div>
          </div>
        `;
      });
    }

    if (prodiResults.length > 0) {
      html += `<div class="autocomplete-group-label">Program Studi</div>`;
      prodiResults.forEach(r => {
        const info = DataUtils.classifyKeketatan(r.keketatan);
        html += `
          <div class="autocomplete-item" onclick="App.openDetailAndHighlight('${r.univId}', '${escapeAttr(r.prodiNama)}')" role="option">
            <img class="ac-icon" src="${r.logoUrl}" alt="${r.univSingkatan}" loading="lazy"
                 onerror="this.style.display='none'">
            <div class="ac-text">
              <div class="ac-name">${highlightMatch(r.prodiNama, query)}</div>
              <div class="ac-meta">${r.univSingkatan} · ${r.jenjang}</div>
            </div>
            <span class="ac-badge">
              <span class="keketatan-badge ${info.cssClass}" style="font-size:11px;padding:2px 8px;">
                <span class="dot"></span>${r.keketatan.toFixed(1)}%
              </span>
            </span>
          </div>
        `;
      });
    }

    return html;
  }

  /**
   * Render compare modal content
   */
  function renderCompareTable(items) {
    if (items.length === 0) return '';

    const cols = items.length;
    const fields = [
      { key: 'univNama', label: 'Universitas' },
      { key: 'jenjang', label: 'Jenjang' },
      { key: 'daya_tampung', label: 'Daya Tampung', isNum: true },
      { key: 'peminat', label: 'Peminat', isNum: true },
      { key: 'keketatan', label: 'Keketatan', isRatio: true },
    ];

    // Find best keketatan (highest = easiest to get in)
    const bestKeketatan = Math.max(...items.map(i => i.keketatan));
    const bestDayaTampung = Math.max(...items.map(i => i.daya_tampung));

    let html = `<div class="compare-grid" style="grid-template-columns: repeat(${cols}, 1fr); gap: var(--space-md);">`;

    // Column headers
    items.forEach(item => {
      html += `
        <div class="compare-column">
          <div class="compare-column-header">
            <div class="compare-prodi-name">${item.prodiNama}</div>
            <div class="compare-univ-name">${item.univNama}</div>
          </div>
      `;

      // Field rows within each column
      fields.forEach(field => {
        let value = item[field.key] || '-';
        let extraClass = '';

        if (field.isNum) {
          value = DataUtils.formatNumber(value);
          if (field.key === 'daya_tampung' && item.daya_tampung === bestDayaTampung) {
            extraClass = 'highlight-best';
          }
        }

        if (field.isRatio) {
          const info = DataUtils.classifyKeketatan(item.keketatan);
          const isBest = item.keketatan === bestKeketatan;
          value = `<span class="keketatan-badge ${info.cssClass}">${item.keketatan.toFixed(2)}% · ${info.label}</span>`;
          if (isBest) extraClass = 'highlight-best';
        }

        html += `
          <div class="compare-row">
            <div class="compare-label">${field.label}</div>
            <div class="compare-value ${extraClass}">${value}</div>
          </div>
        `;
      });

      html += `</div>`;
    });

    html += `</div>`;
    return html;
  }

  /**
   * Render bookmark list
   */
  function renderBookmarkList(bookmarks) {
    if (bookmarks.length === 0) {
      return `
        <div class="bookmark-empty">
          <div class="empty-icon">${Icons.bookmarkOutline}</div>
          <p>Belum ada prodi yang di-bookmark</p>
          <p style="font-size:12px;margin-top:8px;">Klik ikon simpan pada tabel prodi untuk menyimpan</p>
        </div>
      `;
    }

    let html = '';
    bookmarks.forEach(bm => {
      const info = DataUtils.classifyKeketatan(bm.keketatan || 0);
      html += `
        <div class="bookmark-item" onclick="App.openDetailAndHighlight('${bm.univId}', '${escapeAttr(bm.prodiNama)}', '${escapeAttr(bm.jenjang || '')}')">
          <div class="bm-info">
            <div class="bm-prodi">${bm.prodiNama} ${bm.jenjang ? `<span style="font-size:11px;opacity:0.7;font-weight:normal;margin-left:4px;">(${bm.jenjang})</span>` : ''}</div>
            <div class="bm-univ">${bm.univNama}</div>
          </div>
          ${bm.keketatan ? `<span class="keketatan-badge ${info.cssClass}" style="font-size:11px;padding:2px 8px;">
            <span class="dot"></span>${bm.keketatan.toFixed(1)}%
          </span>` : ''}
          <button class="btn-bookmark bookmarked" style="margin-left:8px;"
                  onclick="event.stopPropagation(); App.toggleBookmark('${bm.univId}', '${escapeAttr(bm.prodiNama)}', '${escapeAttr(bm.univNama)}', ${bm.keketatan}, '${escapeAttr(bm.jenjang || '')}')"
                  aria-label="Hapus bookmark">${Icons.bookmarkFilled}</button>
        </div>
      `;
    });
    return html;
  }

  // --- Helpers ---
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escaped.replace(regex, '<strong style="color:var(--primary)">$1</strong>');
  }

  /**
   * Render Strategy Simulator UI
   */
  function renderSimulasiView(allProdiList, selectedPil1Key = '', selectedPil2Key = '', activeTahun = '2025') {
    let prodi1 = null;
    let prodi2 = null;

    if (selectedPil1Key) {
      const [uId, pName] = selectedPil1Key.split(':::');
      prodi1 = allProdiList.find(p => p.univId === uId && p.nama === pName);
    }
    if (selectedPil2Key) {
      const [uId, pName] = selectedPil2Key.split(':::');
      prodi2 = allProdiList.find(p => p.univId === uId && p.nama === pName);
    }

    // Evaluate Strategy Risk
    let status = {
      level: 'neutral',
      title: 'Pilih Pilihan 1 & Pilihan 2',
      badgeClass: 'badge-neutral',
      desc: 'Silakan pilih dua program studi di bawah ini untuk menganalisis strategi kelolosan dan tingkat risiko pilihanmu.',
      tips: [
        'Aturan Emas SNBT/SNBP: Pilihan 1 untuk prodi impian utama, Pilihan 2 untuk prodi dengan keketatan lebih longgar sebagai jaring pengaman (Safety Net).'
      ]
    };

    if (prodi1 && prodi2) {
      const k1 = prodi1.keketatan;
      const k2 = prodi2.keketatan;
      const isReverse = k2 < k1;

      if (isReverse) {
        status = {
          level: 'warning',
          title: '⚠️ Peringatan: Urutan Pilihan Terbalik',
          badgeClass: 'badge-warning',
          desc: `Pilihan 2 (${prodi2.nama} — ${k2.toFixed(2)}%) memiliki rasio keketatan lebih kecil/ketat dibandingkan Pilihan 1 (${prodi1.nama} — ${k1.toFixed(2)}%). Dalam seleksi SNBT/SNBP, Pilihan 2 sebaiknya memiliki peluang penerimaan yang lebih besar/longgar dari Pilihan 1.`,
          tips: [
            'Tukarkan posisi Pilihan 1 dan Pilihan 2 agar prodi yang paling ketat berada di Pilihan 1.',
            'Jika Pilihan 1 tidak lolos, Pilihan 2 dengan rasio lebih longgar akan menjadi penyelamat (Safety Net).'
          ]
        };
      } else if (k1 < 5 && k2 < 5) {
        status = {
          level: 'danger',
          title: '🔴 Risiko Tinggi: Kedua Pilihan Sangat Ketat',
          badgeClass: 'badge-danger',
          desc: `Kedua prodi target (${prodi1.nama} [${k1.toFixed(2)}%] dan ${prodi2.nama} [${k2.toFixed(2)}%]) tergolong Sangat Ketat (< 5%). Jika nilai/skor berada di bawah persentil teratas, berisiko gugur di kedua pilihan sekaligus.`,
          tips: [
            'Pertimbangkan untuk mengganti Pilihan 2 ke prodi dengan keketatan > 10% atau > 15% sebagai jaring pengaman (Safety Net).',
            'Pastikan skor tryout UTBK kamu konsisten berada di persentil teratas.'
          ]
        };
      } else if (k1 < 5 && k2 >= 5 && k2 <= 15) {
        status = {
          level: 'moderate',
          title: '🟡 Strategi Moderat: Pilihan 1 Target Impian & Pilihan 2 Cukup Ketat',
          badgeClass: 'badge-moderate',
          desc: `Pilihan 1 (${prodi1.nama} — ${k1.toFixed(2)}%) merupakan Target Utama, sementara Pilihan 2 (${prodi2.nama} — ${k2.toFixed(2)}%) berada di tingkat keketatan sedang.`,
          tips: [
            'Kombinasi ini baik jika kamu memiliki skor UTBK / nilai rapor yang konsisten tinggi.',
            'Untuk perlindungan maksimal, Pilihan 2 dapat digeser ke rasio > 15% agar peluang lolos semakin pasti.'
          ]
        };
      } else {
        status = {
          level: 'optimal',
          title: '🟢 Strategi Optimal & Aman (Ideal Strategy)',
          badgeClass: 'badge-optimal',
          desc: `Kombinasi Pilihan 1 (${prodi1.nama} — ${k1.toFixed(2)}%) dan Pilihan 2 (${prodi2.nama} — ${k2.toFixed(2)}%) memiliki rasio keketatan yang seimbang. Pilihan 2 berfungsi sebagai jaring pengaman (Safety Net) yang sangat baik.`,
          tips: [
            'Strategi ini meminimalkan risiko gugur total pada seleksi SNBT/SNBP.',
            'Fokus tingkatkan persiapan materi UTBK untuk menembus target Pilihan 1!'
          ]
        };
      }
    }

    return `
      <div class="simulasi-card-layout">
        <div class="simulasi-header-box">
          <h2>🎯 Simulasi Strategi Pilihan 1 & Pilihan 2 (SNBT ${activeTahun})</h2>
          <p>Uji kombinasi dua prodi impianmu untuk melihat tingkat keamanan dan rasio risiko kelolosan.</p>
        </div>

        <!-- Strategy Evaluator Result Banner -->
        <div class="eval-result-banner ${status.badgeClass}">
          <div class="eval-title">${status.title}</div>
          <div class="eval-desc">${status.desc}</div>
          <div class="eval-tips">
            <strong>Rekomendasi Strategi:</strong>
            <ul>
              ${status.tips.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          ${prodi1 && prodi2 ? `
            <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">
              <button class="btn-print-report" onclick="App.printSimulasiReport()" style="background:var(--primary);color:white;">
                ${Icons.pen} Cetak / Simpan PDF Laporan Strategi
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Choice Cards Grid -->
        <div class="choice-cards-grid">
          <!-- PILIHAN 1 -->
          <div class="choice-box">
            <div class="choice-badge pil1">PILIHAN 1 (Target Utama)</div>
            <div class="form-group" style="margin-top:12px;">
              <label class="filter-label">Pilih Prodi Pilihan 1:</label>
              <select class="filter-select select-choice" onchange="App.setSimulasiPilihan(1, this.value)" style="width:100%;">
                <option value="">-- Pilih Prodi Pilihan 1 --</option>
                ${allProdiList.map(p => {
                  const key = `${p.univId}:::${p.nama}`;
                  const isSel = selectedPil1Key === key ? 'selected' : '';
                  return `<option value="${key}" ${isSel}>${p.univSingkatan} — ${p.nama} (${p.keketatan.toFixed(2)}%)</option>`;
                }).join('')}
              </select>
            </div>

            ${prodi1 ? `
              <div class="choice-prodi-details">
                <div class="cp-title">${prodi1.nama}</div>
                <div class="cp-univ"><img src="${prodi1.logoUrl}" class="mini-logo"> ${prodi1.univNama}</div>
                <div class="cp-metrics">
                  <div><span>Daya Tampung</span><strong>${DataUtils.formatNumber(prodi1.daya_tampung)}</strong></div>
                  <div><span>Peminat</span><strong>${DataUtils.formatNumber(prodi1.peminat)}</strong></div>
                  <div><span>Keketatan</span><strong>${prodi1.keketatan.toFixed(2)}%</strong></div>
                </div>
                <div style="margin-top:8px;">${renderKeketanBadge(prodi1.keketatan, prodi1.trendDiff)}</div>
              </div>
            ` : `
              <div class="choice-placeholder">Silakan pilih prodi pertama</div>
            `}
          </div>

          <!-- PILIHAN 2 -->
          <div class="choice-box">
            <div class="choice-badge pil2">PILIHAN 2 (Safety Net)</div>
            <div class="form-group" style="margin-top:12px;">
              <label class="filter-label">Pilih Prodi Pilihan 2:</label>
              <select class="filter-select select-choice" onchange="App.setSimulasiPilihan(2, this.value)" style="width:100%;">
                <option value="">-- Pilih Prodi Pilihan 2 --</option>
                ${allProdiList.map(p => {
                  const key = `${p.univId}:::${p.nama}`;
                  const isSel = selectedPil2Key === key ? 'selected' : '';
                  return `<option value="${key}" ${isSel}>${p.univSingkatan} — ${p.nama} (${p.keketatan.toFixed(2)}%)</option>`;
                }).join('')}
              </select>
            </div>

            ${prodi2 ? `
              <div class="choice-prodi-details">
                <div class="cp-title">${prodi2.nama}</div>
                <div class="cp-univ"><img src="${prodi2.logoUrl}" class="mini-logo"> ${prodi2.univNama}</div>
                <div class="cp-metrics">
                  <div><span>Daya Tampung</span><strong>${DataUtils.formatNumber(prodi2.daya_tampung)}</strong></div>
                  <div><span>Peminat</span><strong>${DataUtils.formatNumber(prodi2.peminat)}</strong></div>
                  <div><span>Keketatan</span><strong>${prodi2.keketatan.toFixed(2)}%</strong></div>
                </div>
                <div style="margin-top:8px;">${renderKeketanBadge(prodi2.keketatan, prodi2.trendDiff)}</div>
              </div>
            ` : `
              <div class="choice-placeholder">Silakan pilih prodi kedua</div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate Printable PDF / Print View Document HTML
   */
  function generatePrintReportHTML(type, title, subtitle, items, notes = '') {
    const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    let tableRowsHtml = '';
    if (type === 'compare') {
      tableRowsHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th>Parameter</th>
              ${items.map(p => `<th>${p.prodiNama}<br><small style="font-weight:normal;color:#64748B;">${p.univNama}</small></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Jenjang</strong></td>
              ${items.map(p => `<td>${p.jenjang || '-'}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Daya Tampung</strong></td>
              ${items.map(p => `<td>${DataUtils.formatNumber(p.dayaTampung)} kursi</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Peminat</strong></td>
              ${items.map(p => `<td>${DataUtils.formatNumber(p.peminat)} orang</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Rasio Keketatan (%)</strong></td>
              ${items.map(p => `<td><strong style="color:#2563EB;">${p.keketatan.toFixed(2)}%</strong></td>`).join('')}
            </tr>
            <tr>
              <td><strong>Kategori Persaingan</strong></td>
              ${items.map(p => {
                const info = DataUtils.classifyKeketatan(p.keketatan);
                return `<td><span class="report-badge ${info.cssClass}">${info.label}</span></td>`;
              }).join('')}
            </tr>
          </tbody>
        </table>
      `;
    } else if (type === 'simulasi') {
      const p1 = items[0];
      const p2 = items[1];
      tableRowsHtml = `
        <div class="report-simulasi-grid">
          <div class="report-sim-box">
            <h4 style="color:#2563EB;margin-bottom:8px;">PILIHAN 1 (Target Utama)</h4>
            <h3>${p1.nama}</h3>
            <p style="color:#64748B;">${p1.univNama}</p>
            <hr style="margin:12px 0;border:0;border-top:1px solid #E2E8F0;">
            <p>Daya Tampung: <strong>${DataUtils.formatNumber(p1.daya_tampung)}</strong></p>
            <p>Peminat: <strong>${DataUtils.formatNumber(p1.peminat)}</strong></p>
            <p>Keketatan: <strong style="color:#2563EB;">${p1.keketatan.toFixed(2)}%</strong></p>
          </div>

          <div class="report-sim-box">
            <h4 style="color:#7C3AED;margin-bottom:8px;">PILIHAN 2 (Safety Net)</h4>
            <h3>${p2.nama}</h3>
            <p style="color:#64748B;">${p2.univNama}</p>
            <hr style="margin:12px 0;border:0;border-top:1px solid #E2E8F0;">
            <p>Daya Tampung: <strong>${DataUtils.formatNumber(p2.daya_tampung)}</strong></p>
            <p>Peminat: <strong>${DataUtils.formatNumber(p2.peminat)}</strong></p>
            <p>Keketatan: <strong style="color:#7C3AED;">${p2.keketatan.toFixed(2)}%</strong></p>
          </div>
        </div>

        <div style="margin-top:20px;padding:16px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;">
          <h4 style="margin-bottom:6px;color:#0F172A;">Hasil Analisis Strategi:</h4>
          <p style="margin-bottom:8px;line-height:1.5;">${notes.desc}</p>
          <strong>Rekomendasi Konsultasi:</strong>
          <ul style="margin-top:6px;padding-left:20px;">
            ${notes.tips.map(t => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${title} — Portal SNPMB</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #0F172A; padding: 32px; margin: 0; background: #fff; }
          .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 16px; margin-bottom: 24px; }
          .report-logo { font-size: 20px; font-weight: 800; color: #2563EB; }
          .report-meta { font-size: 12px; color: #64748B; text-align: right; }
          h2 { margin: 0 0 6px 0; font-size: 22px; color: #0F172A; }
          p.sub { margin: 0 0 24px 0; color: #64748B; font-size: 14px; }
          .report-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .report-table th, .report-table td { border: 1px solid #E2E8F0; padding: 12px 14px; text-align: left; font-size: 13px; }
          .report-table th { background: #F8FAFC; font-weight: 700; }
          .report-badge { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; display: inline-block; }
          .report-badge.sangat-ketat { background: #FEF2F2; color: #EF4444; }
          .report-badge.ketat { background: #FFF7ED; color: #F97316; }
          .report-badge.kompetitif { background: #FEFCE8; color: #EAB308; }
          .report-badge.longgar { background: #F0FDF4; color: #22C55E; }
          .report-simulasi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .report-sim-box { border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; background: #FFF; }
          .report-footer { margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 11px; color: #94A3B8; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-logo">🎓 Portal Keketatan SNPMB</div>
          <div class="report-meta">
            <div>Tanggal Cetak: ${today}</div>
            <div>Dokumen Resmi Analisis Pilihan</div>
          </div>
        </div>

        <h2>${title}</h2>
        <p class="sub">${subtitle}</p>

        ${tableRowsHtml}

        <div class="report-footer">
          <div>Portal Keketatan SNPMB — Data Resmi SNPMB (portal.snpmb.id)</div>
          <div>Halaman 1 dari 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;
  }

  return {
    Icons,
    renderCampusCard,
    renderKeketanBadge,
    renderProdiRow,
    renderMasterProdiRow,
    renderSkeletonRows,
    renderEmptyState,
    renderStatsBar,
    renderAutocompleteResults,
    renderCompareTable,
    renderBookmarkList,
    renderSimulasiView,
    generatePrintReportHTML,
    escapeHtml,
    escapeAttr,
  };
})();
