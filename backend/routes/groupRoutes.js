import express from "express"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { isLoggedIn, isAdmin } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(getAllGroups).post(createGroup)

export default router
