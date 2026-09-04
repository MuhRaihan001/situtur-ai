require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🔄 Memulai inisialisasi database...');
  console.log(`📡 Menghubungkan ke ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT || 3306}...`);

  const sslConfig = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false;

  try {
    // 1. Koneksi awal ke server (tanpa memilih database)
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: sslConfig,
      multipleStatements: true
    });

    console.log('✅ Berhasil terhubung ke server MySQL!');

    const targetDb = process.env.DATABASE_NAME || 'situtur1';

    // 2. Buat database jika belum ada
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\`;`);
    console.log(`✅ Database \`${targetDb}\` siap.`);

    // 3. Masuk ke database target
    await connection.changeUser({ database: targetDb });

    // 4. Baca schema SQL
    const sqlPath = path.join(__dirname, 'database', 'situtur(1).sql');
    if (fs.existsSync(sqlPath)) {
      console.log(`📄 Membaca schema dari ${sqlPath}...`);
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');

      // Jalankan sql dump
      await connection.query(sqlContent);
      console.log(`✅ Tabel dan data awal berhasil di-import ke database \`${targetDb}\`!`);
    } else {
      console.warn(`⚠️ File schema tidak ditemukan di: ${sqlPath}`);
    }

    // 5. Verifikasi daftar tabel
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log('📋 Daftar tabel di database saat ini:', tableNames);

    await connection.end();
    console.log('🎉 Selesai! Database siap digunakan oleh aplikasi.');
  } catch (err) {
    console.error('❌ Gagal menginisialisasi database:');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Error: Password atau Username salah (Access Denied). Mohon cek kembali password di dashboard Aiven.');
    } else {
      console.error(err.message);
    }
  }
}

initializeDatabase();
