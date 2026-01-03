/**
 * Utilitas untuk menyamarkan ID dalam URL
 * Menghasilkan ID acak sepanjang 12 karakter yang tetap bisa didekode
 */

// Karakter yang digunakan untuk salt acak agar hasil b64 terlihat berbeda
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&^*_()^_+-=';

/**
 * Mengenkode ID numerik menjadi string acak sepanjang 12 karakter
 * @param {number|string} id 
 * @returns {string}
 */
export const encodeId = (id) => {
  if (!id) return '';
  
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
  
  // 4. Encode ke Base64 (hasilnya pasti 12 karakter)
  return btoa(payload);
};

/**
 * Mendekode string acak kembali menjadi ID asli
 * @param {string} maskedId 
 * @returns {string|null}
 */
export const decodeId = (maskedId) => {
  if (!maskedId || maskedId.length !== 12) return null;
  
  try {
    // 1. Decode Base64
    const decoded = atob(maskedId);
    
    // 2. Ambil ID dari posisi setelah salt (karakter ke-4 sampai akhir)
    const idPart = decoded.substring(3);
    
    // 3. Hilangkan padding nol dan kembalikan ID asli
    const originalId = parseInt(idPart, 10);
    return isNaN(originalId) ? null : originalId.toString();
  } catch (e) {
    console.error('Gagal mendekode ID:', e);
    return null;
  }
};
