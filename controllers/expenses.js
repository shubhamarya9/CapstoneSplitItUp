const config = require('config');
const moment = require('moment');
const expensesModel = require('../model/expenses');
const groupUsersModel = require('../model/group_and_users');
const groupsModel = require('../model/groups');
const paymentModel = require('../model/payments');
const userModel = require('../model/users');
const Notifications = require('../config/notification.js');
const sendGrid = require('../config/sendGrid');
const userContactListsModel = require('../model/usersContactLists');
var mongoose = require('mongoose');

const controller = {};


controller.addExpenses = async (req,res) => {
    try{

        let token = req.token;
        let body = req.body;
        body.userId = token._id;
        let expense = new expensesModel(body);
        var data = await expense.save();
        var findMembersInGroup = await groupUsersModel.find({"groupId":req.body.groupId}).exec();
        var findGroupOwner = await groupsModel.find({"_id":req.body.groupId}).exec();
        var userArray = [];
        findMembersInGroup.forEach(function(val,index){
            if(val.userId.equals(body.userId)){
              console.log("Matched");
            }else{
              userArray.push(val.userId);
            }
        });
        findGroupOwner.forEach(function(val,index){
           if(val.groupOwner.equals(body.userId)){
                 console.log("Matched");
           }else{
                userArray.push(val.groupOwner);

           }
        })
        console.log("userArray",userArray)
        await checkUserSettings(0,userArray,async(userErr,userSuccess)=>{
             if(userErr){

             }else{
                 var totalMembers = userArray.length +1;
                 var amount= data.amount/totalMembers;
                 await addPayments(0, userArray,data,amount, async (paymentErr,paymentS) => {
                      if(paymentS){
                        res.json(config.get('buildSuccess')('Expense Added successfully'));
                      }else{
                        res.json(config.get('buildSuccess')('Error Adding Expenses'));
                      }
                })
             }
        });
        // console.log("checkUserSettingsddd",result);
        // var sendNotification = await Notifications.sendNotification(userArray,"multiple","Expense Alert!","Expense Added.");
        // var totalMembers = userArray.length +1;
        // var amount= data.amount/totalMembers;
        // await addPayments(0, userArray,data,amount, async (paymentErr,paymentS) => {
        //      if(paymentS){
        //        res.json(config.get('buildSuccess')('Expense Added successfully'));
        //      }else{
        //        res.json(config.get('buildSuccess')('Error Adding Expenses'));
        //      }
        // })
    }catch(e){
      console.log("eeeee",e)
        throw res.json(config.get('buildError')(e));
    }
}


controller.getAllExpenses = async (req,res) => {
    try{
        const token = req.token;
        console.log("token>>",token);
        if(req.query.groupId){
          const userExpenses = await expensesModel.find({ userId: token._id, groupId:req.query.groupId }).exec();
          res.json(config.get('buildSuccess')('list of user expenses',userExpenses));
        }else{
          const userExpenses = await expensesModel.find({ userId: token._id }).exec();
          res.json(config.get('buildSuccess')('list of user expenses',userExpenses));
        }

    }catch(e){
      console.log("eee",e)
        throw res.json(config.get('buildError')(e));
    }
}

