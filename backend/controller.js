import MsgCode from "./constants.js"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import pool from "./db.js"
import transporter from "./nodemailer.js"

const CreateTask = async (req, res) => {
    const { username, password, task_name, task_plan, task_app_acronym, task_description } = req.body

    // check url is matching exact case
    if (req.url !== "/CreateTask") {
        return res.json({ MsgCode: MsgCode.INVALID_URL, message: "Invalid URL" })
    }

    // check for payload type
    if (req.headers["content-type"] !== "application/json") {
        return res.json({ MsgCode: MsgCode.INVALID_PAYLOAD_TYPE, message: "Invalid payload type" })
    }

    const mandatoryKeys = ["username", "password", "task_name", "task_plan", "task_app_acronym"]

    // check if all keys are present in the payload and count is same
    // dup keys is not checked as it will take on the latest key
    if (!mandatoryKeys.every(key => Object.keys(req.body).includes(key)) || Object.keys(req.body).length < mandatoryKeys.length) {
        return res.json({ MsgCode: MsgCode.INVALID_KEYS, message: "Invalid keys" })
    }

    // check datatype
    const dataType = {
        username: "string",
        password: "string",
        task_name: "string",
        task_plan: "string",
        task_app_acronym: "string",
        task_description: "string"
    }

    // check data length
    const dataLength = {
        username: 50,
        password: 255,
        task_name: 255,
        task_plan: 255,
        task_app_acronym: 50,
        task_description: 65535
    }

    for (const key in req.body) {
        if (typeof req.body[key] !== dataType[key] || req.body[key].length > dataLength[key]) {
            return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Invalid input type" })
        }
    }

    // check if mandatory fields are empty
    for (const key of mandatoryKeys) {
        if (!req.body[key]) {
            return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Mandatory fields are empty" })
        }
    }

    const connection = await pool.getConnection()

    // check iam
    try {
        // check if username exists
        const queryUser = `SELECT * FROM accounts WHERE username = ?`
        const [userResults] = await connection.query(queryUser, [username])

        if (userResults.length === 0 || userResults[0].accountstatus !== "Active" || !(await bcrypt.compare(password, userResults[0].password))) {
            // username not found
            return res.json({ MsgCode: MsgCode.INVALID_CREDENTIALS, message: "Invalid credentials" })
        }

        const queryPermit = `SELECT app_permit_create FROM application WHERE app_acronym = ?`
        const [permitResults] = await connection.query(queryPermit, [task_app_acronym])

        if (permitResults.length === 0) {
            return res.json({ MsgCode: MsgCode.NOT_FOUND, message: "Application not found" })
        }

        // app permit create is empty
        if (!permitResults[0].app_permit_create) {
            return res.json({ MsgCode: MsgCode.NOT_AUTHORIZED, message: "Not authorized" })
        } else {
            // check if user is in group
            const queryGroup = `SELECT username FROM usergroup WHERE username = ? AND user_group = ?`
            const [groupResults] = await connection.query(queryGroup, [username, permitResults[0].app_permit_create])

            if (groupResults.length === 0) {
                return res.json({ MsgCode: MsgCode.NOT_AUTHORIZED, message: "Not authorized" })
            }
        }

        // check if plan exists
        const queryPlan = `SELECT plan_mvp_name FROM plan WHERE plan_mvp_name = ?`
        const [planResults] = await connection.query(queryPlan, [task_plan])

        if (planResults.length === 0) {
            return res.json({ MsgCode: MsgCode.NOT_FOUND, message: "Plan not found" })
        }

        try {
            await connection.beginTransaction()

            // get latest rnumber from application table
            const queryRnumber = `SELECT app_rnumber FROM application WHERE app_acronym = ?`
            const [rnumberResults] = await connection.query(queryRnumber, [task_app_acronym])

            const task_id = `${task_app_acronym}_${rnumberResults[0].app_rnumber + 1}`
            const task_notes = `${auditStampString(username, "Open")}\nTask Created.`

            const insertQuery = `INSERT INTO task (task_id, task_name, task_plan, task_app_acronym, task_description, task_state, task_creator, task_owner, task_createdate, task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            await connection.query(insertQuery, [task_id, task_name, task_plan, task_app_acronym, task_description, "Open", username, username, new Date().toLocaleDateString("en-ca"), task_notes])

            const updateRNumberQuery = `UPDATE application SET app_rnumber = app_rnumber + 1 WHERE app_acronym = ?`
            await connection.query(updateRNumberQuery, [task_app_acronym])

            await connection.commit()
            return res.json({ MsgCode: MsgCode.SUCCESS, message: "Task created successfully" })
        } catch (err) {
            await connection.rollback()
            return res.json({ MsgCode: MsgCode.INTERNAL_ERROR, message: "An error occurred while creating user1", err: err.stack })
        }
    } catch (err) {
        return res.json({ MsgCode: MsgCode.INTERNAL_ERROR, message: "An error occurred while creating user2", err: err.stack })
    } finally {
        connection.release()
    }
}

const GetTaskbyState = async (req, res) => {
    const { username, password, task_state, task_app_acronym } = req.body

    // check url is matching exact case
    if (req.url !== "/GetTaskbyState") {
        return res.json({ MsgCode: MsgCode.INVALID_URL, message: "Invalid URL" })
    }

    // check for payload type
    if (req.headers["content-type"] !== "application/json") {
        return res.json({ MsgCode: MsgCode.INVALID_PAYLOAD_TYPE, message: "Invalid payload type" })
    }

    const mandatoryKeys = ["username", "password", "task_state", "task_app_acronym"]

    // check if all keys are present in the payload and count is same
    // dup keys is not checked as it will take on the latest key
    if (!mandatoryKeys.every(key => Object.keys(req.body).includes(key)) || Object.keys(req.body).length < mandatoryKeys.length) {
        return res.json({ MsgCode: MsgCode.INVALID_KEYS, message: "Invalid keys" })
    }

    // check datatype
    const dataType = {
        username: "string",
        password: "string",
        task_state: "string",
        task_app_acronym: "string"
    }

    // check data length
    const dataLength = {
        username: 50,
        password: 255,
        task_state: 10,
        task_app_acronym: 50,
    }

    for (const key in req.body) {
        if (typeof req.body[key] !== dataType[key] || req.body[key].length > dataLength[key]) {
            return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Invalid input type" })
        }
    }

    // check if mandatory fields are empty
    for (const key of mandatoryKeys) {
        if (!req.body[key]) {
            return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Mandatory fields are empty" })
        }
    }

    const allowedStates = ["Open", "Todo", "Doing", "Done", "Closed"]

    if (!allowedStates.includes(task_state)) {
        return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Invalid input" })
    }

    const connection = await pool.getConnection()

    // check iam
    try {
        // check if username exists
        const queryUser = `SELECT * FROM accounts WHERE username = ?`
        const [userResults] = await connection.query(queryUser, [username])

        if (userResults.length === 0 || userResults[0].accountstatus !== "Active" || !(await bcrypt.compare(password, userResults[0].password))) {
            // username not found
            return res.json({ MsgCode: MsgCode.INVALID_CREDENTIALS, message: "Invalid credentials" })
        }

        // check if app exists
        const queryApp = `SELECT app_acronym FROM application WHERE app_acronym = ?`
        const [appResults] = await connection.query(queryApp, [task_app_acronym])

        if (appResults.length === 0) {
            return res.json({ MsgCode: MsgCode.NOT_FOUND, message: "Application not found" })
        }

        const query = `SELECT * FROM task WHERE task_state = ? AND task_app_acronym = ?`
        const [result] = await connection.query(query, [task_state, task_app_acronym])
        return res.json({ MsgCode: MsgCode.SUCCESS, data: result })
    } catch (err) {
        return res.json({ MsgCode: MsgCode.INTERNAL_ERROR, message: "An error occurred while creating user2", err: err.stack })
    } finally {
        connection.release()
    }
}

const PromoteTask2Done = async (req, res) => {
    const { username, password, task_id, task_notes } = req.body

    // check url is matching exact case
    if (req.url !== "/PromoteTask2Done") {
        return res.json({ MsgCode: MsgCode.INVALID_URL, message: "Invalid URL" })
    }

    // check for payload type
    if (req.headers["content-type"] !== "application/json") {
        return res.json({ MsgCode: MsgCode.INVALID_PAYLOAD_TYPE, message: "Invalid payload type" })
    }

    const mandatoryKeys = ["username", "password", "task_id"]

    // check if all keys are present in the payload and count is same
    // dup keys is not checked as it will take on the latest key
    if (!mandatoryKeys.every(key => Object.keys(req.body).includes(key)) || Object.keys(req.body).length < mandatoryKeys.length) {
        return res.json({ MsgCode: MsgCode.INVALID_KEYS, message: "Invalid keys" })
    }

    // check datatype
    const dataType = {
        username: "string",
        password: "string",
        task_id: "string"
    }

    // check data length
    const dataLength = {
        username: 50,
        password: 255,
        task_id: 100
    }

    for (const key in req.body) {
        if (typeof req.body[key] !== dataType[key] || req.body[key].length > dataLength[key]) {
            return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Invalid input type" })
        }
    }

    // check if mandatory fields are empty
    for (const key of mandatoryKeys) {
        if (!req.body[key]) {
            return res.json({ MsgCode: MsgCode.INVALID_INPUT, message: "Mandatory fields are empty" })
        }
    }

    const connection = await pool.getConnection()

    try {
        // check if username exists
        const queryUser = `SELECT * FROM accounts WHERE username = ?`
        const [userResults] = await connection.query(queryUser, [username])

        if (userResults.length === 0 || userResults[0].accountstatus !== "Active" || !(await bcrypt.compare(password, userResults[0].password))) {
            // username not found
            return res.json({ MsgCode: MsgCode.INVALID_CREDENTIALS, message: "Invalid credentials" })
        }

        // check if task_id exists
        const queryTask = `SELECT * FROM task WHERE task_id = ?`
        const [taskResults] = await connection.query(queryTask, [task_id])

        if (taskResults.length === 0) {
            return res.json({ MsgCode: MsgCode.NOT_FOUND, message: "Task not found" })
        } else {
            const queryPermit = `SELECT app_permit_doing, app_permit_done FROM application WHERE app_acronym = ?`
            const [permitResults] = await connection.query(queryPermit, [taskResults[0].task_app_acronym])

            if (permitResults.length === 0) {
                return res.json({ MsgCode: MsgCode.NOT_FOUND, message: "Application not found" })
            }

            // app permit doing is empty
            if (!permitResults[0].app_permit_doing) {
                return res.json({ MsgCode: MsgCode.NOT_AUTHORIZED, message: "Not authorized" })
            } else {
                // check if user is in group
                const queryGroup = `SELECT username FROM usergroup WHERE username = ? AND user_group = ?`
                const [groupResults] = await connection.query(queryGroup, [username, permitResults[0].app_permit_doing])

                if (groupResults.length === 0) {
                    return res.json({ MsgCode: MsgCode.NOT_AUTHORIZED, message: "Not authorized" })
                }
            }

            // check if task_state is in doing
            if (taskResults[0].task_state !== "Doing") {
                return res.json({ MsgCode: MsgCode.INVALID_STATE_CHANGE, message: "Invalid state change" })
            }

            let newLog;

            if (task_notes) {
                newLog = auditStampString(username, "Doing") + `\nTask submitted for review.\n` + auditStampString(username, "Doing") + `\n${task_notes}` + `\n${taskResults[0].task_notes}`
            } else {
                newLog = auditStampString(username, "Doing") + `\nTask submitted for review.` + `\n${taskResults[0].task_notes}`
            }

            const updateTaskQuery = `UPDATE task SET task_state = ?, task_notes = ?, task_owner = ? WHERE task_id = ?`
            await pool.query(updateTaskQuery, ["Done", newLog, username, task_id])

            const getListOfEmails = `SELECT GROUP_CONCAT(email SEPARATOR ', ') as emails FROM accounts WHERE username IN (SELECT username FROM usergroup WHERE user_group = ?)`
            const [results] = await pool.query(getListOfEmails, [permitResults[0].app_permit_done])

            if (results[0].emails) {
                let message = {
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
                };

                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.log('Error occurred. ' + err.message);
                        return process.exit(1);
                    }

                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                });
            }

            return res.json({ MsgCode: MsgCode.SUCCESS, message: "Task promoted to Done" })
        }
    } catch (err) {
        return res.json({ MsgCode: MsgCode.INTERNAL_ERROR, message: "An error occurred while creating user2", err: err.stack })
    } finally {
        connection.release()
    }
}

const convertLogsToDateTime = datetime => {
    return datetime.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h12"
    })?.replace("am", "AM").replace("pm", "PM")
}

const auditStampString = (creator, state) => {
    const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1)
    return `******************\n[User: ${creator}, State: ${capitalizedState}, Date: ${convertLogsToDateTime(new Date())}]`
}

export { CreateTask, GetTaskbyState, PromoteTask2Done }