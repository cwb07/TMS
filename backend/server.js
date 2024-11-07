import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import routes from "./routes/routes.js"

// load environment variables
dotenv.config()
const PORT = process.env.PORT

const app = express()

// requests from frontend origin are permitted
// allow cookies to be sent from frontend

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true
  })
)

// middleware parses the JSON data and makes it accessible through the req.body
app.use(express.json())

// cookie parser middleware, allow to access req.cookies
app.use(cookieParser())

// routes
app.use(routes)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
