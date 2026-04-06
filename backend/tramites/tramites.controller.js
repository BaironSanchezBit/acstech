const Tramites = require("./tramites.dao");
const { format } = require("date-fns");

exports.create = async (req, res) => {
  const tramites = new Tramites(req.body);
  try {
    await tramites.save();
    res.status(201).send(tramites);
  } catch (error) {
    res.status(400).send(error);
  }
};

// exports.create = async (req, res) => {
//     try {
//         const costosTramitesArray = req.body;

//         for (const item of costosTramitesArray) {
//             const tramitadores = new Tramitadores(item);
//             await tramitadores.save();
//         }

//         res.status(201).send('Todos los costos de trámites han sido creados exitosamente');
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

exports.getAll = async (req, res) => {
  try {
    const tramites = await Tramites.find({});
    res.status(200).send(tramites);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getByIdTramite = async (req, res) => {
  try {
    const tramites = await Tramites.findOne({
      numeroInventario: req.params.numeroInventario,
    });
    if (!tramites) {
      return res.status(404).send();
    }
    res.send(tramites);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getOne = async (req, res) => {
  try {
    const tramites = await Tramites.findById(req.params.id);
    if (!tramites) {
      return res.status(404).send();
    }
    res.send(tramites);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.update = async (req, res) => {
    try {
        const tramites = await Tramites.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!tramites) {
            return res.status(404).send();
        }

        res.send(tramites);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tramites = await Tramites.findByIdAndDelete(id);
    if (!tramites) {
      return res
        .status(404)
        .json({ success: false, message: "Tramite not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Tramite deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllTramites = async (req, res) => {
    try {
        const tramites = await Tramites.find()
            .populate({
                path: 'vehiculo',
                select: 'placa marca linea version'
            });
        const resultado = tramites.map(tramite => {
            const marca = tramite.vehiculo?.marca || '';
            const linea = tramite.vehiculo?.linea || '';
            const version = tramite.vehiculo?.version || '';

            const carro = `${marca} ${linea} ${version}`;

            const formatFecha = (fecha) => {
                if (fecha) {
                    let date = new Date(fecha);
                    date.setDate(date.getDate() + 1); // Sumar un día
                    return format(date, 'yyyy-MM-dd');
                }
                return null;
            };

            return {
                _id: tramite._id,
                numeroInventario: tramite.numeroInventario,
                placa: tramite.vehiculo?.placa,
                marca: carro,
                valorImpuesto: tramite.valorImpuesto,
                estadoImpuesto: tramite.estadoImpuesto,
                estadoVenta: tramite.estadoVenta,
                fechaVenta: formatFecha(tramite.fechaVenta),
                tipoNegocio: tramite.tipoNegocio,
                proveedor: tramite.proveedor,
                comprador: tramite.comprador,
                vendedor: tramite.vendedor,
                levantamiento: tramite.levantamiento,
                inscripcion: tramite.inscripcion,
                sePuedeTraspaso: tramite.sePuedeTraspaso,
                observacionTraspaso: tramite.observacionTraspaso,
                ciudadTraspaso: tramite.ciudadTraspaso,
                estadoTraspaso: tramite.estadoTraspaso,
                fechaEnvioTraspaso: formatFecha(tramite.fechaEnvioTraspaso),
                estadoFinal: tramite.estadoFinal,
                observacionFinal: tramite.observacionFinal,
                numeroDias: tramite.numeroDias
            };
        });

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error al buscar todos los trámites" });
  }
};

exports.checkTramitesAlerts = async (socket) => {
  try {
    const tramites = await Tramites.find({}).populate("vehiculo");
    tramites.forEach((tramite) => {
      if (
        tramite.proveedor === "AUTONAL" &&
        tramite.tipoNegocio === "COMPRA" &&
        diasTranscurridos(tramite) >= 25
      ) {
        socket.emit("provNotice", {
          title: "Alerta de Traspaso",
          message: `El traspaso está pronto a su fecha final, tiene ${diasTranscurridos(
            tramite
          )} días.`,
          vehiculoId:
            tramite.vehiculo.marca +
            " " +
            tramite.vehiculo.linea +
            " " +
            tramite.vehiculo.version +
            ": " +
            tramite.vehiculo.placa,
        });
      }
    });
  } catch (error) {
    console.error(error);
    socket.emit("errorCheckingProv", {
      error: "Error al verificar alertas de provisión",
    });
  }
};

function diasTranscurridos(tramite) {
  let fechaInicial = tramite.fechaEnvioTraspaso;
  let numeroDias;

  if (tramite.estadoTraspaso != "FINALIZADO") {
    if (fechaInicial === null || fechaInicial === "1970-01-01") {
      return 0;
    }

    const fechaInicialDate = new Date(fechaInicial);
    const fechaActualDate = new Date();

    // Restablecer las horas para evitar ajustes
    fechaInicialDate.setHours(0, 0, 0, 0);
    fechaActualDate.setHours(0, 0, 0, 0);

    const diferenciaMs = fechaActualDate.getTime() - fechaInicialDate.getTime();

    numeroDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24) - 1);

    return numeroDias;
  }
}

exports.checkTramitesAlerts = async (socket) => {
    try {
        const tramites = await Tramites.find({}).populate('vehiculo');
        tramites.forEach(tramite => {
            if (tramite.proveedor === 'AUTONAL' && tramite.tipoNegocio === 'COMPRA') {
                if (diasTranscurridos(tramite) >= 25 && diasTranscurridos(tramite) <= 30) {
                    socket.emit('provNotice', {
                        title: 'Alerta de Traspaso',
                        message: `El trámite está a ${diasTranscurridos(tramite)} días de vencer. Por favor, complete los pasos necesarios antes de la fecha límite.`,
                        vehiculoId: tramite.vehiculo.marca + ' ' + tramite.vehiculo.linea + ' ' + tramite.vehiculo.version + ': ' + tramite.vehiculo.placa
                    });
                }
                if (diasTranscurridos(tramite) > 30) {
                    socket.emit('provNotice', {
                        title: 'Alerta de Traspaso',
                        message: `El trámite ha vencido. Por favor, realice el trámite inmediatamente para evitar inconvenientes.`,
                        vehiculoId: tramite.vehiculo.marca + ' ' + tramite.vehiculo.linea + ' ' + tramite.vehiculo.version + ': ' + tramite.vehiculo.placa
                    });
                }
            }
            if (tramite.proveedor === 'PERSONA NATURAL' && tramite.tipoNegocio === 'COMPRA') {
                if (diasTranscurridos(tramite) >= 3 && diasTranscurridos(tramite) <= 5) {
                    socket.emit('provNotice', {
                        title: 'Alerta de Traspaso',
                        message: `El trámite está a ${diasTranscurridos(tramite)} días de vencer. Por favor, complete los pasos necesarios antes de la fecha límite.`,
                        vehiculoId: tramite.vehiculo.marca + ' ' + tramite.vehiculo.linea + ' ' + tramite.vehiculo.version + ': ' + tramite.vehiculo.placa
                    });
                }
                if (diasTranscurridos(tramite) > 5) {
                    socket.emit('provNotice', {
                        title: 'Alerta de Traspaso',
                        message: `El trámite ha vencido. Por favor, realice el trámite inmediatamente para evitar inconvenientes.`,
                        vehiculoId: tramite.vehiculo.marca + ' ' + tramite.vehiculo.linea + ' ' + tramite.vehiculo.version + ': ' + tramite.vehiculo.placa
                    });
                }
            }
            if (tramite.proveedor === 'SANTANDER' && tramite.tipoNegocio === 'COMPRA') {
                if (diasTranscurridos(tramite) >= 7 && diasTranscurridos(tramite) <= 10) {
                    socket.emit('provNotice', {
                        title: 'Alerta de Traspaso',
                        message: `El trámite está a ${diasTranscurridos(tramite)} días de vencer. Por favor, complete los pasos necesarios antes de la fecha límite.`,
                        vehiculoId: tramite.vehiculo.marca + ' ' + tramite.vehiculo.linea + ' ' + tramite.vehiculo.version + ': ' + tramite.vehiculo.placa
                    });
                }
                if (diasTranscurridos(tramite) > 10) {
                    socket.emit('provNotice', {
                        title: 'Alerta de Traspaso',
                        message: `El trámite ha vencido. Por favor, realice el trámite inmediatamente para evitar inconvenientes.`,
                        vehiculoId: tramite.vehiculo.marca + ' ' + tramite.vehiculo.linea + ' ' + tramite.vehiculo.version + ': ' + tramite.vehiculo.placa
                    });
                }
            }
        });
    } catch (error) {
        console.error(error);
        socket.emit('errorCheckingProv', { error: 'Error al verificar alertas de provisión' });
    }
};

function diasTranscurridos(tramite) {
    let fechaInicial = tramite.fechaEnvioTraspaso;
    let numeroDias;

    if (tramite.estadoTraspaso != 'FINALIZADO') {

        if (fechaInicial === null || fechaInicial === '1970-01-01') {
            return 0;
        }

        const fechaInicialDate = new Date(fechaInicial);
        const fechaActualDate = new Date();

        // Restablecer las horas para evitar ajustes
        fechaInicialDate.setHours(0, 0, 0, 0);
        fechaActualDate.setHours(0, 0, 0, 0);

        const diferenciaMs = fechaActualDate.getTime() - fechaInicialDate.getTime();

        numeroDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24) - 1);

        return numeroDias;
    }
}