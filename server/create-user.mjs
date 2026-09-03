import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const [email, password] = process.argv.slice(2);
if (!email || !password) throw new Error('Usage: node server/create-user.mjs email password');

const pool = await mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'csua_intrams',
});
const hash = await bcrypt.hash(password, 12);
await pool.query(
  'INSERT INTO users (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)',
  [email.toLowerCase(), hash]
);
await pool.end();
console.log(`Created or updated ${email}`);