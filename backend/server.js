import express from "express"
import dotenv from "dotenv"
import accountsRoutes from "./routes/accountsRoutes.js"
import cookieParser from "cookie-parser"

// load environment variables
dotenv.config()
const PORT = process.env.PORT

const app = express()

// middleware parses the JSON data and makes it accessible through the req.body
app.use(express.json())

// cookie parser middleware, allow to access req.cookies
app.use(cookieParser())

// routes
app.use("/accounts", accountsRoutes)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
