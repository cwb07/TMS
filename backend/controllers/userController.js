import pool from "../config/db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// @desc    Login user & get token
// @route   POST /user/login
const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    })
  }

  try {
    // check if username exists
    const query = `SELECT * FROM accounts WHERE username = ?`
    const [results] = await pool.query(query, [username])

    if (results.length === 0) {
      // username not found
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    const user = results[0]

    if (!(await bcrypt.compare(password, user.password)) || user.accountstatus !== "Active") {
      // account is not active or password not matching
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    // Generate a token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "60m"
    })

    // Set JWT as an HTTP-Only cookie
    res.cookie("jwt", token, {
      httpOnly: true, // jwt is transmitted w every HTTP req, prevents xss - disallow javascript from accessing cookies
      maxAge: 60 * 60 * 1000 // 60 minutes in milliseconds
    })

    return res.status(200).json({
      success: true,
      message: "Login successful"
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to login user",
      stack: err.stack
    })
  }
}

// @desc    Logout user / clear cookie
// @route   POST /user/logout
const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0) // Set expiration to a past date
  })

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
}

// @desc    Get all users w groups
// @route   GET /user
const getAllUsers = async (req, res, next) => {
  try {
    const query = `
    SELECT A.*, GROUP_CONCAT(UG.user_group SEPARATOR ', ') AS user_group
    FROM accounts A
    LEFT JOIN usergroup UG ON A.username = UG.username
    GROUP BY A.username`

    const [results] = await pool.query(query)

    return res.status(200).json({
      success: true,
      message: "Accounts retrieved",
      data: results
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve all accounts",
      stack: err.stack
    })
  }
}

// @desc Edit a user
// @route PUT /user
const editUser = async (req, res) => {
  const { username, password, email, groups, accountstatus } = req.body

  // username, password and status must be filled
  if (!username) {
    return res.status(409).json({
      success: false,
      message: "Username is mandatory"
    })
  }

  if (!password) {
    return res.status(409).json({
      success: false,
      message: "Password is mandatory"
    })
  }

  if (!accountstatus) {
    return res.status(409).json({
      success: false,
      message: "Active is mandatory"
    })
  }

  // username regex
  // max 50 characters, alphanumeric with no spaces
  const usernameRegex = /^[a-zA-Z0-9]{1,50}$/

  if (!usernameRegex.test(username)) {
    return res.status(409).json({
      success: false,
      message: "Username must be alphanumeric"
    })
  }

  // password regex
  // min 8 char & max 10 char consisting of alphabets, numbers and special characters
  const passwordRegex = /^[^\s]{8,10}$/

  if (!passwordRegex.test(password)) {
    return res.status(409).json({
      success: false,
      message: "Invalid password format"
    })
  }

  // email regex if user did enter email (optional)
  const emailRegex = /^[^\s]+@[^\s]+\.com$/

  if (email && !emailRegex.test(email)) {
    return res.status(409).json({
      success: false,
      message: "Invalid email format"
    })
  }

  const connection = await pool.getConnection()
  try {
    // start transaction
    await connection.beginTransaction()
    // check if username exists
    const query = `
    SELECT A.*, GROUP_CONCAT(UG.user_group SEPARATOR ', ') AS user_group
    FROM accounts A
    LEFT JOIN usergroup UG ON A.username = UG.username
    GROUP BY A.username`
    const [results] = await pool.query(query, [username])

    const user = results[0]

    // user must exist to update
    if (results.length !== 0) {
      // can update user
      // check if need to rehash password
      if (await bcrypt.compare(password, user.password)) {
        // password is the same, no need to rehash
        const updateQuery = `UPDATE accounts SET email = ?, accountstatus = ? WHERE username = ?`
        await pool.query(updateQuery, [email, accountstatus, username])
      } else {
        // password is different, rehash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const updateQuery = `UPDATE accounts SET email = ?, password = ?, accountstatus = ? WHERE username = ?`
        await pool.query(updateQuery, [email, hashedPassword, accountstatus, username])
      }

      // update user groups
      // if user groups is same as before, no need to update
      if (groups.sort().toString() !== user.user_group.split(", ").sort().toString()) {
        const deleteQuery = `DELETE FROM usergroup WHERE username = ?`
        await pool.query(deleteQuery, [username])

        if (groups) {
          for (let group of groups) {
            const query = `
            INSERT INTO usergroup(username, user_group)
            VALUES (?, ?)
          `

            await pool.query(query, [username, group])
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Account updated"
      })
    } else {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
  } catch (err) {
    // rollback in case of error
    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "Unable to update user",
      stack: err.stack
    })
  } finally {
    // release the connection back to the pool
    connection.release()
  }
}

// @desc    Add a new user
// @route   POST /user
const addNewUser = async (req, res) => {
  const { username, password, email, groups, accountstatus } = req.body

  // username, password and status must be filled
  if (!username) {
    return res.status(409).json({
      success: false,
      message: "Username is mandatory"
    })
  }

  if (!password) {
    return res.status(409).json({
      success: false,
      message: "Password is mandatory"
    })
  }

  if (!accountstatus) {
    return res.status(409).json({
      success: false,
      message: "Active is mandatory"
    })
  }

  // username regex
  // max 50 characters, alphanumeric with no spaces
  const usernameRegex = /^[a-zA-Z0-9]{1,50}$/

  if (!usernameRegex.test(username)) {
    return res.status(409).json({
      success: false,
      message: "Username must be alphanumeric"
    })
  }

  // password regex
  // min 8 char & max 10 char consisting of alphabets, numbers and special characters
  const passwordRegex = /^[^\s]{8,10}$/

  if (!passwordRegex.test(password)) {
    return res.status(409).json({
      success: false,
      message: "Invalid password format"
    })
  }

  // email regex if user did enter email (optional)
  const emailRegex = /^[^\s]+@[^\s]+\.com$/

  if (email && !emailRegex.test(email)) {
    return res.status(409).json({
      success: false,
      message: "Invalid email format"
    })
  }

  const connection = await pool.getConnection()
  try {
    // start transaction
    await connection.beginTransaction()

    //check if username exists
    const query = `SELECT * FROM accounts WHERE username = ?`
    const [results] = await pool.query(query, [username])

    if (results.length === 0) {
      //username is unique, able to create user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const query = `
        INSERT INTO accounts(username, email, password, accountstatus)
        VALUES (?, ?, ?, ?)
      `
      const [results] = await pool.query(query, [username, email, hashedPassword, accountstatus])

      // inserted new account
      if (results.affectedRows > 0) {
        // insert user into user groups
        if (groups) {
          for (let group of groups) {
            const query = `
              INSERT INTO usergroup(username, user_group)
              VALUES (?, ?)
            `

            await pool.query(query, [username, group])
          }
        }

        // inserted user into user group
        return res.status(201).json({
          success: true,
          message: "User successfully created"
        })
      }
    } else {
      return res.status(409).json({
        success: false,
        message: "Username needs to be unique"
      })
    }
  } catch (err) {
    // rollback in case of error
    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "Unable to create user",
      stack: err.stack
    })
  } finally {
    // release the connection back to the pool
    connection.release()
  }
}

export { getAllUsers, addNewUser, login, logout, editUser }
