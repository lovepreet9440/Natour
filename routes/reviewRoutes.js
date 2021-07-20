const express = require('express')
const reviewController = require('./../contollers/reviewController')
const authController = require('./../contollers/authController')
// const catchAsync = require('../utility/catchAsync')

const router = express.Router({ mergeParams: true })

// Protect all routes after this middleware
// Because of middleware stack
router.use(authController.protect)

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restricted('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    )

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restricted('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restricted('user', 'admin'),
        reviewController.deleteReview
    )

module.exports = router
