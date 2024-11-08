import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// user must be logged in and authenticated and active
const isLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt

  const connection = await pool.getConnection()

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (decoded.ip !== req.ip || decoded.browser != req.headers["user-agent"]) {
        return res.status(401).json({
          success: false,
          message: "Your session is not valid with this IP address"
        })
      }

      const query = `SELECT username, email, accountstatus FROM accounts WHERE username = ?`
      const [results] = await connection.query(query, [decoded.username])

      if (results.length === 0 || results[0].accountstatus !== "Active") {
        // no user found or user not active
        return res.status(401).json({
          success: false,
          message: "Unathorized access"
        })
      } else {
        req.user = results[0]
        next()
      }
    } catch (err) {
      res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
      })

      if (err instanceof jwt.TokenExpiredError) {
        // token expired
        return res.status(401).json({
          success: false,
          message: "Session has expired. Please log in again."
        })
      } else if (err instanceof jwt.JsonWebTokenError) {
        // invalid token - signature issues
        return res.status(401).json({
          success: false,
          message: "Unable to verify session. Please log in again."
        })
      } else {
        return res.status(500).json({
          success: false,
          message: "An error occurred while checking if user is logged in",
          stack: err.stack
        })
      }
    } finally {
      connection.release()
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Login first to access this resource"
    })
  }
}

const checkGroup = async (username, groupname) => {
  const connection = await pool.getConnection()

  try {
    const query = `
    SELECT user_group 
    FROM usergroup 
    WHERE username = ? AND user_group = ?;`

    const [results] = await connection.query(query, [username, groupname])

    if (results.length === 0) {
      // user not in group
      return false
    } else {
      return true
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking if user is in group",
      stack: err.stack
    })
  } finally {
    // release the connection back to the pool
    connection.release()
  }
}

const checkUserAccess = groups => async (req, res, next) => {
  let isAuthorized = true

  for (let group of groups) {
    if (!(await checkGroup(req.user.username, group))) {
      isAuthorized = false
      break
    }
  }

  if (isAuthorized) {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access"
    })
  }
}

export { checkUserAccess, isLoggedIn, checkGroup }
