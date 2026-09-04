require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Konfigurasi Cloud (Aiven)
const CLOUD_CONFIG = {
  host: process.env.DATABASE_HOST || 'mysql-1ed0f98f-ahmadanugrahsatya-6ec9.e.aivencloud.com',
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 13820,
  user: process.env.DATABASE_USER || 'avnadmin',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'situtur1',
  ssl: { rejectUnauthorized: false },
  multipleStatements: true
};

// Konfigurasi Localhost (XAMPP / Laragon)
const LOCAL_CONFIG = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'situtur',
  multipleStatements: true
};

async function syncDirect() {
  console.log('🚀 Memulai proses sinkronisasi database ke Aiven Cloud...\n');

  let cloudConn;
  try {
    console.log(`📡 Menghubungkan ke Aiven Cloud (${CLOUD_CONFIG.host}:${CLOUD_CONFIG.port})...`);
    cloudConn = await mysql.createConnection(CLOUD_CONFIG);
    console.log(`✅ Terhubung ke Aiven Cloud (Database: ${CLOUD_CONFIG.database})!\n`);
  } catch (err) {
    console.error('❌ Gagal terhubung ke Aiven Cloud:');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Password di .env belum sesuai dengan yang ada di Aiven Console.');
    } else {
      console.error(err.message);
    }
    return;
  }

  // Cek apakah Localhost MySQL menyala
  let localConn;
  let isLocalRunning = false;
  try {
    localConn = await mysql.createConnection(LOCAL_CONFIG);
    isLocalRunning = true;
    console.log('🟢 Terdeteksi MySQL Localhost (XAMPP/Laragon) sedang aktif!');
  } catch (e) {
    console.log('🟡 MySQL Localhost tidak aktif. Akan menggunakan file dump SQL lokal sebagai sumber.');
  }

  try {
    // Nonaktifkan pemeriksaan primary key & foreign key sementara selama migrasi data
    await cloudConn.query('SET SESSION sql_require_primary_key = 0;');
    await cloudConn.query('SET FOREIGN_KEY_CHECKS = 0;');

    if (isLocalRunning) {
      console.log('📦 Menyalin seluruh struktur tabel & isi data dari Localhost ke Cloud...');
      const [tables] = await localConn.query('SHOW TABLES');
      const tableList = tables.map(t => Object.values(t)[0]);

      for (const table of tableList) {
        console.log(`\n⏳ Memproses tabel: [${table}]`);

        // 1. Ambil Create Table dari local
        const [[createResult]] = await localConn.query(`SHOW CREATE TABLE \`${table}\``);
        let createSql = createResult['Create Table'];

        // Buat tabel di cloud
        await cloudConn.query(`DROP TABLE IF EXISTS \`${table}\``);
        await cloudConn.query(createSql);
        console.log(`  ✓ Struktur tabel [${table}] dibuat di Cloud`);

        // Jika tabel belum memiliki PRIMARY KEY (seperti query_actions di local), tambahkan primary key
        if (!createSql.toUpperCase().includes('PRIMARY KEY')) {
          const [cols] = await localConn.query(`SHOW COLUMNS FROM \`${table}\``);
          const idColObj = cols.find(c => c.Field.toLowerCase() === 'id' || c.Field.toLowerCase() === 'id_user');
          if (idColObj) {
            try {
              await cloudConn.query(`ALTER TABLE \`${table}\` ADD PRIMARY KEY (\`${idColObj.Field}\`);`);
              console.log(`  ✓ Menambahkan PRIMARY KEY pada kolom [${idColObj.Field}]`);
            } catch (pkErr) {
              // abaikan jika sudah ada
            }
          }
        }

        // 2. Ambil data dari local
        const [rows] = await localConn.query(`SELECT * FROM \`${table}\``);
        if (rows.length > 0) {
          const keys = Object.keys(rows[0]);
          const placeholders = keys.map(() => '?').join(', ');
          const columns = keys.map(k => `\`${k}\``).join(', ');
          const insertSql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;

          for (const row of rows) {
            const values = keys.map(k => row[k]);
            await cloudConn.query(insertSql, values);
          }
          console.log(`  ✓ Berhasil memindahkan ${rows.length} baris data ke Cloud!`);
        } else {
          console.log(`  - Tabel kosong (0 data).`);
        }
      }

      await localConn.end();
    } else {
      // Fallback: Gunakan file situtur(1).sql
      const sqlFile = path.join(__dirname, 'database', 'situtur(1).sql');
      console.log(`📄 Mengimpor langsung dari file: ${sqlFile}`);
      const sqlContent = fs.readFileSync(sqlFile, 'utf8');
      await cloudConn.query(sqlContent);
      console.log('✅ File SQL berhasil di-import ke Aiven Cloud!');
    }

    await cloudConn.query('SET FOREIGN_KEY_CHECKS = 1;');

    const [finalTables] = await cloudConn.query('SHOW TABLES');
    console.log('\n===========================================');
    console.log('🎉 SINKRONISASI SELESAI DENGAN SUKSES!');
    console.log('Tabel di database Aiven (situtur1):', finalTables.map(t => Object.values(t)[0]));
    console.log('===========================================\n');
  } catch (err) {
    console.error('❌ Terjadi error saat proses sinkronisasi:', err.message);
  } finally {
    if (cloudConn) await cloudConn.end();
  }
}

syncDirect();
