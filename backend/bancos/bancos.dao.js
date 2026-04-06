    const mongoose = require('mongoose');
    const bancosSchema = require('./bancos.model');

    bancosSchema.statics = {
        create: async function(data) {
            const bancos = new this(data);
            return await bancos.save();
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

    const bancosModel = mongoose.model('bancos', bancosSchema);
    module.exports = bancosModel;