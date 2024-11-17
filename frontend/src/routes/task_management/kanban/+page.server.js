import { error, redirect } from "@sveltejs/kit"

import axios from "axios"

export const load = async ({ request, locals }) => {
  const appName = locals.app
  let defaultColor = "#6C757D"

  if (!appName) {
    redirect(302, "/task_management")
  }

  try {
    const response = await axios.get(`http://localhost:3000/getUser`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const planResponse = await axios.post(`http://localhost:3000/getAllPlansInApp`, { plan_app_acronym: appName }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const taskResponse = await axios.post(`http://localhost:3000/getAllTasksInApp`, { task_app_acronym: appName }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const appResponse = await axios.post(`http://localhost:3000/getAppPermissions`, { app_acronym: appName }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

    if (response.data.success && planResponse.data.success && taskResponse.data.success && appResponse.data.success) {
      const plansList = planResponse.data.data

      for (let state in taskResponse.data.data) {
        let tasksList = taskResponse.data.data[state].map(task => ({ ...task, task_color: plansList.find(plan => plan.plan_mvp_name === task.task_plan)?.plan_color || defaultColor }))
        taskResponse.data.data[state] = tasksList
      }

      return {
        username: response.data.data.username,
        isPM: response.data.data.isPM,
        isAdmin: response.data.data.isAdmin,
        plansList: planResponse.data.data,
        tasksList: taskResponse.data.data,
        permissionsList: appResponse.data.data,
        appname: appName
      }
    }
  } catch (err) {
    if (err.response.status === 401) {
      error(401, { message: err.response.data.message, redirectToLogin: true })
    } else {
      error(500, { message: "Internal server error" })
    }
  }
}

export const actions = {
  createPlan: async ({ request }) => {
    const form = await request.formData()

    const plan_app_acronym = form.get("appname")
    const plan_mvp_name = form.get("planname")
    const plan_startdate = form.get("startdate")
    const plan_enddate = form.get("enddate")
    const plan_color = form.get("color")

    try {
      const response = await axios.post(`http://localhost:3000/createPlan`, { plan_mvp_name, plan_app_acronym, plan_startdate, plan_enddate, plan_color }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { successMessage: response.data.message, resetCreatePlanForm: true }
      } else {
        return { successMessage: "", errorMessage: response.data.message }
      }
    } catch (err) {
      if (err.response.status === 401) {
        error(401, { message: err.response.data.message, redirectToLogin: true })
      } else if (err.response.status === 403) {
        error(403, { message: err.response.data.message, redirectToTMS: true })
      } else {
        error(500, { message: "Internal server error" })
      }
    }
  },
  createTask: async ({ request }) => {
    const form = await request.formData()

    const task_app_acronym = form.get("appname")
    const task_creator = form.get("creator")
    const task_createdate = new Date(form.get("creationdate")).toLocaleDateString("en-ca")
    const task_name = form.get("taskname")
    const task_owner = form.get("owner")
    const task_description = form.get("description")
    const task_plan = form.get("taskplan")

    try {
      const response = await axios.post(`http://localhost:3000/createTask`, { task_name, task_plan, task_app_acronym, task_description, task_creator, task_owner, task_createdate }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { successMessage: response.data.message, resetCreateTaskForm: true }
      } else {
        return { successMessage: "", errorMessage: response.data.message }
      }
    } catch (err) {
      if (err.response.status === 401) {
        error(401, { message: err.response.data.message, redirectToLogin: true })
      } else if (err.response.status === 403 && err.response.data.reload) {
        error(403, { message: err.response.data.message, reload: true })
      } else if (err.response.status === 403) {
        error(403, { message: err.response.data.message, redirectToTMS: true })
      } else {
        error(500, { message: "Internal server error" })
      }
    }
  },
  saveTask: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("tasknotes")
    const enterLog = form.get("enterlog")
    const task_state = form.get("taskstate")
    const task_app_acronym = form.get("appname")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_app_acronym, task_id, task_plan, task_notes, enterLog, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { taskSuccessMessage: response.data.message, resetSaveTaskForm: true, newNotes: response.data.newNotes }
      } else {
        return { successMessage: "", errorMessage: response.data.message }
      }
    } catch (err) {
      if (err.response.status === 401) {
        error(401, { message: err.response.data.message, redirectToLogin: true })
      } else if (err.response.status === 403 && err.response.data.reload) {
        error(403, { message: err.response.data.message, reload: true })
      } else if (err.response.status === 403) {
        error(403, { message: err.response.data.message, redirectToTMS: true })
      } else {
        error(500, { message: "Internal server error" })
      }
    }
  },
  promoteTask: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("tasknotes")
    const enterLog = form.get("enterlog")
    const task_state = form.get("taskstate")
    const task_app_acronym = form.get("appname")

    try {
      const response = await axios.post(`http://localhost:3000/promoteTask`, { task_app_acronym, task_id, task_plan, task_notes, enterLog, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { taskSuccessMessage: response.data.message, resetPromoteTaskForm: true, newNotes: response.data.newNotes }
      } else {
        return { successMessage: "", errorMessage: response.data.message }
      }
    } catch (err) {
      if (err.response.status === 401) {
        error(401, { message: err.response.data.message, redirectToLogin: true })
      } else if (err.response.status === 403 && err.response.data.reload) {
        error(403, { message: err.response.data.message, reload: true })
      } else if (err.response.status === 403) {
        error(403, { message: err.response.data.message, redirectToTMS: true })
      } else {
        error(500, { message: "Internal server error" })
      }
    }
  },
  promoteTask2Done: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("tasknotes")
    const enterLog = form.get("enterlog")
    const task_state = form.get("taskstate")
    const task_app_acronym = form.get("appname")

    try {
      const response = await axios.post(`http://localhost:3000/promoteTask2Done`, { task_app_acronym, task_id, task_plan, task_notes, enterLog, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { taskSuccessMessage: response.data.message, resetPromoteTaskForm: true, newNotes: response.data.newNotes }
      } else {
        return { successMessage: "", errorMessage: response.data.message }
      }
    } catch (err) {
      if (err.response.status === 401) {
        error(401, { message: err.response.data.message, redirectToLogin: true })
      } else if (err.response.status === 403 && err.response.data.reload) {
        error(403, { message: err.response.data.message, reload: true })
      } else if (err.response.status === 403) {
        error(403, { message: err.response.data.message, redirectToTMS: true })
      } else {
        error(500, { message: "Internal server error" })
      }
    }
  },
  demoteTask: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("tasknotes")
    const enterLog = form.get("enterlog")
    const task_state = form.get("taskstate")
    const task_owner = form.get("owner")
    const task_app_acronym = form.get("appname")

    try {
      const response = await axios.post(`http://localhost:3000/demoteTask`, { task_app_acronym, task_id, task_plan, task_notes, enterLog, task_state, task_owner }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { taskSuccessMessage: response.data.message, resetDemoteTaskForm: true, newNotes: response.data.newNotes, newOwner: response.data.newOwner }
      } else {
        return { successMessage: "", errorMessage: response.data.message }
      }
    } catch (err) {
      if (err.response.status === 401) {
        error(401, { message: err.response.data.message, redirectToLogin: true })
      } else if (err.response.status === 403 && err.response.data.reload) {
        error(403, { message: err.response.data.message, reload: true })
      } else if (err.response.status === 403) {
        error(403, { message: err.response.data.message, redirectToTMS: true })
      } else {
        error(500, { message: "Internal server error" })
      }
    }
  }
}
