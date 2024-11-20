import { checkTaskStatePermit, checkUserAccess, isLoggedIn } from "../middlewares/authMiddleware.js"
import { createApplication, editApplication, getAllApplications, getAppPermissions } from "../controllers/applicationController.js"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { createPlan, getAllPlansInApp } from "../controllers/planController.js"
import { createTask, demoteTask, getTaskbyState, promoteTask, promoteTask2Done, saveTask } from "../controllers/taskController.js"
import { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile } from "../controllers/userController.js"

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
router.route("/getAllPlansInApp").post(isLoggedIn, getAllPlansInApp)
router.route("/getAppPermissions").post(isLoggedIn, getAppPermissions)
router.route("/getTaskbyState").post(isLoggedIn, getTaskbyState)

// pl
router.route("/createApplication").post(isLoggedIn, checkUserAccess("pl"), createApplication)
router.route("/editApplication").post(isLoggedIn, checkUserAccess("pl"), editApplication)

// pm
router.route("/createPlan").post(isLoggedIn, checkUserAccess("pm"), createPlan)

// task based access for each app
router.route("/createTask").post(isLoggedIn, checkTaskStatePermit, createTask)
router.route("/saveTask").post(isLoggedIn, checkTaskStatePermit, saveTask)
router.route("/promoteTask").post(isLoggedIn, checkTaskStatePermit, promoteTask)
router.route("/promoteTask2Done").post(isLoggedIn, checkTaskStatePermit, promoteTask2Done)
router.route("/demoteTask").post(isLoggedIn, checkTaskStatePermit, demoteTask)

export default router
