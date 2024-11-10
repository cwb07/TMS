import bcrypt from "bcrypt"
import { checkGroup } from "../middlewares/authMiddleware.js"
import jwt from "jsonwebtoken"
import pool from "../config/db.js"

// max 50 characters, alphanumeric with no spaces
const usernameRegex = /^[a-zA-Z0-9]{1,50}$/

// email regex match pattern: (user)@(domain)
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

// min 8 char & max 10 char consisting of alphabets, numbers and special characters at least 1 each
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~`!@#$%^&*()\-_=+{[}\]|\\:;"'<,>.?\/])[A-Za-z\d@~`!@#$%^&*()\-_=+{[}\]|\\:;"'<,>.?\/]{8,10}$/

// Login user & get token
const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.json({ success: false, message: "Invalid credentials" })
  }

  const connection = await pool.getConnection()

  try {
    // check if username exists
    const query = `SELECT * FROM accounts WHERE username = ?`
    const [results] = await connection.query(query, [username])

    if (results.length === 0) {
      // username not found
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const user = results[0]

    if (!(await bcrypt.compare(password, user.password)) || user.accountstatus !== "Active") {
      // account is not active or password not matching
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = jwt.sign(
      { username, ip: req.ip, browser: req.headers["user-agent"] }, process.env.JWT_SECRET,
      { expiresIn: "60m" }
    )

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    })

    return res.json({ success: true, message: "Login successful" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to login user", stack: err.stack })
  } finally {
    connection.release()
  }
}

// Logout user & clear cookie
const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0)
  })

  return res.json({ success: true, message: "Logged out successfully" })
}

const getUser = async (req, res) => {
  req.user.isAdmin = await checkGroup(req.user.username, "admin")
  return res.json({ success: true, message: "User retrieved", data: req.user })
}

const getAllUsers = async (req, res) => {
  const connection = await pool.getConnection()

  try {
    const query = `
    SELECT A.*, GROUP_CONCAT(UG.user_group SEPARATOR ', ') AS user_group
    FROM accounts A
    LEFT JOIN usergroup UG ON A.username = UG.username
    GROUP BY A.username`

    const [results] = await connection.query(query)

    return res.json({ success: true, message: "Accounts retrieved", data: results })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to retrieve all accounts", stack: err.stack })
  } finally {
    connection.release()
  }
}

const updateProfile = async (req, res) => {
  const { username, email, password } = req.body

  if (!email && !password) {
    return res.json({ success: false, message: "Please enter either a email or password" })
  }

  if (email && !emailRegex.test(email)) {
    return res.json({ success: false, message: "Email format entered must match the pattern username@domain.com" })
  }

  if (password && !passwordRegex.test(password)) {
    return res.json({ success: false, message: "Password can only consist of alphabets, numbers and special characters, minimum 8-10 characters" })
  }

  let updateFields = [];
  let values = []

  // add email if given
  if (email) {
    updateFields.push("email = ?");
    values.push(email)
  }

  // add password if given
  if (password) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    updateFields.push("password = ?");
    values.push(hashedPassword)
  }

  values.push(username)

  const updateQuery = "UPDATE accounts SET " + updateFields.join(", ") + " WHERE username = ?"
  const connection = await pool.getConnection()

  try {
    await connection.query(updateQuery, values)
    return res.json({ success: true, message: "Your profile has been updated" })
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to update user profile", stack: err.stack })
  } finally {
    connection.release()
  }
}

const editUser = async (req, res) => {
  let { username, password, email, groups, accountstatus } = req.body

  email = email.trim()

  if (email && !emailRegex.test(email)) {
    return res.json({ success: false, message: "Email format entered must match the pattern username@domain.com" })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // check if username exists
    const query = `SELECT * FROM accounts WHERE username = ?`
    const [results] = await connection.query(query, [username])

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
          return res.json({ success: false, message: "Password can only consist of alphabets, numbers and special characters, minimum 8-10 characters" })
        }

        // password is different, rehash
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const updateQuery = `UPDATE accounts SET email = ?, password = ?, accountstatus = ? WHERE username = ?`
        await connection.query(updateQuery, [email, hashedPassword, accountstatus, username])
      }

      const deleteQuery = `DELETE FROM usergroup WHERE username = ?`
      await connection.query(deleteQuery, [username])

      let newGroups = []

      if (username == 'admin') {
        if (!groups.includes('admin')) {
          newGroups = [...groups, 'admin'];
        }
      } else {
        newGroups = groups;
      }

      if (newGroups) {
        for (let group of newGroups) {
          const query = `INSERT INTO usergroup(username, user_group) VALUES (?, ?)`
          await connection.query(query, [username, group])
        }
      }

      await connection.commit()
      return res.json({ success: true, message: "Account updated" })
    } else {
      return res.json({ success: false, message: "User not found" })
    }
  } catch (err) {
    await connection.rollback()
    return res.status(500).json({ success: false, message: "Unable to update user", stack: err.stack })
  } finally {
    connection.release()
  }
}

const createUser = async (req, res) => {
  let { username, password, email, groups, accountstatus } = req.body

  username = username.trim()
  email = email.trim()

  // username, password and status must be filled
  if (!username) {
    return res.json({ success: false, message: "Username is mandatory" })
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
        return res.json({ success: false, message: "Username must be alphanumeric with no spaces and have a maximum of 50 characters" })
      }

      if (email && !emailRegex.test(email)) {
        return res.json({ success: false, message: "Email format entered must match the pattern username@domain.com" })
      }

      if (!password) {
        return res.json({ success: false, message: "Password is mandatory" })
      }

      if (!passwordRegex.test(password)) {
        return res.json({ success: false, message: "Password can only consist of alphabets, numbers and special characters, minimum 8-10 characters" })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      const query = `INSERT INTO accounts(username, email, password, accountstatus) VALUES (?, ?, ?, ?)`
      const [results] = await connection.query(query, [username, email, hashedPassword, accountstatus])

      // inserted new account
      if (results.affectedRows > 0) {
        if (groups) {
          for (let group of groups) {
            const query = `INSERT INTO usergroup(username, user_group) VALUES (?, ?)`
            await connection.query(query, [username, group])
          }
        }

        await connection.commit()
        return res.json({ success: true, message: "User successfully created" })
      }
    } else {
      return res.json({ success: false, message: "Username needs to be unique" })
    }
  } catch (err) {
    await connection.rollback()
    return res.status(500).json({ success: false, message: "Unable to create user", stack: err.stack })
  } finally {
    connection.release()
  }
}

export { createUser, editUser, getAllUsers, getUser, login, logout, updateProfile }
