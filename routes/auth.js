const express = require('express');
const router = express.Router();
const { celebrate, Joi }= require('celebrate');
const authMiddleware = require('../middleware/AuthMiddleware');
const authController = require('../controllers/auth');


router.post('/login',celebrate({
    body: {
        email : Joi.string().required(),
        password : Joi.string().required()
    }
}),authController.login);

router.post('/register',celebrate({
    body: {
        userName : Joi.string(),
        firstName : Joi.string(),
        lastName : Joi.string(),
        email : Joi.string().required(),
        password : Joi.string().required(),
        phone : Joi.string()
    }
}),authController.register);

router.post('/forgot-password',celebrate({
    body: {
        email : Joi.string().required()
    }
}),authController.forgotPassword);

router.post('/reset-password',celebrate({
    body: {
        tmpToken: Joi.string().required(),
        otp: Joi.string().required(),
        password : Joi.string().required()
    }
}),authController.resetPassword);

router.post('/change-password',celebrate({
    body: {
        password : Joi.string().required()
    }
}),authMiddleware.authorization,authController.changePassword);



module.exports = router;
