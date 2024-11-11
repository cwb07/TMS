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
