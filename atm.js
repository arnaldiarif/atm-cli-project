const inquirer = require('inquirer');
const db = require('./db');

let loggedInUser = null;

async function register() {
  const { name, pin } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Masukkan nama:' },
    { type: 'password', name: 'pin', message: 'Buat PIN (4 digit):', mask: '*' }
  ]);

  const [result] = await db.execute(
    'INSERT INTO accounts (name, pin, balance, created_at) VALUES (?, ?, ?, NOW())',
    [name, pin, 0]
  );

  await db.execute('INSERT INTO accounts (name, pin) VALUES (?, ?)', [name, pin]);
  console.log(`Akun berhasil dibuat untuk ${name}.`);
  console.log(`Nomor akun Anda: ${result.insertId}`);
}

async function login() {
  if (loggedInUser) {
    console.log(`Sudah login sebagai ${loggedInUser.name}`);
    return;
  }
  const { id, pin } = await inquirer.prompt([
    { type: 'input', name: 'id', message: 'Masukkan nomor akun:' },
    { type: 'password', name: 'pin', message: 'Masukkan PIN:', mask: '*' }
  ]);

  const [rows] = await db.execute('SELECT * FROM accounts WHERE id = ? AND pin = ?', [id, pin]);
  if (rows.length === 0) {
    console.log('Nomor akun atau PIN salah.');
  } else {
    loggedInUser = rows[0];
    console.log(`Login berhasil, selamat datang ${loggedInUser.name}`);
  }
}

async function checkBalance() {
  if (!loggedInUser) {
    console.log('Anda harus login dulu.');
    return;
  }
  const [rows] = await db.execute('SELECT balance FROM accounts WHERE id = ?', [loggedInUser.id]);
  const balance = Number(rows[0].balance); 
  console.log(`Saldo Anda saat ini: Rp${balance.toFixed(2)}`);
}

async function deposit() {
  if (!loggedInUser) {
    console.log('Anda harus login dulu.');
    return;
  }
  const { amount } = await inquirer.prompt([
    { type: 'input', name: 'amount', message: 'Masukkan jumlah setor:', validate: input => !isNaN(input) && Number(input) > 0 }
  ]);
  const amt = parseFloat(amount);

  await db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amt, loggedInUser.id]);
  await db.execute('INSERT INTO transactions (account_id, type, amount) VALUES (?, "deposit", ?)', [loggedInUser.id, amt]);

  console.log(`Berhasil setor Rp${amt.toFixed(2)}`);
}

async function withdraw() {
  if (!loggedInUser) {
    console.log('Anda harus login dulu.');
    return;
  }
  const { amount } = await inquirer.prompt([
    { type: 'input', name: 'amount', message: 'Masukkan jumlah tarik:', validate: input => !isNaN(input) && Number(input) > 0 }
  ]);
  const amt = parseFloat(amount);

  const [rows] = await db.execute('SELECT balance FROM accounts WHERE id = ?', [loggedInUser.id]);
  if (rows[0].balance < amt) {
    console.log('Saldo tidak cukup.');
    return;
  }

  await db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amt, loggedInUser.id]);
  await db.execute('INSERT INTO transactions (account_id, type, amount) VALUES (?, "withdraw", ?)', [loggedInUser.id, amt]);

  console.log(`Berhasil tarik Rp${amt.toFixed(2)}`);
}

async function transfer() {
  if (!loggedInUser) {
    console.log('Anda harus login dulu.');
    return;
  }

  const { targetId, amount } = await inquirer.prompt([
    { type: 'input', name: 'targetId', message: 'Masukkan nomor akun tujuan:' },
    { type: 'input', name: 'amount', message: 'Masukkan jumlah transfer:', validate: input => !isNaN(input) && Number(input) > 0 }
  ]);

  if (targetId == loggedInUser.id) {
    console.log('Tidak bisa transfer ke akun sendiri.');
    return;
  }

  const amt = parseFloat(amount);

  const [rows] = await db.execute('SELECT balance FROM accounts WHERE id = ?', [loggedInUser.id]);
  if (rows[0].balance < amt) {
    console.log('Saldo tidak cukup.');
    return;
  }

  const [targetRows] = await db.execute('SELECT * FROM accounts WHERE id = ?', [targetId]);
  if (targetRows.length === 0) {
    console.log('Akun tujuan tidak ditemukan.');
    return;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amt, loggedInUser.id]);
    await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amt, targetId]);

    await conn.execute('INSERT INTO transactions (account_id, type, amount, target_id) VALUES (?, "transfer_out", ?, ?)', [loggedInUser.id, amt, targetId]);
    await conn.execute('INSERT INTO transactions (account_id, type, amount, target_id) VALUES (?, "transfer_in", ?, ?)', [targetId, amt, loggedInUser.id]);

    await conn.commit();
    console.log(`Transfer Rp${amt.toFixed(2)} ke akun ${targetId} berhasil.`);
  } catch (err) {
    await conn.rollback();
    console.error('Transfer gagal:', err.message);
  } finally {
    conn.release();
  }
}

async function showTransactionHistory() {
  if (!loggedInUser) {
    console.log('Anda harus login dulu.');
    return;
  }

  const [rows] = await db.execute(
    `SELECT type, amount, target_id, created_at FROM transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT 10`,
    [loggedInUser.id]
  );

  if (rows.length === 0) {
    console.log('Belum ada histori transaksi.');
    return;
  }

  console.log('Histori Transaksi Terakhir:');
  rows.forEach(tx => {
    let info = '';
    const amount = Number(tx.amount);
        switch (tx.type) {
    case 'deposit': info = `Setor Rp${amount.toFixed(2)}`; break;
    case 'withdraw': info = `Tarik Rp${amount.toFixed(2)}`; break;
    case 'transfer_out': info = `Transfer Rp${amount.toFixed(2)} ke akun ${tx.target_id}`; break;
    case 'transfer_in': info = `Diterima Rp${amount.toFixed(2)} dari akun ${tx.target_id}`; break;
}

    console.log(`${tx.created_at.toISOString()} - ${info}`);
  });
}

async function mainMenu() {
  while (true) {
    const { choice } = await inquirer.prompt({
      type: 'list',
      name: 'choice',
      message: 'Pilih menu:',
      choices: [
        'register',
        'login',
        'check-balance',
        'deposit',
        'withdraw',
        'transfer',
        'histori-transaksi',
        'logout',
        'keluar'
      ]
    });

    switch (choice) {
      case 'register': await register(); break;
      case 'login': await login(); break;
      case 'check-balance': await checkBalance(); break;
      case 'deposit': await deposit(); break;
      case 'withdraw': await withdraw(); break;
      case 'transfer': await transfer(); break;
      case 'histori-transaksi': await showTransactionHistory(); break;
      case 'logout':
        loggedInUser = null;
        console.log('Logout berhasil.');
        break;
      case 'keluar':
        console.log('Terima kasih sudah menggunakan ATM CLI!');
        process.exit(0);
    }
    console.log('\n');
  }
}

mainMenu();
