var fcm = require('fcm-notification');
var FCM = new fcm(__dirname+'/splitiitup-firebase-adminsdk-d65br-cabb76b3ad.json');
var TopicName = 'splitItUp';
var NotificationModel = require('model/notifications');

exports.sendNotification = (data,flag,title,message)=>{
   return new Promise(function(resolve,reject){
        var count = 0;
        var TopicName = 'splitItUp'+data;
        console.log("TopicName??",TopicName);
        var message = {
          notification:{
            title :title,
            body : message

          },
          topic: TopicName
        };
        FCM.send(message, function(err, data) {
            if(err){
                resolve(null);
            }else {
                resolve(data);
            };
        });
   });
};