controller.getExpensesStatus = async (req,res) => {
    try{
        const token = req.token;
        const type = req.query.type;
        if(type=="owe"){
          // var oweList = await paymentModel.find({"spentFor":token._id}).populate('spentBy').exec();
           var oweList = await paymentModel.aggregate([{
             "$match":{"spentFor":mongoose.Types.ObjectId(token._id)}
              },{
                 "$lookup":{
                        "from":"users",
                        "localField":"spentBy",
                        "foreignField":"_id",
                        "as":"spentByInfo"

                     }

              },{
                "$unwind":{
                       "path":"$spentByInfo"
                    }
              },
              {
                 "$project":{
                        "receiver":"$spentByInfo.firstName",
                        "receiverId":"$spentByInfo._id",
                        "amount":1,
                        "spentFor":1

                     }

              },
              {
                "$group":{
                       "_id":"$receiverId",
                       "spentForId":{"$first":"$spentFor"},
                       "receiverId":{"$first":"$receiverId"},
                       "name":{"$first":"$receiver"},
                       "amount":{"$sum":"$amount"}

                    }
              }

            ]).exec();
            var borrowList = await paymentModel.aggregate([{
              "$match":{"spentBy":mongoose.Types.ObjectId(token._id)}
               },{
                  "$lookup":{
                         "from":"users",
                         "localField":"spentFor",
                         "foreignField":"_id",
                         "as":"spentForInfo"

                      }

               },{
                 "$unwind":{
                        "path":"$spentForInfo"
                     }
               },
               {
                  "$project":{
                         "payer":"$spentForInfo.firstName",
                         "payerId":"$spentForInfo._id",
                         "amount":1,
                         "spentBy":1

                      }

               },
               {
                 "$group":{
                        "_id":"$payerId",
                        "spentById":{"$first":"$spentBy"},
                        "payerId":{"$first":"$payerId"},
                        "name":{"$first":"$payer"},
                        "amount":{"$sum":"$amount"}

                     }
               }
              ]).exec();
                    var oweArray = oweList;
                    var borrowArray = borrowList;
                    console.log("oweArray",oweArray);
                    console.log("borrowArray",borrowArray);
                    var finalArray = [];

                     for(var i = 0;i<oweArray.length;i++){
                        for(var j=0;j<borrowArray.length;j++){
                          if(oweArray[i].receiverId.equals(borrowArray[j].payerId)){
                             console.log("amounts",oweArray[i].amount,borrowArray[j].amount);
                               if(oweArray[i].amount>borrowArray[j].amount){
                                 var obj = oweArray[i];
                                 obj.amount = oweArray[i].amount - borrowArray[j].amount;
                                 oweArray.save;
                               }else{
                                 var obj = oweArray[i];
                                 obj.amount = 0;
                                 oweArray.save;

                               }
                              }
                        }
                     }
                     console.log("finalArray",oweArray);
                     res.json(config.get('buildSuccess')('Owe List',oweArray));
                  }else{
                    var borrowList = await paymentModel.aggregate([{
                      "$match":{"spentBy":mongoose.Types.ObjectId(token._id)}
                       },{
                          "$lookup":{
                                 "from":"users",
                                 "localField":"spentFor",
                                 "foreignField":"_id",
                                 "as":"spentForInfo"

                              }

                       },{
                         "$unwind":{
                                "path":"$spentForInfo"
                             }
                       },
                       {
                          "$project":{
                                 "payer":"$spentForInfo.firstName",
                                 "payerId":"$spentForInfo._id",
                                 "amount":1,
                                 "spentBy":1

                              }

                       },
                       {
                         "$group":{
                                "_id":"$payerId",
                                "spentById":{"$first":"$spentBy"},
                                "payerId":{"$first":"$payerId"},
                                "name":{"$first":"$payer"},
                                "amount":{"$sum":"$amount"}

                             }
                       }
                      ]).exec();

                      var oweList = await paymentModel.aggregate([{
                        "$match":{"spentFor":mongoose.Types.ObjectId(token._id)}
                         },{
                            "$lookup":{
                                   "from":"users",
                                   "localField":"spentBy",
                                   "foreignField":"_id",
                                   "as":"spentByInfo"

                                }

                         },{
                           "$unwind":{
                                  "path":"$spentByInfo"
                               }
                         },
                         {
                            "$project":{
                                   "receiver":"$spentByInfo.firstName",
                                   "receiverId":"$spentByInfo._id",
                                   "amount":1,
                                   "spentFor":1

                                }

                         },
                         {
                           "$group":{
                                  "_id":"$receiverId",
                                  "spentForId":{"$first":"$spentFor"},
                                  "receiverId":{"$first":"$receiverId"},
                                  "name":{"$first":"$receiver"},
                                  "amount":{"$sum":"$amount"}

                               }
                         }

                       ]).exec();

                       var oweArray = oweList;
                       var borrowArray = borrowList;
                       console.log("oweArray",oweArray);
                       console.log("borrowArray",borrowArray);
                      for(var i = 0;i<borrowArray.length;i++){
                        for(var j=0;j<oweArray.length;j++){
                          if(borrowArray[i].payerId.equals(oweArray[j].receiverId)){
                             console.log("amounts",borrowArray[i].amount,oweArray[j].amount);
                               if(borrowArray[i].amount>oweArray[j].amount){
                                 var obj = borrowArray[i];
                                 obj.amount = borrowArray[i].amount - oweArray[j].amount;
                                 borrowArray.save;
                               }else{

                                 var obj = borrowArray[i];
                                 obj.amount = 0;
                                 borrowArray.save;

                               }
                              }
                        }
                     }
                     console.log("finalArray",borrowArray);
                     res.json(config.get('buildSuccess')('Borrow List',borrowList));
                  }

              }catch(e){
                console.log("e",e)
                  throw res.json(config.get('buildError')(e));
              }
          }

          controller.getProfileHistory = async(req,res)=>{
              const loggedInUserId = req.token._id;
              const friendProfileId = req.query.friendId;
              console.log("loggedInUserId",loggedInUserId);
              console.log("friendProfileId",friendProfileId);
              const result = await paymentModel.aggregate([{
                   "$match":{
                         "$or":[{
                             "spentBy":mongoose.Types.ObjectId(loggedInUserId),
                             "spentFor":mongoose.Types.ObjectId(friendProfileId),
                          },{
                             "spentBy":mongoose.Types.ObjectId(friendProfileId),
                             "spentFor":mongoose.Types.ObjectId(loggedInUserId),

                          }]

                       }

              },{
                  "$lookup":{
                         "from":"users",
                         "localField":"spentBy",
                         "foreignField":"_id",
                         "as":"spentByInfo"

                      }
               },{"$unwind":"$spentByInfo"},{
                  "$lookup":{
                       "from":"users",
                       "localField":"spentFor",
                       "foreignField":"_id",
                       "as":"spentForInfo"
                }
               },{"$unwind":"$spentForInfo"},{
                 "$project":{
                        "_id":1,
                        "amount":1,
                        "expenseId":1,
                        "groupId":1,
                        "spentBy":"$spentByInfo.firstName",
                        "spentById":"$spentByInfo._id",
                        "spentFor":"$spentForInfo.firstName",
                        "spentForId":"$spentForInfo._id",
                        "createdOn":1

                     }

               },{"$sort":{"createdOn":-1}}
             ]).exec()
   console.log("result",result)
   res.json(config.get('buildSuccess')('Payment History retrieved successfully.',result));
}

