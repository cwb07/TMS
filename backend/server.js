import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import groupRoutes from "./routes/groupRoutes.js"
import cookieParser from "cookie-parser"
import cors from "cors"

// load environment variables
dotenv.config()
const PORT = process.env.PORT

const app = express()

// requests from frontend origin are permitted
app.use(
  cors({
    origin: "http://localhost:5173"
  })
)

// middleware parses the JSON data and makes it accessible through the req.body
app.use(express.json())

// cookie parser middleware, allow to access req.cookies
app.use(cookieParser())

// routes
app.use("/user", userRoutes)
app.use("/group", groupRoutes)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
