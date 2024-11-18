import { checkGroup } from "../middlewares/authMiddleware.js"
import pool from "../config/db.js"

// app rnumber must be positive INT
const appRnumberRegex = /^\d+$/

// app acronym length must be 1-50 characters
const appAcronymRegex = /^[a-zA-Z0-9\s]{1,50}$/

const createApplication = async (req, res) => {
  const { app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create } = req.body
  let { app_acronym } = req.body

  app_acronym = app_acronym.trim()

  if (!app_acronym) {
    return res.json({ success: false, message: "App name is mandatory" })
  }

  const connection = await pool.getConnection()

  try {
    //check if application exists
    const query = `SELECT * FROM application WHERE app_acronym = ?`
    const [results] = await connection.query(query, [app_acronym])

    if (results.length === 0) {
      //application is unique
      if (!appAcronymRegex.test(app_acronym)) {
        return res.json({ success: false, message: "App name must be alphanumeric and have a maximum of 50 characters" })
      }

      if (!app_rnumber) {
        return res.json({ success: false, message: "App Rnumber is mandatory" })
      }

      if (!appRnumberRegex.test(app_rnumber) || app_rnumber <= 0) {
        return res.json({ success: false, message: "App Rnumber must be a positive integer" })
      }

      if (!app_startdate) {
        return res.json({ success: false, message: "App start date is mandatory" })
      }

      if (!app_enddate) {
        return res.json({ success: false, message: "App end date is mandatory" })
      }

      // app start date must be before app end date
      if (app_startdate > app_enddate) {
        return res.json({ success: false, message: "App start date must be before app end date" })
      }

      const query = `INSERT INTO application(app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      await connection.query(query, [app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create])
      return res.json({ success: true, message: "Application created" })
    } else {
      return res.json({ success: false, message: "Application already exists" })
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to create application", stack: err.stack })
  } finally {
    connection.release()
  }
}

const editApplication = async (req, res) => {
  const { prev_app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create } = req.body
  let { app_acronym } = req.body

  app_acronym = app_acronym.trim()

  if (!app_acronym) {
    return res.json({ success: false, message: "App name is mandatory" })
  }

  const connection = await pool.getConnection()

  try {
    // if app acronym changed
    if (prev_app_acronym !== app_acronym) {
      //check if application already exists in current db
      const query = `SELECT * FROM application WHERE app_acronym = ?`
      const [results] = await connection.query(query, [app_acronym])

      if (results.length !== 0) {
        return res.json({ success: false, message: "Application already exists" })
      }
    }

    if (!appAcronymRegex.test(app_acronym)) {
      return res.json({ success: false, message: "App name must be alphanumeric have a maximum of 50 characters" })
    }

    if (!app_startdate) {
      return res.json({ success: false, message: "App start date is mandatory" })
    }

    if (!app_enddate) {
      return res.json({ success: false, message: "App end date is mandatory" })
    }

    // app start date must be before app end date
    if (app_startdate > app_enddate) {
      return res.json({ success: false, message: "App start date must be before app end date" })
    }

    const updateQuery = `UPDATE application SET app_acronym = ?, app_description = ?, app_rnumber = ?, app_startdate = ?, app_enddate = ?, app_permit_open = ?, app_permit_todolist = ?, app_permit_doing = ?, app_permit_done = ?, app_permit_create = ? WHERE app_acronym = ?`
    await connection.query(updateQuery, [app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create, prev_app_acronym])
    return res.json({ success: true, message: "Application updated" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to update application", stack: err.stack })
  } finally {
    connection.release()
  }
}

const getAllApplications = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const query = `SELECT * FROM application`
    const [results] = await connection.query(query)

    return res.json({ success: true, message: "Applications retrieved", data: results })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve applications", stack: err.stack })
  } finally {
    connection.release()
  }
}

const getAppPermissions = async (req, res) => {
  const { app_acronym } = req.body

  const connection = await pool.getConnection()

  try {
    const query = `SELECT app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create FROM application WHERE app_acronym = ?`
    const [results] = await connection.query(query, [app_acronym])

    const permissions = results[0]

    for (const permitGroup in permissions) {
      permissions[permitGroup] = await checkGroup(req.user.username, permissions[permitGroup])
    }

    return res.json({ success: true, message: "App permissions retrieved", data: permissions })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve app permissions", stack: err.stack })
  } finally {
    connection.release()
  }
}

export { createApplication, getAllApplications, editApplication, getAppPermissions }