controller.addSettlement = async(req,res)=>{
    try{
      var obj = {};
      if(req.body.type=="owe"){
        obj.spentBy = req.token._id;
        obj.spentFor = req.body.userId;
      }else{
        obj.spentFor = req.token._id;
      obj.spentBy = req.body.userId;
      }
      
      obj.amount = req.body.amount;
      obj.description = req.body.description;
      obj.createdOn = new Date();
      var result = await paymentModel.create(obj);
      var oweAmount = await paymentModel.aggregate([{
      "$match":{
            "spentFor":mongoose.Types.ObjectId(req.token._id),
            "spentBy":mongoose.Types.ObjectId(req.body.userId)
          }},{
            "$lookup":
                { "from":"users",
                  "localField":"spentBy",
                  "foreignField":"_id",
                  "as":"spentByInfo"
                }},
                {"$unwind":"$spentByInfo"},
             {
               "$lookup":
                  { "from":"users",
                    "localField":"spentFor",
                    "foreignField":"_id",
                    "as":"spentForInfo"
                  }},
                  {"$unwind":"$spentForInfo"},
             {
                "$project":
                   {
                      "spentById":"$spentByInfo._id",
                      "spentByName":"$spentByInfo.firstName",
                      "spentForId":"$spentForInfo._id",
                      "spentForName":"$spentForInfo.firstName",
                      "amount":1
                   }
              },
              {
                      "$group":{
                             "_id":"$spentForId",
                             "spentById":{"$first":"$spentById"},
                             "spentByName":{"$first":"$spentByName"},
                             "oweAmount":{"$sum":"$amount"}

                          }
              }
        ]).exec();

        var borrowAmount = await paymentModel.aggregate([
             {
              "$match":{
                    "spentBy":mongoose.Types.ObjectId(req.token._id),
                    "spentFor":mongoose.Types.ObjectId(req.body.userId)
                  }

              },
              {
                "$lookup":
                  { "from":"users",
                    "localField":"spentBy",
                    "foreignField":"_id",
                    "as":"spentByInfo"
                  }
               },
               {"$unwind":"$spentByInfo"},
               {
                  "$lookup":
                     {
                        "from":"users",
                        "localField":"spentFor",
                        "foreignField":"_id",
                        "as":"spentForInfo"
                      }
                },
                {"$unwind":"$spentForInfo"},
                {
                   "$project":
                      {
                        "spentById":"$spentByInfo._id",
                        "spentByName":"$spentByInfo.firstName",
                        "spentForId":"$spentForInfo._id",
                        "spentForName":"$spentForInfo.firstName",
                        "amount":1
                      }
                 },
                 {
                        "$group":{
                               "_id":"$spentById",
                               "spentForId":{"$first":"$spentForId"},
                               "spentForName":{"$first":"$spentForName"},
                               "borrowAmount":{"$sum":"$amount"}

                            }
                 }
         ]).exec();
//       var userContactData = await userContactListsModel.find({"_id":req.body.userId},{"phone":1}).exec();
//       console.log("userContactData",userContactData);
//       var phone = userContactData[0].phone;
      var userData = await userModel.find({"_id":req.body.userId}).exec();
      console.log("userData",userData);
      if(userData && userData.length){
        if(userData[0].notificationPush==true){
           console.log("1");
           var sendNotification = await Notifications.sendNotification(req.body.userId,"Expense Alert!","Expense Added.");
           console.log("oweAmount",oweAmount,borrowAmount);
           if(oweAmount[0].oweAmount>borrowAmount[0].borrowAmount){
              oweAmount = oweAmount[0].oweAmount - borrowAmount[0].borrowAmount;
              borrowAmount = 0;
           }else if(borrowAmount[0].borrowAmount>oweAmount[0].oweAmount){
             console.log("oweAmount",oweAmount[0].oweAmount,borrowAmount[0].borrowAmount - oweAmount[0].oweAmount);
              borrowAmount = borrowAmount[0].borrowAmount - oweAmount[0].oweAmount;
               oweAmount = 0;
           }else{
              oweAmount = 0;
              borrowAmount = 0;
           }
           var obj = {
              "oweAmount":oweAmount,
              "borrowAmount":borrowAmount
           }
           res.json(config.get('buildSuccess')('Success.',obj));
        //   res.json(config.get('buildSuccess')('Success.'));
        }else{
          console.log("2");
          const mailData = {
              to: userData[0].email,
              subject: 'Expense Alert',
              text:`Expense Added`,
              html: `ExpenseAdded`
          }
          var sendEmail = await sendGrid.sendMail(mailData);
          console.log("oweAmount",oweAmount,borrowAmount);
          if(oweAmount[0].oweAmount>borrowAmount[0].borrowAmount){
             oweAmount = oweAmount[0].oweAmount - borrowAmount[0].borrowAmount;
             borrowAmount = 0;
          }else if(borrowAmount[0].borrowAmount>oweAmount[0].oweAmount){
            console.log("oweAmount",oweAmount[0].oweAmount,borrowAmount[0].borrowAmount - oweAmount[0].oweAmount);
             borrowAmount = borrowAmount[0].borrowAmount - oweAmount[0].oweAmount;
              oweAmount = 0;
          }else{
             oweAmount = 0;
             borrowAmount = 0;
          }
          var obj = {
             "oweAmount":oweAmount,
             "borrowAmount":borrowAmount
          }
          res.json(config.get('buildSuccess')('Success.',obj));
        }
    }else{
      res.json(config.get('buildSuccess')('Success.'));
    }
  }catch(e){
      console.log("e",e)
      throw res.json(config.get('buildError')(e));
    }

}

