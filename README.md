# DUITku

DUITku adalah aplikasi web Expense Tracker sederhana untuk mahasiswa. Aplikasi membantu pengguna mencatat pemasukan dan pengeluaran pribadi, melihat riwayat transaksi, serta memantau total pemasukan, total pengeluaran, dan saldo terkini.

Setiap transaksi terhubung dengan akun yang sedang login. Pemisahan data ditegakkan menggunakan Supabase Row Level Security (RLS), sehingga pengguna hanya dapat melihat dan mengelola transaksi miliknya sendiri.

## Fitur Utama

- Registrasi akun menggunakan email dan password.
- Login dan logout.
- Session login yang tetap tersedia selama masih berlaku.
- Dashboard ringkasan keuangan interaktif berbasis AJAX tanpa reload halaman.
- Menambahkan transaksi pemasukan atau pengeluaran melalui modal in-page secara asinkron.
- Melihat riwayat transaksi dengan pembaruan dinamis.
- Mengubah transaksi milik sendiri secara in-page via AJAX.
- Menghapus transaksi milik sendiri secara asinkron setelah konfirmasi.
- Memfilter riwayat transaksi secara real-time berdasarkan jenis, kategori, dan periode.
- Menetapkan dan mengubah batas anggaran pengeluaran bulanan (Monthly Budget).
- Memantau penggunaan anggaran dengan progress bar dinamis dan indikator status (Aman, Waspada, Melebihi Anggaran).
- Sinkronisasi otomatis pemakaian anggaran saat transaksi pengeluaran ditambah, diubah, atau dihapus.
- Pemisahan data transaksi dan anggaran antar pengguna menggunakan RLS.
- Preferensi tema `light` atau `dark` yang disimpan dalam cookie.
- Tampilan responsif untuk ponsel dan desktop.

## User Stories

### US-01 — Registrasi

Sebagai pengunjung, saya ingin membuat akun menggunakan email dan password agar dapat menggunakan DUITku.

Kriteria penerimaan:

- Email harus valid dan belum terdaftar.
- Password minimal delapan karakter.
- Konfirmasi password harus sesuai.
- Pengguna menerima informasi yang jelas ketika registrasi berhasil atau gagal.

### US-02 — Login

Sebagai pengguna terdaftar, saya ingin login agar dapat mengakses data keuangan pribadi saya.

Kriteria penerimaan:

- Pengguna dapat login menggunakan kredensial yang benar.
- Kredensial yang salah ditolak dengan pesan yang aman.
- Pengguna yang berhasil login diarahkan ke dashboard.

### US-03 — Session dan logout

Sebagai pengguna, saya ingin session tetap bertahan setelah halaman di-refresh dan dapat logout ketika selesai menggunakan aplikasi.

Kriteria penerimaan:

- Refresh tidak menghilangkan session yang masih valid.
- Guest tidak dapat membuka dashboard.
- Setelah logout, halaman terproteksi tidak dapat dibuka.

### US-04 — Mencatat transaksi

Sebagai pengguna, saya ingin mencatat pemasukan atau pengeluaran agar riwayat keuangan saya tersimpan.

Data transaksi terdiri dari:

- jenis: `income` atau `expense`;
- nominal lebih besar dari nol;
- kategori;
- deskripsi opsional;
- tanggal transaksi.

### US-05 — Melihat riwayat transaksi

Sebagai pengguna, saya ingin melihat riwayat transaksi agar dapat mengetahui aktivitas keuangan saya.

Transaksi ditampilkan dari tanggal terbaru dan hanya menampilkan data milik pengguna yang sedang login.

### US-06 — Mengubah transaksi

Sebagai pengguna, saya ingin memperbaiki transaksi milik saya apabila terdapat kesalahan pencatatan.

### US-07 — Menghapus transaksi

Sebagai pengguna, saya ingin menghapus transaksi milik saya yang tidak lagi diperlukan setelah memberikan konfirmasi.

### US-08 — Ringkasan keuangan

Sebagai pengguna, saya ingin melihat total pemasukan, total pengeluaran, dan saldo agar dapat mengetahui kondisi keuangan saya.

Rumus saldo:

```text
Saldo = Total Pemasukan - Total Pengeluaran
```

### US-09 — Preferensi tema

Sebagai pengguna, saya ingin memilih tema terang atau gelap agar tampilan aplikasi sesuai preferensi saya.

Preferensi disimpan melalui cookie `duitku_theme` selama 30 hari.

### US-10 — Manajemen transaksi via AJAX

