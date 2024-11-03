import express from "express"
import { login, logout, getAllUsers, createUser, editUser, getUser, updateProfile } from "../controllers/userController.js"
import { isLoggedIn, isAdmin } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(isLoggedIn, getUser).post(createUser).put(isLoggedIn, updateProfile)

router.route("/edit").put(isLoggedIn, isAdmin, editUser)

router.route("/all").get(isLoggedIn, isAdmin, getAllUsers)

router.route("/login").post(login)

router.route("/logout").post(isLoggedIn, logout)

export default router
