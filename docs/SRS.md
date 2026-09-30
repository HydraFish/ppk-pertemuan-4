# Software Requirements Specification (SRS)

## DUITku — Expense Tracker Mahasiswa

**Versi:** 2.0  
**Status:** Implementasi Pertemuan 5 (AJAX & Budget Bulanan)  
**Platform:** Web  
**Bahasa antarmuka:** Bahasa Indonesia  

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini mendefinisikan kebutuhan aplikasi web **DUITku**, yaitu aplikasi pencatat keuangan pribadi untuk mahasiswa. Dokumen ini menjadi sumber acuan bagi programmer, reviewer, dan penguji pada iterasi Pertemuan 5 (Penambahan AJAX & Fitur Anggaran Bulanan).

### 1.2 Ruang lingkup

DUITku memungkinkan pengguna untuk:

- membuat akun, login, dan logout;
- mempertahankan status login selama session masih berlaku;
- mencatat pemasukan dan pengeluaran;
- melihat, mengubah, dan menghapus transaksi miliknya secara asinkron (AJAX) tanpa reload halaman;
- memfilter riwayat transaksi secara real-time (AJAX) berdasarkan tipe, kategori, dan periode;
- melihat saldo, total pemasukan, dan total pengeluaran yang terbarui secara dinamis;
- menetapkan anggaran pengeluaran bulanan (Monthly Budget);
- memantau persentase dan sisa pemakaian anggaran bulanan berdasarkan transaksi pengeluaran aktual;
- menyimpan sedikitnya satu preferensi pengguna melalui cookie;
- memperoleh pemisahan data yang aman antar pengguna melalui Supabase Row Level Security (RLS).

### 1.3 Di luar ruang lingkup

Versi ini tidak mencakup:

- akun atau dashboard admin;
- transaksi bersama atau kolaborasi antarpengguna;
- target tabungan (savings goals);
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

### SRS-AJAX-01 — Reaktivitas Dashboard Asinkron

Dashboard harus dapat memperbarui data transaksi dan metrik keuangan (Pemasukan, Pengeluaran, Saldo) secara asinkron (AJAX) tanpa reload halaman penuh (*full page reload*).

Kriteria:
- Data transaksi dan ringkasan keuangan dapat di-fetch ulang atau dimutasi langsung dari client.
- Perubahan transaksi (tambah, ubah, hapus) langsung merefleksikan perubahan pada kartu ringkasan keuangan dan widget anggaran secara instan.

### SRS-AJAX-02 — Manajemen Transaksi In-Page / Asinkron

Pengguna dapat menambah, mengedit, dan menghapus transaksi langsung dari tampilan dashboard (misal: modal / in-page drawer / inline form) menggunakan AJAX (`fetch` API).

Kriteria:
- Menambah transaksi baru tidak menavigasi ke halaman terpisah `/transactions/new`, melainkan menggunakan dialog/modal interaktif yang mengirim request POST ke API.
- Mengedit transaksi tidak menavigasi ke `/transactions/[id]/edit`, melainkan membuka dialog/modal edit yang mengirim request PUT/PATCH ke API.
- Menghapus transaksi mengirimkan request DELETE via AJAX setelah dialog konfirmasi, dan baris transaksi langsung terhapus dari tampilan tanpa refresh halaman.
- Validasi error dan feedback sukses ditampilkan langsung di UI.

### SRS-AJAX-03 — Filter Transaksi Real-time

Pengguna dapat memfilter daftar transaksi secara dinamis dan asinkron (AJAX) tanpa reload halaman.

Kriteria:
- Filter berdasarkan jenis transaksi: `Semua`, `Pemasukan` (`income`), `Pengeluaran` (`expense`).
- Filter berdasarkan kategori: memilih kategori tertentu atau semua kategori.
- Filter berdasarkan periode bulan dan tahun: menampilkan transaksi pada bulan/tahun yang dipilih.
- Perubahan filter langsung memperbarui daftar riwayat transaksi di dashboard secara asinkron.
- Menyediakan tombol atau opsi reset filter untuk kembali menampilkan seluruh data.

