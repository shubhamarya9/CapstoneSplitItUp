const mongoose = require('mongoose');

const notification = mongoose.Schema({
    senderId : { type: mongoose.Schema.ObjectId, ref: 'users' },
    receiverId : { type: mongoose.Schema.ObjectId, ref: 'users' },
    message: { type: 'String' }
},{ timestamps: true });

module.exports = mongoose.model('notifications', notification);
