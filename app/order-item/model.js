const {model, Schema} = require('mongoose');

const orderItemSchema = new Schema({

    name: {
        type: String,
        minLength: [5, 'Panjang nama makanan minimal 5 karakter'],
        required: [true, 'Nama makanan harus diisi']
    },

    price: {
        type: Number,
        required: [true, 'Harga harus diisi']
    },

    qty: {
        type: Number,
        required: [true, 'Kuantitas harus diisi'],
        min: [1, 'Kuantitas minimal 1']
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    order: {
        type: Schema.Types.ObjectId,
        ref:'Order'
    }
})

const OrderItem = model('OrderItem', orderItemSchema);

module.exports = OrderItem;