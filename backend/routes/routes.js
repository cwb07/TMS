import { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile } from "../controllers/userController.js"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { isAdmin, isLoggedIn } from "../middlewares/authMiddleware.js"

import express from "express"

const router = express.Router()

// GET
router.route("/getUser").get(isLoggedIn, getUser)
router.route("/getAdmin").get(isLoggedIn, isAdmin, getUser)
router.route("/getAllUsers").get(isLoggedIn, isAdmin, getAllUsers)
router.route("/getAllGroups").get(isLoggedIn, isAdmin, getAllGroups)

// POST
router.route("/createUser").post(isLoggedIn, isAdmin, createUser)
router.route("/login").post(login)
router.route("/logout").post(isLoggedIn, logout)
router.route("/createGroup").post(isLoggedIn, isAdmin, createGroup)

// PUT
router.route("/editUser").put(isLoggedIn, isAdmin, editUser)
router.route("/updateProfile").put(isLoggedIn, updateProfile)

export default router
