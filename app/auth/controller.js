const User = require('../user/model');
const config = require('../config');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {getToken} = require('../utils/get-token');

async function register(req, res, next) {
    try {
        const payload = req.body;

        let user = new User(payload);

        await user.save();

        return res.json(user);
    } catch (error) {
        if(error && error.name === 'ValidationError'){
            return res.json({
                error:1,
                message: error.message,
                fields: error.errors
            })
        }

        next(error);
    }
}

async function localStrategy(email, password, done) {
    try {
        let user = await User.findOne({email}).select('-__v -createdAt -updatedAt -cart_items -token');

        if(!user){return done(null, false, {message: `invalid username or password`});}

        if(bcrypt.compareSync(password, user.password)){

            //toJSON utk menghilangkan field yg tdk perlu di consume
            ({password, ...userWithoutPassword} = user.toJSON());

            return done(null, userWithoutPassword);
        }
    } catch (error) {
        done(error, null);
    }

    done();
}

async function login(req, res, next) {
    passport.authenticate('local', async function(err, user){

        if(err) return next(err);

        if(!user) return res.json({error: 1, message: 'email or password incorrect'})

        //TODO buat json web token
        let signed = jwt.sign(user, config.secretKey);

        //TODO simpan token ke user dengan $push ke array token
        await User.findOneAndUpdate({_id: user._id}, {$push: {token: signed}}, {new: true});

        //TODO response ke client
        return res.json({
            message:'logged in successfully',
            user: user,
            token: signed
        })
    })(req, res, next);
}

function me(req, res, next) {

    if(!req.user){
        return res.json({
            error:1,
            message:`you are not login or token expired`
        });
    }

    return res.json(req.user);
}

async function logout(req, res, next) {
    //dapatkan token dari request 
    let token = getToken(req);

    //hapus tokend dari user
    let user = await User.findOneAndUpdate({token: {$in: [token]}},{$pull: {token}},{useFindAndModify: false});

    //cek jika user atau token tidak ada
    if(!token || !user){
        return res.json({
            error:1,
            message:'user not found'
        });
    }

    //logout berhasil
    return res.json({
        error:0,
        message:'logout berhasil'
    })
}

module.exports = {
    register, localStrategy, login, me, logout
}