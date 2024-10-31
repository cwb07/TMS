import express from "express"
import { login, logout, getAllUsers, addNewUser, editUser, getUser, updateProfile } from "../controllers/userController.js"
import { isLoggedIn } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(isLoggedIn, getUser).post(addNewUser).put(updateProfile)

router.route("/edit").put(editUser)

router.route("/all").get(getAllUsers)

router.route("/login").post(login)

router.route("/logout").post(logout)

export default router
