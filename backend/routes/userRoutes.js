import express from "express"
import { login, logout, getAllUsers, addNewUser, editUser } from "../controllers/userController.js"
import { isLoggedIn } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(getAllUsers).post(addNewUser).put(editUser)

router.route("/login").post(login)

router.route("/logout").post(logout)

export default router
