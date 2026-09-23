# DUITku

DUITku adalah aplikasi web Expense Tracker sederhana untuk mahasiswa. Aplikasi membantu pengguna mencatat pemasukan dan pengeluaran pribadi, melihat riwayat transaksi, serta memantau total pemasukan, total pengeluaran, dan saldo terkini.

Setiap transaksi terhubung dengan akun yang sedang login. Pemisahan data ditegakkan menggunakan Supabase Row Level Security (RLS), sehingga pengguna hanya dapat melihat dan mengelola transaksi miliknya sendiri.

## Fitur Utama

- Registrasi akun menggunakan email dan password.
- Login dan logout.
- Session login yang tetap tersedia selama masih berlaku.
- Dashboard ringkasan keuangan.
- Menambahkan transaksi pemasukan atau pengeluaran.
- Melihat riwayat transaksi.
- Mengubah transaksi milik sendiri.
- Menghapus transaksi milik sendiri.
- Pemisahan data antar pengguna menggunakan RLS.
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

## Aturan Bisnis

1. Setiap transaksi dimiliki tepat oleh satu pengguna.
2. Pengguna hanya dapat membaca, membuat, mengubah, dan menghapus transaksi miliknya sendiri.
3. `user_id` harus berasal dari session pengguna, bukan input bebas dari form.
4. Jenis transaksi hanya `income` atau `expense`.
5. Nominal transaksi harus lebih besar dari nol.
6. Saldo boleh bernilai negatif.
7. Seluruh nominal ditampilkan dalam Rupiah Indonesia.
8. Penghapusan transaksi bersifat permanen pada versi ini.

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

RLS aktif pada tabel `transactions` dengan policy terpisah untuk operasi `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`. Semua policy hanya berlaku untuk role `authenticated` dan membandingkan `auth.uid()` dengan `user_id`.

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

Jika Supabase CLI belum digunakan, migration dapat diterapkan secara manual:

1. Buka file migration pembuatan tabel `transactions`.
2. Buka **Supabase Dashboard → SQL Editor**.
3. Buat query baru.
4. Salin isi migration satu kali.
5. Periksa bahwa query hanya menyentuh objek DUITku.
6. Klik **Run**.
7. Pastikan tabel `transactions` tersedia.
8. Pastikan RLS aktif dan terdapat empat policy ownership.

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

### CRUD transaksi

1. Tambahkan pemasukan.
2. Tambahkan pengeluaran.
3. Pastikan keduanya muncul di riwayat.
4. Ubah salah satu transaksi.
5. Hapus salah satu transaksi setelah konfirmasi.
6. Pastikan ringkasan berubah dengan benar.

### Isolasi data dan RLS

1. Buat akun A dan akun B.
2. Login sebagai akun A dan buat transaksi.
3. Logout, kemudian login sebagai akun B.
4. Pastikan transaksi akun A tidak terlihat.
5. Coba akses URL edit transaksi akun A menggunakan akun B.
6. Pastikan akses ditolak atau data dianggap tidak ditemukan.

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

- Project Next.js tersedia.
- Dependency Supabase tersedia.
- Environment lokal PM telah dikonfigurasi.
- Tabel `transactions` tersedia di Supabase.
- RLS aktif dengan empat ownership policy.
- Implementasi antarmuka dan fitur aplikasi telah selesai dan di-merge ke main.

Perbarui bagian ini setelah implementasi dan pengujian selesai.
