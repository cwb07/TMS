import express from "express"
import { addNewGroup } from "../controllers/groupController.js"

const router = express.Router()

router.route("/").post(addNewGroup)

export default router
