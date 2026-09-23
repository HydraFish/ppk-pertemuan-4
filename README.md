# DUITku

DUITku adalah aplikasi web Expense Tracker untuk mahasiswa. Pengguna dapat mengelola pemasukan dan pengeluaran pribadi, melihat riwayat transaksi, serta memantau saldo melalui dashboard.

Spesifikasi lengkap terdapat pada `docs/SRS.md`. Dokumen SRS adalah sumber kebenaran utama apabila ada bagian README yang kurang jelas.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- `@supabase/supabase-js`
- `@supabase/ssr`

## Scope Programmer

Proyek dikerjakan oleh satu programmer. Programmer bertanggung jawab atas seluruh implementasi berikut:

1. konfigurasi Supabase untuk browser dan server;
2. registrasi, login, logout, dan session persisten;
3. proteksi route;
4. schema database dan Row Level Security;
5. CRUD transaksi;
6. dashboard ringkasan keuangan;
7. cookie preferensi tema;
8. validasi, error handling, dan responsive UI;
9. verifikasi lint, build, serta acceptance criteria.

Tidak ada pembagian P1/P2/P3/P4. Semua scope dikerjakan pada satu feature branch oleh satu programmer.

## Instruksi Wajib untuk AI Programmer

Jika kamu adalah AI coding agent, kerjakan proyek ini secara end-to-end dengan ketentuan berikut:

1. Baca seluruh `AGENTS.md`, `README.md`, dan `docs/SRS.md` sebelum mengubah kode.
2. Untuk API Next.js yang mungkin berubah, baca dokumentasi lokal yang relevan di `node_modules/next/dist/docs/`.
3. Periksa kode dan status Git saat ini sebelum mengubah file.
4. Implementasikan hanya scope yang tercantum dalam SRS.
5. Jangan menambahkan fitur admin, budget, ekspor, grafik, atau fitur lain di luar scope.
6. Gunakan Supabase Auth; jangan membuat sistem password sendiri.
7. Terapkan RLS pada tabel `transactions`.
8. Jangan pernah menggunakan secret key atau `service_role` di browser.
9. Jangan membaca, mencetak, atau memasukkan isi `.env.local` ke output, log, maupun repository.
10. Jangan mengubah versi dependency atau menambah package kecuali benar-benar diperlukan.
11. Jangan menjalankan `git commit`, `git push`, membuat pull request, atau merge. Semua operasi tersebut dilakukan manusia.
12. Jangan menghapus perubahan pengguna yang tidak berkaitan dengan tugas.
13. Setelah implementasi, jalankan `npm run lint` dan `npm run build`.
14. Laporkan file yang diubah, hasil pemeriksaan, langkah manual Supabase, dan risiko yang masih tersisa.

## Persiapan Manusia Sebelum Agent Bekerja

Pastikan posisi terminal berada di proyek dan working tree aman:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/expense-tracker
npm install
git status
```

Jika branch sudah dibuat, jangan membuat branch kedua. Cukup pastikan berada pada branch fitur:

```powershell
git branch --show-current
```

Output yang diharapkan:

```text
feature/expense-tracker
```

## Environment Variables

Buat `.env.local` pada root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```

Buat `.env.example` tanpa nilai rahasia:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Pastikan `.gitignore` tetap mengabaikan `.env.local`. Publishable key digunakan oleh client, tetapi tetap tidak boleh di-hardcode pada source code. Jangan menambahkan Supabase secret key karena baseline proyek tidak memerlukannya.

## Target Struktur Implementasi

Agent boleh menyesuaikan struktur jika memiliki alasan teknis yang jelas, tetapi tanggung jawab berikut harus dipisahkan:

```text
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  auth/
    callback/route.ts
  dashboard/page.tsx
  transactions/
    new/page.tsx
    [id]/edit/page.tsx
  layout.tsx
  page.tsx
lib/
  supabase/
    client.ts
    server.ts
    proxy.ts
  validation/
    transaction.ts
supabase/
  migrations/
    ..._create_transactions.sql
proxy.ts
```

Gunakan Server Components secara default. Gunakan Client Components hanya untuk interaksi browser yang benar-benar memerlukan state atau API browser.

## Urutan Implementasi untuk Agent

### Fase 1 — Pemeriksaan awal

- Baca SRS.
- Periksa `package.json`, struktur App Router, dan aturan proyek.
- Verifikasi dependency Supabase sudah tersedia.
- Periksa bahwa `.env.local` diabaikan Git.
- Jangan menampilkan nilai environment variable.

### Fase 2 — Schema dan keamanan database

Buat migration SQL yang idempotensinya wajar dan mudah dijalankan melalui Supabase SQL Editor. Migration minimal harus:

- membuat tabel `public.transactions` sesuai SRS;
- membuat foreign key ke `auth.users(id)` dengan `ON DELETE CASCADE`;
- membuat constraints untuk jenis dan nominal transaksi;
- membuat indeks yang diperlukan;
- menyediakan mekanisme pembaruan `updated_at`;
- mengaktifkan RLS;
- membuat policy `SELECT`, `INSERT`, `UPDATE`, dan `DELETE` berdasarkan `auth.uid()`.

Jangan menjalankan destructive reset terhadap project Supabase. Jika agent tidak memiliki akses database, cukup buat file SQL dan laporkan bahwa manusia harus menjalankannya.

### Fase 3 — Integrasi Supabase SSR

