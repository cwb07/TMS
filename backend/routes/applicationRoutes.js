import { createApp, getAllApp } from "../controllers/applicationController.js"
import { isLoggedIn, isPl } from "../middlewares/authMiddleware.js"

import express from "express"

const router = express.Router()

router.route("/").post(isLoggedIn, isPl, createApp)
router.route('/all').get(isLoggedIn, isPl, getAllApp)

export default router