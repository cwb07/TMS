import { isLoggedIn, isPl } from "../middlewares/authMiddleware.js"

import { createApp } from "../controllers/applicationController.js"
import express from "express"

const router = express.Router()

router.route("/").post(isLoggedIn, isPl, createApp)

export default router