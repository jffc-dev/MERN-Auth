import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db/connectDB.js'
import authRoutes from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

dotenv.config()
const app = express()
const port = process.env.PORT || 5000
const __dirname = path.resolve()

app.use(cors({origin: 'http://localhost:5173', credentials: true}))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)

if(process.env.NODE_ENV === 'production'){
    console.log(2)
    app.use(express.static(path.join(__dirname, '/frontend/dist')))
    app.get('*', (req, res)=>{
        console.log(1)
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

app.listen(port, ()=>{
    connectDB()
    console.log(`server is running on port: ${port}`);
    console.log(`server is running on mode: '${process.env.NODE_ENV}'`);
})
