# Software Requirements Specification (SRS)

## DUITku — Expense Tracker Mahasiswa

**Versi:** 1.0  
**Status:** Baseline implementasi  
**Platform:** Web  
**Bahasa antarmuka:** Bahasa Indonesia  

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini mendefinisikan kebutuhan aplikasi web **DUITku**, yaitu aplikasi pencatat keuangan pribadi untuk mahasiswa. Dokumen ini menjadi sumber acuan bagi programmer, reviewer, dan penguji.

### 1.2 Ruang lingkup

DUITku memungkinkan pengguna untuk:

- membuat akun, login, dan logout;
- mempertahankan status login selama session masih berlaku;
- mencatat pemasukan dan pengeluaran;
- melihat, mengubah, dan menghapus transaksi miliknya;
- melihat saldo, total pemasukan, dan total pengeluaran;
- menyimpan sedikitnya satu preferensi pengguna melalui cookie;
- memperoleh pemisahan data yang aman antar pengguna.

### 1.3 Di luar ruang lingkup

Versi ini tidak mencakup:

- akun atau dashboard admin;
- transaksi bersama atau kolaborasi antarpengguna;
- anggaran bulanan;
- target tabungan;
- ekspor PDF/Excel;
- integrasi rekening bank atau dompet digital;
- multi-currency;
- pemulihan password, kecuali kemudian diminta secara eksplisit.

## 2. Aktor Sistem

### 2.1 Pengunjung (Guest)

Pengguna yang belum login. Hanya dapat membuka halaman login dan registrasi.

### 2.2 Pengguna Terautentikasi

Pengguna yang sudah login. Dapat membuka dashboard dan mengelola transaksi miliknya sendiri.

## 3. Asumsi dan Keputusan Teknis

- Framework menggunakan Next.js App Router, TypeScript, dan Tailwind CSS.
- Database dan autentikasi menggunakan Supabase.
- Akun minimal terdiri dari email dan password.
- Mata uang yang digunakan adalah Rupiah Indonesia (IDR).
- Nilai uang disimpan sebagai tipe numerik, bukan floating point.
- Preferensi cookie yang digunakan adalah tema tampilan `light` atau `dark`.
- Semua pemeriksaan kepemilikan data harus ditegakkan oleh Row Level Security (RLS), bukan hanya disembunyikan di UI.

## 4. Kebutuhan Fungsional

### SRS-AUTH-01 — Registrasi akun

Pengunjung dapat membuat akun menggunakan email dan password.

Kriteria:

- email wajib diisi dan harus valid;
- password wajib diisi dengan panjang minimal 8 karakter;
- konfirmasi password harus sama;
- email yang sudah terdaftar harus ditolak;
- setelah registrasi berhasil, aplikasi menampilkan hasil yang jelas;
- jika verifikasi email diaktifkan di Supabase, pengguna diarahkan untuk memeriksa email;
- jika session langsung tersedia, pengguna dapat diarahkan ke dashboard.

### SRS-AUTH-02 — Login

Pengguna dapat login menggunakan email dan password yang valid.

Kriteria:

- kredensial tidak valid menghasilkan pesan kesalahan yang aman;
- pengguna yang berhasil login diarahkan ke dashboard;
- halaman login tidak menampilkan detail teknis dari Supabase.

### SRS-AUTH-03 — Logout

Pengguna yang login dapat keluar dari aplikasi.

Kriteria:

- session pengguna dihapus;
- pengguna diarahkan ke halaman login;
- halaman terproteksi tidak dapat dibuka setelah logout.

### SRS-AUTH-04 — Session persisten

Informasi login harus tetap tersedia selama session Supabase masih berlaku.

Kriteria:

- refresh halaman tidak membuat pengguna logout;
- session disimpan dan diperbarui menggunakan cookie melalui integrasi SSR Supabase;
- session yang kedaluwarsa atau tidak valid mengarahkan pengguna ke login;
- pengguna yang sudah login dan membuka halaman login/registrasi diarahkan ke dashboard.

### SRS-AUTH-05 — Proteksi halaman

Dashboard dan seluruh halaman transaksi hanya dapat diakses oleh pengguna terautentikasi.

### SRS-TRX-01 — Menambahkan transaksi

Pengguna dapat menambahkan transaksi pemasukan atau pengeluaran.

Field:

- `type`: wajib, hanya `income` atau `expense`;
- `amount`: wajib, angka lebih besar dari 0;
- `category`: wajib, maksimal 50 karakter;
- `description`: opsional, maksimal 255 karakter;
- `transaction_date`: wajib, berupa tanggal valid.

