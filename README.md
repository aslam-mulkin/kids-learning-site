
# Belajar Seru — Kurikulum Merdeka (SD/SMP)

Website sederhana untuk belajar dengan dua metode:
- **Active Recall / Flashcards**: tandai Benar/Salah, kartu yang salah akan **muncul kembali acak**.
- **Kuis Pilihan Ganda**: nilai akhir + cek jawaban & pembahasan.

## Struktur Konten (Modular)
```
src/content/<kelas>/<mapel>/<bab-x>/
  flashcards.json         # kumpulan Q/A pendek untuk active recall
  mcq/
    set-1.json            # set soal PG ke-1
    set-2.json            # set soal PG ke-2, dst.
  meta.json               # { "title": "Bab 1: ..." } (opsional)
```
Contoh:
- `src/content/2/bahasa-indonesia/bab-1/flashcards.json`
- `src/content/2/bahasa-indonesia/bab-1/mcq/set-1.json`

> Cukup salin folder `bab-x` untuk menambah topik/bab baru, atau tambahkan `set-3.json` untuk set soal tambahan.

## Menjalankan (Mac/Windows/Linux)
1. Install Node.js 18+
2. Buka terminal di folder proyek ini, jalankan:
   ```bash
   npm i
   npm run dev -- --host
   ```
   Akses di jaringan lokal: terminal akan menampilkan URL `http://<ip-laptop>:5173`.

## Build & Serve (untuk jaringan lokal)
```bash
npm run build
# opsi 1: vite preview
npm run preview -- --host
# opsi 2: Python simple server (setelah build)
cd dist
python3 -m http.server 8080 --bind 0.0.0.0
# lalu akses http://<ip-laptop>:8080
```

## Menambah Materi
- **Flashcards** (`flashcards.json`):
  ```json
  [
    { "q": "Kata yang menamai orang/benda/tempat disebut?", "a": "Kata benda (nomina)" }
  ]
  ```
- **Pilihan Ganda** (`mcq/set-1.json`):
  ```json
  [
    { "id": "bi2b1-01", "q": "Yang termasuk kata benda adalah ...", "options": ["manis","rumah","besar","cepat"], "answer": 1, "explain": "Rumah adalah benda/tempat." }
  ]
  ```

## Catatan Desain
- UI sengaja sederhana (Tailwind). Tidak perlu DB — cukup edit file JSON.
- Loader otomatis mendeteksi konten dengan `import.meta.glob`.
- Mode kuis mendukung **banyak set soal** per bab (pilih dari dropdown).

## Saran (Prompt vs Agent)
- **Prompt** sudah cukup untuk generate set awal soal/flashcards per bab, lalu Anda edit JSON.
- **Agent** berguna jika ingin otomatisasi lebih lanjut: misal ambil materi dari buku PDF, menghasilkan beberapa set sekaligus, atau melakukan QA (duplikasi, tingkat kesulitan, dsb). Mulai dari prompt; upgrade ke agent saat kebutuhan otomatisasi bertambah.

