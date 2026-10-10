import db from '../backend/config/db.js';

async function run() {
  try {
    const [rows] = await db.query('SELECT user_id, name, email, password_hash, role, status FROM users WHERE email LIKE "%supervisor%" OR email LIKE "%worker%" OR email LIKE "%admin%"');
    console.log('--- USERS IN MYSQL ---');
    console.table(rows);
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
