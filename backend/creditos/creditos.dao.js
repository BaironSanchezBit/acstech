const mongoose = require('mongoose');
const creditosSchema = require('./creditos.model');

creditosSchema.statics = {
    create: async function (data) {
        const creditos = new this(data);
        return await creditos.save();
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

const creditosModel = mongoose.model('creditos', creditosSchema);
module.exports = creditosModel;