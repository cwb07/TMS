import accountsModel from "../models/accountsModel.js"
import asyncHandler from "../middlewares/asyncHandler.js"

// @desc    Get all accounts
// @route   GET /api/accounts
const getAllAccounts = asyncHandler(async (req, res, next) => {
  const results = await accountsModel.queryAllAccounts()

  if (results.length > 0) {
    res.status(200).json({
      success: true,
      data: results,
      message: "Accounts successfully retrieved"
    })
  } else {
    throw new Error("No accounts found")
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

export { getAllAccounts, addNewAccount }
