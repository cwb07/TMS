import { checkUserAccess, isLoggedIn } from "../middlewares/authMiddleware.js"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile } from "../controllers/userController.js"
import { createApplication, getAllApplications, editApplication } from "../controllers/applicationController.js"

import express from "express"

const router = express.Router()

// admin
router.route("/getAllUsers").get(isLoggedIn, checkUserAccess("admin"), getAllUsers)
router.route("/createUser").post(isLoggedIn, checkUserAccess("admin"), createUser)
router.route("/createGroup").post(isLoggedIn, checkUserAccess("admin"), createGroup)
router.route("/editUser").put(isLoggedIn, checkUserAccess("admin"), editUser)

// user
router.route("/login").post(login)
router.route("/logout").post(isLoggedIn, logout)
router.route("/getUser").get(isLoggedIn, getUser)
router.route("/getAllGroups").get(isLoggedIn, getAllGroups)
router.route("/updateProfile").put(isLoggedIn, updateProfile)
router.route("/getAllApplications").get(isLoggedIn, getAllApplications)

// pl
router.route("/createApplication").post(isLoggedIn, checkUserAccess("pl"), createApplication)
router.route("/editApplication").post(isLoggedIn, checkUserAccess("pl"), editApplication)

export default router
