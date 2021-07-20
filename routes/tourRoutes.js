const express = require('express')
const tourController = require('../contollers/tourControllers')
const authController = require('./../contollers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router()

// router.param('id', tourController.checkID)

// GET api/tours/:tourId/reviews
router.use('/:tourId/reviews', reviewRouter)
// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restricted('user'),
//         reviewController.createReview
//     )

// POST api/tours/:tourId/reviews
router.use('/:tourId/reviews', reviewRouter)

router
    .route('/top-5-cheap-tours')
    .get(tourController.aliasTopTour, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats)
router
    .route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restricted('admin', 'lead-guide'),
        tourController.getMonthlyPlan
    )

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restricted('admin', 'lead-guide'),
        tourController.createTour
    )

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        tourController.updateTour,
        authController.protect,
        authController.restricted('admin', 'lead-guide')
    )
    .delete(
        authController.protect,
        authController.restricted('admin', 'lead-guide'),
        tourController.deleteTour
    )

module.exports = router
