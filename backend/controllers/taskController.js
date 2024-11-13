import pool from "../config/db.js"

const createTask = async (req, res) => {
  const { task_plan, task_app_acronym, task_description, task_creator, task_owner, task_createdate } = req.body
  let { task_name } = req.body

  task_name = task_name.trim()

  if (!task_name) {
    return res.json({ success: false, message: "Task name is mandatory" })
  }

  const connection = await pool.getConnection()

  try {
    const getRNumberQuery = `SELECT task_id as count FROM task WHERE task_app_acronym = ?`
    const [result] = await connection.query(getRNumberQuery, [task_app_acronym])

    const task_id = `${task_app_acronym}_${result.length + 1}`
    const task_notes = `
    **********
    TASK CREATED
    User: ${task_creator}, Date: ${task_createdate}, State: Open
    `

    const insertQuery = `INSERT INTO task (task_id, task_name, task_plan, task_app_acronym, task_description, task_state, task_creator, task_owner, task_createdate, task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.query(insertQuery, [task_id, task_name, task_plan, task_app_acronym, task_description, "open", task_creator, task_owner, task_createdate, task_notes])
    return res.json({ success: true, message: "Task created successfully" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to create task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const getAllTasksInApp = async (req, res) => {
  const { task_app_acronym } = req.body

  const connection = await pool.getConnection()

  try {
    const query = `SELECT * FROM task WHERE task_app_acronym = ?`
    const [results] = await connection.query(query, [task_app_acronym])
    return res.json({ success: true, message: "Tasks retrieved", data: results })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve all tasks", stack: err.stack })
  } finally {
    connection.release()
  }
}

export { createTask, getAllTasksInApp }
