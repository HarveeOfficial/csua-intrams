import cors from 'cors';
import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';

const app = express();
const port = Number(process.env.API_PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || 'change-this-local-secret';
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'csua_intrams',
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { next(error); }
});

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch { res.status(401).json({ message: 'Session expired. Please log in again.' }); }
};

const parseJson = (value, fallback) => {
  if (value == null) return fallback;
  return typeof value === 'string' ? JSON.parse(value) : value;
};

const collegeRow = (row) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  photo_url: row.photo_url || undefined,
  events: parseJson(row.events, {}),
});

const scheduleRow = (row) => ({
  id: row.id,
  sport: row.sport,
  category: row.category,
  event: row.event,
  game: row.game,
  teams: parseJson(row.teams, []),
  type: row.type,
  winner: row.winner,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

app.get('/api/colleges', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM colleges ORDER BY name');
    res.json(rows.map(collegeRow));
  } catch (error) { next(error); }
});

app.post('/api/colleges', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.body.id || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim();
    const color = String(req.body.color || '#475569').trim();
    const photoUrl = String(req.body.photo_url || '').trim() || null;
    if (!/^[a-z0-9_-]+$/.test(id) || !name) {
      return res.status(400).json({ message: 'A valid id and college name are required.' });
    }
    await pool.query(
      'INSERT INTO colleges (id, name, color, photo_url, events) VALUES (?, ?, ?, ?, ?)',
      [id, name, color, photoUrl, JSON.stringify(req.body.events || {})]
    );
    const [rows] = await pool.query('SELECT * FROM colleges WHERE id = ?', [id]);
    res.status(201).json(collegeRow(rows[0]));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That college id already exists.' });
    next(error);
  }
});

app.get('/api/colleges/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM colleges WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'College not found' });
    res.json(collegeRow(rows[0]));
  } catch (error) { next(error); }
});

app.patch('/api/colleges/:id', requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE colleges SET events = ? WHERE id = ?',
      [JSON.stringify(req.body.events || {}), req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'College not found' });
    const [rows] = await pool.query('SELECT * FROM colleges WHERE id = ?', [req.params.id]);
    res.json(collegeRow(rows[0]));
  } catch (error) { next(error); }
});

app.get('/api/schedule', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM schedule ORDER BY sport, category, event, game'
    );
    res.json(rows.map(scheduleRow));
  } catch (error) { next(error); }
});

app.post('/api/schedule', requireAuth, async (req, res, next) => {
  try {
    const { sport, category, event, game, teams, type, winner = null, createdAt = Date.now() } = req.body;
    const id = randomUUID();
    await pool.query(
      'INSERT INTO schedule (id, sport, category, event, game, teams, type, winner, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, sport, category || '-', event || null, game, JSON.stringify(teams || []), type, winner, createdAt]
    );
    const [rows] = await pool.query('SELECT * FROM schedule WHERE id = ?', [id]);
    res.status(201).json(scheduleRow(rows[0]));
  } catch (error) { next(error); }
});

app.patch('/api/schedule/:id', requireAuth, async (req, res, next) => {
  try {
    const updatedAt = Date.now();
    const [result] = await pool.query(
      'UPDATE schedule SET winner = ?, updated_at = ? WHERE id = ?',
      [req.body.winner || null, updatedAt, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Schedule entry not found' });
    const [rows] = await pool.query('SELECT * FROM schedule WHERE id = ?', [req.params.id]);
    res.json(scheduleRow(rows[0]));
  } catch (error) { next(error); }
});

app.delete('/api/schedule/:id', requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM schedule WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Schedule entry not found' });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Database request failed' });
});

app.listen(port, () => console.log(`MySQL API listening on http://localhost:${port}`));