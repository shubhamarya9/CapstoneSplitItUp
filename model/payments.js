const mongoose = require('mongoose');

const payments = mongoose.Schema({
    expenseId : { type: mongoose.Schema.ObjectId, ref: 'expenses' },
    groupId : { type: mongoose.Schema.ObjectId, ref: 'groups' },
    amount : { type: Number , default: 0 },
    spentBy : { type: mongoose.Schema.ObjectId, ref: 'users' },
    spentFor : { type: mongoose.Schema.ObjectId, ref: 'users' },
    createdOn : {type:Date},
    description:{type:String}
},{ timestamps: true });

module.exports = mongoose.model('payments', payments);
