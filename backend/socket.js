// socket.js

let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            transports: ['polling', 'websocket']
        });

        io.on('connection', socket => {

            socket.on('checkSoatOnLogin', () => {
                const inventoryController = require('./inventarios/inventarios.controller');
                const tramitesController = require('./tramites/tramites.controller');
                inventoryController.checkExpirations(socket);
                inventoryController.checkContractExpirations(socket);
                inventoryController.checkProvAlerts(socket);
                tramitesController.checkTramitesAlerts(socket);
            });

            socket.on('checkObsOnLogin', () => {
                const vehiculosController = require('./vehiculos/vehiculos.controller');
                vehiculosController.checkObservations(socket);
            });

            socket.on('disconnect', () => {
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
