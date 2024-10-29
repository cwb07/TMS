import express from "express"
import { login, logout, getAllUsers, addNewUser } from "../controllers/userController.js"
import { isLoggedIn } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(isLoggedIn, getAllUsers).post(addNewUser)

router.route("/login").post(login)

router.route("/logout").post(logout)

export default router
