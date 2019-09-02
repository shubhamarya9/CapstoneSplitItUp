const mongoose = require('mongoose');

const expenses = mongoose.Schema({
    groupId : { type: mongoose.Schema.ObjectId, ref: 'groupId' },
    amount : { type: Number , default: 0 },
    category : { type: String },
    currencyType : { type: String , "default":"$" },
    description : { type: String ,"default": "" },
    expenseCreatedDate : { type: String },
    userId: { type: mongoose.Schema.ObjectId, ref: 'users' }
},{ timestamps: true });

module.exports = mongoose.model('expenses', expenses);
