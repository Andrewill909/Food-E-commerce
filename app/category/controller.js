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

module.exports = {
    store
}