import axios from "axios"

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData()

    const username = form.get("username")
    const password = form.get("password")

    try {
      const response = await axios.post("http://localhost:3000/login",
        { username, password },
        { headers: { "Content-Type": "application/json", "User-Agent": request.headers.get("User-Agent"), cookie: request.headers.get("cookie") } })

      if (response.data.success) {
        let token = response.headers["set-cookie"][0].split(";")[0].split("=")[1]
        cookies.set("jwt", token, { path: "/", httpOnly: true, maxAge: 60 * 60 })

        return { loginSuccess: true }
      } else {
        return { errorMessage: response.data.message }
      }
    } catch (err) {
      return { errorMessage: "Invalid credentials" }
    }
  }
}
