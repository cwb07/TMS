import pool from "../config/db.js"

// plan mvp name length must be 1-255 characters
const planMvpRegex = /^[a-zA-Z0-9\s]{1,255}$/

const createPlan = async (req, res) => {
  const { plan_app_acronym, plan_startdate, plan_enddate, plan_color } = req.body
  let { plan_mvp_name } = req.body

  plan_mvp_name = plan_mvp_name.trim()

  if (!plan_mvp_name) {
    return res.json({ success: false, message: "Plan name is mandatory" })
  }

  if (!planMvpRegex.test(plan_mvp_name)) {
    return res.json({ success: false, message: "Plan name must be alphanumeric have a maximum of 255 characters" })
  }

  // check if plan name already exists under this app
  const connection = await pool.getConnection()

  try {
    const query = `SELECT * FROM plan WHERE plan_mvp_name = ? AND plan_app_acronym = ?`
    const [results] = await connection.query(query, [plan_mvp_name, plan_app_acronym])

    if (results.length > 0) {
      return res.json({ success: false, message: "Plan name already exists" })
    } else {
      if (!plan_startdate) {
        return res.json({ success: false, message: "Plan start date is mandatory" })
      }

      if (!plan_enddate) {
        return res.json({ success: false, message: "Plan end date is mandatory" })
      }

      // plan start date must be before app end date
      if (plan_startdate >= plan_enddate) {
        return res.json({ success: false, message: "App start date must be before app end date" })
      }

      const insertQuery = `INSERT INTO plan(plan_mvp_name, plan_app_acronym, plan_startdate, plan_enddate, plan_color) VALUES (?, ?, ?, ?, ?)`
      await connection.query(insertQuery, [plan_mvp_name, plan_app_acronym, plan_startdate, plan_enddate, plan_color])
      return res.json({ success: true, message: "Plan created" })
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to create plan", stack: err.stack })
  } finally {
    connection.release()
  }
}

const getAllPlansInApp = async (req, res) => {
  const { plan_app_acronym } = req.body

  const connection = await pool.getConnection()

  try {
    const query = `SELECT * FROM plan WHERE plan_app_acronym = ?`
    const [results] = await connection.query(query, [plan_app_acronym])
    return res.json({ success: true, message: "Plans retrieved", data: results })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve all plans", stack: err.stack })
  } finally {
    connection.release()
  }
}

export { createPlan, getAllPlansInApp }
