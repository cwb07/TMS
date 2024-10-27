import jwt from 'jsonwebtoken';
import accountsModel from '../models/accountsModel.js';
import asyncHandler from './asyncHandler.js';
import ErrorHandler from '../utils/errorHandler.js';

// User must be logged in
const isLoggedIn = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // get username from jwt cookies, store in req.user to access it
        const results = await accountsModel.queryFindAccountByUsername(decoded.username, false)

        if (results.length === 0) {
            // no username found
            throw new ErrorHandler("No user found", 401)
        } else {
            // store in req.user to access it anywhere
            req.user = results[0];
            next();
        }
    } else {
        throw new ErrorHandler('Login first to access this resource', 401)
    }
});

export { isLoggedIn };