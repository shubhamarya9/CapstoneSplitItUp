const express = require('express');
const router = express.Router();
const { celebrate, Joi }= require('celebrate');

const authMiddleware = require('../middleware/AuthMiddleware');
const expensesController = require('../controllers/expenses');

/* GET users listing. */
router.post('/add-expense',celebrate({
    body: {
        groupId : Joi.string(),
        category : Joi.string(),
        amount : Joi.number(),
        description : Joi.string(),
        expenseCreatedDate: Joi.string()
    }
}),authMiddleware.authorization,expensesController.addExpenses);

router.get('/list',authMiddleware.authorization,expensesController.getAllExpenses);


router.get('/type',authMiddleware.authorization,expensesController.getExpensesStatus);

router.get('/getProfileHistory',authMiddleware.authorization,expensesController.getProfileHistory);

router.post('/addSettlement',celebrate({
  body:{
     "userId":Joi.string(),
     "amount":Joi.number(),
     "description":Joi.string(),
     "type":Joi.string()
  }
}),authMiddleware.authorization,expensesController.addSettlement);


router.get('/dashboardData',authMiddleware.authorization,expensesController.dashboardData);
// router.post('/dashboardData',celebrate({
//       body:{
//         "userId":Joi.string()
//       }
// }),authMiddleware.authorization,expensesController.dashboardData);

router.get('/reportsData',authMiddleware.authorization,expensesController.reportsData);
// router.post('/reportsData',celebrate({
//      body:{
//         "userId":Joi.string()
//      }
// }),authMiddleware.authorization,expensesController.reportsData);

module.exports = router;
