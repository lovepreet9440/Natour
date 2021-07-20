const AppError = require('../utility/appError')

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFeildsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]

    const message = `Duplicate field value ${value}. Please use another value`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    const errorMessages = []

    for (const key in err.errors) {
        const msg = err.errors[key].message
        errorMessages.push(msg)
    }

    const message = `Invalid input data. ${errorMessages.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTErrror = () =>
    new AppError('Invalid token! Please login again', 401)

const handleJWTExpireError = () =>
    new AppError('Your token expired! Please login again', 401)

const sendErrDev = (req, res, err) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack,
        })
    } else {
        // Render website
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        })
    }
}
const sendErrProd = (req, res, err) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            // Operational error

            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message,
            })
        } else {
            // Programing error or other unknown error

            // log error
            console.error('ERROR', err)

            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later',
            })
        }
    }

    // B) Rendered website
    if (err.isOperational) {
        // Operational error

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        // Programing error or other unknown error

        // log error
        console.error('ERROR', err)

        res.status(500).json({
            status: 'Error',
            message: 'Something went very wrong !',
        })
    }
}

module.exports = (err, req, res, next) => {
    // console.log(err.stack)

    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrDev(req, res, err)
    } else if (process.env.NODE_ENV === 'production') {
        // Try to not manipulate orrigral err So, make a copy using destructuring

        // let errors = { ...err }

        if (err.name === 'CastError') err = handleCastErrorDB(err)
        if (err.code === 11000) err = handleDuplicateFeildsDB(err)
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
        if (err.name === 'JsonWebTokenError') err = handleJWTErrror()
        if (err.name === 'TokenExpireError') err = handleJWTExpireError()

        sendErrProd(req, res, err)
    }
}
