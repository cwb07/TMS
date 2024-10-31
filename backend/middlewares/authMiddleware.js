import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// User must be logged in
const isLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // get username from jwt cookies, store in req.user to access it
    const query = `SELECT username, email, accountstatus FROM accounts WHERE username = ?`
    const [results] = await pool.query(query, [decoded.username])

    if (results.length === 0) {
      // no username found
      return res.status(401).json({
        success: false,
        message: "No user found"
      })
    } else {
      // store in req.user to access it anywhere
      req.user = results[0]
      next()
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Login first to access this resource",
    })
  }
}

export { isLoggedIn }
