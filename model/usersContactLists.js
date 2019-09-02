const mongoose = require('mongoose');

const usersContactLists = mongoose.Schema({
    userId : { type: mongoose.Schema.ObjectId, ref: 'users' },
    name : { type: String ,"default": "" },
    email : { type: String, "default": "" },
    phone : { type: String , "default": ""},
    registered : { type: Boolean ,default : false },
    contactUserId : { type: mongoose.Schema.ObjectId, ref: 'users' },
},{ timestamps: true });

module.exports = mongoose.model('userscontactlists',usersContactLists);
