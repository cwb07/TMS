import express from "express"
import { getAllAccounts, addNewAccount, login } from "../controllers/accountsController.js"

const router = express.Router()
router.route("/").get(getAllAccounts).post(addNewAccount)
router.route("/auth").post(login)

export default router
