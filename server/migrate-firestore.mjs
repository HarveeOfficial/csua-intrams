import fs from 'node:fs';
import admin from 'firebase-admin';
import mysql from 'mysql2/promise';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './service-account.json';
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Missing Firebase service account: ${serviceAccountPath}`);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
});

const firestore = admin.firestore();
const pool = await mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'csua_intrams',
});

const colleges = await firestore.collection('colleges-new').get();
for (const document of colleges.docs) {
  const data = document.data();
  await pool.query(
    `INSERT INTO colleges (id, name, color, photo_url, events)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name), color = VALUES(color),
     photo_url = VALUES(photo_url), events = VALUES(events)`,
    [document.id, data.name || document.id, data.color || '', data.photo_url || null,
      JSON.stringify(data.events || {})]
  );
}

const schedule = await firestore.collection('schedule').get();
for (const document of schedule.docs) {
  const data = document.data();
  await pool.query(
    `INSERT INTO schedule (id, sport, category, event, game, teams, type, winner, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE sport = VALUES(sport), category = VALUES(category),
     event = VALUES(event), game = VALUES(game), teams = VALUES(teams), type = VALUES(type),
     winner = VALUES(winner), created_at = VALUES(created_at), updated_at = VALUES(updated_at)`,
    [document.id, data.sport || '', data.category || '-', data.event || null, data.game || 0,
      JSON.stringify(data.teams || []), data.type || 'h2h', data.winner || null,
      data.createdAt || Date.now(), data.updatedAt || null]
  );
}

await pool.end();
console.log(`Migrated ${colleges.size} colleges and ${schedule.size} schedule entries.`);