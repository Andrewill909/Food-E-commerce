const mongoose = require('mongoose');
const {model, Schema} = mongoose;

let categorySchema = new Schema({
    name:{
        type: String,
        minLength: [3, 'panjang nama kategori minimal 3 karakter'],
        maxLength: [20, 'panjang nama kategori maksimal 20 karakter'],
        required: [true, 'Nama kategori harus diisi']
    }
})

const Category = model('Category', categorySchema);

module.exports = Category;