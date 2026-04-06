    const mongoose = require('mongoose');
    const costosTramitesSchema = require('./costosTramites.model');

    costosTramitesSchema.statics = {
        create: async function(data) {
            const costosTramite = new this(data);
            return await costosTramite.save();
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

    const costosTramiteModel = mongoose.model('costosTramites', costosTramitesSchema);
    module.exports = costosTramiteModel;