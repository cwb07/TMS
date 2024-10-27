import express from "express"
import { getAllAccounts, addNewAccount, login, logout } from "../controllers/accountsController.js"
import { isLoggedIn } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.route("/")
    .get(isLoggedIn, getAllAccounts)
    .post(isLoggedIn, addNewAccount)

router.route("/login")
    .post(login)

router.route("/logout")
    .post(isLoggedIn, logout)

export default router