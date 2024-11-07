import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import routes from "./routes/routes.js"

dotenv.config()
const PORT = process.env.PORT

const app = express()

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    credentials: true
  })
)

app.use(express.json())
app.use(cookieParser())

app.use(routes)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
