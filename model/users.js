const mongoose = require('mongoose');

const users = mongoose.Schema({
    userName : { type: String },
    firstName : { type: String ,"default": "" },
    lastName : { type: String ,"default": "" },
    email : { type: String , required: true , unique: true },
    password : { type: String , required: true, select: false },
    otp : { type: String ,  select: false  },
    phone : { type: String , default :"" },
    userBudget : { type : String , default :"" },
    guiId : { type: String, default :"" },
    notificationText : { type: Boolean ,default : false },
    notificationEmail : { type: Boolean ,default : false },
    notificationPush : { type: Boolean ,default : false }
},{ timestamps: true });

module.exports = mongoose.model('users',users);



