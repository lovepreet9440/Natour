const AppError = require('./../utility/appError')
const User = require('./../models/userModel')
const catchAsync = require('./../utility/catchAsync')
const factory = require('./handleFactory')

const filterObj = (obj, ...allowedFeilds) => {
    const result = {}

    Object.keys(obj).forEach(el => {
        if (allowedFeilds.includes(el)) {
            result[el] = obj[el]
        }
    })

    return result
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates. Please try /users/updateMyPassword',
                400
            )
        )
    }

    // 2) Filtering out the req.body such as role
    const filteredBody = filterObj(req.body, 'name', 'email')

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        { new: true, runValidators: true }
    )

    res.status(200).json({
        status: 'success',
        user: updatedUser
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    // eslint-disable-next-line no-unused-vars
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        active: false
    })

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined. Please use Sign Up instead'
    })
}
exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
