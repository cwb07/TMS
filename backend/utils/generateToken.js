import jwt from 'jsonwebtoken';

const generateToken = (res, username) => {
    // Generate a token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: '60m',
    });

    // Set JWT as an HTTP-Only cookie
    res.cookie('jwt', token, {
        httpOnly: true, // jwt is transmitted w every HTTP req, prevents xss - disallow javascript from accessing cookies
        maxAge: 60 * 60 * 1000  // 60 minutes in milliseconds
    });
};

export default generateToken;