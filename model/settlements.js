const mongoose = require('mongoose');

const settlements = mongoose.Schema({
    senderUserId: { type: mongoose.Schema.ObjectId, ref: 'users' },
    receiverUserId: { type: mongoose.Schema.ObjectId, ref: 'users' },
    approvalStatus : { type: Boolean,default: false },
    amount : { type: Number },
    currencyType : { type: String , "default":"$" },
    description : { type: String ,"default": "" },
},{ timestamps: true });

module.exports = mongoose.model('settlements', settlements);
