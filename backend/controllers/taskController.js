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
    await connection.beginTransaction()

    const getRNumberQuery = `SELECT task_id as count FROM task WHERE task_app_acronym = ?`
    const [result] = await connection.query(getRNumberQuery, [task_app_acronym])

    const task_id = `${task_app_acronym}_${result.length + 1}`
    const task_notes = `${auditStampString(task_creator, "Open")}\nTask Created.`

    const insertQuery = `INSERT INTO task (task_id, task_name, task_plan, task_app_acronym, task_description, task_state, task_creator, task_owner, task_createdate, task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.query(insertQuery, [task_id, task_name, task_plan, task_app_acronym, task_description, "Open", task_creator, task_owner, task_createdate, task_notes])

    await connection.commit()
    return res.json({ success: true, message: "Task created successfully" })
  } catch (err) {
    await connection.rollback()
    return res.status(500).json({ success: false, message: "Unable to create task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const updateTask = async (req, res) => {
  const { task_id, prev_task_plan, task_plan, task_notes, username, task_state } = req.body

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    let newPlan = prev_task_plan

    if (prev_task_plan !== task_plan) {
      await appendNotesToTask(connection, task_id, username, task_state, task_plan ? `Plan updated to ${task_plan}.` : `Plan removed.`)
      const updatePlanQuery = `UPDATE task SET task_plan = ? WHERE task_id = ?`
      await connection.query(updatePlanQuery, [task_plan, task_id])
      newPlan = task_plan
    }

    if (task_notes) {
      await appendNotesToTask(connection, task_id, username, task_state, task_notes)
    }

    // update task owner
    const updateOwnerQuery = `UPDATE task SET task_owner = ? WHERE task_id = ?`
    await connection.query(updateOwnerQuery, [username, task_id])

    // get updated task notes from db
    const getNotesQuery = `SELECT task_notes FROM task WHERE task_id = ?`
    const [results] = await connection.query(getNotesQuery, [task_id])
    const updatedNotes = results[0].task_notes

    await connection.commit()
    return res.json({ success: true, message: "Task updated successfully", notes: updatedNotes, plan: newPlan })
  } catch (err) {
    await connection.rollback()
    return res.status(500).json({ success: false, message: "Unable to update task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const getTaskbyState = async (state, app) => {
  const connection = await pool.getConnection()

  try {
    const query = `SELECT * FROM task WHERE task_state = ? AND task_app_acronym = ?`
    const [results] = await connection.query(query, [state, app])
    return results
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve tasks by state", stack: err.stack })
  } finally {
    connection.release()
  }
}

const getAllTasksInApp = async (req, res) => {
  const { task_app_acronym } = req.body

  const states = ["Open", "Todo", "Doing", "Done", "Close"]
  const tasksByState = {}

  for (const state of states) {
    const tasks = await getTaskbyState(state, task_app_acronym)
    tasksByState[state] = tasks
  }

  return res.json({ success: true, message: "Tasks retrieved", data: tasksByState })
}

// helper functions
const convertLogsToDateTime = datetime => {
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

const auditStampString = (creator, state) => {
  const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1)
  return `******************\n[User: ${creator}, State: ${capitalizedState}, Date: ${convertLogsToDateTime(new Date())}]`
}

const appendNotesToTask = async (connection, task_id, username, state, notes) => {
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

export { createTask, getAllTasksInApp, updateTask }
