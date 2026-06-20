const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

async function openDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  })
}

async function initDb() {
  const db = await openDb()
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      grant_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(username, grant_id)
    )
  `)
  return db
}

module.exports = { openDb, initDb }
