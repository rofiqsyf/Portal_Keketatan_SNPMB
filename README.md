# Portal Keketatan SNPMB

> **Cek Peluangmu Masuk PTN Impian** — Portal data keketatan seleksi masuk PTN jalur SNBT & SNBP

Portal informasi interaktif yang menyajikan data keketatan (rasio diterima/pendaftar) untuk ribuan program studi di Perguruan Tinggi Negeri Indonesia. Dibangun untuk membantu siswa SMA dan guru BK membuat keputusan berbasis data dengan antarmuka yang bersih, modern, dan profesional.

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Autocomplete Search** | Cari prodi atau universitas dengan hasil instan |
| **Indikator Keketatan** | Badge warna semantik (Sangat Ketat / Ketat / Kompetitif / Longgar) |
| **Filter & Sort** | Filter jalur (SNBT/SNBP), wilayah, dan sorting multi-kolom |
| **Mode Perbandingan** | Bandingkan hingga 4 prodi side-by-side |
| **Bookmark** | Simpan prodi favorit (localStorage, tanpa akun) |
| **Dark Mode** | Toggle tema gelap/terang |
| **Mobile-First** | Responsif dari 360px hingga 1440px+ |

## Struktur Proyek

```
snpmb_scrap/
├── index.html                      # Entry point
├── assets/
│   ├── css/
│   │   └── style.css               # Design system & styles
│   ├── js/
│   │   ├── data.js                 # Data processing utilities
│   │   ├── components.js           # UI component renderers (SVG icons)
│   │   └── app.js                  # Main application logic
│   └── data/
│       └── universities.json       # Consolidated university data
├── tools/
│   ├── scraper.py                  # HTML table scraper
│   ├── consolidate_data.py         # Data consolidation script
│   └── raw_html/                   # Archived raw HTML tables
├── docs/
│   └── PRD-SDD-Portal-Keketatan-SNPMB.md
├── .gitignore
└── README.md
```

## Cara Menjalankan

### 1. Local Development
Karena ini static site, cukup serve dengan HTTP server:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: gunakan Live Server extension
```

Buka `http://localhost:8080` di browser.

### 2. Rebuild Data (jika ada update)
```bash
python tools/consolidate_data.py
```

## Data

- **37 PTN** dengan data keketatan SNBT
- **2.257 program studi** tercakup
- **Sumber**: Data publik pengumuman SNPMB 2025/2026
- **Format**: JSON terkonsolidasi (`assets/data/universities.json`)

## Disclaimer

Portal ini **BUKAN situs resmi SNPMB**. Data disajikan untuk keperluan informasi dan edukasi. Keakuratan data tidak dijamin — selalu verifikasi dengan sumber resmi di [snpmb.bppp.kemdikbud.go.id](https://snpmb.bppp.kemdikbud.go.id).

## Lisensi

Dibuat untuk keperluan edukasi publik.