- Buat browser client menggunakan `createBrowserClient`.
- Buat server client menggunakan `createServerClient` dan cookie API Next.js yang sesuai versinya.
- Buat mekanisme proxy/session refresh sesuai pola resmi Supabase untuk Next.js.
- Proteksi dashboard serta route transaksi.
- Pastikan guest diarahkan ke login.
- Pastikan pengguna yang sudah login tidak perlu kembali ke login/register.

Jangan mempercayai `getSession()` sebagai satu-satunya pemeriksaan identitas di server. Gunakan metode autentikasi server yang memvalidasi pengguna sesuai API Supabase yang tersedia.

### Fase 4 — Autentikasi

Implementasikan:

- registrasi email/password;
- login email/password;
- logout;
- penanganan callback jika dibutuhkan;
- pesan berhasil dan gagal yang aman;
- redirect berdasarkan status login.

Tangani kedua konfigurasi Supabase berikut:

- email confirmation dinonaktifkan: session dapat langsung tersedia;
- email confirmation diaktifkan: tampilkan instruksi untuk memeriksa email.

### Fase 5 — CRUD transaksi

Implementasikan operasi create, read, update, dan delete untuk transaksi.

Ketentuan:

- validasi dilakukan pada server;
- `user_id` selalu berasal dari pengguna terautentikasi;
- query update/delete harus dibatasi berdasarkan kepemilikan;
- input nominal diproses secara aman sebagai nilai desimal;
- kegagalan mengakses transaksi milik pengguna lain menghasilkan kondisi tidak ditemukan atau akses ditolak tanpa membocorkan datanya;
- delete memerlukan konfirmasi pengguna.

### Fase 6 — Dashboard

Dashboard harus menampilkan:

- total pemasukan;
- total pengeluaran;
- saldo;
- riwayat transaksi terbaru;
- tombol tambah transaksi;
- aksi edit dan hapus untuk setiap transaksi.

Gunakan format Rupiah Indonesia. Sediakan tampilan empty state apabila pengguna belum memiliki transaksi.

### Fase 7 — Cookie preferensi

Implementasikan pilihan tema `light` dan `dark` dengan cookie `duitku_theme`.

Cookie harus:

- hanya menerima `light` atau `dark`;
- berlaku pada path `/`;
- menggunakan `SameSite=Lax`;
- berlaku selama 30 hari;
- menggunakan `Secure` pada production;
- tidak berisi informasi sensitif.

Preferensi harus tetap terlihat setelah halaman di-refresh.

### Fase 8 — UX dan aksesibilitas dasar

- Desain responsif untuk ponsel dan desktop.
- Gunakan label form yang terhubung dengan input.
- Tampilkan loading, error, success, dan empty state yang relevan.
- Jangan hanya menggunakan warna untuk membedakan pemasukan dan pengeluaran; sertakan teks atau simbol.
- Pastikan navigasi dashboard, tambah transaksi, dan logout mudah ditemukan.

### Fase 9 — Verifikasi

Jalankan:

```powershell
npm run lint
npm run build
git status --short
```

Perbaiki error yang berkaitan dengan implementasi. Jangan mengabaikan error dengan menonaktifkan lint atau TypeScript.

Lakukan atau dokumentasikan pengujian manual berikut:

1. registrasi;
2. login dan logout;
3. session bertahan setelah refresh;
4. proteksi dashboard dari guest;
5. tambah pemasukan dan pengeluaran;
6. edit transaksi;
7. hapus transaksi;
8. akurasi total dan saldo;
9. isolasi data menggunakan dua akun;
10. persistensi tema melalui cookie.

## Langkah Manual Supabase

Setelah agent membuat migration:

1. Buka project di Supabase Dashboard.
2. Pilih **SQL Editor**.
3. Buat query baru.
4. Salin isi migration SQL yang dibuat agent.
5. Periksa bahwa query hanya menyentuh objek proyek DUITku.
6. Jalankan query.
7. Buka **Table Editor** dan pastikan tabel `transactions` tersedia.
8. Periksa bahwa RLS aktif dan empat policy kepemilikan tersedia.

Untuk autentikasi, periksa pengaturan URL:

- Site URL untuk development: `http://localhost:3000`
- Redirect URL development yang relevan: `http://localhost:3000/**`

Jangan membagikan database password, connection string, secret key, atau `service_role` kepada anggota melalui chat.

## Menjalankan Aplikasi

```powershell
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Definition of Done

Pekerjaan programmer selesai apabila:

- seluruh acceptance criteria pada SRS terpenuhi;
- schema dan RLS tersedia sebagai migration yang dapat ditinjau;
- autentikasi serta session berjalan;
- CRUD transaksi bekerja;
- perhitungan dashboard benar;
- cookie preferensi bekerja;
- isolasi dua akun telah diuji;
- lint dan production build berhasil;
- tidak ada secret maupun `.env.local` dalam perubahan Git;
- agent telah memberikan ringkasan perubahan dan langkah manual;
- manusia telah meninjau perubahan sebelum commit.

## Workflow Git Setelah Implementasi

AI agent berhenti setelah implementasi dan verifikasi. Programmer/manusia kemudian memeriksa:

```powershell
git status
git diff --stat
git diff
```

Jika perubahan benar, manusia membuat beberapa commit logis, misalnya:

```text
feat: configure Supabase authentication
feat: add transaction database schema and policies
feat: add transaction management
feat: add financial dashboard and theme preference
```

Setelah itu manusia yang melakukan push dan membuka pull request. Jangan meminta AI agent mencantumkan dirinya sebagai co-author.
