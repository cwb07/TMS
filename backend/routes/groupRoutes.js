import express from "express"
import { addNewGroup, getAllGroups } from "../controllers/groupController.js"

const router = express.Router()

router.route("/").get(getAllGroups).post(addNewGroup)

export default router
