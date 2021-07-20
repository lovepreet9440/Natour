const Tour = require('../models/toursModel')
const AppError = require('../utility/appError')
const catchAsync = require('../utility/catchAsync')

exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data
    const tours = await Tour.find()

    // 2) built template

    // 3) Render the templete using data
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get tour data with guides and reviews
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        feilds: 'review rating user',
    })

    if (!tour) {
        const err = new AppError('There is no tour with that name', 404)
        return next(err)
    }
    // 2) built template

    // 3) Render the templete using data
    res.status(200).render('tour', {
        title: `${tour.name} tour`,
        tour,
    })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Login Account',
    })
}

exports.getMyAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My Account',
    })
}
