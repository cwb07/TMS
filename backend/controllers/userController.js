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

// @desc    Get all users
// @route   GET /user
const getAllUsers = async (req, res, next) => {
  const query = `SELECT * FROM accounts`
  const [results] = await pool.query(query)

  if (results.length > 0) {
    return res.status(200).json({
      success: true,
      message: "Accounts successfully retrieved",
      data: results
    })
  }
}

// @desc    Add a new user
// @route   POST /user
const addNewUser = async (req, res, next) => {
  const { username, password, email } = req.body

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  try {
    const query = `
      INSERT INTO accounts(username, password, email)
      VALUES (?, ?, ?)
    `

    const [results] = await pool.query(query, [username, hashedPassword, email])

    if (results.affectedRows > 0) {
      return res.status(201).json({
        success: true,
        message: "Account successfully created"
      })
    } else {
      return res.status(500).json({
        success: true,
        message: "Failed to create account"
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      stack: err.stack
    })
  }
}

export { getAllUsers, addNewUser, login, logout }
