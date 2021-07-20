const path = require('path')
const express = require('express')
const morgan = require('morgan')
// const rateLimit = require('express-rate-limit')
// const helmet = require('helmet')
// const mongoSanitize = require('express-mongo-sanitize')
// const xss = require('xss-clean')
// const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const AppError = require('./utility/appError')
const globalErrorHandler = require('./contollers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1. GLOBAL MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Security HTTP headers
// app.use(helmet())

// Limiting the requests from same API
// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from your IP. Please try again after an hour',
// })
// app.use('/api', limiter)

// Body parser, reading data from body of req.body
app.use(express.json({ limit: '10kb' }))
// Parse the data from the cookie
app.use(cookieParser())

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize())

// Data sanitization against XSS
// app.use(xss())

// Prevent parameter pollution
// app.use(
//     hpp({
//         whitelist: [
//             'duration',
//             'ratingsAverage',
//             'ratingsQuantity',
//             'maxGroupSize',
//             'difficulty',
//             'price',
//         ],
//     })
// )

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// 2. Routers
// app.get('/', (req, res) => {
//     res.status(200).render('base')
// })

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server`
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statuscode = 404

    const err = new AppError(
        `Can't find ${req.originalUrl} on this server`,
        404
    )

    next(err)
})

app.use(globalErrorHandler)

// 3. Exporting the app to server.js
module.exports = app
