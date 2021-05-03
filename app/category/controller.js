const Category = require('./model');

async function store(req, res, next) {
    let payload = req.body;
    try {
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
        const deleted = await Category.findOneAndDelete({_id: req.params.id});

        return res.json(deleted);
    } catch (error) {
        
        next(error);
    }
}

module.exports = {
    store, update, destroy
}