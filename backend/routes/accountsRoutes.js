import express from "express"
import { getAllAccounts, addNewAccount, login, logout } from "../controllers/accountsController.js"
import { isLoggedIn } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/").get(isLoggedIn, getAllAccounts).post(addNewAccount)

router.route("/login").post(login)

router.route("/logout").post(logout)

export default router
