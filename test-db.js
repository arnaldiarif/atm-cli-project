const db = require('./db');

(async () => {
  try {
    const [rows] = await db.execute('SELECT NOW() AS waktu');
    console.log('Koneksi berhasil. Waktu sekarang:', rows[0].waktu);
  } catch (err) {
    console.error('Koneksi GAGAL:', err.message);
  }
})();
