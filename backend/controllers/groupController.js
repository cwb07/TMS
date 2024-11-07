import pool from "../config/db.js"

// max 50 characters, alphanumeric with possible underscore
const groupnameRegex = /^[a-zA-Z0-9_]{1,50}$/

// @desc    Create group
// @route   POST /group
const createGroup = async (req, res) => {
  const { groupname } = req.body

  if (!groupname) {
    return res.status(400).json({
      success: false,
      message: "Group name is mandatory"
    })
  }

  if (!groupnameRegex.test(groupname)) {
    // group name format wrong
    return res.status(400).json({
      success: false,
      message: "Group name must be alphanumeric (allow underscore) and have a maximum of 50 characters"
    })
  }

  const connection = await pool.getConnection()
  try {
    // start transaction
    await connection.beginTransaction()

    // check if groupname exists
    const query = `SELECT * FROM usergroup WHERE user_group = ?`
    const [results] = await connection.query(query, [groupname])

    if (results.length > 0) {
      // groupname already exists
      return res.status(409).json({
        success: false,
        message: "Group name already exists"
      })
    }

    // insert new group
    const insertQuery = `INSERT INTO usergroup (user_group) VALUES (?)`
    await connection.query(insertQuery, [groupname])

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: "Group created"
    })
  } catch (err) {
    // rollback in case of error
    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "Unable to create group",
      stack: err.stack
    })
  } finally {
    // release the connection back to the pool
    connection.release()
  }
}

// @desc    Get all groups
// @route   GET /group
const getAllGroups = async (req, res) => {
  try {
    const query = `SELECT DISTINCT user_group FROM usergroup`
    const [results] = await pool.query(query)

    // Extract the user_group names into a new array
    const groupNames = results.map(row => row.user_group)

    return res.status(200).json({
      success: true,
      message: "Groups successfully retrieved",
      data: groupNames
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch groups",
      stack: err.stack
    })
  }
}

export { createGroup, getAllGroups }