controller.dashboardData = async(req,res)=>{
    var userId = req.token._id;
    var budgetAmount =await userModel.find({"_id":mongoose.Types.ObjectId(userId)},{"userBudget":1}).exec();
    console.log("budgetAmount",budgetAmount);
    var expenseAmount =await expensesModel.aggregate([{
        "$match":{"userId":mongoose.Types.ObjectId(userId)}
    },
    { $group: { _id : "$userId", sum : { $sum: "$amount" } } },{"$project":{sum:1}}
    ]).exec();
    console.log("expenseAmount",expenseAmount);
    var sumToBeOwed = 0;
    var owedAmount = await paymentModel.find({"spentFor":mongoose.Types.ObjectId(userId)}).exec();
    owedAmount.forEach(function(val,key){
        sumToBeOwed = sumToBeOwed + val.amount;
    })
    var sumToBeBorrowed = 0;
    var borrowedAmount = await paymentModel.find({"spentBy":mongoose.Types.ObjectId(userId)}).exec();
    borrowedAmount.forEach(function(val,key){
         sumToBeBorrowed = sumToBeBorrowed + val.amount
    });
    var obj = {};
    obj.budget = ((budgetAmount[0].userBudget=='')?0.00:(parseFloat(budgetAmount[0].userBudget)));
    obj.expenses = ((expenseAmount && expenseAmount[0])?(expenseAmount[0].sum):0.00);
    obj.owe = sumToBeOwed;
    obj.borrowed = sumToBeBorrowed;
    res.json(config.get('buildSuccess')('Success.',obj));
}

