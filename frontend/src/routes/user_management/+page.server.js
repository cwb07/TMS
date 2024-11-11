import axios from "axios"
import { error } from "@sveltejs/kit"

export const load = async ({ request }) => {
  try {
    const response = await axios.get(`http://localhost:3000/getUser`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const groupResponse = await axios.get(`http://localhost:3000/getAllGroups`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })
    const userResponse = await axios.get(`http://localhost:3000/getAllUsers`, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

    if (groupResponse.data.success && userResponse.data.success && response.data.success) {
      return {
        username: response.data.data.username,
        isAdmin: response.data.data.isAdmin,
        groupsList: groupResponse.data.data,
        usersList: userResponse.data.data
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
  createGroup: async ({ request }) => {
    const form = await request.formData()
    const groupname = form.get("groupname")

    try {
      const response = await axios.post(`http://localhost:3000/createGroup`, { groupname }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { successMessage: response.data.message, resetCreateGroupForm: true }
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
  createUser: async ({ request }) => {
    const form = await request.formData()

    const username = form.get("username")
    const password = form.get("password")
    const accountstatus = form.get("accountstatus")
    const email = form.get("email")
    const groups = JSON.parse(form.get("groups"))

    try {
      const response = await axios.post(`http://localhost:3000/createUser`, { username, email, password, groups, accountstatus }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { successMessage: response.data.message, errorMessage: "", resetCreateUserForm: true }
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
  editUser: async ({ request }) => {
    const form = await request.formData()

    const username = form.get("username")
    const password = form.get("password")
    const accountstatus = form.get("accountstatus")
    const email = form.get("email")
    let groups = JSON.parse(form.get("groups"))

    try {
      const response = await axios.put(`http://localhost:3000/editUser`, { username, email, password, groups, accountstatus }, { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        return { successMessage: response.data.message, errorMessage: "", resetEditUserForm: true }
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
