import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { sanitizeMiddleware } from './middlewares/sanitize'
import rateLimit from 'express-rate-limit'

const { PORT = 3000 } = process.env
const app = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})

app.use(limiter)
app.use(cookieParser())

app.use(cors({
    origin: process.env.ORIGIN_ALLOW || 'http://localhost:5173',
    credentials: true
}))
// app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(sanitizeMiddleware)

app.options('*', cors())
app.use((req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }
    
    const origin = req.get('origin') || req.get('referer') || '';
    
    if (origin && !origin.includes('localhost')) {
        return res.status(403).json({ message: 'CSRF attack detected' });
    }
    
    next();
});
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
