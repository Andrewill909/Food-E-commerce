const Product = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model');

const config = require('../config');
const path = require('path');
const fs = require('fs');


//function store
async function store(req, res, next){
    try {
        let payload = req.body;

        //TODO cek adanya field category pada payload
        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
            //let category = await Category.findOne({name: new RegExp(payload.category, 'i')})
            if(category){
                payload = {...payload, category: category._id};
            }else{
                //hapus properti
                delete payload.category;
            }
        }

        //TODO cek adanya field tags yang memiliki isi (bukan sekedar array kosong)
        if(payload.tags && payload.tags.length){
            const tags = await Tag.find({name: {$in: payload.tags}});
            // const tags = await Tag.find().where('name').in(payload.tags).exec();

            //jika ada resultnya
            if(tags.length){
                payload = {...payload, tags: tags.map(tag => tag._id)};
            }
        }

        //TODO cek adanya file yang diupload
        if(req.file){
            //lokasi file sementara yg di upload
            let temp_path = req.file.path;
            
            //mendapatkan ekstensi file
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]
            //nama random file + ekstensi
            let filename = req.file.filename + '.' + originalExt

            let targetPath = path.resolve(config.rootPath, `public/upload/${filename}`)
            
            const src = fs.createReadStream(temp_path);
            const dest = fs.createWriteStream(targetPath);

            src.pipe(dest);

            src.on('end', async () => {
                try {
                    let product = new Product({...payload, image_url: filename});

                    await product.save();
                    
                    return res.json(product);

                } catch (error) {
                    //jika error hapus file yg sudah terupload ke dir
                    fs.unlinkSync(targetPath);

                    //cek jika error karena validasi mongoDB
                    if(error && error.name === 'ValidationError'){
                        return res.json({
                            error:1,
                            message: error.message,
                            fields: error.errors
                        })
                    }

                    //error lainya
                    next(error);
                }
                
            })

            src.on('error', async() => {
                next(error);
            })

        }else{
            //buat product dari payload/data yang dikirim dari client
            let product = new Product(payload);

            //save ke db
            await product.save();

            return res.json(product);
        }
        
    } catch (error) {
        console.log(error)
        //TODO cek tipe error
        if(error && error.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: error.message,
                fields: error.errors
            })
        }

        //TODO ini utk pass error yang tidak bisa ditangani (alias biar express tangani)
        next(error)
    }
    
}

//function get data
async function index(req, res, next) {
    try {
        //limit dan skip dibawah bertipe string, maka harus di parsing
        let {limit = 10, skip = 0, q= '', category= '', tags= []} = req.query;

        let criteria = {};
        if(q.length){
            // criteria = {...criteria, name: {$regex: `${q}`, $options: 'i'}}
            criteria = {...criteria, name: new RegExp(`${q}`,'i')};

        }
        if(category.length){
            //! ingat isi field category pada document product adalah id, bukan nama category
            category = await Category.findOne({name: new RegExp(category,'i')});

            criteria = {...criteria, category: category._id};
        }

        if(tags.length){
            tags = await Tag.find().where('name').in(tags).exec();

            criteria = {...criteria, tags: {$in: tags.map(tag => tag._id)}};
        }

        const products = await Product.find(criteria).limit(parseInt(limit)).skip(parseInt(skip)).populate('category').populate('tags');
        return res.json(products);

    } catch (error) {
        next(error);
    }
}

//function update
async function update(req, res, next){
    try {
        let payload = req.body;

        //TODO cek adanya field category pada payload
        if(payload.category){
            const category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
            // const category = await Category.findOne({name: new RegExp(payload.category,'i')});
            if(category){
                payload = {...payload, category: category._id};
            }else{
                delete payload.category;
            }
        }

        //TODO cek adanya field tags yang memiliki isi (bukan sekedar array kosong)
        if(payload.tags && payload.tags.length){
            const tags = await Tag.find({name: {$in: payload.tags}});
            // const tags = await Tag.find().where('name').in(payload.tags).exec();

            //jika ada resultnya
            if(tags.length){
                payload = {...payload, tags: tags.map(tag => tag._id)};
            }
        }

        //TODO cek adanya file image yang diupload
        if(req.file){
            //lokasi file sementara yg di upload
            let temp_path = req.file.path;
            
            //mendapatkan ekstensi file
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]
            //nama random file + ekstensi
            let filename = req.file.filename + '.' + originalExt

            let targetPath = path.resolve(config.rootPath, `public/upload/${filename}`)
            
            const src = fs.createReadStream(temp_path);
            const dest = fs.createWriteStream(targetPath);

            src.pipe(dest);

            src.on('end', async () => {
                try {
                    // let product = new Product({...payload, image_url: filename});
                    let product = await Product.findOne({_id: req.params.id})
                    
                    //dapatkan path file yg telah ada
                    let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

                    //cek jika file ada di sistem
                    if(fs.existsSync(currentImage)){
                        fs.unlinkSync(currentImage);
                    }

                    //setelah itu baru update produk
                    product = await Product.findByIdAndUpdate({_id: req.params.id},{...payload, image_url: filename},{new: true, runValidators:true})
                    
                    return res.json(product);

                } catch (error) {
                    //jika error hapus file yg sudah terupload ke dir
                    fs.unlinkSync(targetPath);

                    //cek jika error karena validasi mongoDB
                    if(error && error.name === 'ValidationError'){
                        return res.json({
                            error:1,
                            message: error.message,
                            fields: error.errors
                        })
                    }

                    //error lainya
                    next(error);
                }
                
            })

            src.on('error', async() => {
                next(error);
            })

        }else{
            //buat product dari payload/data yang dikirim dari client
            let product = await Product.findOneAndUpdate({
                _id: req.params.id
            },payload,{
                new: true,
                runValidators: true
            });


            return res.json(product);
        }
        
    } catch (error) {
        console.log(error)
        //TODO cek tipe error
        if(error && error.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: error.message,
                fields: error.errors
            })
        }

        //TODO ini utk pass error yang tidak bisa ditangani (alias biar express tangani)
        next(error)
    }
    
}

//function delete
async function destroy(req, res, next) {
    try {
        let product = await Product.findOneAndDelete({_id: req.params.id});

        //cek juga apakah produk yang akan dihapus punya file gambar
        const currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

        if(fs.existsSync(currentImage)){
            fs.unlinkSync(currentImage);
        }

        return res.json(product);
        
    } catch (error) {
        next(error)
    }
}
module.exports = {
    store, index, update, destroy
}