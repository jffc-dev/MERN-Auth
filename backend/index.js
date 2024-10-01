import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db/connectDB.js'
import authRoutes from './routes/auth.route.js'
import cookieParser from 'cookie-parser'

dotenv.config()
const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res)=> {
    res.send("Hello world1!")
})

app.use("/api/auth", authRoutes)

app.listen(3001, ()=>{
    connectDB()
    console.log(`server is running on port: ${port}`);
    
})
