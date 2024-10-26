import pool from "../config/db.js"

const queryAllAccounts = async () => {
  try {
    const query = `SELECT * FROM accounts`

    const [results] = await pool.query(query)

    return results
  } catch (err) {
    throw new Error("Failed to retrieve accounts: " + err)
  }
}

const queryAddNewAccount = async (username, password, email, groups) => {
  try {
    const query = `
      INSERT INTO accounts(username, password, email)
      VALUES (?, ?, ?)
    `

    await pool.query(query, [username, password, email])

    // insert groups into groups table to associate username with groups
    if (groups && groups.length > 0) {
      console.log(groups)
    }
  } catch (err) {
    throw new Error("Failed to add account: " + err)
  }
}

const accountsModel = {
  queryAllAccounts,
  queryAddNewAccount
}

export default accountsModel
