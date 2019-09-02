const express = require('express');
const router = express.Router();
const { celebrate, Joi }= require('celebrate');

const authMiddleware = require('../middleware/AuthMiddleware');
const groupsController = require('../controllers/groups');

/* GET users listing. */
router.post('/add-group',celebrate({
    body: {
        name: Joi.string(),
        description : Joi.string()
    }
}),authMiddleware.authorization,groupsController.addGroup);

router.get('/list',authMiddleware.authorization,groupsController.getAllGroups);

router.get('/groupList',authMiddleware.authorization,groupsController.groupList);

router.get('/type/:getType',celebrate({
    params: {
        getType : Joi.string().valid('Active','Archived')
    }
}), authMiddleware.authorization,groupsController.getGroupByType);


router.put('/group-update/:groupId',celebrate({
    body: {
        name: Joi.string(),
        description : Joi.string(),
        active: Joi.boolean()
    },
    params:{
        groupId: Joi.string()
    }
}),authMiddleware.authorization,groupsController.groupUpdate);

router.post('/add-user/:groupId',celebrate({
    body: {
        contactId: Joi.string()
    },
    params:{
        groupId: Joi.string()
    }
}),authMiddleware.authorization,groupsController.groupAddUser);

router.post('/addGroupUsers',celebrate({
    body:{
      groupId:Joi.string(),
      userId:Joi.string()
    }
}),authMiddleware.authorization,groupsController.addGroupUsers);

router.get('/archiveGroup',authMiddleware.authorization,groupsController.archiveGroup);

router.get('/getGroupDetail',authMiddleware.authorization,groupsController.getGroupDetail);





module.exports = router;
