const mongoose = require('mongoose')
const {Schema, model} = mongoose;
const bcrypt = require('bcrypt');
const HASH_ROUND = 10;
const AutoIncrement = require('mongoose-sequence')(mongoose)

let userSchema = new Schema({
    full_name: {
        type: String,
        required: [true, 'Nama harus diisi'],
        maxLength: [255, 'Panjang nama antara 3 sampai 255 karakter'],
        minLength: [3, 'Panjang nama antara 3 sampai 255 karakter']
    },
    customer_id:{
        type: Number
    },
    email:{
        type: String,
        required: [true, 'email harus diisi'],
        maxLength: [255, 'Panjang email maksimal 255 karakter']
    },
    password:{
        type: String,
        required: [true, 'password harus diisi'],
        maxLength: [255, 'panjang password maksimal 255 karakter']
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    token: [String]
},{
    timestamps: true
});

userSchema.plugin(AutoIncrement, {inc_field: 'customer_id'})

userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();
})

userSchema.path('email').validate(function(value){

    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return EMAIL_RE.test(value);

}, attr => `${attr.value} harus merupakan email yang valid!`);

userSchema.path('email').validate(async function(value){

    try {
        const count = await this.model('User').count({email: value});

        //TODO jika ditemukan document / sudah ada, maka akan di return false
        return !count;
    } catch (error) {
        throw error;
    }
    
}, attr => `${attr.value} sudah terdaftar`);

const User = model('User', userSchema);

module.exports = User;