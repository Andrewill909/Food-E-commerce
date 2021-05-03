const {Schema, model} = require('mongoose')

const productSchema = new Schema({
    name:{
        type: String, 
        minLength:[3,'product name must be at least 3 characters'],
        maxLength:[255, 'product name cannot more than 255 characters'],
        required: [true, 'product name must be filled']
    },
    description:{
        type: String,
        maxLength:[1000, 'description length cannot more than 1000 characters'],      
    },
    price:{
        type: Number,
        default:0
    },
    image_url:{
        type: String
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    tags:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ]
},{
    timestamps: true
})

const Product = model('Product', productSchema)

module.exports = Product