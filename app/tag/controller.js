const Tag = require('./model');

const {policyFor} = require('../policy/index');

async function store(req, res, next){
    const payload = req.body;
    try {

        //TODO cek policy
        let policy = policyFor(req.user);

        if(!policy.can('create', 'Tag')){
            return res.json({
                error:1,
                message: 'Anda tidak memiliki akses untuk membuat Tag'
            })
        }

        let tag = new Tag(payload);

        await tag.save();

        return res.json(tag);
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

async function update(req, res, next){
    const payload = req.body;
    try {

        //TODO cek policy
        let policy = policyFor(req.user);

        if(!policy.can('update', 'Tag')){
            return res.json({
                error:1,
                message:'Anda tidak memiliki akses untuk mengupdate Tag'
            })
        }

        const tag = await Tag.findOneAndUpdate({_id: req.params.id}, payload, {new: true, runValidators: true});

        return res.json(tag);
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

        if(!policy.can('delete', 'Tag')){
            return res.json({
                error:1,
                message:'Anda tidak memiliki akses untuk menghapus Tag'
            })
        }

        const destroy = await Tag.findOneAndDelete({_id: req.params.id});

        return res.json(destroy);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    store, update, destroy
}