const notFound = (req, res, next) => {
    const error = new Error(`${req.originalUrl} route not found`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        error: err,
        stack: err.stack,
        middleware: "errorHandler middleware invoked",
    });
};

export { errorHandler, notFound };