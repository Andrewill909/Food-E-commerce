const jwt = require('jsonwebtoken');
const {getToken} = require('../utils/get-token');
const config = require('../config');
const User = require('../user/model');

function decodeToken() {
    return async function(req, res, next) {
        try {
            let token = getToken(req);

            if(!token) return next();

            req.user = jwt.verify(token, config.secretKey);

            let user = await User.findOne({token: {$in: [token]}});
            
            //token expired (user tdk ditemukan)
            if(!user){
                return res.json({
                    error:1,
                    message: `Token expired`
                })
            }
        } catch (error) {
            if(error && error.name === `JsonWebTokenError`){
                return res.json({
                    error:1,
                    message: error.message
                })
            }

            //error lainya
            next(error);
        }

        return next();
    }
}

module.exports = {
    decodeToken
}