### SRS-BUDGET-01 — Penetapan Anggaran Bulanan

Pengguna dapat menetapkan atau memperbarui nominal anggaran pengeluaran bulanan (Monthly Budget) untuk bulan dan tahun tertentu.

Kriteria:
- Nominal anggaran wajib berupa angka positif (> 0).
- Periode anggaran ditentukan oleh bulan (1–12) dan tahun (misal: 2026).
- Pengguna hanya memiliki tepat satu nominal anggaran per kombinasi bulan dan tahun (bersifat *upsert* atau *edit* jika sudah ada).
- Operasi penetapan/pembaruan anggaran dilakukan secara asinkron (AJAX) tanpa reload halaman.

### SRS-BUDGET-02 — Pemantauan & Visualisasi Penggunaan Anggaran

Sistem menyajikan visualisasi pemantauan anggaran terhadap pengeluaran aktual bulan bersangkutan.

Kriteria:
- Pengeluaran aktual dihitung dari total nominal transaksi dengan `type = 'expense'` pada bulan dan tahun yang bersangkutan.
- Menampilkan persentase penggunaan: `(total_pengeluaran / target_anggaran) * 100%`.
- Menampilkan sisa anggaran jika pengeluaran masih berada di bawah target anggaran.
- Menampilkan indikator visual (progress bar):
  - **Aman (Hijau)**: Penggunaan < 80%.
  - **Waspada (Kuning/Oranye)**: Penggunaan 80% – 100%.
  - **Over-budget (Merah)**: Penggunaan > 100% disertai pesan peringatan bahwa anggaran telah terlampaui beserta selisih nominalnya.
- Jika pengguna belum menetapkan anggaran pada bulan terkait, sistem menampilkan informasi bahwa anggaran belum diset dan menyediakan tombol untuk menetapkan anggaran.
- Pembaruan transaksi pengeluaran (tambah/edit/hapus) langsung memicu kalkulasi ulang progres anggaran secara otomatis melalui AJAX.

### SRS-BUDGET-03 — Isolasi & Keamanan Anggaran

Data anggaran bulanan terisolasi ketat per pengguna melalui Row Level Security (RLS) dan verifikasi session pada backend. Pengguna dilarang keras dapat melihat, mengubah, atau menghapus anggaran milik pengguna lain.

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
11. Setiap pengguna hanya dapat menetapkan maksimal 1 nominal anggaran untuk kombinasi bulan dan tahun tertentu.
12. Nominal target anggaran bulanan harus lebih besar dari nol.
13. Perhitungan akumulasi pemakaian anggaran bulanan hanya memperhitungkan transaksi pengeluaran (`type = 'expense'`) pada bulan dan tahun bersangkutan milik pengguna tersebut.
14. Pengguna dilarang mengakses, menetapkan, atau mengubah anggaran pengguna lain.

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

### 6.3 Tabel `budgets`

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `user_id` | `uuid` | Wajib, FK ke `auth.users(id)`, `ON DELETE CASCADE` |
| `month` | `integer` | Wajib, check `month between 1 and 12` |
| `year` | `integer` | Wajib, check `year >= 2020` |
| `amount` | `numeric(14,2)` | Wajib, check lebih besar dari 0 |
| `created_at` | `timestamptz` | Wajib, default `now()` |
| `updated_at` | `timestamptz` | Wajib, default `now()` |

Constraint unik & Indeks:

- constraint unik gabungan: `unique (user_id, month, year)`;
- indeks pada `user_id`;
- indeks gabungan pada `(user_id, year, month)`.

## 7. Keamanan Supabase

### 7.1 RLS pada Tabel `transactions`

RLS wajib diaktifkan pada tabel `transactions`.

Kebijakan minimal:

- `SELECT`: pengguna hanya dapat membaca baris dengan `auth.uid() = user_id`;
- `INSERT`: pengguna hanya dapat membuat baris dengan `auth.uid() = user_id`;
- `UPDATE`: pengguna hanya dapat memperbarui baris dengan `auth.uid() = user_id` dan hasil akhirnya tetap dimiliki pengguna yang sama;
- `DELETE`: pengguna hanya dapat menghapus baris dengan `auth.uid() = user_id`.

