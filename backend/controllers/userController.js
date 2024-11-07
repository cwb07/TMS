import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// max 50 characters, alphanumeric with no spaces
const usernameRegex = /^[a-zA-Z0-9]{1,50}$/

// email regex match pattern: user@domain.com
const emailRegex = /^[^\s]+@[^\s]+\.com$/

// min 8 char & max 10 char consisting of alphabets, numbers and special characters at least 1 each
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!@#$%^&*()\-_=+{[}\]|\\:;"'<,>.?\/])[A-Za-z\d@~`!@#$%^&*()\-_=+{[}\]|\\:;"'<,>.?\/]{8,10}$/

// @desc    Login user & get token
// @route   POST /login
const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials"
    })
  }

  const connection = await pool.getConnection()

  try {
    // check if username exists
    const query = `SELECT * FROM accounts WHERE username = ?`
    const [results] = await connection.query(query, [username])

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

    // generate token
    const token = jwt.sign(
      {
        username,
        ip: req.ip,
        browser: req.headers["user-agent"]
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "60m"
      }
    )

    // set JWT as an HTTP-Only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
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
  } finally {
    connection.release()
  }
}

// @desc    Logout user / clear cookie
// @route   POST /logout
const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0)
  })

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
}

// @desc    Get user info
// @route   GET /getUser
// @route   GET /getAdmin
const getUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User retrieved",
    data: req.user
  })
}

// @desc    Get all users w groups
// @route   GET /getAllUsers
const getAllUsers = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const query = `
    SELECT A.*, GROUP_CONCAT(UG.user_group SEPARATOR ', ') AS user_group
    FROM accounts A
    LEFT JOIN usergroup UG ON A.username = UG.username
    GROUP BY A.username`

    const [results] = await connection.query(query)

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
  } finally {
    connection.release()
  }
}

// @desc Update profile
// @route PUT /updateProfile
const updateProfile = async (req, res) => {
  const { username, email, password } = req.body

  if (!username) {
    return res.status(409).json({
      success: false,
      message: "Username is mandatory"
    })
  }

  if (!email && !password) {
    return res.status(409).json({
      success: false,
      message: "Please enter either a email or password"
    })
  }

  if (email && !emailRegex.test(email)) {
    return res.status(409).json({
      success: false,
      message: "Email format entered must match the pattern username@domain.com"
    })
  }

  if (password && !passwordRegex.test(password)) {
    return res.status(409).json({
      success: false,
      message: "Password can only consist of alphabets, numbers and special characters, minimum 8-10 characters"
    })
  }

  // create update query string
  let updateQuery = "UPDATE accounts SET"
  const values = []

  // add email if given
  if (email) {
    updateQuery += " email = ?,"
    values.push(email)
  }

  // add password if given
  if (password) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    updateQuery += " password = ?,"
    values.push(hashedPassword)
  }

  // remove trailing comma
  updateQuery = updateQuery.slice(0, -1)

  // add where clause
  updateQuery += " WHERE username = ?"
  values.push(username)

  const connection = await pool.getConnection()

  try {
    // start transaction
    await connection.beginTransaction()

    // execute query
    await connection.query(updateQuery, values)

    await connection.commit()

    return res.status(200).json({
      success: true,
      message: "Your profile has been updated"
    })
  } catch (err) {
    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "Unable to update user profile",
      stack: err.stack
    })
  } finally {
    connection.release()
  }
}

