import express from "express"
import { getAllAccounts, addNewAccount } from "../controllers/accountsController.js"

const router = express.Router()
router.route("/").get(getAllAccounts).post(addNewAccount)

export default router
