const mongoose = require('mongoose');
const clientsSchema = require('./clientes.model');

clientsSchema.statics = {
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

const clientsModel = mongoose.model('Clientes', clientsSchema);
module.exports = clientsModel;