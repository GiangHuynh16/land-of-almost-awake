import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { kingdomsRouter } from './routes/kingdoms.js'
import { achievementsRouter } from './routes/achievements.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)
app.use('/kingdoms', kingdomsRouter)
app.use('/achievements', achievementsRouter)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`)
})
