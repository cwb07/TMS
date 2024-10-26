import pool from "../config/db.js"
import bcrypt from "bcrypt"

const matchPassword = async (enteredPassword, hashPassword) => {
  return await bcrypt.compare(enteredPassword, hashPassword);
};

const queryFindAccountByUsername = async (username) => {
  const query = `SELECT * FROM accounts WHERE username = ?`
  const [results] = await pool.query(query, [username])
  return results
}

const queryAllAccounts = async (req, res, next) => {
  const query = `SELECT * FROM accounts`
  const [results] = await pool.query(query)
  return results
}

//begin transaction for adding into groups
const queryAddNewAccount = async (username, password, email) => {
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const query = `
      INSERT INTO accounts(username, password, email)
      VALUES (?, ?, ?)
    `

  const [results] = await pool.query(query, [username, hashedPassword, email])
  return results
}

const accountsModel = {
  queryAllAccounts,
  queryAddNewAccount,
  queryFindAccountByUsername,
  matchPassword
}

export default accountsModel
