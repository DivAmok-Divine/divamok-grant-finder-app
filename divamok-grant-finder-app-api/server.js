const express = require('express')
const cors = require('cors')
const { initDb } = require('./database')
const authRoutes = require('./routes/auth')
const savedRoutes = require('./routes/saved')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/saved', savedRoutes)

const PORT = process.env.PORT || 3000

initDb().then(() => {
  console.log('Database initialized')
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
  })
}).catch(console.error)
