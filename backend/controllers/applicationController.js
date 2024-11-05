import pool from "../config/db.js"

// @desc    Get all application
// @route   GET /application/all
const getAllApp = async (req, res) => {
    try {
        const query = `
        SELECT * FROM application`

        const [results] = await pool.query(query)

        return res.status(200).json({
            success: true,
            message: "Applications retrieved",
            data: results
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve all applications",
            stack: err.stack
        })
    }
}

// @desc    Create application
// @route   POST /application
const createApp = async (req, res) => {
    const {
        app_acronym,
        app_description,
        app_rnumber,
        app_startdate,
        app_enddate,
        app_permit_open,
        app_permit_todolist,
        app_permit_doing,
        app_permit_done
    } = req.body

    // app_acronym length must be provided
    if (!app_acronym) {
        return res.status(409).json({
            success: false,
            message: "Application name is mandatory"
        })
    }

    // app_acronym regex
    // 1-50 characters
    const appAcronymRegex = /^.{1,50}$/

    if (!appAcronymRegex.test(app_acronym)) {
        return res.status(409).json({
            success: false,
            message: "Application name must be 1-50 characters"
        })
    }

    // app_rnumber must be provided
    if (!app_rnumber) {
        return res.status(409).json({
            success: false,
            message: "Application running number is mandatory"
        })
    }

    // app_rnumber must be positive int
    if (app_rnumber < 0 && Number.isInteger(app_rnumber)) {
        return res.status(409).json({
            success: false,
            message: "Application running number must be positive"
        })
    }

    // app_startdate must be provided
    if (!app_startdate) {
        return res.status(409).json({
            success: false,
            message: "Application start date is mandatory"
        })
    }

    // app_enddate must be provided
    if (!app_enddate) {
        return res.status(409).json({
            success: false,
            message: "Application end date is mandatory"
        })
    }

    // app_startdate must be earlier than app_enddate
    if (app_startdate > app_enddate) {
        return res.status(409).json({
            success: false,
            message: "Application start date must be earlier than end date"
        })
    }

    const query = `
        INSERT INTO application(app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    try {
        await pool.query(query, [app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done])
        return res.status(201).json({
            success: true,
            message: "Application created successfully"
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to create application",
            stack: err.stack
        })
    }
}

export { createApp, getAllApp }