const Tag = require('./model');

async function store(req, res, next){
    const payload = req.body;
    try {
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
        const destroy = await Tag.findOneAndDelete({_id: req.params.id});

        return res.json(destroy);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    store, update, destroy
}