/**
 * Utilitas untuk memformat tanggal ke format Indonesia yang ramah pengguna
 * @param {string|Date|number} dateInput - Input tanggal (ISO string, Date object, atau timestamp)
 * @param {boolean} includeTime - Apakah ingin menyertakan waktu (jam:menit)
 * @returns {string} - Tanggal terformat (contoh: 9 Jan 2026)
 */
export const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return 'TBD';

  try {
    const date = new Date(dateInput);
    
    // Validasi apakah date valid
    if (isNaN(date.getTime())) {
      return 'Format Salah';
    }

    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error Tanggal';
  }
};
