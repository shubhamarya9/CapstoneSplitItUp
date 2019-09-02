const jwt = require('jsonwebtoken')
const config = require('config');
const jwtService = {}

jwtService.decodeAndValidate = function(request) {
    try {
        if (request.get('Authorization')) {
            return jwt.verify(request.get('Authorization'), config.get('JWT_TOKEN_SECRET'))
        } else throw 'You are not valid user';
    } catch (err) {
       throw err;
    }
}

jwtService.createToken = function(data) {
    try {
        return jwt.sign(data, config.get('JWT_TOKEN_SECRET'), {
            algorithm: 'HS256'
        })
    } catch (err) {
        throw err
    }
}

module.exports = jwtService;