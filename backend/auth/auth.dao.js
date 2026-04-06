const mongoose = require('mongoose');
const authSchema = require('./auth.model');

authSchema.statics = {
    create: async function(data) {
        const user = new this(data);
        const savedUser = await user.save();
        return savedUser;
    },
    login: function(query, cb) {
        this.find(query, cb);
    },
    updateUser: async function(id, data) {
        const updatedUser = await this.findOneAndUpdate({ _id: id }, { $set: data }, { new: true });
        return updatedUser;
    }
};

const authModel = mongoose.model('Usuarios', authSchema);

module.exports = authModel;