import { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile } from "../controllers/userController.js"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { checkUserAccess, isLoggedIn } from "../middlewares/authMiddleware.js"

import express from "express"

const router = express.Router()

// GET
router.route("/getUser").get(isLoggedIn, getUser)
router.route("/getAllUsers").get(isLoggedIn, checkUserAccess(["admin"]), getAllUsers)
router.route("/getAllGroups").get(isLoggedIn, checkUserAccess(["admin"]), getAllGroups)

// POST
router.route("/createUser").post(isLoggedIn, checkUserAccess(["admin"]), createUser)
router.route("/login").post(login)
router.route("/logout").post(isLoggedIn, logout)
router.route("/createGroup").post(isLoggedIn, checkUserAccess(["admin"]), createGroup)

// PUT
router.route("/editUser").put(isLoggedIn, checkUserAccess(["admin"]), editUser)
router.route("/updateProfile").put(isLoggedIn, updateProfile)

export default router
