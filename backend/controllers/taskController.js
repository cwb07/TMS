import dotenv from "dotenv"
import pool from "../config/db.js"
import transporter from "../config/nodemailer.js"

dotenv.config()

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

const promoteTask2Done = async (req, res) => {
  const { task_app_acronym, task_id, task_plan, task_notes, enterLog, task_state } = req.body
  let newLog;

  if (enterLog) {
    newLog = auditStampString(req.user.username, task_state) + `\nTask submitted for review.\n` + auditStampString(req.user.username, task_state) + `\n${enterLog}` + `\n${task_notes}`
  } else {
    newLog = auditStampString(req.user.username, task_state) + `\nTask submitted for review.` + `\n${task_notes}`
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
    await pool.query(updateTaskQuery, ["Done", task_plan, newLog, req.user.username, task_id])

    const getPermitGroup = `SELECT app_permit_done FROM application WHERE app_acronym = ?`
    const [permitGroup] = await pool.query(getPermitGroup, [task_app_acronym])

    const getListOfEmails = `SELECT GROUP_CONCAT(email SEPARATOR ', ') as emails FROM accounts WHERE username IN (SELECT username FROM usergroup WHERE user_group = ?)`
    const [results] = await pool.query(getListOfEmails, [permitGroup[0].app_permit_done])

    transporter.sendMail({
      from: process.env.MAILER_FROM,
      to: results[0].emails,
      subject: `Task Pending Review: ${task_id}`,
      text: `Dear Team,\n\nA task in the Task Management System is pending review.\nPlease login to the system to review the task.\n\nTask ID: ${task_id}\n\nRegards,\nTask Management System`,
      html: `
            <p>Dear Team,</p>
            <p>A task in the Task Management System is pending review.<br>Please login to the system to review the task.</p>
            <p>Task ID: <b>${task_id}</b></p>
            <p>Regards,<br>Task Management System</p>
            `
    }).then(() => {
      console.log('Email sent successfully')
    }).catch((error) => {
      console.log('Error sending email:', error)
    })

    return res.json({ success: true, message: 'Task submitted for review.', newNotes: newLog })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to promote task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const promoteTask = async (req, res) => {
  const { task_id, task_plan, task_notes, enterLog, task_state } = req.body
  let newLog;

  const nextStates = {
    Open: "Todo",
    Todo: "Doing",
    Done: "Closed"
  }

  const logMessage = {
    Open: "Task released.",
    Todo: `Task assigned to ${req.user.username}.`,
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
    return res.json({ success: true, message: `${logMessage[task_state]}`, newNotes: newLog })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to promote task", stack: err.stack })
  } finally {
    connection.release()
  }
}

const demoteTask = async (req, res) => {
  const { task_id, task_plan, task_notes, enterLog, task_state, task_owner } = req.body
  let newLog;

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
    return res.json({ success: true, message: `${logMessage[task_state]}`, newNotes: newLog, newOwner: newOwner })
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

const getTaskbyState = async (req, res) => { 
  const { task_state, task_app_acronym } = req.body

  const connection = await pool.getConnection()

  try {
    const query = `SELECT * FROM task WHERE task_state = ? AND task_app_acronym = ?`
    const [result] = await connection.query(query, [task_state, task_app_acronym])
    return res.json({ success: true, message: "Tasks retrieved", data: result })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve tasks by state", stack: err.stack })
  } finally {
    connection.release()
  }
}

// helper functions
const convertLogsToDateTime = datetime => {
  let formattedDateTime = datetime.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  })?.replace("am", "AM").replace("pm", "PM")

  return formattedDateTime.replace(/00:/, '12:');
}

const auditStampString = (creator, state) => {
  const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1)
  return `******************\n[User: ${creator}, State: ${capitalizedState}, Date: ${convertLogsToDateTime(new Date())}]`
}

export { getTaskbyState, createTask, saveTask, promoteTask, demoteTask, promoteTask2Done }
