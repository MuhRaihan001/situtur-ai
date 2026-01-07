export const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return 'TBD';

  try {
    let date;

    // Kalau number dan kelihatan kayak UNIX timestamp detik
    if (typeof dateInput === 'number' && dateInput < 1e12) {
      date = new Date(dateInput * 1000);
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
      return 'Format Salah';
    }

    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error Tanggal';
  }
};
