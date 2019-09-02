const express = require('express');
const router = express.Router();
const { celebrate, Joi }= require('celebrate');

const authMiddleware = require('../middleware/AuthMiddleware');
const usersController = require('../controllers/users');

/* GET users listing. */
router.get('/list',authMiddleware.authorization,usersController.getAllUser);

router.post('/update-profile',celebrate({
    body: {
        userName : Joi.string(),
        firstName : Joi.string(),
        lastName : Joi.string(),
        phone : Joi.string(),
        userBudget : Joi.string(),
        guiId : Joi.string(),
        notificationText : Joi.boolean(),
        notificationEmail : Joi.boolean(),
        notificationPush : Joi.boolean()
    }
}), authMiddleware.authorization,usersController.updateProfile);

router.get('/profile',authMiddleware.authorization,usersController.getProfile);

router.post('/deleteUser',authMiddleware.authorization,usersController.deleteUser);

module.exports = router;
