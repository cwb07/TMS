import MsgCode from "./constants.js"
import dotenv from "dotenv"
import express from "express"
import routes from "./routes.js"

dotenv.config()
const PORT = process.env.PORT

const app = express()

app.use(express.json())

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        res.json({ MsgCode: MsgCode.INTERNAL_ERROR })
    }
});

app.use(routes)
app.use((req, res) => {
    res.json({ MsgCode: MsgCode.INVALID_URL })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
