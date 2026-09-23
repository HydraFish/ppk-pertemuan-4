const MESSAGES: Record<string, string> = {
  missing_fields: "Email dan password wajib diisi.",
  invalid_credentials: "Email atau password salah.",
  weak_password: "Password minimal 8 karakter.",
  password_mismatch: "Konfirmasi password tidak sama.",
  email_taken: "Email sudah terdaftar.",
  signup_failed: "Registrasi gagal. Silakan coba lagi.",
};

const NOTICES: Record<string, string> = {
  check_email: "Registrasi berhasil. Periksa email kamu untuk konfirmasi akun.",
};

export function authErrorMessage(code: string | undefined) {
  if (!code) return null;
  return MESSAGES[code] ?? "Terjadi kesalahan. Silakan coba lagi.";
}

export function authNoticeMessage(code: string | undefined) {
  if (!code) return null;
  return NOTICES[code] ?? null;
}
