import pool from "../config/db.js"
const saveTask = async (req, res) => {
  const { task_id, task_plan, task_notes, enterLog, task_state } = req.body

  let newLog = task_notes

  if (enterLog) {
    newLog = auditStampString(req.user.username, task_state) + `\n${enterLog}` + `\n${task_notes}`
  }

  const connection = await pool.getConnection()

  try {
    // if task_state different from task_state in db, res error
    const getTaskQuery = `SELECT task_state FROM task WHERE task_id = ?`
    const [task] = await pool.query(getTaskQuery, [task_id])

    if (task[0].task_state !== task_state) {
      return res.json({ success: false, message: "Task state was changed to by another user. Please refresh. " })
    }

    const updateTaskQuery = `UPDATE task SET task_plan = ?, task_notes = ?, task_owner = ? WHERE task_id = ?`
    await pool.query(updateTaskQuery, [task_plan, newLog, req.user.username, task_id])
    return res.json({ success: true, message: "Task saved", newNotes: newLog })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to save task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const promoteTask = async (req, res) => {
  const { task_id, task_plan, task_notes, enterLog, task_state } = req.body
  let newLog = task_notes

  const nextStates = {
    Open: "Todo",
    Todo: "Doing",
    Doing: "Done",
    Done: "Closed"
  }

  const logMessage = {
    Open: "Task released.",
    Todo: `Task assigned to ${req.user.username}.`,
    Doing: `Task submitted for review.`,
    Done: "Task closed."
  }

  if (enterLog) {
    newLog = auditStampString(req.user.username, task_state) + `\n${logMessage[task_state]}\n` + auditStampString(req.user.username, task_state) + `\n${enterLog}` + `\n${task_notes}`
  } else {
    newLog = auditStampString(req.user.username, task_state) + `\n${logMessage[task_state]}` + `\n${task_notes}`
  }

  const connection = await pool.getConnection()

  try {
    // if task_state different from task_state in db, res error
    const getTaskQuery = `SELECT task_state FROM task WHERE task_id = ?`
    const [task] = await pool.query(getTaskQuery, [task_id])

    if (task[0].task_state !== task_state) {
      return res.json({ success: false, message: "Task state was changed to by another user. Please refresh. " })
    }

    const updateTaskQuery = `UPDATE task SET task_state = ?, task_plan = ?, task_notes = ?, task_owner = ? WHERE task_id = ?`
    await pool.query(updateTaskQuery, [nextStates[task_state], task_plan, newLog, req.user.username, task_id])
    return res.json({ success: true, message: `Task ${logMessage[task_state]}`, newNotes: newLog })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to promote task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const demoteTask = async (req, res) => {
  const { task_id, task_plan, task_notes, enterLog, task_state, task_owner } = req.body
  let newLog = task_notes

  const nextStates = {
    Doing: "Todo",
    Done: "Doing"
  }

  const logMessage = {
    Doing: `Task unassigned.`,
    Done: `Task review rejected. Task assigned back to ${task_owner}.`
  }

  if (enterLog) {
    newLog = auditStampString(req.user.username, task_state) + `\n${logMessage[task_state]}\n` + auditStampString(req.user.username, task_state) + `\n${enterLog}` + `\n${task_notes}`
  } else {
    newLog = auditStampString(req.user.username, task_state) + `\n${logMessage[task_state]}` + `\n${task_notes}`
  }

  let newOwner = req.user.username

  if (task_owner) {
    newOwner = task_owner
  }

  const connection = await pool.getConnection()

  try {
    // if task_state different from task_state in db, res error
    const getTaskQuery = `SELECT task_state FROM task WHERE task_id = ?`
    const [task] = await pool.query(getTaskQuery, [task_id])

    if (task[0].task_state !== task_state) {
      return res.json({ success: false, message: "Task state was changed to by another user. Please refresh. " })
    }

    const updateTaskQuery = `UPDATE task SET task_state = ?, task_plan = ?, task_notes = ?, task_owner = ? WHERE task_id = ?`
    await pool.query(updateTaskQuery, [nextStates[task_state], task_plan, newLog, newOwner, task_id])
    return res.json({ success: true, message: `Task ${logMessage[task_state]}`, newNotes: newLog, newOwner: newOwner })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to demote task", stack: err.stack })
  } finally {
    connection.release()
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
    await connection.beginTransaction()

    const getRNumberQuery = `SELECT task_id as count FROM task WHERE task_app_acronym = ?`
    const [result] = await connection.query(getRNumberQuery, [task_app_acronym])

    const task_id = `${task_app_acronym}_${result.length + 1}`
    const task_notes = `${auditStampString(task_creator, "Open")}\nTask Created.`

    const insertQuery = `INSERT INTO task (task_id, task_name, task_plan, task_app_acronym, task_description, task_state, task_creator, task_owner, task_createdate, task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    await connection.query(insertQuery, [task_id, task_name, task_plan, task_app_acronym, task_description, "Open", task_creator, task_owner, task_createdate, task_notes])

    await connection.commit()
    return res.json({ success: true, message: "Task created" })
  } catch (err) {
    await connection.rollback()
    return res.status(500).json({ success: false, message: "Unable to create task", stack: err.stack })
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

  const states = ["Open", "Todo", "Doing", "Done", "Closed"]
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

export { createTask, getAllTasksInApp, saveTask, promoteTask, demoteTask }
