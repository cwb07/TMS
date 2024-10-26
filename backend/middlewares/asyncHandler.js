const asyncHandler = (fn) => (req, res, next) => {
    // executes fn and returns a promise object
    // if error occurs during execution, it catches the error and passes it to next
    Promise.resolve(fn(req, res, next)).catch(next);
}

export default asyncHandler;