Sistem harus mengisi `user_id` berdasarkan pengguna yang sedang login. Nilai `user_id` tidak boleh dipercaya dari input form.

### SRS-TRX-02 — Melihat riwayat transaksi

Pengguna dapat melihat daftar seluruh transaksi miliknya.

Kriteria:

- transaksi pengguna lain tidak pernah ditampilkan;
- daftar menampilkan jenis, nominal, kategori, deskripsi, dan tanggal;
- daftar diurutkan berdasarkan tanggal transaksi terbaru, kemudian waktu pembuatan terbaru;
- kondisi kosong menampilkan pesan yang mudah dipahami.

### SRS-TRX-03 — Mengubah transaksi

Pengguna dapat mengubah transaksi miliknya sendiri dengan aturan validasi yang sama seperti penambahan transaksi.

### SRS-TRX-04 — Menghapus transaksi

Pengguna dapat menghapus transaksi miliknya sendiri setelah memberikan konfirmasi.

### SRS-TRX-05 — Isolasi kepemilikan transaksi

Pengguna dilarang membaca, mengubah, atau menghapus transaksi milik pengguna lain, termasuk apabila mencoba memanipulasi URL atau request secara manual.

### SRS-DASH-01 — Ringkasan keuangan

Dashboard menampilkan:

- total pemasukan pengguna;
- total pengeluaran pengguna;
- saldo pengguna dengan rumus `total pemasukan - total pengeluaran`.

Semua nilai dihitung hanya dari transaksi milik pengguna yang sedang login.

### SRS-DASH-02 — Dashboard transaksi

Dashboard menyediakan akses untuk melihat riwayat, menambah, mengubah, dan menghapus transaksi.

### SRS-COOKIE-01 — Preferensi dalam cookie

Pengguna dapat memilih tema `light` atau `dark`.

Kriteria:

- preferensi disimpan pada cookie bernama `duitku_theme`;
- nilai cookie hanya `light` atau `dark`;
- preferensi tetap digunakan setelah refresh atau kunjungan berikutnya;
- cookie menggunakan `SameSite=Lax`, path `/`, dan masa berlaku 30 hari;
- atribut `Secure` digunakan pada lingkungan production;
- cookie ini tidak menyimpan password, token rahasia, atau data transaksi.

### SRS-VALID-01 — Validasi input

Semua perubahan data harus divalidasi pada sisi server. Validasi sisi client boleh ditambahkan untuk pengalaman pengguna, tetapi tidak boleh menjadi satu-satunya validasi.

### SRS-FEEDBACK-01 — Umpan balik pengguna

Operasi berhasil atau gagal harus menghasilkan pesan yang jelas tanpa membocorkan stack trace, query database, atau kredensial.

## 5. Aturan Bisnis

1. Setiap transaksi dimiliki tepat oleh satu pengguna.
2. Pengguna hanya dapat mengelola transaksi miliknya sendiri.
3. Nominal transaksi harus lebih besar dari nol.
4. Jenis transaksi hanya `income` atau `expense`.
5. Saldo dapat bernilai negatif.
6. Perhitungan ringkasan menggunakan seluruh transaksi pengguna.
7. `user_id` transaksi diperoleh dari session terautentikasi.
8. Tanggal transaksi tidak harus sama dengan tanggal pencatatan.
9. Seluruh nominal ditampilkan sebagai Rupiah dengan format lokal Indonesia.
10. Penghapusan transaksi bersifat permanen pada versi ini.

## 6. Model Data

### 6.1 Akun

Akun dikelola oleh `auth.users` milik Supabase Auth. Aplikasi tidak perlu membuat tabel password sendiri.

### 6.2 Tabel `transactions`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `user_id` | `uuid` | Wajib, FK ke `auth.users(id)`, `ON DELETE CASCADE` |
| `type` | `text` | Wajib, check `income` atau `expense` |
| `amount` | `numeric(14,2)` | Wajib, check lebih besar dari 0 |
| `category` | `varchar(50)` | Wajib |
| `description` | `varchar(255)` | Opsional |
| `transaction_date` | `date` | Wajib |
| `created_at` | `timestamptz` | Wajib, default `now()` |
| `updated_at` | `timestamptz` | Wajib, default `now()` |

Indeks minimal:

- indeks pada `user_id`;
- indeks gabungan pada `user_id` dan `transaction_date`.

`updated_at` harus diperbarui secara otomatis melalui trigger atau secara konsisten dari aplikasi.

## 7. Keamanan Supabase

RLS wajib diaktifkan pada tabel `transactions`.

Kebijakan minimal:

