const catchAsync = require('./../utility/catchAsync')
const AppError = require('./../utility/appError')
const APIfeatures = require('../utility/apiFeatures')

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // const newTour = new Tour({})
        // newTour.save()
        const newTour = await Model.create(req.body)

        res.status(201).json({
            status: 'success',
            data: { data: newTour },
        })
    })

exports.getOne = (Model, populateOpt) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id)

        if (populateOpt) query = query.populate(populateOpt)

        const doc = await query

        if (!doc) {
            const err = new AppError('No document found with that ID', 404)
            return next(err)
        }

        res.status(200).json({
            status: 'success',
            data: {
                doc,
            },
        })
    })

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // Allow nested GET reviews on tour (HACK)
        let filter = {}
        if (req.params.tourId) filter = { tour: req.params.tourId }

        // Execute the query
        const features = new APIfeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFeilds()
            .pagination()

        // const docs = await features.query.explain()
        const docs = await features.query

        // Sending Response
        res.status(200).json({
            status: 'success',
            results: docs.length,
            data: {
                docs,
            },
        })
    })

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if (!doc) {
            const err = new AppError('No document found with that ID', 404)
            return next(err)
        }

        res.status(200).json({
            status: 'success',
            data: { data: doc },
        })
    })

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id)

        if (!doc) {
            const err = new AppError('No document found with that ID', 404)
            return next(err)
        }

        res.status(204).json({
            status: 'success',
            data: null,
        })
    })
