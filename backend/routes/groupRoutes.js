import express from "express"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { isLoggedIn, isAdmin } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(isLoggedIn, isAdmin, getAllGroups).post(isLoggedIn, isAdmin, createGroup)

export default router
