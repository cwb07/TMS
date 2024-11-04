import { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile } from "../controllers/userController.js"
import { isAdmin, isLoggedIn } from "../middlewares/authMiddleware.js"

import express from "express"

const router = express.Router()

router.route("/").get(isLoggedIn, getUser).post(isLoggedIn, isAdmin, createUser).put(isLoggedIn, updateProfile)
router.route("/admin").get(isLoggedIn, isAdmin, getUser)

router.route("/edit").put(isLoggedIn, isAdmin, editUser)

router.route("/all").get(isLoggedIn, isAdmin, getAllUsers)

router.route("/login").post(login)

router.route("/logout").post(isLoggedIn, logout)

export default router
