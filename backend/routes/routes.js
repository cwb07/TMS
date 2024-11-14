import { checkUserAccess, isLoggedIn } from "../middlewares/authMiddleware.js"
import { createGroup, getAllGroups } from "../controllers/groupController.js"
import { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile } from "../controllers/userController.js"
import { createApplication, getAllApplications, editApplication } from "../controllers/applicationController.js"
import { createPlan, getAllPlansInApp } from "../controllers/planController.js"
import { createTask, getAllTasksInApp, saveTask, promoteTask2Todo, promoteTask2Doing, demoteTask2Todo, promoteTask2Done, demoteTask2Doing, promoteTask2Closed } from "../controllers/taskController.js"

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

// pl
router.route("/createApplication").post(isLoggedIn, checkUserAccess("pl"), createApplication)
router.route("/editApplication").post(isLoggedIn, checkUserAccess("pl"), editApplication)

// pm
router.route("/createPlan").post(isLoggedIn, checkUserAccess("pm"), createPlan)

// to check user rights later
router.route("/createTask").post(isLoggedIn, createTask)
router.route("/getAllTasksInApp").post(isLoggedIn, getAllTasksInApp)
router.route("/saveTask").post(isLoggedIn, saveTask)
router.route("/promoteTask2Todo").post(isLoggedIn, promoteTask2Todo)
router.route("/promoteTask2Doing").post(isLoggedIn, promoteTask2Doing)
router.route("/demoteTask2Todo").post(isLoggedIn, demoteTask2Todo)
router.route("/promoteTask2Done").post(isLoggedIn, promoteTask2Done)
router.route("/demoteTask2Doing").post(isLoggedIn, demoteTask2Doing)
router.route("/promoteTask2Closed").post(isLoggedIn, promoteTask2Closed)

export default router
