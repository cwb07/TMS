import axios from "axios"
import { error } from "@sveltejs/kit"

export const load = async ({ request }) => {
  try {
    const response = await axios.get(`http://localhost:3000/getUser`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const applicationResponse = await axios.get(`http://localhost:3000/getAllApplications`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const groupResponse = await axios.get(`http://localhost:3000/getAllGroups`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

    if (response.data.success && applicationResponse.data.success) {
      return {
        username: response.data.data.username,
        isAdmin: response.data.data.isAdmin,
        applicationsList: applicationResponse.data.data,
        groupsList: groupResponse.data.data
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
  createApp: async ({ request }) => {
    const form = await request.formData()

    const app_acronym = form.get("name")
    const app_rnumber = form.get("rnumber")
    const app_description = form.get("description")
    const app_startdate = form.get("startdate")
    const app_enddate = form.get("enddate")
    const app_permit_open = form.get("permitopen")
    const app_permit_todolist = form.get("permittodo")
    const app_permit_doing = form.get("permitdoing")
    const app_permit_done = form.get("permitdone")
    const app_permit_create = form.get("permitcreate")

    try {
      const response = await axios.post(`http://localhost:3000/createApplication`, { app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { successMessage: response.data.message, resetCreateAppForm: true }
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
  }
}
