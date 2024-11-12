import axios from "axios"
import { error } from "@sveltejs/kit"

export const load = async ({ request }) => {
  try {
    const response = await axios.get(`http://localhost:3000/getUser`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

    if (response.data.success) {
      return {
        username: response.data.data.username,
        isPM: response.data.data.isPM,
        isAdmin: response.data.data.isAdmin
      }
    }
  } catch (err) {
    console.log(err)
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
  }
}
