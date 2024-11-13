import pool from "../config/db.js"

const auditStampString = (creator, state) => {
  const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1)
  return `******************\n[User: ${creator}, State: ${capitalizedState}, Date: ${convertLogsDateTime(new Date())}]`
}

const appendNotesToTask = async (task_id, username, state, notes) => {
  const connection = await pool.getConnection()

  try {
    const getNotesQuery = `SELECT task_notes FROM task WHERE task_id = ?`
    const [results] = await connection.query(getNotesQuery, [task_id])

    const updatedNotes = `${auditStampString(username, state)}\n${notes}\n${results[0].task_notes}`
    const updateNotesQuery = `UPDATE task SET task_notes = ? WHERE task_id = ?`
    await connection.query(updateNotesQuery, [updatedNotes, task_id])
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to update task notes", stack: err.stack })
  }
}

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
    const task_notes = `${auditStampString(task_creator, "Open")}\nTask Created.`

    const insertQuery = `INSERT INTO task (task_id, task_name, task_plan, task_app_acronym, task_description, task_state, task_creator, task_owner, task_createdate, task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.query(insertQuery, [task_id, task_name, task_plan, task_app_acronym, task_description, "Open", task_creator, task_owner, task_createdate, task_notes])

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

const updateTask = async (req, res) => {
  const { task_id, prev_task_plan, task_plan, task_notes, username, task_state } = req.body

  const connection = await pool.getConnection()

  try {
    if (prev_task_plan !== task_plan) {
      await appendNotesToTask(task_id, username, task_state, task_plan ? `Plan updated to ${task_plan}.` : `Plan removed.`)
      const updatePlanQuery = `UPDATE task SET task_plan = ? WHERE task_id = ?`
      await connection.query(updatePlanQuery, [task_plan, task_id])
    }

    if (task_notes) {
      await appendNotesToTask(task_id, username, task_state, task_notes)
    }

    // get updated task notes from db
    const getNotesQuery = `SELECT task_notes FROM task WHERE task_id = ?`
    const [results] = await connection.query(getNotesQuery, [task_id])
    const updatedNotes = results[0].task_notes

    return res.json({ success: true, message: "Task updated successfully", notes: updatedNotes })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to update task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const convertLogsDateTime = datetime => {
  return datetime
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
    ?.replace("am", "AM")
    .replace("pm", "PM")
}

export { createTask, getAllTasksInApp, updateTask }
