const mongoose = require('mongoose');
const orderSchema = require('./ordenDeTrabajo.model');

orderSchema.statics = {
    create: async function (data) {
        const tramites = new this(data);
        return await tramites.save();
    },

    getAll: async function () {
        return await this.find({});
    },

    getOne: async function (id) {
        return await this.findById(id);
    },

    update: async function (id, updateData) {
        return await this.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    },
};

const ordenesModel = mongoose.model('ordenes', orderSchema);
module.exports = ordenesModel;