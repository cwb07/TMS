import express from "express"
import { addNewGroup, getAllGroups } from "../controllers/groupController.js"
import { isLoggedIn, isAdmin } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(isLoggedIn, isAdmin, getAllGroups).post(isLoggedIn, isAdmin, addNewGroup)

export default router
