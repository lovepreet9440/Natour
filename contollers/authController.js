// const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utility/catchAsync')
const AppError = require('../utility/appError')
const sendEmail = require('../utility/email')

const assignToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN,
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = assignToken(user._id)

    // const id = user._id
    // const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRE_IN
    // })

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
    })

    createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) check if the email and password exist inside form
    if (!email || !password) {
        return next(new AppError('Please enter the email and password', 400))
    }

    // 2) check if the user exist and password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) if every thing is ok send token to the client
    createSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get the token out of header
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(
            new AppError(
                'You are not logged in! PLease login to get access.',
                401
            )
        )
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id)

    if (!currentUser) {
        return next(
            new AppError(
                'User belongs to this token no longer exist! Please login again',
                401
            )
        )
    }

    // 4) Check is the user changed password after the token was issued
    if (currentUser.isPasswordChanged(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password! Please login again',
                401
            )
        )
    }

    // Grant access to the protected route
    res.locals.user = currentUser
    req.user = currentUser

    next()
})

/** ---------------------------------------------------------------------------------------*/
/** ------------------------        FRONT  END  CODE         ----------------------------- */
/** ---------------------------------------------------------------------------------------*/
// this   "isLogedin"   function or middleware is used for frontend login functionality
//  OR  WE  CAN  SAY  ONLY  FOR  RENDERING  PAGES,  NO  ERRORS
exports.isLogedin = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // 1) Verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            )

            // 3) Check if user still exists
            const currentUser = await User.findById(decoded.id)

            if (!currentUser) {
                return next()
            }

            // 4) Check is the user changed password after the token was issued
            if (currentUser.isPasswordChanged(decoded.iat)) {
                return next()
            }

            // If all of the above code run then . . .
            // It means there is a logged in user
            res.locals.user = currentUser
            return next()
        }
        next()
    } catch (err) {
        return next()
    }
}

// ------------   Logout code
exports.logout = (req, res) => {
    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })
    res.status(200).json({ status: 'success' })
}

/** ---------------------------------------------------------------------------------------*/
/** --------------------------       END  OF  CODE         ------------------------------- */
/** ---------------------------------------------------------------------------------------*/

exports.restricted = function (...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(
                new AppError(
                    'Your do not have permission to perform this action',
                    403
                )
            )
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) check there is any input or not
    if (!req.body.email) {
        return next(new AppError('Please enter the email', 400))
    }

    // 2) Genarte user based on email
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(
            new AppError('There is no user with that email address', 404)
        )
    }

    // 3) Genrate random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // console.log(user.passwordResetExpires > Date.now())

    // 4) Send link to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot password? Submit a PATCH request with new password and passwordConfirm to ${resetURL}.\n If you didn't forget your password please ignore this email`

    try {
        await sendEmail({
            email: user.email, //or req.body.email
            subject: 'Your password link is valid for 10 min',
            message,
        })

        res.status(200).json({
            status: 'success',
            message: 'Reset link has been send to email',
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined

        await user.save({ validateBeforeSave: false })

        return next(
            new AppError(
                'There is an error sending the email. Please try again later!',
                500
            )
        )
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token

    // const hashedToken = crypto
    //     .createHash('sha256')
    //     .update(req.params.token)
    //     .digest('hex')

    const user = await User.findOne({
        passwordResetToken: req.params.token,
        passwordResetExpires: { $gt: Date.now() }, //checking the token has expired or not
    })

    // console.log(user.passwordResetToken)
    // console.log(typeof user.passwordResetToken)
    // console.log(req.params.token)
    // console.log(typeof req.params.token)
    // console.log('-----------------------------------')
    // console.log(user.passwordResetToken == req.params.token)
    // console.log(user)

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) Update changedPasswordAt property for the user
    // checkout user model we did that part in moedel using userSchema.pre

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res)
})

exports.updateMyPassword = catchAsync(async (req, res, next) => {
    // 1) Get the user from the collection
    const user = await User.findById(req.user.id).select('+password')

    // 2) Check the input password is correct
    if (!(await user.comparePassword(req.body.oldPassword, user.password))) {
        return next(new AppError('Incorrect old password', 401))
    }

    // 3) If So, Update the password
    user.password = req.body.newPassword
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    // await user.saveAndUpadate() ( THIS WILL DISABLE THE VALIDATORS AND userSchema.pre FUNCTIONS )

    // 4) log the user in, send JWT
    createSendToken(user, 200, res)
})
