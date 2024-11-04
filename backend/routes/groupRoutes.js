import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { isAdmin, isLoggedIn } from "../middlewares/authMiddleware.js"

import express from "express"

const router = express.Router()

router.route("/").get(isLoggedIn, isAdmin, getAllGroups).post(isLoggedIn, isAdmin, createGroup)

export default router