Sebagai pengguna, saya ingin menambah, mengubah, dan menghapus transaksi langsung dari dashboard melalui dialog modal interaktif tanpa reload halaman.

Kriteria penerimaan:

- Form tambah dan ubah tampil sebagai modal di atas dashboard.
- Penyimpanan dan pembaruan data dilakukan via request asinkron (`fetch`).
- Penghapusan transaksi menghapus baris seketika tanpa navigasi halaman.
- Ringkasan keuangan langsung diperbarui secara otomatis.

### US-11 — Filter transaksi real-time

Sebagai pengguna, saya ingin memfilter riwayat transaksi berdasarkan jenis, kategori, dan periode bulan/tahun secara instan tanpa reload halaman.

Kriteria penerimaan:

- Pilihan filter jenis: Semua, Pemasukan, dan Pengeluaran.
- Pencarian/pemilihan kategori transaksi.
- Filter periode bulan dan tahun.
- Pembaruan filter memuat ulang daftar transaksi secara asinkron via AJAX.
- Tersedia tombol reset untuk mengembalikan filter ke kondisi awal.

### US-12 — Penetapan anggaran bulanan

Sebagai pengguna, saya ingin menetapkan dan mengubah batas anggaran pengeluaran bulanan agar memiliki batasan belanja yang jelas.

Kriteria penerimaan:

- Pengguna dapat menetapkan target nominal anggaran bulanan (> 0).
- Periode anggaran ditentukan berdasarkan bulan dan tahun.
- Penetapan atau pengubahan nominal anggaran dilakukan melalui modal AJAX tanpa reload halaman.

### US-13 — Pemantauan penggunaan anggaran

Sebagai pengguna, saya ingin memantau persentase dan sisa pemakaian anggaran bulanan berdasarkan transaksi pengeluaran aktual.

Kriteria penerimaan:

- Menampilkan nominal target anggaran, pengeluaran aktual, dan sisa anggaran.
- Menampilkan visual progress bar dengan indikator warna status:
  - Aman (Hijau) jika penggunaan < 80%;
  - Waspada (Kuning/Oranye) jika penggunaan 80% – 100%;
  - Melebihi Anggaran (Merah) jika penggunaan > 100% disertai pesan peringatan selisih defisit.
- Perubahan transaksi pengeluaran langsung menyinkronkan status anggaran secara otomatis via AJAX.

## Aturan Bisnis

1. Setiap transaksi dimiliki tepat oleh satu pengguna.
2. Pengguna hanya dapat membaca, membuat, mengubah, dan menghapus transaksi miliknya sendiri.
3. `user_id` harus berasal dari session pengguna, bukan input bebas dari form.
4. Jenis transaksi hanya `income` atau `expense`.
5. Nominal transaksi harus lebih besar dari nol.
6. Saldo boleh bernilai negatif.
7. Seluruh nominal ditampilkan dalam Rupiah Indonesia.
8. Penghapusan transaksi bersifat permanen pada versi ini.
9. Setiap pengguna hanya dapat menetapkan maksimal 1 nominal anggaran untuk kombinasi bulan dan tahun tertentu.
10. Nominal target anggaran bulanan harus lebih besar dari nol.
11. Perhitungan akumulasi pemakaian anggaran bulanan hanya memperhitungkan transaksi pengeluaran (`type = 'expense'`) pada bulan dan tahun bersangkutan milik pengguna tersebut.
12. Pengguna hanya dapat membaca, menetapkan, dan mengubah anggaran miliknya sendiri.

Spesifikasi lengkap tersedia pada [docs/SRS.md](docs/SRS.md).

## Teknologi

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- `@supabase/supabase-js`
- `@supabase/ssr`

## Struktur Data

Supabase Auth mengelola akun pengguna melalui `auth.users`. Password tidak disimpan pada tabel buatan aplikasi.

Data keuangan disimpan pada tabel `public.transactions`:

| Kolom | Keterangan |
|---|---|
| `id` | UUID transaksi |
| `user_id` | Pemilik transaksi, terhubung ke `auth.users` |
| `type` | `income` atau `expense` |
| `amount` | Nominal transaksi |
| `category` | Kategori transaksi |
| `description` | Keterangan opsional |
| `transaction_date` | Tanggal transaksi |
| `created_at` | Waktu data dibuat |
| `updated_at` | Waktu terakhir diperbarui |

Data anggaran bulanan disimpan pada tabel `public.budgets`:

