import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// user must be logged in and authenticated and active
const isLoggedIn = async (req, res, next) => {
  let token = req.cookies.jwt

  if (token) {
    const connection = await pool.getConnection()

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (decoded.ip !== req.ip || decoded.browser != req.headers["user-agent"]) {
        res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) })
        res.cookie("app", "", { httpOnly: true, expires: new Date(0) })
        return res.status(401).json({ success: false, message: "Your session is not valid with this IP address" })
      }

      const query = `SELECT username, email, accountstatus FROM accounts WHERE username = ?`
      const [results] = await connection.query(query, [decoded.username])

      if (results.length === 0 || results[0].accountstatus !== "Active") {
        res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) })
        res.cookie("app", "", { httpOnly: true, expires: new Date(0) })

        // no user found or user not active
        return res.status(401).json({ success: false, message: "Unauthorized access" })
      } else {
        req.user = results[0]
        next()
      }
    } catch (err) {
      res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) })
      res.cookie("app", "", { httpOnly: true, expires: new Date(0) })

      if (err instanceof jwt.TokenExpiredError) {
        // token expired
        return res.status(401).json({ success: false, message: "Session has expired. Please log in again." })
      } else if (err instanceof jwt.JsonWebTokenError) {
        // invalid token - signature issues
        return res.status(401).json({ success: false, message: "Unable to verify session. Please log in again." })
      } else {
        return res.status(500).json({ success: false, message: "An error occurred while checking if user is logged in", stack: err.stack })
      }
    } finally {
      connection.release()
    }
  } else {
    return res.status(401).json({ success: false, message: "Login first to access this resource" })
  }
}

const checkGroup = async (username, groupname) => {
  const connection = await pool.getConnection()

  try {
    const query = `SELECT user_group FROM usergroup WHERE username = ? AND user_group = ?;`
    const [results] = await connection.query(query, [username, groupname])

    if (results.length === 0) {
      // user not in group
      return false
    } else {
      return true
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "An error occurred while checking if user is in group", stack: err.stack })
  } finally {
    connection.release()
  }
}

const checkUserAccess = (...groups) => async (req, res, next) => {
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
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) })
    res.cookie("app", "", { httpOnly: true, expires: new Date(0) })
    return res.status(403).json({ success: false, message: "Unauthorized access" })
  }
}

const checkTaskStatePermit = async (req, res, next) => {
  let { task_state, task_app_acronym } = req.body

  const connection = await pool.getConnection()

  try {
    const query = `SELECT app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done FROM application WHERE app_acronym = ?`
    const [results] = await connection.query(query, [task_app_acronym])

    const statePermitMap = {
      Create: results[0].app_permit_create,
      Open: results[0].app_permit_open,
      Todo: results[0].app_permit_todolist,
      Doing: results[0].app_permit_doing,
      Done: results[0].app_permit_done
    }

    if (!task_state) {
      task_state = "Create"
    }

    const hasPermission = await checkGroup(req.user.username, statePermitMap[task_state])

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: `You do not have permission to perform this action`, reload: true })
    }

    next()
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error checking state permissions", stack: err.stack })
  } finally {
    connection.release()
  }
}

export { checkUserAccess, isLoggedIn, checkGroup, checkTaskStatePermit }