// @desc Edit a user
// @route PUT /editUser
const editUser = async (req, res) => {
  const { username, password, email, groups, accountstatus } = req.body

  // username, password and status must be filled
  if (!username) {
    return res.status(409).json({
      success: false,
      message: "Username is mandatory"
    })
  }

  if (!usernameRegex.test(username)) {
    return res.status(409).json({
      success: false,
      message: "Username must be alphanumeric with no spaces and have a maximum of 50 characters"
    })
  }

  if (email && !emailRegex.test(email)) {
    return res.status(409).json({
      success: false,
      message: "Email format entered must match the pattern username@domain.com"
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // check if username exists
    const query = `
    SELECT A.*, GROUP_CONCAT(UG.user_group SEPARATOR ', ') AS user_group
    FROM accounts A
    LEFT JOIN usergroup UG ON A.username = UG.username
    WHERE A.username = ?
    GROUP BY A.username
     `
    const [results] = await connection.query(query, [username])

    const user = results[0]

    // user must exist to update
    if (results.length !== 0) {
      // can update user
      // check if need to rehash password
      if (!password) {
        // password is the same, no need to rehash
        const updateQuery = `UPDATE accounts SET email = ?, accountstatus = ? WHERE username = ?`
        await connection.query(updateQuery, [email, accountstatus, username])
      } else {
        if (!passwordRegex.test(password)) {
          return res.status(409).json({
            success: false,
            message: "Password can only consist of alphabets, numbers and special characters, minimum 8-10 characters"
          })
        }

        // password is different, rehash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const updateQuery = `UPDATE accounts SET email = ?, password = ?, accountstatus = ? WHERE username = ?`
        await connection.query(updateQuery, [email, hashedPassword, accountstatus, username])
      }

      if (!accountstatus) {
        return res.status(409).json({
          success: false,
          message: "Active is mandatory"
        })
      }

      // update user groups
      // if user groups is same as before, no need to update
      const userGroups = (user.user_group || "").split(", ").sort().toString()
      const sortedGroups = groups.sort().toString()

      if (sortedGroups !== userGroups) {
        const deleteQuery = `DELETE FROM usergroup WHERE username = ?`
        await connection.query(deleteQuery, [username])

        if (groups) {
          for (let group of groups) {
            const query = `
            INSERT INTO usergroup(username, user_group)
            VALUES (?, ?)
          `

            await connection.query(query, [username, group])
          }
        }
      }

      await connection.commit()

      return res.status(200).json({
        success: true,
        message: "Account updated"
      })
    } else {
      await connection.rollback()

      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }
  } catch (err) {
    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "Unable to update user",
      stack: err.stack
    })
  } finally {
    connection.release()
  }
}

// @desc    Create user
// @route   POST /createUser
const createUser = async (req, res) => {
  const { username, password, email, groups, accountstatus } = req.body

  // username, password and status must be filled
  if (!username) {
    return res.status(409).json({
      success: false,
      message: "Username is mandatory"
    })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    //check if username exists
    const query = `SELECT * FROM accounts WHERE username = ?`
    const [results] = await connection.query(query, [username])

    if (results.length === 0) {
      //username is unique
      if (!usernameRegex.test(username)) {
        return res.status(409).json({
          success: false,
          message: "Username must be alphanumeric with no spaces and have a maximum of 50 characters"
        })
      }

      if (email && !emailRegex.test(email)) {
        return res.status(409).json({
          success: false,
          message: "Email format entered must match the pattern username@domain.com"
        })
      }

      if (!password) {
        return res.status(409).json({
          success: false,
          message: "Password is mandatory"
        })
      }

      if (!passwordRegex.test(password)) {
        return res.status(409).json({
          success: false,
          message: "Password can only consist of alphabets, numbers and special characters, minimum 8-10 characters"
        })
      }

      if (!accountstatus) {
        return res.status(409).json({
          success: false,
          message: "Active is mandatory"
        })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const query = `
        INSERT INTO accounts(username, email, password, accountstatus)
        VALUES (?, ?, ?, ?)
      `
      const [results] = await connection.query(query, [username, email, hashedPassword, accountstatus])

      // inserted new account
      if (results.affectedRows > 0) {
        // insert user into user groups
        if (groups) {
          for (let group of groups) {
            const query = `
              INSERT INTO usergroup(username, user_group)
              VALUES (?, ?)
            `

            await connection.query(query, [username, group])
          }
        }

        await connection.commit()

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
    await connection.rollback()

    return res.status(500).json({
      success: false,
      message: "Unable to create user",
      stack: err.stack
    })
  } finally {
    connection.release()
  }
}

export { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile }
