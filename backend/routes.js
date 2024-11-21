import { CreateTask, GetTaskbyState, PromoteTask2Done } from "./controller.js"

import express from "express"

const router = express.Router()

router.route("/GetTaskbyState").post(GetTaskbyState)
router.route("/CreateTask").post(CreateTask)
router.route("/PromoteTask2Done").put(PromoteTask2Done)

export default router
