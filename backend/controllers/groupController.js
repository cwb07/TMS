import pool from "../config/db.js"

// max 50 characters, alphanumeric with possible underscore
const groupnameRegex = /^[a-zA-Z0-9_]{1,50}$/

// @desc    Create group
// @route   POST /createGroup
const createGroup = async (req, res) => {
  const { groupname } = req.body

  if (!groupname) {
    return res.status(400).json({ success: false, message: "Group name is mandatory" })
  }

  if (!groupnameRegex.test(groupname)) {
    return res.status(400).json({ success: false, message: "Group name must be alphanumeric (allow underscore) and have a maximum of 50 characters" })
  }

  const connection = await pool.getConnection()

  try {
    // check if groupname exists
    const query = `SELECT * FROM usergroup WHERE user_group = ?`
    const [results] = await connection.query(query, [groupname])

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: "Group name already exists" })
    }

    const insertQuery = `INSERT INTO usergroup (user_group) VALUES (?)`
    await connection.query(insertQuery, [groupname])
    return res.status(201).json({ success: true, message: "Group created" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to create group", stack: err.stack })
  } finally {
    connection.release()
  }
}

// @desc    Get all groups
// @route   GET /getAllGroups
const getAllGroups = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const query = `SELECT DISTINCT user_group FROM usergroup`
    const [results] = await connection.query(query)

    // extract user_group names into a new array
    const groupNames = results.map(row => row.user_group)

    return res.status(200).json({ success: true, message: "Groups successfully retrieved", data: groupNames })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to fetch groups", stack: err.stack })
  } finally {
    connection.release()
  }
}

export { createGroup, getAllGroups }