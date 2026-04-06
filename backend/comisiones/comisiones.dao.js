const mongoose = require('mongoose');
const comisionesSchema = require('./comisiones.model');

comisionesSchema.statics = {
    create: async function(data) {
        const comision = new this(data);
        return await comision.save();
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

const comisionesModel = mongoose.model('Comisiones', comisionesSchema);
module.exports = comisionesModel;