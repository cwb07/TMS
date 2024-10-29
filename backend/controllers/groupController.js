import pool from "../config/db.js"

// @desc    Add a new group
// @route   POST /group
const addNewGroup = async (req, res) => {
  const { groupname } = req.body

  if (!groupname) {
    return res.status(400).json({
      success: false,
      message: "Group is mandatory"
    })
  }

  const connection = await pool.getConnection()
  try {
    // start transaction
    await connection.beginTransaction()

    // max 50 characters, alphanumeric with possible underscore
    const groupnameRegex = /^[a-zA-Z0-9_]{1,50}$/

    if (!groupnameRegex.test(groupname)) {
      // group name format wrong
      return res.status(401).json({
        success: false,
        message: "Invalid group format"
      })
    }

    // check if groupname exists
    const query = `SELECT * FROM usergroup WHERE user_group = ?`
    const [results] = await pool.query(query, [groupname])

    if (results.length > 0) {
      // groupname already exists
      return res.status(409).json({
        success: false,
        message: "Group name already exists"
      })
    }

    // insert new group
    const insertQuery = `INSERT INTO usergroup (user_group) VALUES (?)`
    await pool.query(insertQuery, [groupname])

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

export { addNewGroup }
