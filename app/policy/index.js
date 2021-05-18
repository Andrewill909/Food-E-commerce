const {AbilityBuilder, Ability} = require('@casl/ability');

//buat object policy
const policies = {
    guest(user,{can}){
        can('read','Product');
    },

    user(user, {can}){
        //baca daftar order
        can('view','Order');

        //buat order
        can('create', 'Order');

        //membaca order miliknya
        can('read','Order', {user_id: user._id});

        //mengupdate data dirinya sendiri ('User')
        can('update','User', {_id: user._id});

        //membaca cart miliknya
        can('read','Cart', {user_id: user._id});

        //mengupdate cart miliknya
        can('update','Cart', {user_id: user._id});

        //melihat daftar DeliveryAddress
        can('view', 'DeliveryAddress');

        //membuat DeliveryAddress
        can('create', 'DeliveryAddress', {user_id: user._id});

        //membaca DeliveryAddress miliknya
        can('read', 'DeliveryAddress', {user_id: user._id});

        //mengupdate DeliveryAddress miliknya
        can('update', 'DeliveryAddress', {user_id: user._id});
        
        //menghapus 'DeliveryAddress' miliknya
        can('delete', 'DeliveryAddress', {user_id: user._id});

        //membaca invoice miliknya
        can('read', 'Invoice', {user_id: user._id});


    },

    admin(user, {can}){
        can('manage','all');
    }
}

function policyFor(user) {
    let builder = new AbilityBuilder();

    if(user && typeof policies[user.role] === 'function'){
        policies[user.role](user, builder);
    }else{
        policies['guest'](user, builder);
    }

    return new Ability(builder.rules);
}

module.exports = {
    policyFor
}