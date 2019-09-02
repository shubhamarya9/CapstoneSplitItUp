const config = require('config');
const jwt = require('jsonwebtoken')
const AuthMiddleWare = {};


AuthMiddleWare.authorization = function(req, res, next) {
    try{
        if (req.get('Authorization')) {
            req.token = jwt.verify(req.get('Authorization'), config.get('JWT_TOKEN_SECRET'));
            next();
        } else {
            throw 'Not Authorized';
        }
    }catch(err){
      console.log("err",err)
        throw res.json(config.get('buildError')(err));
    }
};

module.exports = AuthMiddleWare;
