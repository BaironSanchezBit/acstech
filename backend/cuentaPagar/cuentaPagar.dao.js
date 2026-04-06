const mongoose = require('mongoose');
const cuentaPagarSchema = require('./cuentaPagar.model');

cuentaPagarSchema.statics = {
    create: async function(data) {
        const work = new this(data);
        return await work.save();
    },

    getAll: async function() {
        return await this.find({});
    },

    getOne: async function(id) {
        return await this.findById(id);
    },

    updateRegister: async function(id, updateData) {
        return await this.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    },
};

const cuentaPagarModel = mongoose.model('cuentaPagar', cuentaPagarSchema);
module.exports = cuentaPagarModel;