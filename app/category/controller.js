const Category = require('./model');

const {policyFor} = require('../policy/index');


async function store(req, res, next) {
    let payload = req.body;
    try {

        //TODO cek policy
        let policy = policyFor(req.user);

        if(!policy.can('create', 'Category')){
            return res.json({
                error:1,
                message:'Anda tidak memiliki akses untuk membuat kategori'
            });
        }

        let category = new Category(payload);

        await category.save();

        return res.json(category);

    } catch (error) {
        if(error && error.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: error.message,
                fields: err.errors
            })
        }

        //unknown error
        next(error);
    }
}

async function update(req, res, next){
    let payload = req.body;

    try {

        //TODO cek policy
        let policy = policyFor(req.user);

        if(!policy.can('update', 'Category')){
            return res.json({
                error:1,
                message: 'Anda tidak memiliki akses untuk mengupdate kategori'
            })
        }

        let category = await Category.findOneAndUpdate({_id: req.params.id},payload,{
            new: true, runValidators: true
        })

        return res.json(category);

    } catch (error) {

        if(error && error.name == 'ValidationError'){

            return res.json({
                error:1,
                message: error.message,
                fields: error.errors
            })
        }

        next(error);

    }
}

async function destroy(req, res, next) {
    try {

        //TODO cek policy
        let policy = policyFor(req.user);

        if(!policy.can('delete', 'Category')){
            return res.json({
                error:1,
                message:'Anda tidak memiliki akses untuk menghapus kategori'
            })
        }

        const deleted = await Category.findOneAndDelete({_id: req.params.id});

        return res.json(deleted);
    } catch (error) {
        
        next(error);
    }
}

module.exports = {
    store, update, destroy
}