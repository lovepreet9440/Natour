const express = require('express')
const viewsController = require('../contollers/viewsController')
const authController = require('../contollers/authController')

const router = express.Router()

router.use(authController.isLogedin)

router.get('/overview', authController.isLogedin, viewsController.getOverview)
router.get('/tour/:slug', authController.isLogedin, viewsController.getTour)
router.get('/login', authController.isLogedin, viewsController.getLoginForm)
router.get('/me', authController.protect, viewsController.getMyAccount)

module.exports = router
