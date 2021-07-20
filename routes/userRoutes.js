/* eslint-disable no-unused-vars */
const express = require('express')
const { Router } = require('express')

const userController = require('./../contollers/userControllers')
const authController = require('./../contollers/authController')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// Protect all routes after this middleware
// Because of middleware stack
router.use(authController.protect)

router.patch('/updateMyPassword', authController.updateMyPassword)

router.get('/me', userController.getMe, userController.getUser)
router.patch('/updateMe', userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)

// Protect all routes after this middleware
// Because of middleware stack
router.use(authController.restricted('admin'))

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser)

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)

module.exports = router
