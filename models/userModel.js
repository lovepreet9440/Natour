const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true,
        maxlength: [40, 'A tour must have less or equal then 40 character'],
        // validate: [validator.isAlpha, 'User name must contain only characters']
    },

    email: {
        type: String,
        required: [true, 'User must have a Email'],
        unique: true,
        lowercase: true,

        validate: [validator.isEmail, 'Please enter a valid Email'],
    },

    role: {
        type: String,
        emun: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },

    password: {
        type: String,
        required: [true, 'Please enter a password'],
        maxlength: [8, 'Password must be less or equal to 8 character'],
        minlength: [5, 'Password must be more or equal to 5 character'],
        select: false,
    },

    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // this only work on CREATE nd and SAVE only
            validator: function (pswrd) {
                return pswrd === this.password
            },
            message: 'Passwords are not same',
        },
        select: false,
    },

    photo: [String],

    passwordChangedAt: {
        type: Date,
        select: false,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
})

userSchema.pre('save', async function (next) {
    // check weather thhe password is modified or not
    if (!this.isModified('password')) return next()

    // hashing the password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    // deleting the passwordConfirm
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function (next) {
    // check weather thhe password is modified or not
    if (!this.isModified('password') || this.isNew) return next()

    // hashing the password with the cost of 12
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})

userSchema.methods.comparePassword = async (
    inputPassword,
    dataBasePassword
) => {
    return await bcrypt.compare(inputPassword, dataBasePassword)
}

userSchema.methods.isPasswordChanged = function (tokenCreatedAt) {
    // don't use arrrow function because we want to use "this"

    if (this.passwordChangedAt) {
        // passwordChangedAt is in date format (i.e. 26/12/1999) converting it into time stapm similar to tokenCreatedAt
        const passwordChangedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )

        return tokenCreatedAt < passwordChangedTimeStamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return this.passwordResetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
