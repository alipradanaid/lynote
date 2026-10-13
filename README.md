# LyNote — Arsip Bacaan Sederhana

Versi ringkas: halaman daftar bacaan, kategori, pencarian, dan halaman baca yang hanya berisi **judul besar → sumber → rangkuman**. Tidak ada bagian refleksi atau gagasan terpisah, tidak ada database, dan tidak ada form edit publik.

## Struktur folder
- `index.html` — struktur halaman
- `assets/style.css` — seluruh desain
- `assets/app.js` — pencarian, kategori, dan tampilan bacaan
- `content/articles.json` — semua data bacaan

## Menambah atau mengedit rangkuman
Edit hanya `content/articles.json`. Setiap bacaan memiliki format:
- `id`: unik, gunakan huruf kecil dan tanda hubung
- `title`: judul bacaan yang tampil besar
- `category`: misalnya `Kapustakan Jawa`, `Sufistik`, `Psikologi`, `Filsafat`
- `date`: format `YYYY-MM-DD`
- `excerpt`: ringkasan singkat untuk daftar arsip
- `sourceTitle`, `sourceAuthor`, `sourceYear`, `sourceUrl`: informasi sumber
- `summary`: rangkuman utama; gunakan paragraf biasa, `-` untuk poin, atau `##` untuk subjudul seperlunya

Untuk menambah bacaan, duplikat salah satu objek dalam array `articles`, ubah isinya, lalu pastikan ada koma di antara objek-objek artikel. File JSON harus tetap valid.

## Deploy ke Vercel
1. Ekstrak ZIP.
2. Unggah ke repositori GitHub yang terhubung ke Vercel, atau impor folder ke Vercel.
3. Pilih preset **Other**; tidak perlu build command khusus.
4. Jika terhubung ke GitHub, perubahan pada `content/articles.json` akan memicu deploy baru setelah commit/push.

Untuk mencoba di komputer, gunakan server lokal seperti Live Server di VS Code. Jangan membuka `index.html` langsung dengan `file://` karena browser dapat memblokir pembacaan file JSON.

## Hak edit dan performa
Situs ini statis dan tidak memiliki halaman admin. Pengunjung hanya bisa membaca; penyuntingan dilakukan pada file sumber. Batasi akses repositori dan Vercel agar hanya akunmu yang bisa mengedit. Situs dibuat ringan, tanpa framework atau pustaka eksternal, dan artikel dirender saat dibuka.
