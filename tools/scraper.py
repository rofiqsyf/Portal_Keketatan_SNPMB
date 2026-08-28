import os # <-- Tambahan baru untuk mengatur folder
from bs4 import BeautifulSoup
import json

def scrape_data_lokal():
    print("Membaca file tabel_upi.html...")
    
    # Kita siapkan 'keranjang' kosong untuk menampung data jurusan
    data_upi = [] 
    
    try:
        with open("tabel_upi.html", "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, 'html.parser')
            
        baris_tabel = soup.find_all('tr')
        
        if not baris_tabel:
            print("Waduh, baris tabel masih tidak ditemukan.")
            return

        print("Sedang memproses dan menghitung data...")
        
        for baris in baris_tabel:
            kolom = baris.find_all('td')
            
            if len(kolom) >= 6: 
                nama_jurusan = kolom[2].text.strip()
                # --- 🔥 FITUR BARU: Menangkap teks Jenjang dari kolom ke-4 ---
                jenjang_prodi = kolom[3].text.strip() 
                
                daya_tampung_str = kolom[4].text.strip()
                peminat_str = kolom[5].text.strip()
                
                if daya_tampung_str.isdigit() and peminat_str.isdigit():
                    daya_tampung = int(daya_tampung_str)
                    peminat = int(peminat_str)
                    
                    try:
                        keketatan = (daya_tampung / peminat) * 100
                        hasil_keketatan = f"{keketatan:.2f}%" 
                    except ZeroDivisionError:
                        hasil_keketatan = "0%"

                    # Memasukkan data jurusan ini ke dalam 'keranjang'
                    data_upi.append({
                        "prodi": nama_jurusan,
                        "jenjang": jenjang_prodi,
                        "daya_tampung": daya_tampung,
                        "peminat": peminat,
                        "keketatan": hasil_keketatan
                    })

        # --- 🔥 FITUR BARU: Menyimpan ke dalam folder database_univ_snbt ---
        nama_folder = "database_univ_snbt"
        
        # Mengecek apakah folder sudah ada, jika belum buat foldernya otomatis
        if not os.path.exists(nama_folder):
            os.makedirs(nama_folder)
            
        # Menggabungkan nama folder dan nama file JSON
        path_file = os.path.join(nama_folder, "upi_snbt.json")

        # Menyimpan ke file JSON sesuai path yang baru
        with open(path_file, "w", encoding="utf-8") as file_json:
            json.dump(data_upi, file_json, indent=4)
            
        print(f"MANTAP! Data berhasil diekspor ke folder '{nama_folder}' dengan nama 'upi_snbt.json'! 🚀")

    except Exception as e:
        print("Aduh, ada error:", e)

if __name__ == "__main__":
    scrape_data_lokal()