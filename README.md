# 🎓 Portal Keketatan SNPMB v3.0

> **Cek Peluang & Strategi Masuk PTN Impian** : Portal analitik data keketatan seleksi masuk Perguruan Tinggi Negeri ( jalur SNBT & SNBP ) di Indonesia.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2563EB?style=for-the-badge&logo=github)](https://rofiqsyf.github.io/Portal_Keketatan_SNPMB/)
[![Official Reference](https://img.shields.io/badge/Referensi_Resmi-snpmb.id-059669?style=for-the-badge)](https://snpmb.id/)
[![License](https://img.shields.io/badge/Lisensi-Edukasi_Publik-7C3AED?style=for-the-badge)](#disclaimer)

---

## 📌 Daftar Isi

1. [Tentang Portal](#-tentang-portal)
2. [Arsitektur Sistem](#-arsitektur-sistem)
3. [Fitur Unggulan v3.0](#-fitur-unggulan-v30)
4. [Struktur Repositori](#-struktur-repositori)
5. [Panduan Maintenance & Pemeliharaan Data](#-panduan-maintenance--pemeliharaan-data)
6. [Panduan Deployment & Menjalankan Lokal](#-panduan-deployment--menjalankan-lokal)
7. [Panduan Workflow Git Manual](#-panduan-workflow-git-manual)
8. [Disclaimer & Sumber Data](#-disclaimer--sumber-data)

---

## 🌟 Tentang Portal

**Portal Keketatan SNPMB** adalah platform web analitik independen yang dirancang untuk membantu calon mahasiswa, orang tua, dan Guru Bimbingan Konseling (BK) dalam mengambil keputusan berbasis data (*data-driven decision making*) saat memilih Program Studi pada seleksi masuk PTN.

Portal ini mengonsolidasi data **37 Perguruan Tinggi Negeri** dan **2.257 Program Studi** dengan histori 3 tahun (*2025, 2024, 2023*), memungkinkan pengguna menganalisis rasio keketatan, peminat, daya tampung, serta menyimulasikan kombinasi pilihan prodi secara akurat dan responsif.

---

## 🏗️ Arsitektur Sistem

Portal ini dibangun menggunakan pendekatan **Static Client-Side Web Application (Jamstack style architecture)** yang terpisah dari **Python Data Pipeline Engine**.

```
  ┌────────────────────────────────────────────────────────┐
  │                    DATA PIPELINE                       │
  │  [Portal Resmi SNPMB] ➔ [tools/scraper.py]             │
  │                       ➔ [tools/consolidate_data.py]    │
  │                       ➔ [assets/data/universities.json]│
  └───────────────────────────┬────────────────────────────┘
                              │ (Static JSON Master)
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │              CLIENT-SIDE WEB APPLICATION               │
  │  ┌────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────┐ │
  │  │  data.js   │➔│components.js│➔│ analyzer.js │➔│app.│ │
  │  │(Data Utils │ │ (UI Render) │ │ (Probabilistic│ │js  │ │
  │  │ & Filters) │ │             │ │  Analyzer)  │ │    │ │
  │  └────────────┘ └─────────────┘ └─────────────┘ └────┘ │
  │                           │                            │
  │                   [index.html & UI]                    │
  └───────────────────────────┬────────────────────────────┘
                              │ (Host Free)
                              ▼
               [GitHub Pages / Browser Client]
```

### Mengapa Pendekatan Client-Side Digunakan?
1. ⚡ **Zero Server Latency**: Seluruh proses pencarian, filtering 5-dimensi, sorting multi-kolom, simulasi, dan analisis probabilistik peluang dilakukan secara lokal di memori browser pengguna tanpa lag/delay HTTP request.
2. 💰 **Hosting Gratis Selamanya**: Tidak membutuhkan server backend (Node.js/Python/PHP) yang aktif 24 jam. Website dapat di-host secara gratis 100% pada **GitHub Pages**, **Vercel**, atau **Netlify**.
3. 🔒 **Privasi Pengguna Terjamin**: Skor UTBK, nilai rapor, bookmark, dan riwayat simulasi tersimpan aman di `localStorage` browser pengguna tanpa pengumpulan data pribadi.

### Modul Utama Frontend:
- `assets/js/data.js` : Mengelola kalkulasi statistik, penyaringan 5-dimensi, rekomendasi tier keketatan, pencarian fuzzy, dan resolusi histori multi-tahun (2025, 2024, 2023).
- `assets/js/analyzer.js` : Modul analisis probabilistik peluang (konversi skor UTBK 7 subtest ke persentil nasional via distribusi normal CDF, kalkulasi skor tertimbang SNBP dari rapor + mapel pendukung + akreditasi sekolah, serta matching prodi).
- `assets/js/components.js` : Modul pembangun elemen UI (Render kartu PTN, badge keketatan, tabel prodi, modal perbandingan, evaluator simulasi strategi, kalkulator analisis SNBT/SNBP, dan generator laporan PDF). Menggunakan sistem ikon vektor SVG murni (Lucide-style).
- `assets/js/app.js` : Controller utama pengendali status aplikasi (*App State*), pengubah mode gelap/terang, pelacak pencarian populer real-time (`PopularSearchStore`), dan event listeners.
- `assets/css/style.css` : Design system lengkap berbasis HSL CSS variables, tema terang/gelap high-contrast, stacking context z-index terstruktur, serta layout responsif.

---

## 🚀 Fitur Unggulan v3.0

### 🎯 1. Analisis Peluang UTBK-SNBT (7 Subtest)
- **Input Skor UTBK 7 Subtest**: Memasukkan nilai 7 subtes lengkap (Penalaran Umum, PBM, PPU, Pengetahuan Kuantitatif, Literasi Bahasa Indonesia, Literasi Bahasa Inggris, dan Penalaran Matematika).
- **Model Probabilistik IRT & CDF**: Mengonversi skor komposit ke estimasi persentil nasional berbasis distribusi Gauss standar UTBK 2025 (*mean=545,78*).
- **Matching 2.257 Prodi**: Mengelompokkan prodi PTN ke dalam 5 tingkatan peluang (Sangat Berpeluang, Berpeluang, Kompetitif, Perlu Peningkatan, Kurang Berpeluang) dengan fitur load-more per 50 prodi.

### 📋 2. Analisis Peluang SNBP (Jalur Prestasi)
- **Kalkulator Rapor + Mapel Pendukung**: Menghitung skor tertimbang SNBP sesuai ketentuan resmi Kepmendikdasmen No. 102/M/2025 (min 50% rata-rata rapor + maks 50% mapel pendukung relevan).
- **Penyesuaian Akreditasi Sekolah**: Memperhitungkan bobot akreditasi sekolah (A=40%, B=25%, C=5% kuota eligible).
- **Rumpun Prodi Dinamis**: Pilihan rumpun IPA/Saintek, IPS/Soshum, atau Campuran yang menyesuaikan form input mapel pendukung secara otomatis.

### 🎯 3. Simulasi Strategi Pilihan 1 & 2 (SNBT/SNBP)
- **Evaluator Risiko Real-Time**: Menganalisis kombinasi 2 prodi target dan memberikan saran strategi:
  - 🟢 **Strategi Optimal & Aman**: Pilihan 1 Impian + Pilihan 2 dengan keketatan lebih longgar sebagai jaring pengaman (*Safety Net*).
  - 🟡 **Strategi Moderat**: Pilihan 1 Impian + Pilihan 2 Keketatan Sedang.
  - 🔴 **Strategi Risiko Tinggi**: Kedua pilihan tergolong Sangat Ketat (< 5%), berisiko gugur ganda jika nilai tidak di persentil teratas.
  - ⚠️ **Peringatan Pilihan Terbalik**: Memperingatkan jika Pilihan 2 lebih ketat dari Pilihan 1.

### 🖨️ 4. Fitur Cetak & Ekspor PDF Laporan
- Tombol **`[ 🖨️ Cetak Laporan ]`** pada Modal Perbandingan dan Hasil Simulasi Strategi.
- Menghasilkan dokumen cetak laporan PDF interaktif ber-kop resmi *Portal Keketatan SNPMB* untuk keperluan sesi bimbingan konseling dengan **Guru BK & Orang Tua**.

### ⚡ 5. Pencarian Populer Real-Time
- Modul `PopularSearchStore` yang secara otomatis melacak dan mengurutkan 7 kata kunci yang paling sering dicari oleh pengguna secara live dengan penyimpanan `localStorage`.

### 🗓️ 6. Multi-Year Data Switcher (2025, 2024, 2023)
- Beralih data tahun seleksi dalam 1-klik. Seluruh statistik daya tampung, peminat, dan rasio keketatan otomatis tersinkronisasi.

### 🗺️ 7. Filter Suite 5-Dimensi
- Filter komprehensif berdasarkan: **Tahun**, **Jalur Seleksi (SNBT/SNBP)**, **Tingkat Keketatan (<5%, 5-15%, 15-30%, >30%)**, **Jenjang (S1, D4, D3)**, dan **38 Provinsi Indonesia**.

### 🌓 8. Mode Gelap High-Contrast (Dark Mode)
- Desain mode gelap dengan batas bidang (*border outline*) dan elevasi warna yang kontras, memastikan seluruh tombol filter, dropdown, dan teks terlihat jelas.

---

## 📁 Struktur Repositori

```
snpmb_scrap/
├── index.html                      # Entry point aplikasi web
├── README.md                       # Dokumentasi resmi proyek
├── .gitignore                      # Konfigurasi file yang diabaikan git
├── assets/
│   ├── css/
│   │   └── style.css               # Design system, CSS variables & dark mode
│   ├── js/
│   │   ├── data.js                 # Utilitas kalkulasi & penyaringan data
│   │   ├── components.js           # Visual component renderers & PDF generator
│   │   └── app.js                  # Controller utama & pelacak pencarian populer
│   ├── data/
│   │   └── universities.json       # Master database 37 PTN & 2.257 prodi (2023-2025)
│   └── images/
│       └── main_bg.JPG             # Background hero image
├── tools/
│   ├── scraper.py                  # Script scraping tabel HTML dari portal resmi
│   ├── consolidate_data.py         # Script konsolidasi data multi-tahun ke JSON
│   └── raw_html/                   # Arsip file HTML mentah per universitas
├── database_univ_snbt/             # File data mentah JSON per PTN
└── docs/
    └── PRD-SDD-Portal-Keketatan-SNPMB.md   # Dokumen PRD & SDD spesifikasi teknis
```

---

## 🛠️ Panduan Maintenance & Pemeliharaan Data

### A. Cara Memperbarui Data Tahunan (Annual Data Update)
Apabila portal SNPMB merilis data baru (misalnya tahun **2026**):

1. **Unduh/Simpan Tabel HTML Resmi**:
   Simpan file HTML tabel prodi universitas baru ke dalam folder `tools/raw_html/` (atau jalankan script `tools/scraper.py`).
2. **Jalankan Script Konsolidasi Data**:
   Buka terminal di folder proyek dan jalankan:
   ```bash
   python tools/consolidate_data.py
   ```
   Script akan memperbarui file `assets/data/universities.json` secara otomatis.
3. **Commit & Push Perubahan**:
   ```bash
   git add assets/data/universities.json
   git commit -m "chore: Update data keketatan SNPMB 2026"
   git push
   ```

### B. Struktur File Master Data (`assets/data/universities.json`)
Setiap entri universitas dan prodi mengikuti skema JSON terstandar:

```json
{
  "id": "ui",
  "nama": "UNIVERSITAS INDONESIA",
  "singkatan": "UI",
  "wilayah": "D.I. Yogyakarta",
  "logo": "https://...",
  "prodi": [
    {
      "nama": "KEDOKTERAN",
      "jenjang": "Sarjana",
      "jalur": "snbt",
      "daya_tampung": 75,
      "peminat": 2750,
      "keketatan": 2.72,
      "history": {
        "2025": { "daya_tampung": 75, "peminat": 2750, "keketatan": 2.72 },
        "2024": { "daya_tampung": 75, "peminat": 2800, "keketatan": 2.68 },
        "2023": { "daya_tampung": 60, "peminat": 2500, "keketatan": 2.40 }
      }
    }
  ]
}
```

---

## 💻 Panduan Deployment & Menjalankan Lokal

### 1. Menjalankan di Komputer Lokal (Local Development)
Karena aplikasi ini berbasis *static web*, Anda dapat menjalankannya dengan web server lokal mana saja:

```bash
# Opsi 1: Python HTTP Server (Bawaan Python)
python -m http.server 8080

# Opsi 2: Node.js serve package
npx serve .

# Opsi 3: Extension Live Server di VS Code
# Klik tombol 'Go Live' pada file index.html
```
Setelah server berjalan, buka **`http://localhost:8080`** pada browser Anda.

---

### 2. Mengaktifkan GitHub Pages (Hosting Online Gratis)
1. Dorong (*push*) seluruh kode proyek ke repositori GitHub Anda.
2. Buka halaman repositori di GitHub: `https://github.com/rofiqsyf/Portal_Keketatan_SNPMB`.
3. Klik **Settings** ➔ **Pages** (di kolom navigasi kiri).
4. Di bagian **Build and deployment**:
   - **Branch**: Pilih `main`.
   - **Folder**: Pilih `/(root)`.
5. Klik **Save**.
6. Website akan aktif dalam 1-2 menit di URL:
   👉 **`https://rofiqsyf.github.io/Portal_Keketatan_SNPMB/`**

---

## 📝 Panduan Workflow Git Manual

Berikut adalah urutan perintah Git jika Anda ingin memperbarui dan mengunggah kode secara **manual** melalui terminal:

```bash
# 1. Cek status file yang terubah
git status

# 2. Tambahkan semua file yang terubah ke staging area
git add .

# 3. Buat catatan snapshot perubahan (commit)
git commit -m "feat: Tambah fitur baru X"

# 4. Unggah perubahan ke GitHub
git push
```

---

## ⚠️ Disclaimer & Sumber Data

- **Portal Resmi SNPMB**: [https://snpmb.id/](https://snpmb.id/)
- **Disclaimer**: Portal Keketatan SNPMB **BUKAN merupakan situs resmi milik Balai Pengelolaan Pengujian Pendidikan (BPPP) atau Kemendikbudristek**. Portal ini dikembangkan secara independen untuk tujuan edukasi dan analitik data publik. Informasi resmi dan pendaftaran seleksi selalu mengacu pada [snpmb.id](https://snpmb.id/).

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi terbuka untuk keperluan edukasi publik.
© 2026 Portal Keketatan SNPMB · Dibuat untuk membantu calon mahasiswa Indonesia.
