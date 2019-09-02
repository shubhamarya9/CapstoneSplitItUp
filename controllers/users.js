const config = require('config');
const userModel = require('../model/users');
const groupUsersModel = require('../model/group_and_users');
var mongoose = require('mongoose')

const controller = {};

/**
 * @param  {} req
 * @param  {} res
 */
controller.getAllUser = async (req,res) => {
    try{
        const usersDoc = await userModel.find().exec();
        res.json(config.get('buildSuccess')('User List',usersDoc));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}


controller.updateProfile = async (req,res) => {
    try{
        const token = req.token;
        const body = req.body;
        await userModel.update({ _id: token._id },body).exec();
        res.json(config.get('buildSuccess')('Update Profile Successfully'));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.getProfile = async (req,res) => {
    try{
        const token = req.token;
        const userDoc = await userModel.findOne({ _id: token._id }).exec();
        res.json(config.get('buildSuccess')('user profile',userDoc));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.deleteUser = async(req,res)=>{
   try{
      const groupId = req.body.groupId;
      const userId = req.body.userId;
      const removeUser= await groupUsersModel.remove({"userId":mongoose.Types.ObjectId(userId),"groupId":mongoose.Types.ObjectId(groupId)}).exec();
      res.json(config.get('buildSuccess')('User removed from group.'));
   }catch(e){
      console.log("eeee",e);
      throw res.json(config.get('buildError')(e));
   }
}

module.exports = controller;
