const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderSchema = new Schema({

    status: {
        type: String,
        enum: ['waiting_payment', 'processing', 'in_delivery', 'delivered'],
        default: 'waiting_payment'
    },

    delivery_fee: {
        type: Number,
        default: 0
    },

    delivery_address: {
        provinsi: {Type: String, required: [true, 'Provinsi harus diisi']},
        kabupaten: {Type: String, required: [true, 'Kabupaten harus diisi']},
        kecamatan: {Type: String, required: [true, 'Kecamatan harus diisi']},
        kelurahan: {Type: String, required: [true, 'Kelurahan harus diisi']},
        detail: {Type: String}
    },

    user: {
        Type: Schema.Types.ObjectId,
        ref:'User'
    },

    order_items: [
        {
        Type: Schema.Types.ObjectId,
        ref:'OrderItem'
    }
    ]
}, {timestamps: true});

orderSchema.plugin(AutoIncrement, {inc_field: 'order_number'});

orderSchema.virtual('items_count').get(function() {
    return this.order_items.reduce((total, item) => {
        return total + parseInt(item.qty)
    }, 0);
});

const Order = model('Order', orderSchema);

module.exports = Order;