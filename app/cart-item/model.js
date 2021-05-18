const {Schema, model} = require('mongoose');

const cartItemSchema = new Schema({

    name: {
        type: String,
        minLength: [5, 'Panjang nama makanan minimal 5 karakter'],
        required: [true, 'Nama harus diisi']
    },

    qty: {
        type: Number,
        required: [true, 'qty harus diisi'],
        min: [1, 'minimal qty adalah 1']
    },

    price: {
        type: Number,
        default: 0
    },

    image_url: {
        type: String
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
});

const CartItem = model('CartItem', cartItemSchema);

module.exports = CartItem;