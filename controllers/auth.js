const config = require('config');
const userModel = require('../model/users');
const userContactListsModel = require('../model/usersContactLists');
const jwt = require('../config/jwt');
const md5 = require('md5');
const sendGrid = require('../config/sendGrid');
const randomString = require('random-string');
const { encrypt , decrypt  } = require('../config/crypto');
const controller = {};


/**
 * @param  {} req
 * @param  {} res
 */
controller.login = async (req,res) => {
    try{
        const body = req.body;
        console.log("bodyyyy",body)
        const userDoc  = await userModel.findOne({ email : body.email,"password":md5(body.password)}).exec();
        console.log("userDoc",userDoc)
        if(!userDoc){
            throw 'You are not authorized user.';
        }else{
            const authentication = {
                token: jwt.createToken({_id : userDoc._id , email : userDoc.email }),
                profile: userDoc
            };
            res.json(config.get('buildSuccess')('login successful',authentication));
        }
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}


/**
 * @param  {} req
 * @param  {} res
 */
controller.register = async (req,res) => {
    try{
        const body = req.body;
        const checkUser  = await userModel.findOne({ email : body.email},{_id:1}).exec();
        if(!checkUser){
            body.password = md5(body.password);
            const user = new userModel(body);
            const userDoc  = await user.save();
            if(body && body.phone){
                await userContactListsModel.update({ phone : body.phone },{ registered: true ,contactUserId : userDoc._id  }).exec();
            }

            const authentication = {
                token: jwt.createToken({_id : userDoc._id , email : userDoc.email }),
                profile:  await userModel.findOne({ _id : userDoc._id }).exec()
            };
            res.json(config.get('buildSuccess')('Register successful',authentication));
        }else{
            throw 'this email is already registered';
        }
    }catch(e){
      console.log("eeeeeeee",e);
        throw res.json(config.get('buildError')(e));
    }
}

controller.forgotPassword = async (req,res) => {
    try{
        const body = req.body;
        const checkUser  = await userModel.findOne({ email : body.email},{_id:1}).exec();
        if(!checkUser){
            throw 'You are not registered user';
        }
        const otp = randomString({
            length: 6,
            numeric: true,
            letters: false,
            special: false
        });

        let tmpToken = encrypt({_id: checkUser._id , email : body.email  });
        await userModel.update({ email : body.email  },{ otp : otp }).exec();
        const mailData = {
            to: body.email,
            subject: 'Forgot Password',
            text:`splitItUp forgot password`,
            html: `Enter this OTP <b>${otp}</b>`
        }
        await sendGrid.sendMail(mailData);
        res.json(config.get('buildSuccess')('OTP sent to your registered email',{ tmpToken : tmpToken }));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.resetPassword = async (req,res) => {
    try{
        const body = req.body;
        let userData = decrypt(body.tmpToken);
        const checkUser  = await userModel.findOne({ _id : userData._id,otp : body.otp  },{_id:1}).exec();
        if(!checkUser){
            throw 'OTP is Invalid';
        }
        await userModel.update({ _id : userData._id },{ password : md5(body.password) }).exec();
        res.json(config.get('buildSuccess')('Password has been reset successfully'));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}

controller.changePassword = async (req,res) => {
    try{
        const token = req.token;
        const body = req.body;
        await userModel.update({ _id : token._id },{ password : md5(body.password) }).exec();
        res.json(config.get('buildSuccess')('Password has been reset successfully'));
    }catch(e){
        throw res.json(config.get('buildError')(e));
    }
}



module.exports = controller;
