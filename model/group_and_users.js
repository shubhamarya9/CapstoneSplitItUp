const mongoose = require('mongoose');

const groupUsers = mongoose.Schema({
     groupId : { type: mongoose.Schema.ObjectId, ref: 'groups' },
     userId : { type: mongoose.Schema.ObjectId, ref: 'users' },
     createdOn : {type:Date}
},{ timestamps: true });

module.exports = mongoose.model('group-users', groupUsers);
