const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key'

// Verifies the Bearer token and puts { username } on req.user.
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

module.exports = { authenticateToken, JWT_SECRET }
