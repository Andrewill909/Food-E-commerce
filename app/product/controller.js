const Product = require('./model');
const config = require('../config');
const path = require('path');
const fs = require('fs');


//function store
async function store(req, res, next){
    try {
        let payload = req.body;
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
        let {limit = 10, skip = 0} = req.query;

        const products = await Product.find().limit(parseInt(limit)).skip(parseInt(skip));
        return res.json(products);

    } catch (error) {
        next(error);
    }
}

//function update
async function update(req, res, next){
    try {
        let payload = req.body;
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