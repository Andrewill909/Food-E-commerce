const {Schema, model} = require('mongoose');

const tagSchema = new Schema({
    name:{
        type: String,
        minLength:[3, 'Panjang nama tag minimal 3 karakter'],
        maxLength: [20, 'Panjang nama tag maksimal 20 karakter'],
        required: [true, 'Nama tag harus diisi']
    }
})

const Tag = model('Tag', tagSchema);

module.exports = Tag;