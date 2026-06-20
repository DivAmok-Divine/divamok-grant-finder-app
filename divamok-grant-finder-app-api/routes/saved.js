const express = require('express')
const { openDb } = require('../database')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Every saved-grants route requires a valid token; items are scoped to the user.
router.use(authenticateToken)

// List the signed-in user's saved grants (newest first).
router.get('/', async (req, res) => {
  try {
    const db = await openDb()
    const rows = await db.all(
      'SELECT payload FROM saved_grants WHERE username = ? ORDER BY created_at DESC',
      [req.user.username],
    )
    res.json(rows.map((r) => JSON.parse(r.payload)))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

// Save a grant (stores the whole match snapshot). Idempotent per (user, grant).
router.post('/', async (req, res) => {
  const match = req.body && req.body.match
  const grantId = match && match.grant && match.grant.id
  if (!grantId) return res.status(400).json({ error: 'Invalid item' })

  try {
    const db = await openDb()
    await db.run(
      'INSERT OR IGNORE INTO saved_grants (username, grant_id, payload) VALUES (?, ?, ?)',
      [req.user.username, grantId, JSON.stringify(match)],
    )
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

// Remove a saved grant.
router.delete('/:grantId', async (req, res) => {
  try {
    const db = await openDb()
    await db.run('DELETE FROM saved_grants WHERE username = ? AND grant_id = ?', [
      req.user.username,
      req.params.grantId,
    ])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

module.exports = router