| Kolom | Keterangan |
|---|---|
| `id` | UUID anggaran |
| `user_id` | Pemilik anggaran, terhubung ke `auth.users` |
| `month` | Bulan anggaran (1–12) |
| `year` | Tahun anggaran (>= 2020) |
| `amount` | Nominal batas anggaran pengeluaran |
| `created_at` | Waktu data dibuat |
| `updated_at` | Waktu terakhir diperbarui |

RLS aktif pada tabel `transactions` dan `budgets` dengan policy terpisah untuk operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`. Semua policy hanya berlaku untuk role `authenticated` dan membandingkan `auth.uid()` dengan `user_id`.

## Prasyarat

Pastikan perangkat memiliki:

- Node.js 24 LTS atau versi yang kompatibel dengan Next.js;
- npm;
- Git;
- akses ke project Supabase kelompok.

Periksa instalasi:

```powershell
node --version
npm --version
git --version
```

## Instalasi

Clone repository:

```powershell
git clone https://github.com/HydraFish/ppk-pertemuan-4.git
cd ppk-pertemuan-4
npm install
```

## Konfigurasi Environment

Buat `.env.local` pada root project, sejajar dengan `package.json`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Nilai diperoleh dari **Supabase Dashboard → Connect**.

Ketentuan keamanan:

- Jangan commit `.env.local`.
- Jangan menaruh database password di source code.
- Jangan menggunakan secret key atau `service_role` pada variabel `NEXT_PUBLIC_*`.
- Gunakan `.env.example` sebagai template tanpa nilai asli.

## Konfigurasi Supabase Auth

Untuk development lokal, konfigurasi pada **Authentication → URL Configuration**:

```text
Site URL:      http://localhost:3000
Redirect URL: http://localhost:3000/**
```

Untuk praktikum, email confirmation dapat dinonaktifkan agar akun uji langsung dapat digunakan. Pada deployment nyata, email confirmation sebaiknya diaktifkan.

## Menyiapkan Database

Migration database tersedia di folder:

```text
supabase/migrations/
```

Jika Supabase CLI belum digunakan, migration dapat diterapkan secara berurutan:

1. Buka file migration pembuatan tabel `transactions` (`20260923000000_create_transactions.sql`).
2. Buka **Supabase Dashboard → SQL Editor**, salin isi query, lalu klik **Run**.
3. Buka file migration pembuatan tabel `budgets` (`20260930000000_create_budgets.sql`).
4. Salin isi query, lalu klik **Run**.
5. Pastikan kedua tabel (`transactions` dan `budgets`) tersedia.
6. Pastikan RLS aktif dan terdapat empat policy ownership pada masing-masing tabel.

Jangan menjalankan migration yang sama secara bersamaan dari dua perangkat.

## Akun Dummy

Akun dummy digunakan hanya untuk development dan demonstrasi.

```text
Email   : demo@duitku.test
Password: test123
```

Akun dapat dibuat melalui halaman registrasi aplikasi. Jika aplikasi belum tersedia, PM dapat membuatnya melalui **Supabase Dashboard → Authentication → Users → Add user** dan mengaktifkan auto-confirm untuk akun uji.

Jangan menggunakan email atau password pribadi sebagai akun dummy.

## Data Dummy

Dataset contoh:

| Jenis | Nominal | Kategori | Deskripsi |
|---|---:|---|---|
| Pemasukan | Rp1.500.000 | Uang Saku | Uang saku bulanan |
| Pengeluaran | Rp150.000 | Makanan | Makan selama beberapa hari |
| Pengeluaran | Rp75.000 | Transportasi | Transportasi ke kampus |
| Pemasukan | Rp500.000 | Freelance | Pendapatan pekerjaan freelance |
| Pengeluaran | Rp200.000 | Pendidikan | Membeli buku kuliah |
| Pengeluaran | Rp100.000 | Internet | Paket internet bulanan |

Hasil ringkasan yang diharapkan:

```text
Total pemasukan   : Rp2.000.000
Total pengeluaran : Rp525.000
Saldo             : Rp1.475.000
```

Contoh target anggaran bulanan:

```text
Target Anggaran   : Rp1.000.000
Pengeluaran Aktual: Rp525.000
Sisa Anggaran     : Rp475.000 (Pemakaian 52,5% - Status: Aman)
```

Data dummy dapat dimasukkan melalui aplikasi setelah login sebagai akun dummy. Cara ini direkomendasikan karena sekaligus menguji autentikasi, validasi, dan RLS.

Apabila data dimasukkan melalui SQL Editor, pastikan setiap baris menggunakan UUID akun dummy yang benar dari `auth.users`. Memasukkan data melalui SQL Editor tidak membuktikan bahwa RLS aplikasi bekerja karena editor memiliki akses administratif.

## Menjalankan Aplikasi

```powershell
npm run dev
```

Buka:

```text
http://localhost:3000
```

Jika `.env.local` baru dibuat atau diubah ketika server masih berjalan, hentikan server dengan `Ctrl+C`, lalu jalankan kembali `npm run dev`.

## Pemeriksaan Kualitas

Jalankan sebelum membuat pull request:

```powershell
npm run lint
npm run build
```

Keduanya harus selesai tanpa error.

## Pengujian Manual

### Autentikasi

1. Registrasi akun baru.
2. Login menggunakan akun tersebut.
3. Refresh dashboard dan pastikan session tetap tersedia.
4. Logout dan pastikan dashboard tidak dapat dibuka.

### CRUD transaksi via AJAX

1. Klik tombol **+ Tambah Transaksi** di dashboard dan pastikan modal terbuka tanpa reload halaman.
2. Tambahkan pemasukan dan pengeluaran.
3. Pastikan data muncul di riwayat dan kartu ringkasan terupdate seketika.
4. Klik **Ubah** pada salah satu baris, simpan perubahan, dan pastikan data terupdate di dashboard.
5. Klik **Hapus** pada salah satu transaksi, konfirmasi dialog, dan pastikan baris terhapus seketika.

### Filter transaksi real-time

1. Ubah filter jenis transaksi menjadi **Pemasukan** atau **Pengeluaran**; pastikan daftar terfilter tanpa reload halaman.
2. Filter berdasarkan kategori transaksi; pastikan hanya kategori yang cocok yang tampil.
3. Filter berdasarkan periode bulan dan tahun; pastikan transaksi periode lain disaring.
4. Klik tombol **Reset**; pastikan filter kembali ke kondisi awal.

### Anggaran bulanan (Monthly Budget)

1. Buka widget Anggaran Pengeluaran Bulanan di dashboard.
2. Tetapkan target anggaran bulanan melalui modal.
3. Pastikan progress bar, nominal pengeluaran aktual, dan sisa anggaran tampil dengan warna status yang tepat (Aman, Waspada, Melebihi Anggaran).
4. Tambahkan transaksi pengeluaran baru; pastikan progres pemakaian anggaran langsung terbarui secara otomatis.
5. Coba ganti bulan pada kartu anggaran; pastikan anggaran bulan terkait tampil sesuai periode.

### Isolasi data dan RLS

1. Buat akun A dan akun B.
2. Login sebagai akun A, lalu buat transaksi dan tetapkan anggaran bulanan.
3. Logout, kemudian login sebagai akun B.
4. Pastikan transaksi dan anggaran akun A tidak terlihat pada dashboard akun B.
5. Coba manipulasi request API transaksi atau anggaran milik akun A menggunakan session akun B.
6. Pastikan akses ditolak atau menghasilkan status 404/403.

### Cookie preferensi

1. Ganti tema aplikasi.
2. Refresh halaman.
3. Pastikan tema tetap digunakan.
4. Periksa keberadaan cookie `duitku_theme` melalui browser developer tools.

## Workflow Git

Setiap pekerjaan dilakukan pada feature branch, bukan langsung pada `main`:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/nama-fitur
```

