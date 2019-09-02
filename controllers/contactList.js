const config = require('config');
const userModel = require('../model/users');
const userContactListsModel = require('../model/usersContactLists');
const mongoose = require('mongoose');

const controller = {};

controller.addListOfConatcts = async (req,res) => {
    try{
        const token = req.token;
        const body = req.body;
        await userContactListsModel.remove({ userId :  token._id  }).exec();
        await asyncForEach(body.contacts, async (contact) => {
            contact.userId = token._id;

            if(contact && contact.phone){
                const userDoc = await userModel.findOne({phone: contact.phone },{_id:1}).exec();
                contact.registered  = (userDoc?true:false);
                if(userDoc){
                    contact.contactUserId = userDoc._id;
                }
            }
            const userContactList = new userContactListsModel(contact);
            await userContactList.save();

        });
        res.json(config.get('buildSuccess')('Contacts has been updated successfully'));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.getContactList = async (req,res) => {
    try{
        const token = req.token;
        const params = req.params;
        var userId = token._id;
        const userList = await userModel.find({"_id":mongoose.Types.ObjectId(userId)},{name:1,phone:1});
        console.log("userList",userList);
        const userContactList = await userContactListsModel.find({ "userId": token._id , $or: [  { "name": { '$regex': params.search, '$options': 'i' } }, { "phone": { '$regex': params.search, '$options': 'i' } } ] },{ name:1,phone:1,registered:1 }).exec();
        console.log("userContactList",userContactList);
        res.json(config.get('buildSuccess')('Contacts has been fetched successfully',userContactList));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.getUserContactList = async (req,res) => {
    try{
        const token = req.token;
        var userId = token._id;
        const userList = await userModel.find({"_id":mongoose.Types.ObjectId(userId)},{name:1,phone:1});
        var phone = userList[0].phone;
        const userContactList = await userContactListsModel.find({ "userId": token._id,registered:true},{ name:1,phone:1,registered:1 }).exec();
        console.log("userContactList",userContactList);
        var userContactListArray = [];
        userContactList.forEach(function(value,key){
            if(value.phone==phone){
              console.log("123");
            }else{
               userContactListArray.push(value);
            }
        });
        console.log("userContactListArray",userContactListArray);

        res.json(config.get('buildSuccess')('Contacts has been fetched successfully',userContactListArray));
    }catch(e){
        console.log("eee",e)
        throw res.json(config.get('buildError')(e));
    }
}


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}



module.exports = controller;
