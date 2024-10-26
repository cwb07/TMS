import pool from "../config/db.js"

const queryAllAccounts = async (req, res, next) => {
  const query = `SELECT * FROM accounts`
  const [results] = await pool.query(query)
  return results
}

//begin transaction for adding into groups
const queryAddNewAccount = async (username, password, email) => {
  const query = `
      INSERT INTO accounts(username, password, email)
      VALUES (?, ?, ?)
    `

  const [results] = await pool.query(query, [username, hashedPassword, email])
  return results
}

const accountsModel = {
  queryAllAccounts,
  queryAddNewAccount
}

export default accountsModel
