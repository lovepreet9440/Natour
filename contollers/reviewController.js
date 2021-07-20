const Review = require('./../models/reviewsModel')
const factory = require('./handleFactory')

// Create new review
exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id
    next()
}

exports.createReview = factory.createOne(Review)
exports.getReview = factory.getOne(Review)
exports.getAllReviews = factory.getAll(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)
