import pool from "../config/db.js"

// app rnumber must be positive INT
const appRnumberRegex = /^[0-9]+$/

// app acronym length must be 1-50 characters
const appAcronymRegex = /^[a-zA-Z0-9]{1,50}$/

const createApplication = async (req, res) => {
  const { app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create } = req.body

  if (!app_acronym) {
    return res.json({ success: false, message: "App name is mandatory" })
  }

  if (!appAcronymRegex.test(app_acronym)) {
    return res.json({ success: false, message: "App name must be alphanumeric have a maximum of 50 characters" })
  }

  if (!app_rnumber) {
    return res.json({ success: false, message: "App Rnumber is mandatory" })
  }

  if (!appRnumberRegex.test(app_rnumber)) {
    return res.json({ success: false, message: "App Rnumber must be a positive integer" })
  }

  if (!app_startdate) {
    return res.json({ success: false, message: "App start date is mandatory" })
  }

  if (!app_enddate) {
    return res.json({ success: false, message: "App end date is mandatory" })
  }

  // app start date must be before app end date
  if (app_startdate >= app_enddate) {
    return res.json({ success: false, message: "App start date must be before app end date" })
  }

  const connection = await pool.getConnection()

  try {
    const query = `INSERT INTO application(app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.query(query, [app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_permit_create])
    return res.json({ success: true, message: "Application created" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to create application", stack: err.stack })
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

export { createApplication, getAllApplications }
