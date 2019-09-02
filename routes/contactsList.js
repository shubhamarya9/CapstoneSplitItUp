const express = require('express');
const router = express.Router();
const { celebrate, Joi }= require('celebrate');

const authMiddleware = require('../middleware/AuthMiddleware');
const contactListController = require('../controllers/contactList');

/* GET users listing. */
router.post('/add-contacts',celebrate({
    body: {
        contacts : Joi.array().items(Joi.object({
            name : Joi.string(),
            email : Joi.string(),
            phone : Joi.string(),
        }))
    }
}),authMiddleware.authorization,contactListController.addListOfConatcts);

router.get('/list',celebrate({
    params: {
        search : Joi.string()
    }
}),authMiddleware.authorization,contactListController.getUserContactList);

router.get('/list/:search',celebrate({
    params: {
        search : Joi.string()
    }
}),authMiddleware.authorization,contactListController.getContactList);




module.exports = router;
