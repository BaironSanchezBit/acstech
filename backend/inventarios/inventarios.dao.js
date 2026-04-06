const mongoose = require('mongoose');
const inventoriesSchema = require('./inventarios.model');

inventoriesSchema.statics = {
    create: async function (data) {
        const inventories = new this(data);
        return await inventories.save();
    },

    getAll: async function () {
        return await this.find({});
    },

    getOne: async function (id) {
        return await this.findById(id);
    },

    updateRegister: async function (id, updateData) {
        return await this.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    },
};

const inventoriesModel = mongoose.model('Inventarios', inventoriesSchema);
module.exports = inventoriesModel;