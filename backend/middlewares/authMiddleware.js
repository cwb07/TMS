import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// User must be logged in and authenticated
const isLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt

  if (token) {
    try {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while checking if user is logged in"
      })
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Login first to access this resource"
    })
  }
}

// checkgroup function
const checkGroup = async (username, groupname) => {
  try {
    const query = `
    SELECT user_group 
    FROM usergroup 
    WHERE username = ? AND user_group = ?;`

    const [results] = await pool.query(query, [username, groupname])

    if (results.length === 0) {
      // user not in group
      return false
    } else {
      return true
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking if user is in group",
      stack: err.stack
    })
  }
}

// User must be an admin
const isAdmin = async (req, res, next) => {
  if (await checkGroup(req.user.username, "admin")) {
    next()
  } else {
    return res.status(401).json({
      success: false,
      message: "You must be an admin to access this resource"
    })
  }
}

export { isLoggedIn, isAdmin }
