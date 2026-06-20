const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { openDb } = require('../database')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key'

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Session expired' })
    req.user = user
    next()
  })
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })
  
  try {
    const db = await openDb()
    const existing = await db.get('SELECT id FROM users WHERE username = ?', [username])
    if (existing) return res.status(409).json({ error: 'Username already exists' })

    const hash = await bcrypt.hash(password, 10)
    await db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash])
    
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token, username })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })

  try {
    const db = await openDb()
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username])
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' })
    res.json({ token, username: user.username })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

router.put('/password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Required fields missing' })

  try {
    const db = await openDb()
    const user = await db.get('SELECT * FROM users WHERE username = ?', [req.user.username])
    
    const match = await bcrypt.compare(oldPassword, user.password_hash)
    if (!match) return res.status(401).json({ error: 'Invalid current password' })

    const hash = await bcrypt.hash(newPassword, 10)
    await db.run('UPDATE users SET password_hash = ? WHERE username = ?', [hash, req.user.username])
    
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const db = await openDb()
    await db.run('DELETE FROM users WHERE username = ?', [req.user.username])
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Database error' })
  }
})

module.exports = router
