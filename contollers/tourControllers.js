const Tour = require('../models/toursModel')
const catchAsync = require('../utility/catchAsync')
const factory = require('./handleFactory')
const AppError = require('./../utility/appError')

exports.aliasTopTour = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

// exports.getAllTours = catchAsync(async (req, res, next) => {
//     // Execute the query
//     const features = new APIfeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFeilds()
//         .pagination()

//     const tours = await features.query

//     // Sending Response
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours
//         }
//     })
// })

exports.getAllTours = factory.getAll(Tour)

// exports.getTour = catchAsync(async (req, res, next) => {
//     // Tour.findOne({ _id: req.params.id })

//     const tour = await Tour.findById(req.params.id).populate('reviews')

//     if (!tour) {
//         const err = new ('No tour found with that ID', 404)
//         return next(err)
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// })

exports.getTour = factory.getOne(Tour, { path: 'reviews' })

// exports.createTour = catchAsync(async (req, res, next) => {
//     // const newTour = new Tour({})
//     // newTour.save()
//     const newTour = await Tour.create(req.body)

//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour
//         }
//     })
// })

exports.createTour = factory.createOne(Tour)

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     })

//     if (!tour) {
//         const err = new ('No tour found with that ID', 404)
//         return next(err)
//     }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     })
// })
exports.updateTour = factory.updateOne(Tour)

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id)

//     if (!tour) {
//         const err = new ('No tour found with that ID', 404)
//         return next(err)
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     })
// })

exports.deleteTour = factory.deleteOne(Tour)

// Get all tours nearby user
exports.getToursWithin = catchAsync(async (req, res, next) => {
    // /tours-within/:distance/center/:latlng/unit/:unit
    // 29.690885, 76.987233
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    // MongoDB accepts radius only in radian
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

    if (!lat || !lng)
        next(new AppError('Please provide latitude and longitude', 400))

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    if (!lat || !lng)
        next(new AppError('Please provide latitude and longitude', 400))

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ])

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    })
})

// Get Tour Statistics using AGGREGATION
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
    ])

    res.status(200).json({
        status: 'success',
        data: stats,
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1 //2021

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStart: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { numTourStart: -1 },
        },
        {
            $limit: 12,
        },
    ])

    res.status(200).json({
        status: 'success',
        data: plan,
    })
})
