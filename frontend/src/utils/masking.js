/**
 * Utilitas untuk menyamarkan ID dalam URL
 * Menghasilkan ID acak sepanjang tepat 12 karakter yang tetap bisa didekode
 */

// Karakter yang digunakan untuk salt acak agar hasil b64 terlihat berbeda
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&^*_()^_+-=';

/**
 * Mengenkode ID numerik menjadi string acak sepanjang tepat 12 karakter
 * @param {number|string} id 
 * @returns {string}
 */
export const encodeId = (id) => {
  if (id === undefined || id === null || id === '') return '';
  
  // 1. Ambil 3 karakter acak sebagai salt di awal
  let salt = '';
  for (let i = 0; i < 3; i++) {
    salt += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  
  // 2. Pad ID menjadi 6 digit agar total payload (salt + id) = 9 karakter
  // 9 karakter string akan menghasilkan tepat 12 karakter Base64 tanpa padding '='
  const paddedId = id.toString().padStart(6, '0');
  
  // 3. Gabungkan salt dan ID
  const payload = salt + paddedId;
  
  // 4. Encode ke Base64 dan ubah ke URL-safe format
  // btoa dari 9 karakter menghasilkan 12 karakter base64
  return btoa(payload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Mendekode string acak kembali menjadi ID asli
 * @param {string} maskedId 
 * @returns {string|null}
 */
export const decodeId = (maskedId) => {
  if (!maskedId) return null;
  
  try {
    // 1. Kembalikan format URL-safe ke Base64 standar
    let base64 = maskedId.replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. Tambahkan padding '=' jika diperlukan (Base64 harus kelipatan 4)
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    // 3. Decode Base64
    const decoded = atob(base64);
    
    // 4. Validasi panjang payload (harus 9 karakter sesuai logika encode)
    if (decoded.length !== 9) {
      // Jika tidak 9, mungkin ini ID asli (angka) yang belum disamarkan
      // Berikan toleransi untuk ID asli agar transisi lancar
      if (!isNaN(parseInt(maskedId, 10))) return maskedId.toString();
      return null;
    }
    
    // 5. Ambil ID dari posisi setelah salt (karakter ke-4 sampai ke-9)
    const idPart = decoded.substring(3);
    
    // 6. Hilangkan padding nol dan kembalikan ID asli
    const originalId = parseInt(idPart, 10);
    return isNaN(originalId) ? null : originalId.toString();
  } catch (e) {
    // Jika gagal decode, cek apakah input sebenarnya adalah ID angka murni
    if (!isNaN(parseInt(maskedId, 10))) return maskedId.toString();
    console.error('Gagal mendekode ID:', e);
    return null;
  }
};