Setelah fitur selesai:

```powershell
git status
git add <file-yang-relevan>
git commit -m "feat: describe the completed feature"
git push -u origin feature/nama-fitur
```

Buat pull request menuju `main`. PM memeriksa perubahan, secret, migration, lint, build, dan hasil pengujian sebelum merge.

Jangan memasukkan `.env.local`, database password, secret key, atau `service_role` ke commit.

## Dokumentasi

- [Software Requirements Specification](docs/SRS.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Status Proyek

Status saat README ini disusun:

- Project Next.js 16 App Router dan React 19 berjalan dengan stabil.
- Dependency Supabase (`@supabase/ssr` dan `@supabase/supabase-js`) terkonfigurasi.
- Tabel `transactions` dan `budgets` tersedia di Supabase dengan RLS aktif.
- Dashboard telah mengadopsi 100% AJAX (zero full-page reload).
- CRUD transaksi in-page modal dan filter real-time telah diimplementasikan.
- Fitur Anggaran Bulanan (Monthly Budget) dengan visual progress bar dan sinkronisasi otomatis selesai.
- Pengujian otomatis (`npm run lint` dan `npm run build`) berhasil 100% tanpa error.
- Seluruh fitur Pertemuan 5 telah selesai dan di-merge ke branch `main`.

