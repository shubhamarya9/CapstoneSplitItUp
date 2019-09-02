const mongoose = require('mongoose');

const activities = mongoose.Schema({
    name : { type: String ,"default": "" },
    description : { type: String ,"default": "" },
    userId: { type: mongoose.Schema.ObjectId, ref: 'users' }    
},{ timestamps: true });

module.exports = mongoose.model('activities', activities);
