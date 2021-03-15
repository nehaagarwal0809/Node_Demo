const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        user_name: String,
        email: { type: String, sparse: true },
        password: String,
        mobile: String,
        state:String,
        token: String,
    }
);

module.exports = mongoose.model('User',UserSchema);