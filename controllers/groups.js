const config = require('config');
const userModel = require('../model/users');
const groupsModel = require('../model/groups');
const userContactListsModel = require('../model/usersContactLists');
const groupUsersModel = require('../model/group_and_users');
const paymentModel = require('../model/payments');
const expensesModel = require('../model/expenses');
const mongoose = require('mongoose');

const controller = {};


controller.addGroup = async (req,res) => {
    try{
        let token = req.token;
        let body = req.body;
        body.groupOwner = token._id;
        body.groupUsers = [ { userId : token._id } ];
        let group = new groupsModel(body);
        await group.save();
        res.json(config.get('buildSuccess')('Group Added successfully'));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}


controller.getAllGroups = async (req,res) => {
    try{
        const token = req.token;
        const userGroups = await groupsModel.find({'groupUsers.userId': token._id,"status":"Active" }).exec();
        console.log("userGroups",userGroups);
        const userAddedGroups = await groupUsersModel.find({'userId':token._id}).populate('groupId').exec();
        console.log("userAddedGroups",userAddedGroups);
        var groupArray = [];
        userGroups.forEach(function(val,index){
            var obj = {
               "groupId":val._id,
               "groupName":val.name
            }
            groupArray.push(obj);
        });
        userAddedGroups.forEach(function(value,key){
          if(value.groupId.status=="Active"){
            var obj = {
               "groupId":value.groupId._id,
               "groupName":value.groupId.name
            }
            groupArray.push(obj);
          }

        });
        console.log("groupArray",groupArray);
        await getExpenses(0, groupArray,token._id, async (expenseErr,expenseS) => {
             if(expenseS){
               res.json(config.get('buildSuccess')('Groups Retrieved successfully',expenseS));
             }else{
               res.json(config.get('buildSuccess')('Error retrievng Groups'));
             }
        });
        // await getPaymentStatus(0, groupArray,token._id, async (paymentErr,paymentS) => {
        //      if(paymentS){
        //        res.json(config.get('buildSuccess')('Groups Retrieved successfully',paymentS));
        //      }else{
        //        res.json(config.get('buildSuccess')('Error retrievng Groups'));
        //      }
        // });
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.groupList = async(req,res) => {
   try{
     const token = req.token;
     const userGroups = await groupsModel.find({'groupUsers.userId': token._id,"status":"Active" }).exec();
     console.log("userGroups",userGroups);
     const userAddedGroups = await groupUsersModel.find({'userId':token._id}).populate('groupId').exec();
     console.log("userAddedGroups",userAddedGroups);
     var groupArray = [];
     userGroups.forEach(function(val,index){
         var obj = {
            "groupId":val._id,
            "groupName":val.name
         }
         groupArray.push(obj);
     });
     userAddedGroups.forEach(function(value,key){
       if(value.groupId.status=="Active"){
         var obj = {
            "groupId":value.groupId._id,
            "groupName":value.groupId.name
         }
         groupArray.push(obj);
       }

     });
     console.log("groupArray",groupArray);
     await getExpenses(0, groupArray,token._id, async (expenseErr,expenseS) => {
          if(expenseS){
            res.json(config.get('buildSuccess')('Groups Retrieved successfully',expenseS));
          }else{
            res.json(config.get('buildSuccess')('Error retrievng Groups'));
          }
     });
  }catch(e){
      console.log("eee",e);
      throw res.json(config.get('buildError')(e));
   }
}

controller.getGroupByType = async (req,res) => {
    try{
        const token = req.token;
        const params = req.params;
        let groupFilter = params.getType;
        const userGroups = await groupsModel.find({status : groupFilter  }).exec();
        res.json(config.get('buildSuccess')(`list of user ${params.getType} groups`,userGroups));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.groupUpdate = async(req,res)=> {
    try{
        const token = req.token;
        const params = req.params;
        const body = req.body;
        const userGroup = await groupsModel.findOne({  _id :params.groupId, 'groupUsers.userId': token._id },{_id:1}).exec();
        if(!userGroup){
            throw 'You are not authorized group user';
        }
        await groupsModel.update({  _id :params.groupId }, body).exec();
        res.json(config.get('buildSuccess')(`Group updated`));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}


controller.groupAddUser = async(req,res)=>{
    try{
        const token = req.token;
        const params = req.params;
        const body = req.body;
        const userGroup = await groupsModel.findOne({  _id :params.groupId, 'groupUsers.userId': token._id },{groupUsers:1}).exec();
        if(!userGroup){
            throw 'You are not authorized group user';
        }
        const userContact = await userContactListsModel.findOne({  "_id" :body.contactId, },{_id:1,registered:1,contactUserId:1}).exec();
        if(!userContact){
            throw 'user contactId not found';
        }
        let groupUsers = userGroup.groupUsers || [];
        let newUser = {};
        newUser.usersContactListsId = userContact._id;
        if(userContact && userContact.registered){
            newUser.userId =  userContact.contactUserId;
        }
        groupUsers.push(newUser);
        await groupsModel.update({  _id :params.groupId }, { groupUsers: groupUsers }).exec();
        res.json(config.get('buildSuccess')(`User add successfully`));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.addGroupUsers = async(req,res)=>{
   try{
      console.log("userId",req.body.userId);
      console.log("groupId",req.body.groupId);
      var getUserContactData = await userContactListsModel.find({"_id":req.body.userId}).exec();
      console.log("getUserContactData",getUserContactData)
      var phone = getUserContactData[0].phone;
      var getUserData = await userModel.find({"phone":phone}).exec();
      var userId = getUserData[0]._id;
      var checkGroupEntry = await groupUsersModel.find({"userId": userId,"groupId":req.body.groupId}).exec();
      console.log("userId",checkGroupEntry);
      if(checkGroupEntry && checkGroupEntry.length){
          throw res.json(config.get('buildError')("User already added."));
      }else{
        var obj = {
           userId : userId,
           groupId : req.body.groupId,
           createdOn : new Date()
        };
        let groupUsers = new groupUsersModel(obj);
        await groupUsers.save();
        res.json(config.get('buildSuccess')('User added to group successfully.'));

      }
  }catch(e){
      console.log("eeee",e);
      throw res.json(config.get('buildError')(e));
   }
}

controller.archiveGroup = async(req,res)=>{
  try{
     const groupId = req.query.groupId;
     const body = req.query.status
     await groupsModel.update({  _id : groupId },{"$set":{"status":body}}).exec();
     res.json(config.get('buildSuccess')('Group Status Changed.'));
 }catch(e){
     throw res.json(config.get('buildError')(e));
  }
}

controller.getGroupDetail = async(req,res)=>{
  try{
     const groupId = req.query.groupId;
     const loggedInUser = req.token._id;
     const checkExpenseEntry = await expensesModel.find({"groupId":mongoose.Types.ObjectId(groupId)}).exec();
     const checkGroupUsers = await groupUsersModel.find({"groupId":mongoose.Types.ObjectId(groupId)}).exec();
     console.log("check>>",checkExpenseEntry.length,checkGroupUsers.length);
     if(checkExpenseEntry.length>0 && checkGroupUsers.length>0 ){
       console.log("i come here");
       const result = await groupsModel.aggregate([
         {
          "$match":{
                "_id":mongoose.Types.ObjectId(groupId)
           }
          },
          {"$lookup":{"from":"users","localField":"groupOwner","foreignField":"_id","as":"ownerInfo"}},{"$unwind":"$ownerInfo"},
           {"$project":{"name":1,"status":1,"ownerId":"$ownerInfo._id","ownerName":"$ownerInfo.firstName"}},
            {
            "$lookup":{
                 "from":"expenses",
                 "localField":"_id",
                 "foreignField":"groupId",
                 "as":"expenseData"
            }
           },
           {
              "$unwind":"$expenseData",

           },
           {
              "$group":{
                    "_id":"$expenseData.groupId",
                    "groupName":{"$first":"$name"},
                    "groupStatus":{"$first":"$status"},
                    "ownerId":{"$first":"$ownerId"},
                    "ownerName":{"$first":"$ownerName"},
                    "expenses":{"$push":{"description":"$expenseData.description","amount":"$expenseData.amount","category":"$expenseData.category"}},
                    "totalAmount":{"$sum":"$expenseData.amount"}

                  }

            },{"$project":{"expenses":1,"groupName":1,"totalAmount":1,"groupStatus":1,"ownerId":1,"ownerName":1}},
            {
           "$lookup":{
                  "from":"group-users",
                  "localField":"_id",
                  "foreignField":"groupId",
                  "as":"groupInfo"

               }

           },
           {"$unwind":"$groupInfo"},
           {
           "$lookup":{
              "from":"userscontactlists",
              "localField":"groupInfo.userId",
              "foreignField":"_id",
              "as":"groupInfo.userContactData"
              }
          },
          {
            "$unwind":{
            "path":"$groupInfo.userContactData",
            "preserveNullAndEmptyArrays":true}
          },
         {
         "$lookup":{
              "from":"users",
              "localField":"groupInfo.userId",
              "foreignField":"_id",
              "as":"groupInfo.userData"
         }
         },
         {
              "$unwind":{
              "path":"$groupInfo.userData",
              "preserveNullAndEmptyArrays":true}
          },
          {
              "$group":{
                     "_id":"$_id",
                     "groupName":{"$first":"$groupName"},
                     "groupStatus":{"$first":"$groupStatus"},
                     "totalExpenses":{"$first":"$totalAmount"},
                     "ownerId":{"$first":"$ownerId"},
                     "ownerName":{"$first":"$ownerName"},
                     "expenses":{"$first":"$expenses"},
                     "userList":{"$push":
                       {
                          "userId":{ $ifNull: [ "$groupInfo.userData._id", "$groupInfo.userContactData._id" ] },
                          "userName": { $ifNull: [ "$groupInfo.userData.firstName", "$groupInfo.userContactData.name" ] }
                       }
                     }

                  }

            }
          ]).exec();

          var userList = result[0].userList;
          console.log("userList>>>",userList)
          var newArray = [];
          userList.forEach(function(val,key){
            console.log("val",val.userId,loggedInUser)
              if(val.userId.equals(loggedInUser)){
               console.log("Equals");
              }else{
                newArray.push(val)
              }
          })


          var obj = {};
          obj._id = result[0]._id;
          obj.groupName = result[0].groupName;
          obj.groupStatus = result[0].groupStatus;
          obj.expenses = result[0].expenses;
          obj.ownerId = result[0].ownerId,
          obj.ownerName = result[0].ownerName,
          obj.totalExpenses = result[0].totalExpenses;
          obj.userList = newArray;


         console.log("result>>4",result[0].userList)
          res.json(config.get('buildSuccess')('Group detail retrieved successfully.',obj));
        //  res.json(config.get('buildSuccess')('Group detail retrieved successfully.',result[0]));
     }else if(checkExpenseEntry.length==0 && checkGroupUsers.length==0){
       console.log("groupId",groupId);
          const groupData = await groupsModel.find({"_id":mongoose.Types.ObjectId(groupId)},{"name":1,"status":1}).exec();
          var obj = {};
          obj._id = groupData[0]._id;
          obj.groupName = groupData[0].name;
          obj.groupStatus = groupData[0].status;
          obj.expenses = [];
          obj.userList = [];
          obj.totalExpenses = 0;
          res.json(config.get('buildSuccess')('Group detail retrieved successfully.',obj));

     }else if(checkExpenseEntry.length > 0 && checkGroupUsers.length==0){
       console.log("we are here")
       const result = await groupsModel.aggregate([
         {
          "$match":{
                "_id":mongoose.Types.ObjectId(groupId)
           }},
           {"$lookup":{"from":"users","localField":"groupOwner","foreignField":"_id","as":"ownerInfo"}},{"$unwind":"$ownerInfo"},
            {"$project":{"name":1,"status":1,"ownerId":"$ownerInfo._id","ownerName":"$ownerInfo.firstName"}},
            {
            "$lookup":{
                 "from":"expenses",
                 "localField":"_id",
                 "foreignField":"groupId",
                 "as":"expenseData"
            }
           },
           {
              "$unwind":"$expenseData",
           },
           {
              "$group":{
                    "_id":"$expenseData.groupId",
                    "groupName":{"$first":"$name"},
                    "groupStatus":{"$first":"$status"},
                    "ownerId":{"$first":"$ownerId"},
                    "ownerName":{"$first":"$ownerName"},
                    "expenses":{"$push":{"description":"$expenseData.description","amount":"$expenseData.amount","category":"$expenseData.category"}},
                    "totalExpenses":{"$sum":"$expenseData.amount"}

                  }

            },{"$project":{"expenses":1,"groupName":1,"totalExpenses":1,"groupStatus":1,"ownerId":1,"ownerName":1}}
            ]).exec();

            var obj = {};
            obj._id = result[0]._id;
            obj.groupName = result[0].groupName;
            obj.groupStatus = result[0].groupStatus;
            obj.expenses = result[0].expenses;
            obj.ownerId = result[0].ownerId,
            obj.ownerName = result[0].ownerName,
            obj.totalExpenses = result[0].totalExpenses;
            obj.userList = [];


           console.log("result>>4",result[0].userList)
          res.json(config.get('buildSuccess')('Group detail retrieved successfully.',result[0]));
     }else{
       const result = await groupsModel.aggregate([
         {
          "$match":{
                "_id":mongoose.Types.ObjectId(groupId)
           }},
           {"$lookup":{"from":"users","localField":"groupOwner","foreignField":"_id","as":"ownerInfo"}},{"$unwind":"$ownerInfo"},
            {"$project":{"name":1,"status":1,"ownerId":"$ownerInfo._id","ownerName":"$ownerInfo.firstName"}},
           {
           "$lookup":{
                  "from":"group-users",
                  "localField":"_id",
                  "foreignField":"groupId",
                  "as":"groupInfo"

               }

           },
           {"$unwind":"$groupInfo"},
           {
           "$lookup":{
              "from":"userscontactlists",
              "localField":"groupInfo.userId",
              "foreignField":"_id",
              "as":"groupInfo.userContactData"
              }
           },
           {
            "$unwind":{
            "path":"$groupInfo.userContactData",
            "preserveNullAndEmptyArrays":true}
          },
          {
         "$lookup":{
              "from":"users",
              "localField":"groupInfo.userId",
              "foreignField":"_id",
              "as":"groupInfo.userData"
              }
          },
          {
              "$unwind":{
              "path":"$groupInfo.userData",
              "preserveNullAndEmptyArrays":true}
          },
          {
              "$group":{
                     "_id":"$_id",
                     "groupName":{"$first":"$name"},
                     "groupStatus":{"$first":"$status"},
                     "ownerId":{"$first":"$ownerId"},
                     "ownerName":{"$first":"$ownerName"},
                     "userList":{"$push":
                       {
                          "userId":{ $ifNull: [ "$groupInfo.userData._id", "$groupInfo.userContactData._id" ] },
                          "userName": { $ifNull: [ "$groupInfo.userData.firstName", "$groupInfo.userContactData.name" ] }
                       }
                     }

                  }

          },
          ]).exec();
          var userList = result[0].userList;
          var newArray = [];
          userList.forEach(function(val,key){
            console.log("val",val.userId,loggedInUser)
              if(val.userId.equals(loggedInUser)){
               console.log("Equals");
              }else{
                newArray.push(val)
              }
          })


          var obj = {};
          obj._id = result[0]._id;
          obj.groupName = result[0].groupName;
          obj.groupStatus = result[0].groupStatus;
          obj. ownerId = result[0].ownerId,
          obj.ownerName = result[0].ownerName,
          obj.expenses = [];
          obj.totalExpenses = 0;
          obj.userList = newArray;


         console.log("result>>ww4",result[0].userList)
          res.json(config.get('buildSuccess')('Group detail retrieved successfully.',obj));
     }

 }catch(e){
   console.log("eeeeeeee",e)
     throw res.json(config.get('buildError')(e));
  }
}

async function getExpenses(count,array,userId,callback) {
  console.log("array>>",array);
   if(count>array.length-1){
      return callback(null,array);
   }else{
      var expenses = await expensesModel.find({"groupId":mongoose.Types.ObjectId(array[count].groupId)}).exec();
      console.log("expenses",expenses);
      var sum = 0;
      if(expenses.length>0){
        expenses.forEach(function(val,key){
            sum = sum + val.amount;
        });
        if(sum>0){
          array[count].amount = sum;
          count = count+1;
          getExpenses(count,array,userId,callback);
        }
      }else{
          array[count].amount = 0;
          count = count+1;
          getExpenses(count,array,userId,callback);
      }


   }
}

async function getPaymentStatus(count,array,userId,callback) {
   if(count>array.length-1){
     return callback(null,array);
   }else{
      var borrowedStatus = await paymentModel.find({"groupId":mongoose.Types.ObjectId(array[count].groupId),"spentBy":mongoose.Types.ObjectId(userId)}).exec();
      var sumToBeBorrowed = 0;
      borrowedStatus.forEach(function(val,key){
           sumToBeBorrowed = sumToBeBorrowed + val.amount
      });
      var sumToBeOwed = 0;
      var owedStatus = await paymentModel.find({"groupId":mongoose.Types.ObjectId(array[count].groupId),"spentFor":mongoose.Types.ObjectId(userId)}).exec();
      owedStatus.forEach(function(val,key){
          sumToBeOwed = sumToBeOwed + val.amount;
      })
      if(sumToBeBorrowed>sumToBeOwed){
          array[count].status = "Borrowed";
          array[count].amount = sumToBeBorrowed;
          count = count + 1;
          getPaymentStatus(count,array,userId,callback);
      }else if(sumToBeBorrowed<sumToBeOwed){
          array[count].status = "Owed";
          array[count].amount = sumToBeOwed;
          count = count + 1;
          getPaymentStatus(count,array,userId,callback);
      }else{
          array[count].status = "Settled";
          array[count].amount = 0;
          count = count + 1;
          getPaymentStatus(count,array,userId,callback);
      }
 }

}

module.exports = controller;
