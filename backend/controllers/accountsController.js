import accountsModel from "../models/accountsModel.js"
import asyncHandler from "../middlewares/asyncHandler.js"
import generateToken from "../utils/generateToken.js"
import ErrorHandler from "../utils/errorHandler.js"

// @desc    Login user & get token
// @route   POST /api/accounts/login
const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body

  // Check if username exists
  const results = await accountsModel.queryFindAccountByUsername(username, true)

  if (results.length === 0) {
    // no username found
    throw new ErrorHandler("Invalid username or password", 401)
  }

  const user = results[0];
  const isMatch = await accountsModel.matchPassword(password, user.password);

  if (isMatch) {
    generateToken(res, user.username);

    res.status(200).json({
      success: true,
      message: "Login successful"
    })
  } else {
    // wrong password
    throw new ErrorHandler("Invalid username or password", 401)
  }
})

// @desc    Logout user / clear cookie
// @route   POST /api/accounts/logout
const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Set expiration to a past date
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  })
};

// @desc    Get all accounts
// @route   GET /api/accounts
const getAllAccounts = asyncHandler(async (req, res, next) => {
  const results = await accountsModel.queryAllAccounts()

  if (results.length > 0) {
    res.status(200).json({
      success: true,
      message: "Accounts successfully retrieved",
      data: results
    })
  } else {
    throw new ErrorHandler("No accounts found")
  }
});

// @desc    Add a new account
// @route   POST /api/accounts
const addNewAccount = asyncHandler(async (req, res, next) => {
  const { username, password, email } = req.body

  const results = await accountsModel.queryAddNewAccount(username, password, email)

  if (results.affectedRows > 0) {
    res.status(201).json({
      success: true,
      message: "Account successfully created"
    })
  } else {
    throw new Error("Failed to create account")
  }
});

export { getAllAccounts, addNewAccount, login, logout }
