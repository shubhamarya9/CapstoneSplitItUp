const mongoose = require('mongoose');

const groups = mongoose.Schema({
    name : { type: String ,"default": "" },
    description : { type: String ,"default": "" },
    groupOwner: { type: mongoose.Schema.ObjectId, ref: 'users' }   ,
    groupUsers : [{ userId : {type : mongoose.Schema.ObjectId , ref : 'users'}, usersContactListsId : {type : mongoose.Schema.ObjectId , ref : 'userscontactlists'} }],
    status: { type:String,enum:["Active","Archived"],default:"Active" }
},{ timestamps: true });

module.exports = mongoose.model('groups', groups);
