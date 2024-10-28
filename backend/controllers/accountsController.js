import pool from "../config/db.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// @desc    Login user & get token
// @route   POST /api/accounts/login
const login = async (req, res, next) => {
  const { username, password } = req.body

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
    const isMatch = await bcrypt.compare(password, user.password)

    if (isMatch) {
      if (user.accountstatus !== "Active") {
        // account is not active
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
    } else {
      // wrong password
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }
  } catch (err) {
    // db call error
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      stack: err.stack
    })
  }
}

// @desc    Logout user / clear cookie
// @route   POST /api/accounts/logout
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

// @desc    Get all accounts
// @route   GET /api/accounts
const getAllAccounts = async (req, res, next) => {
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

// @desc    Add a new account
// @route   POST /api/accounts
const addNewAccount = async (req, res, next) => {
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

export { getAllAccounts, addNewAccount, login, logout }
