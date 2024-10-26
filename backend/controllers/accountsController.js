import accountsModel from "../models/accountsModel.js"

// @desc    Get all accounts
// @route   GET /api/accounts
const getAllAccounts = async (req, res) => {
  try {
    const results = await accountsModel.queryAllAccounts()
    res.status(200).json(results)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// @desc    Add a new account
// @route   POST /api/accounts
const addNewAccount = async (req, res) => {
  const { username, password, email } = req.body

  try {
    await accountsModel.queryAddNewAccount(username, password, email)

    res.status(201).json({
      success: true,
      message: "Account successfully created"
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export { getAllAccounts, addNewAccount }