### 7.2 RLS pada Tabel `budgets`

RLS wajib diaktifkan pada tabel `budgets`.

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

Produk dianggap memenuhi baseline Pertemuan 5 apabila seluruh skenario berikut berhasil:

1. Pengunjung dapat mendaftar dengan data valid.
2. Pengguna dapat login dan logout.
3. Refresh dashboard tidak menghilangkan session yang masih valid.
4. Guest yang membuka dashboard diarahkan ke login.
5. Pengguna dapat membuat transaksi pemasukan dan pengeluaran secara asinkron (AJAX) via modal/in-page form tanpa full page reload.
6. Pengguna dapat melihat, mengubah, dan menghapus transaksi miliknya secara asinkron (AJAX) tanpa full page reload.
7. Ringkasan keuangan (Pemasukan, Pengeluaran, Saldo) otomatis terbarui via AJAX saat transaksi bertambah, berubah, atau terhapus.
8. Pengguna dapat memfilter transaksi (berdasarkan jenis: semua/pemasukan/pengeluaran, kategori, dan periode bulan) secara asinkron tanpa reload halaman.
9. Pengguna dapat menetapkan dan memperbarui target anggaran bulanan (Monthly Budget) via AJAX.
10. Dashboard menampilkan visualisasi progres anggaran bulanan (persentase, sisa/kelebihan dana, dan indikator warna Aman/Waspada/Over-budget).
11. Menambah, mengedit, atau menghapus transaksi pengeluaran langsung memicu pembaruan progres anggaran bulanan secara otomatis via AJAX.
12. Dua akun yang berbeda tidak dapat melihat atau memanipulasi transaksi maupun anggaran satu sama lain (terisolasi penuh via RLS).
13. Input tidak valid (nominal <= 0, bulan di luar 1-12, format tanggal keliru) ditolak pada sisi server.
14. Preferensi tema tersimpan dalam cookie dan bertahan setelah refresh.
15. `.env.local`, secret key, dan password tidak masuk repository.
16. `npm run lint` dan `npm run build` berhasil tanpa error.

## 11. Skenario Uji Isolasi Data Wajib

### 11.1 Isolasi Transaksi
1. Buat akun A dan akun B.
2. Login sebagai akun A, lalu buat minimal satu transaksi.
3. Catat ID transaksi akun A.
4. Logout dan login sebagai akun B.
5. Pastikan transaksi akun A tidak muncul pada dashboard maupun response API akun B.
6. Coba akses endpoint GET/PUT/DELETE transaksi akun A menggunakan session akun B.
7. Seluruh percobaan akun B harus gagal (HTTP 404 / 403) tanpa membocorkan data akun A.

### 11.2 Isolasi Anggaran Bulanan
1. Login sebagai akun A, tetapkan anggaran bulanan untuk periode bulan tertentu (misal: Rp 1.500.000).
2. Logout dan login sebagai akun B.
3. Buka dashboard akun B pada periode bulan yang sama: pastikan anggaran akun A tidak tampil pada akun B (akun B melihat state belum ada anggaran).
4. Coba lakukan modifikasi atau request data anggaran akun A dengan session akun B melalui manipulasi request API.
5. Sistem dan RLS Supabase harus memblokir request tersebut dan memastikan data akun A tetap terlindungi.

## 12. Definition of Done

Sebuah fitur dinyatakan selesai apabila:

- sesuai SRS dan seluruh aturan bisnis;
- memiliki validasi server dan client;
- seluruh interaksi CRUD, filter, dan budget berjalan asinkron (AJAX) tanpa full page reload;
- menghormati RLS dan kepemilikan pengguna;
- memiliki tampilan loading, kosong, berhasil, dan pesan kesalahan yang relevan;
- sudah diperiksa melalui lint dan production build;
- sudah melalui pengujian manual acceptance criteria;
- tidak menyimpan kredensial di Git;
- perubahan siap ditinjau melalui pull request.
