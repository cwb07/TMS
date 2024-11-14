import axios from "axios"
import { error } from "@sveltejs/kit"
import { redirect } from "@sveltejs/kit"

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

    if (response.data.success && planResponse.data.success && taskResponse.data.success) {
      const plansList = planResponse.data.data

      for (let state in taskResponse.data.data) {
        let tasksList = taskResponse.data.data[state].map(task => ({
          ...task,
          task_color: plansList.find(plan => plan.plan_mvp_name === task.task_plan)?.plan_color || defaultColor
        }))

        taskResponse.data.data[state] = tasksList
      }

      return {
        username: response.data.data.username,
        isPM: response.data.data.isPM,
        isPL: response.data.data.isPL,
        isAdmin: response.data.data.isAdmin,
        plansList: planResponse.data.data,
        tasksList: taskResponse.data.data,
        appname: appName
      }
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
}

export const actions = {
  createPlan: async ({ request }) => {
    const form = await request.formData()

    const plan_mvp_name = form.get("planname")
    const plan_app_acronym = form.get("appname")
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

    const task_plan = form.get("taskplan")
    const task_app_acronym = form.get("appname")
    const task_name = form.get("taskname")
    const task_description = form.get("description")
    const task_creator = form.get("creator")
    const task_owner = form.get("owner")
    const task_createdate = new Date(form.get("creationdate")).toLocaleDateString("en-ca")

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
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { taskSuccessMessage: response.data.message, resetSaveTaskForm: true, notes: response.data.notes, plan: response.data.plan }
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
  promoteTask2Todo: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const promoteResponse = await axios.post(`http://localhost:3000/promoteTask2Todo`, { task_id, username }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success && promoteResponse.data.success) {
        return { successMessage: promoteResponse.data.message, resetSaveTaskForm: true, resetPromoteTask2TodoForm: true, notes: promoteResponse.data.notes, plan: response.data.plan }
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
  promoteTask2Doing: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const promoteResponse = await axios.post(`http://localhost:3000/promoteTask2Doing`, { task_id, username }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success && promoteResponse.data.success) {
        return { successMessage: promoteResponse.data.message, resetSaveTaskForm: true, resetPromoteTask2DoingForm: true, notes: promoteResponse.data.notes, plan: response.data.plan }
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
  demoteTask2Todo: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const demoteResponse = await axios.post(`http://localhost:3000/demoteTask2Todo`, { task_id, username }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success && demoteResponse.data.success) {
        return { successMessage: demoteResponse.data.message, resetSaveTaskForm: true, resetPromoteTask2DoingForm: true, notes: demoteResponse.data.notes, plan: response.data.plan }
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
  promoteTask2Done: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const promoteResponse = await axios.post(`http://localhost:3000/promoteTask2Done`, { task_id, username }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success && promoteResponse.data.success) {
        return { successMessage: promoteResponse.data.message, resetSaveTaskForm: true, resetPromoteTask2DoneForm: true, notes: promoteResponse.data.notes, plan: response.data.plan }
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
  demoteTask2Doing: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")
    const task_owner = form.get("owner")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const demoteResponse = await axios.post(`http://localhost:3000/demoteTask2Doing`, { task_id, username }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const promoteResponse = await axios.post(`http://localhost:3000/promoteTask2Doing`, { task_id, username, assignee: task_owner }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success && demoteResponse.data.success && promoteResponse.data.success) {
        return { successMessage: promoteResponse.data.message, resetSaveTaskForm: true, resetDemoteTask2DoingForm: true, notes: promoteResponse.data.notes, plan: response.data.plan }
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
  promoteTask2Closed: async ({ request }) => {
    const form = await request.formData()

    const task_id = form.get("taskid")
    const prev_task_plan = form.get("prevtaskplan")
    const task_plan = form.get("taskplan")
    const task_notes = form.get("notes")
    const username = form.get("username")
    const task_state = form.get("taskstate")

    try {
      const response = await axios.post(`http://localhost:3000/saveTask`, { task_id, prev_task_plan, task_plan, task_notes, username, task_state }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
      const promoteResponse = await axios.post(`http://localhost:3000/promoteTask2Closed`, { task_id, username }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success && promoteResponse.data.success) {
        return { successMessage: promoteResponse.data.message, resetSaveTaskForm: true, resetPromoteTask2ClosedForm: true, notes: promoteResponse.data.notes, plan: response.data.plan }
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
  }
}