- `SELECT`: pengguna hanya dapat membaca baris dengan `auth.uid() = user_id`;
- `INSERT`: pengguna hanya dapat membuat baris dengan `auth.uid() = user_id`;
- `UPDATE`: pengguna hanya dapat memperbarui baris dengan `auth.uid() = user_id` dan hasil akhirnya tetap dimiliki pengguna yang sama;
- `DELETE`: pengguna hanya dapat menghapus baris dengan `auth.uid() = user_id`.

Ketentuan keamanan:

- aplikasi browser hanya menggunakan publishable key;
- secret key atau `service_role` dilarang dimasukkan ke kode client;
- `.env.local` dilarang masuk Git;
- jangan menonaktifkan RLS untuk mempermudah implementasi;
- otorisasi tidak boleh mengandalkan ID yang dikirim pengguna.

## 8. Kebutuhan Antarmuka

Halaman minimal:

1. `/` — mengarahkan sesuai status login.
2. `/register` — form registrasi.
3. `/login` — form login.
4. `/dashboard` — ringkasan dan riwayat transaksi.
5. `/transactions/new` — form transaksi baru.
6. `/transactions/[id]/edit` — form edit transaksi milik pengguna.

Antarmuka harus:

- responsif pada layar ponsel dan desktop;
- memiliki label form yang jelas;
- menampilkan validasi dekat field atau pada area pesan yang mudah ditemukan;
- memiliki dialog/konfirmasi sebelum penghapusan;
- membedakan pemasukan dan pengeluaran secara visual tanpa hanya mengandalkan warna.

## 9. Kebutuhan Nonfungsional

### SRS-NFR-01 — Keamanan

Data antar pengguna harus terisolasi melalui session, query yang terikat pengguna, dan RLS.

### SRS-NFR-02 — Kinerja

Dashboard harus melakukan query secara efisien dan tidak mengambil transaksi semua pengguna.

### SRS-NFR-03 — Maintainability

- TypeScript digunakan tanpa `any` yang tidak perlu.
- Logika Supabase dipisahkan dari komponen presentasi.
- Validasi dan tipe data digunakan secara konsisten.
- Nama file, fungsi, dan variabel harus jelas.

### SRS-NFR-04 — Kompatibilitas

Aplikasi ditargetkan untuk browser modern dan layout harus responsif.

### SRS-NFR-05 — Privasi

Cookie preferensi tidak boleh berisi data sensitif. Pesan kesalahan tidak boleh membocorkan informasi internal.

## 10. Acceptance Criteria Utama

Produk dianggap memenuhi baseline apabila seluruh skenario berikut berhasil:

1. Pengunjung dapat mendaftar dengan data valid.
2. Pengguna dapat login dan logout.
3. Refresh dashboard tidak menghilangkan session yang masih valid.
4. Guest yang membuka dashboard diarahkan ke login.
5. Pengguna dapat membuat transaksi pemasukan dan pengeluaran.
6. Pengguna dapat melihat, mengubah, dan menghapus transaksi miliknya.
7. Total pemasukan, total pengeluaran, dan saldo dihitung dengan benar.
8. Dua akun yang berbeda tidak dapat melihat atau memanipulasi transaksi satu sama lain.
9. Input tidak valid ditolak pada sisi server.
10. Preferensi tema tersimpan dalam cookie dan bertahan setelah refresh.
11. `.env.local`, secret key, dan password tidak masuk repository.
12. `npm run lint` dan `npm run build` berhasil tanpa error.

## 11. Skenario Uji Isolasi Data Wajib

1. Buat akun A dan akun B.
2. Login sebagai akun A, lalu buat minimal satu transaksi.
3. Catat ID transaksi akun A.
4. Logout dan login sebagai akun B.
5. Pastikan transaksi akun A tidak muncul pada dashboard akun B.
6. Coba akses URL edit transaksi akun A menggunakan akun B.
7. Coba melakukan update dan delete terhadap ID transaksi akun A.
8. Seluruh percobaan akun B harus gagal atau menghasilkan kondisi tidak ditemukan tanpa membocorkan data akun A.

## 12. Definition of Done

Sebuah fitur dinyatakan selesai apabila:

- sesuai SRS dan aturan bisnis;
- memiliki validasi server;
- menghormati RLS dan kepemilikan pengguna;
- memiliki tampilan loading, kosong, berhasil, dan gagal yang relevan;
- sudah diperiksa melalui lint dan production build;
- sudah melalui pengujian manual acceptance criteria;
- tidak menyimpan kredensial di Git;
- perubahan siap ditinjau melalui pull request.