controller.reportsData = async(req,res)=>{
    var userId = req.token._id;
    var categoryCount = await expensesModel.aggregate([{
      "$match":{"userId":mongoose.Types.ObjectId(userId)}
    },{
      "$group":{
             "_id":"$category",
             "count":{"$sum":"$amount"}

          }
   },{"$project":{"categoryCount":"$count"}},
   ]).exec();
   res.json(config.get('buildSuccess')('Success.',categoryCount));
}

async function addPayments(count,array,data,amount,callback) {
    if(count>array.length-1){
      return callback(null,"Success");
    }else{
      var obj = {};
      obj.expenseId = data._id;
      obj.spentBy = data.userId;
      obj.groupId = data.groupId;
      obj.spentFor = array[count];
      obj.amount = amount;
      obj.description = data.description;
      obj.createdOn = new Date();
      paymentModel.create(obj,function(err,result){
          if(err){
            console.log(err,"err")
              count = count+1;
              (count,array,data,amount,callback);
          }else{
            console.log("data",data)
            count=count+1;
            addPayments(count,array,data,amount,callback);
          }
      })

    }
}

async function checkUserSettings(count,array,callback) {
  console.log("count",count,"array",array);
    try {
      if(count>array.length-1){
        return callback(null,"Success");
      }else{
        console.log("eretert");
        // var userContactData = await userContactListsModel.find({"_id":array[count]},{"phone":1}).exec();
        // console.log("userContactData",userContactData);
        // var phone = userContactData[0].phone;
        // console.log("phone>>>",phone);
        var userData = await userModel.find({"_id":mongoose.Types.ObjectId(array[count])}).exec();
        console.log("userData",userData)
        if(userData && userData.length){
          if(userData[0].notificationPush==true){
             console.log("1");
             var sendNotification = await Notifications.sendNotification(array[count],"Expense Alert!","Expense Added.");
             console.log("sendNotification",sendNotification)
             count = count + 1;
             checkUserSettings(count,array,callback);
          }else if(userData[0].notificationEmail==true){
            console.log("2");
            const mailData = {
                to: userData[0].email,
                subject: 'Expense Alert',
                text:`Expense Added`,
                html: `ExpenseAdded`
            }
            var sendEmail = await sendGrid.sendMail(mailData);
            console.log("sendEmail",sendEmail);
            count = count + 1;
            checkUserSettings(count,array,callback);
          }else{
            console.log("3");
            count = count + 1;
            checkUserSettings(count,array,callback);
          }
        }else{
          console.log("4");
          count = count + 1;
          checkUserSettings(count,array,callback);
        }

      }
    } catch(error) {
      return callback(error,null);
    }
};


module.exports = controller;
