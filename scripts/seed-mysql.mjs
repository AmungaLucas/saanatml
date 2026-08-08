import Database from 'better-sqlite3';
import mysql from 'mysql2/promise';

const SQLITE_PATH = './db/custom.db';
const MYSQL = {
  host: 'd7.my-control-panel.com',
  port: 3306,
  user: 'jobready_sanaa_admin',
  password: 'Admincyber',
  database: 'jobready_sanaa',
};

const sqlite = new Database(SQLITE_PATH, { readonly: true });
const conn = await mysql.createConnection(MYSQL);

async function migrateTable(table, columns, transform) {
  const rows = sqlite.prepare(`SELECT ${columns} FROM ${table}`).all();
  if (!rows.length) { console.log(`  ${table}: 0 rows`); return; }

  const data = rows.map(transform);
  const cols = Object.keys(data[0]);
  const placeholders = cols.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`;

  // Insert in batches of 50
  for (let i = 0; i < data.length; i += 50) {
    const batch = data.slice(i, i + 50);
    const values = batch.flatMap(r => cols.map(c => r[c]));
    await conn.query(sql, values);
  }
  console.log(`  ${table}: ${rows.length} rows migrated`);
}

console.log('Checking existing data...');
const [existing] = await conn.query('SELECT COUNT(*) as c FROM Category');
if (existing[0].c > 0) {
  console.log('MySQL already has data - skipping seed');
  process.exit(0);
}

console.log('Migrating data from SQLite to MySQL...');

await migrateTable('Category', 'id, name, slug, description, color, createdAt', r => ({
  ...r,
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
}));

await migrateTable('Author', 'id, name, slug, bio, avatar, role, createdAt', r => ({
  ...r,
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
}));

await migrateTable('Maker', 'id, name, slug, discipline, bio, avatar, location, website, instagram, twitter, isFeatured, createdAt, updatedAt', r => ({
  ...r,
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
  updatedAt: new Date(r.updatedAt).toISOString().slice(0, 19).replace('T', ' '),
}));

await migrateTable('Article', 'id, title, slug, excerpt, content, coverImage, categoryId, authorId, publishedAt, readTime, views, tags, isFeatured, isPinned, createdAt, updatedAt', r => ({
  ...r,
  publishedAt: new Date(r.publishedAt).toISOString().slice(0, 19).replace('T', ' '),
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
  updatedAt: new Date(r.updatedAt).toISOString().slice(0, 19).replace('T', ' '),
}));

await migrateTable('Event', 'id, title, description, date, endDate, venue, city, category, categoryId, imageUrl, ticketUrl, isFeatured, isPast, createdAt', r => ({
  ...r,
  date: new Date(r.date).toISOString().slice(0, 19).replace('T', ' '),
  endDate: r.endDate ? new Date(r.endDate).toISOString().slice(0, 19).replace('T', ' ') : null,
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
}));

await migrateTable('Comment', 'id, articleId, author, content, createdAt', r => ({
  ...r,
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
}));

await migrateTable('NewsletterSubscription', 'id, name, email, createdAt', r => ({
  ...r,
  createdAt: new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' '),
}));

console.log('Migration complete!');
sqlite.close();
await conn.end();
