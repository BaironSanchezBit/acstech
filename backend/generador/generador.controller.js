const fs = require('fs');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const { exec } = require('child_process');
const puppeteer = require("puppeteer");
const docxPdf = require('docx-pdf');


const axios = require("axios");
const ImageModule = require("docxtemplater-image-module-free");
const ExcelJS = require("exceljs");

const multer = require("multer");
// Google Drive deshabilitado (2026-03-20)
// const { google } = require("googleapis");
const { time } = require("console");
const { Readable } = require("stream"); // Importar el módulo stream


async function downloadImageAsBase64(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary").toString("base64");
}

// Google Drive auth deshabilitado (2026-03-20)
// const KEYFILEPATH = path.join(__dirname, "cred.json");
// const SCOPES = ["https://www.googleapis.com/auth/drive"];
// const auth = new google.auth.GoogleAuth({ keyFile: KEYFILEPATH, scopes: SCOPES });


exports.createFolder = async (req, res) => {
    // Google Drive deshabilitado - servicio cloud ya no activo (2026-03-20)
    // Las carpetas se crean localmente
    try {
        const info = req.body;
        const placa = info.placa;
        const primerApellido = info.apellido;
        const nombre = info.nombre;
        const folderName = `${placa} - ${primerApellido} ${nombre}`;

        const localBasePath = '/opt/proyectos/acstech/uploads/carpetas';
        const fs = require('fs');
        const folderPath = `${localBasePath}/${folderName}`;

        if (!fs.existsSync(localBasePath)) {
            fs.mkdirSync(localBasePath, { recursive: true });
        }
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            fs.mkdirSync(`${folderPath}/In`, { recursive: true });
            fs.mkdirSync(`${folderPath}/Out`, { recursive: true });
        }

        res.status(200).json({
            success: true,
            message: 'Carpeta creada localmente',
            folderId: folderName,
            link: `/uploads/carpetas/${folderName}`
        });
    } catch (error) {
        console.error('Error creando carpeta local:', error);
        res.status(500).json({ success: false, message: 'Error creando carpeta local' });
    }
};

// Google Drive deshabilitado (2026-03-20) - guardado local
async function uploadFile(buffer, folderParent, folderName, docName) {
    console.log("[Drive deshabilitado] Guardando archivo localmente:", docName);
    const fs = require('fs');
    const path = require('path');

    const localDir = '/opt/proyectos/acstech/uploads/documentos';
    const subDir = path.join(localDir, folderName || 'general');

    if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
    }

    const filePath = path.join(subDir, docName);
    fs.writeFileSync(filePath, buffer);

    const webViewLink = `/uploads/documentos/${folderName || 'general'}/${docName}`;

    return {
        fileId: 'local-' + Date.now(),
        webViewLink: webViewLink,
        webContentLink: webViewLink,
    };
}

// COMPRA Prueba
/*
exports.contratoCompraPrueba = async (req, res) => {
  const datos = req.body; // Datos para rellenar la plantilla

  // Ruta de la plantilla
  const templatePath = path.resolve(
    __dirname,
    "../plantillas",
    "PLANTILLA CONTRATO DE COMPRA GC-CC02.docx"
  );

  try {
    // Leer la plantilla
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    
    // Rellenar la plantilla con los datos
    doc.render(datos);

    // Generar el archivo .docx
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    const outputDocxPath = path.resolve(__dirname, '../temp', 'contrato_generado.docx');
    fs.writeFileSync(outputDocxPath, buffer);

    // Convertir el .docx a PDF
    const outputPdfPath = path.resolve(__dirname, '../temp', 'contrato_generado.pdf');
    await new Promise((resolve, reject) => {
      docxPdf(outputDocxPath, outputPdfPath, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Enviar el PDF al cliente
    res.download(outputPdfPath, 'contrato_generado.pdf', (err) => {
      if (err) {
        console.error('Error al enviar el archivo:', err);
        res.status(500).send('Error al enviar el archivo');
      }

      // Eliminar los archivos temporales
      //fs.unlinkSync(outputDocxPath);
      //fs.unlinkSync(outputPdfPath);
    });
  } catch (error) {
    console.error('Error al generar el contrato:', error);
    res.status(500).send('Error al generar el contrato');
  }
};
*/
// COMPRA

exports.contratoMandatoRepre = async (req, res) => {
  const datos = req.body;
  datos.estadoValorTotalSoat = formatStateValue(datos.estadoValorTotalSoat);
  datos.estadoTecnicoMecanica = formatStateValue(datos.estadoTecnicoMecanica);
  datos.copiaLlave = formatStateValue(datos.copiaLlave);
  datos.manual = formatStateValue(datos.manual);
  datos.copaSeguridad = formatStateValue(datos.copaSeguridad);
  datos.llantaRepuesto = formatStateValue(datos.llantaRepuesto);
  datos.llavePernos = formatStateValue(datos.llavePernos);
  datos.gato = formatStateValue(datos.gato);
  datos.kitCarretera = formatStateValue(datos.kitCarretera);
  datos.antena = formatStateValue(datos.antena);
  datos.palomera = formatStateValue(datos.palomera);
  datos.tapetes = formatStateValue(datos.tapetes);
  datos.tiroArrastre = formatStateValue(datos.tiroArrastre);

  console.log(datos);
  const templatePath = path.resolve(
    __dirname,
    "../plantillas/2026",
    "CONTRATO DE MANDATO CON REPRESENTACIÓN.docx"
  );

  const imageOptions = {
    getImage(tagValue, tagName) {
      console.log({ tagValue, tagName });
      return fs.readFileSync(tagValue);
    },
    getSize(img) {
      // it also is possible to return a size in centimeters, like this : return [ "2cm", "3cm" ];
      return [150, 78];
    },
  };
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
    parser: function(tag) {
      return {
        get: function(scope) {
          if (tag === '.') return scope;
          return tag.split('.').reduce(function(obj, key) { return (obj != null) ? obj[key] : ''; }, scope) || '';
        }
      };
    },
  });

  var NIT = "";
  var image = "";
  var soporte = "";

  if (datos.organizacion === "AUTOMAGNO S.A.S") {
    NIT = "900.187.453-0";
  } else if (datos.organizacion === "GRUPO EMPRESARIAL SABAOTH S.A.S") {
    NIT = "900.048.800-8";
    image = path.join(__dirname, '../plantillas/Firmas/firma v3-03.png');
    soporte = "Gabriel Felipe\nCastiblanco Perdomo\nCC. 1013260381\n\nRepresentante Legal\nGrupo Empresarial Sabaoth S.A.S";
  }
  else {
    NIT = "000000000-0";
  }


  try {
    // Inyectar datos en objetos anidados para el template
    if (datos.cliente) {
      datos.cliente.idFormated = datos.idFormated || "";
    }
    if (datos.generadorContratos) {
      datos.generadorContratos.organizacion = datos.organizacion || "";
      datos.generadorContratos.NIT = NIT;
    }
    // Mapear campos del formulario fichaNegocio a los tags del template
    if (datos.fichaNegocio) {
      datos.fichaNegocio.liquidacionDeudaFinanciera = datos.fichaNegocio.valorCreditoPrenda || "";
      datos.fichaNegocio.entidadDeudaFinanciera = datos.fichaNegocio.entidadCreditoPrenda || "";
      datos.fichaNegocio.valorAnticipo = datos.fichaNegocio.valorAnticipoNegocio || "";
    }
    const dataDocument = {
      ...datos,
      NIT: NIT,
      // Campos agregados para nuevo contrato 2025
      nombreCompletoMandante: datos.cliente
        ? [datos.cliente.primerNombre, datos.cliente.segundoNombre, datos.cliente.primerApellido, datos.cliente.segundoApellido].filter(Boolean).join(' ')
        : '',
      tipoIdMandatario: 'NIT',
      direccionEmpresa: 'Calle 36 No 15-42 Bucaramanga',
      image: image,
      soporte: soporte,
      observacionesContrato: datos.observacionesContrato || 'Sin observaciones',
    }
    doc.render(dataDocument);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contrato_de_mandato_con_representacion.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

exports.procesoIniciales = async (req, res) => {
  const datos = req.body;
  datos.estadoValorTotalSoat = formatStateValue(datos.estadoValorTotalSoat);
  datos.estadoTecnicoMecanica = formatStateValue(datos.estadoTecnicoMecanica);
  datos.copiaLlave = formatStateValue(datos.copiaLlave);
  datos.manual = formatStateValue(datos.manual);
  datos.copaSeguridad = formatStateValue(datos.copaSeguridad);
  datos.llantaRepuesto = formatStateValue(datos.llantaRepuesto);
  datos.llavePernos = formatStateValue(datos.llavePernos);
  datos.gato = formatStateValue(datos.gato);
  datos.kitCarretera = formatStateValue(datos.kitCarretera);
  datos.antena = formatStateValue(datos.antena);
  datos.palomera = formatStateValue(datos.palomera);
  datos.tapetes = formatStateValue(datos.tapetes);
  datos.tiroArrastre = formatStateValue(datos.tiroArrastre);

  console.log(datos);
  const templatePath = path.resolve(
    __dirname,
    "../plantillas/2026",
    "PROCESO INICIALES - ORDEN DE ADQUISICIÓN VEHICULAR.docx"
  );

  const imageOptions = {
    getImage(tagValue, tagName) {
      console.log({ tagValue, tagName });
      return fs.readFileSync(tagValue);
    },
    getSize(img) {
      // it also is possible to return a size in centimeters, like this : return [ "2cm", "3cm" ];
      return [150, 78];
    },
  };
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
    parser: function(tag) {
      return {
        get: function(scope) {
          if (tag === '.') return scope;
          return tag.split('.').reduce(function(obj, key) { return (obj != null) ? obj[key] : ''; }, scope) || '';
        }
      };
    },
  });

  var NIT = "";
  var image = "";
  var soporte = "";

  if (datos.organizacion === "AUTOMAGNO S.A.S") {
    NIT = "900.187.453-0";
  } else if (datos.organizacion === "GRUPO EMPRESARIAL SABAOTH S.A.S") {
    NIT = "900.048.800-8";
    image = path.join(__dirname, '../plantillas/Firmas/firma v3-03.png');
    soporte = "Gabriel Felipe\nCastiblanco Perdomo\nCC. 1013260381\n\nRepresentante Legal\nGrupo Empresarial Sabaoth S.A.S";
  }
  else {
    NIT = "000000000-0";
  }


  try {
    // Inyectar datos en objetos anidados para el template
    if (datos.cliente) {
      datos.cliente.idFormated = datos.idFormated || "";
    }
    if (datos.generadorContratos) {
      datos.generadorContratos.organizacion = datos.organizacion || "";
      datos.generadorContratos.NIT = NIT;
    }
    // Calcular separacion 5%
    var precioStr = (datos.valorCompraNumero || "").toString().replace(/[^0-9]/g, "");
    var precioNum = parseInt(precioStr) || 0;
    var sep5 = Math.round(precioNum * 0.05);
    var formatMoney = function(n) { return "$ " + n.toString().replace(/B(?=(d{3})+(?!d))/g, "."); };
    const dataDocument = {
      ...datos,
      NIT: NIT,
      image: image,
      soporte: soporte,
      observacionesContrato: datos.observacionesContrato || 'Sin observaciones',
      separacion5porciento: formatMoney(sep5),
      valorCredito: datos.valorCredito || "",
      entidadCredito: datos.entidadCredito || "",
    }
    doc.render(dataDocument);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=proceso_iniciales-orden_de_adquisicion_vehicular.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

// VENTA

exports.ordenCompra = async (req, res) => {
  const datos = req.body;
  console.log('[ORDEN-COMPRA DEBUG] vehiculo:', JSON.stringify(datos.vehiculo ? { placa: datos.vehiculo.placa, marca: datos.vehiculo.marca, linea: datos.vehiculo.linea, _id: datos.vehiculo._id, keys: Object.keys(datos.vehiculo).length } : 'NULL/UNDEFINED'));
  console.log('[ORDEN-COMPRA DEBUG] cliente:', datos.cliente ? datos.cliente.primerNombre : 'NULL');
  datos.estadoValorTotalSoat = formatStateValue(datos.estadoValorTotalSoat);
  datos.estadoTecnicoMecanica = formatStateValue(datos.estadoTecnicoMecanica);
  datos.copiaLlave = formatStateValue(datos.copiaLlave);
  datos.manual = formatStateValue(datos.manual);
  datos.copaSeguridad = formatStateValue(datos.copaSeguridad);
  datos.llantaRepuesto = formatStateValue(datos.llantaRepuesto);
  datos.llavePernos = formatStateValue(datos.llavePernos);
  datos.gato = formatStateValue(datos.gato);
  datos.kitCarretera = formatStateValue(datos.kitCarretera);
  datos.antena = formatStateValue(datos.antena);
  datos.palomera = formatStateValue(datos.palomera);
  datos.tapetes = formatStateValue(datos.tapetes);
  datos.tiroArrastre = formatStateValue(datos.tiroArrastre);

  console.log(datos);
  const templatePath = path.resolve(
    __dirname,
    "../plantillas/2026",
    "ORDEN DE COMPRA.docx"
  );

  const imageOptions = {
    getImage(tagValue, tagName) {
      console.log({ tagValue, tagName });
      return fs.readFileSync(tagValue);
    },
    getSize(img) {
      return [150, 78];
    },
  };
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
    parser: function(tag) {
      return {
        get: function(scope) {
          if (tag === '.') return scope;
          return tag.split('.').reduce(function(obj, key) { return (obj != null) ? obj[key] : ''; }, scope) || '';
        }
      };
    },
  });

  var NIT = "";
  var image = "";
  var soporte = "";

  if (datos.organizacion === "AUTOMAGNO S.A.S") {
    NIT = "900.187.453-0";
  } else if (datos.organizacion === "GRUPO EMPRESARIAL SABAOTH S.A.S") {
    NIT = "900.048.800-8";
    image = path.join(__dirname, '../plantillas/Firmas/firma v3-03.png');
    soporte = "Gabriel Felipe\nCastiblanco Perdomo\nCC. 1013260381\n\nRepresentante Legal\nGrupo Empresarial Sabaoth S.A.S";
  }
  else {
    NIT = "000000000-0";
  }


  try {
    // Inyectar datos en objetos anidados para el template
    if (datos.cliente) {
      datos.cliente.idFormated = datos.idFormated || "";
    }
    if (datos.generadorContratos) {
      datos.generadorContratos.organizacion = datos.organizacion || "";
      datos.generadorContratos.NIT = NIT;
    }
    // Datos del COMPRADOR (la organizacion que compra el vehiculo)
    const comprador = {
      tipoIdentificacion: 'NIT',
      idFormated: NIT,
      ciudadIdentificacion: 'Bogota D.C.',
      direccionResidencia: datos.organizacion === "AUTOMAGNO S.A.S" ? "Calle 88a #30-49" : "",
      ciudadResidencia: 'Bogota D.C.',
      celularOne: (datos.generadorContratos && datos.generadorContratos.telefonoAsesor) || '',
      correoElectronico: '',
    };

    // Datos del VENDEDOR (la persona que vende su vehiculo)
    const vendedor = {
      primerNombre: (datos.cliente && datos.cliente.primerNombre) || '',
      segundoNombre: (datos.cliente && datos.cliente.segundoNombre) || '',
      primerApellido: (datos.cliente && datos.cliente.primerApellido) || '',
      segundoApellido: (datos.cliente && datos.cliente.segundoApellido) || '',
      tipoIdentificacion: (datos.cliente && datos.cliente.tipoIdentificacion) || '',
      NIT: datos.idFormated || '',
      idFormated: datos.idFormated || '',
      direccionResidencia: (datos.cliente && datos.cliente.direccionResidencia) || '',
    };

    const dataDocument = {
      ...datos,
      NIT: NIT,
      image: image,
      soporte: soporte,
      observacionesContrato: datos.observacionesContrato || 'Sin observaciones',
      comprador: comprador,
      vendedor: vendedor,
    }
    doc.render(dataDocument);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=orden_de_compra.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

exports.actaEntrega = async (req, res) => {
  const datos = req.body;
  datos.estadoValorTotalSoat = formatStateValue(datos.estadoValorTotalSoat);
  datos.estadoTecnicoMecanica = formatStateValue(datos.estadoTecnicoMecanica);
  datos.copiaLlave = formatStateValue(datos.copiaLlave);
  datos.manual = formatStateValue(datos.manual);
  datos.copaSeguridad = formatStateValue(datos.copaSeguridad);
  datos.llantaRepuesto = formatStateValue(datos.llantaRepuesto);
  datos.llavePernos = formatStateValue(datos.llavePernos);
  datos.gato = formatStateValue(datos.gato);
  datos.kitCarretera = formatStateValue(datos.kitCarretera);
  datos.antena = formatStateValue(datos.antena);
  datos.palomera = formatStateValue(datos.palomera);
  datos.tapetes = formatStateValue(datos.tapetes);
  datos.tiroArrastre = formatStateValue(datos.tiroArrastre);

  console.log(datos);
  const templatePath = path.resolve(
    __dirname,
    "../plantillas/2026",
    "ACTA DE ENTREGA Y PAZ Y SALVO.docx"
  );

  const imageOptions = {
    getImage(tagValue, tagName) {
      console.log({ tagValue, tagName });
      return fs.readFileSync(tagValue);
    },
    getSize(img) {
      return [150, 78];
    },
  };
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
    parser: function(tag) {
      return {
        get: function(scope) {
          if (tag === '.') return scope;
          return tag.split('.').reduce(function(obj, key) { return (obj != null) ? obj[key] : ''; }, scope) || '';
        }
      };
    },
  });

  var NIT = "";
  var image = "";
  var soporte = "";

  if (datos.organizacion === "AUTOMAGNO S.A.S") {
    NIT = "900.187.453-0";
  } else if (datos.organizacion === "GRUPO EMPRESARIAL SABAOTH S.A.S") {
    NIT = "900.048.800-8";
    image = path.join(__dirname, '../plantillas/Firmas/firma v3-03.png');
    soporte = "Gabriel Felipe\nCastiblanco Perdomo\nCC. 1013260381\n\nRepresentante Legal\nGrupo Empresarial Sabaoth S.A.S";
  }
  else {
    NIT = "000000000-0";
  }


  try {
    // Inyectar datos en objetos anidados para el template
    if (datos.cliente) {
      datos.cliente.idFormated = datos.idFormated || "";
    }
    if (datos.generadorContratos) {
      datos.generadorContratos.organizacion = datos.organizacion || "";
      datos.generadorContratos.NIT = NIT;
    }
    // Datos del COMPRADOR (la organizacion que compra el vehiculo)
    const comprador = {
      tipoIdentificacion: 'NIT',
      idFormated: NIT,
      ciudadIdentificacion: 'Bogota D.C.',
      direccionResidencia: datos.organizacion === "AUTOMAGNO S.A.S" ? "Calle 88a #30-49" : "",
      ciudadResidencia: 'Bogota D.C.',
      celularOne: (datos.generadorContratos && datos.generadorContratos.telefonoAsesor) || '',
      correoElectronico: '',
    };

    // Datos del VENDEDOR (la persona que vende su vehiculo)
    const vendedor = {
      primerNombre: (datos.cliente && datos.cliente.primerNombre) || '',
      segundoNombre: (datos.cliente && datos.cliente.segundoNombre) || '',
      primerApellido: (datos.cliente && datos.cliente.primerApellido) || '',
      segundoApellido: (datos.cliente && datos.cliente.segundoApellido) || '',
      tipoIdentificacion: (datos.cliente && datos.cliente.tipoIdentificacion) || '',
      NIT: datos.idFormated || '',
      idFormated: datos.idFormated || '',
      direccionResidencia: (datos.cliente && datos.cliente.direccionResidencia) || '',
    };

    const dataDocument = {
      ...datos,
      NIT: NIT,
      image: image,
      soporte: soporte,
      observacionesContrato: datos.observacionesContrato || 'Sin observaciones',
      comprador: comprador,
      vendedor: vendedor,
    }
    doc.render(dataDocument);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=acta_de_entrega_y_paz_y_salvo.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

exports.ordenTrabajo = async (req, res) => {
  const datos = req.body;
  const templatePath = path.resolve(
    __dirname,
    "../plantillas",
    "PLANTILLA ORDEN DE TRABAJO.docx"
  );
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    doc.render(datos);

    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contrato_compra.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

exports.funtNatural = async (req, res) => {
  const datos = req.body;

  let templatePath;

  if (datos.tipoIdentificacion === "NIT.") {
    templatePath = "./plantillas/FUNT-JURIDICA.xlsx";
  } else {
    templatePath = "./plantillas/FUNT-NATURAL.xlsx";
  }

  if (datos.servicio) {
    datos.servicio = marcarServicioValue(datos.servicio);
  }

  if (datos.tipoIdentificacion) {
    datos.tipoIdentificacion = marcarTipoDocuValue(datos.tipoIdentificacion);
  }

  if (datos.clase) {
    datos.clase = marcarClaseValue(datos.clase);
  }

  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  if (datos.tipoIdentificacion.nit === "X") {
    worksheet.getCell("A24").value = "";
    worksheet.getCell("I24").value = "";
    worksheet.getCell("P24").value = "";
    const digitoVerificacion =
      datos.numeroIdentificacion + "-" + datos.digitoVerificacion;
    worksheet.getCell("S26").value = digitoVerificacion;
    const concaten =
      datos.primerNombre +
      " " +
      datos.segundoNombre +
      " " +
      datos.primerApellido +
      " " +
      datos.segundoApellido;
    worksheet.getCell("A24").value = concaten;
  } else {
    const concaten = datos.primerNombre + " " + datos.segundoNombre;
    worksheet.getCell("P24").value = concaten;
    worksheet.getCell("A24").value = datos.primerApellido;
    worksheet.getCell("I24").value = datos.segundoApellido;
    worksheet.getCell("S26").value = datos.numeroIdentificacion;
  }

  worksheet.getCell("A29").value = datos.direccionResidencia;
  worksheet.getCell("M29").value = datos.ciudadResidencia;
  worksheet.getCell("S29").value = datos.celularOne;
  worksheet.getCell("W7").value = datos.marca;
  worksheet.getCell("Z7").value = datos.linea;
  worksheet.getCell("W10").value = datos.color;
  worksheet.getCell("AJ3").value = datos.placaLetras;
  worksheet.getCell("AK3").value = datos.placaNumeros;
  worksheet.getCell("AG10").value = datos.modelo;
  worksheet.getCell("AI10").value = datos.cilindraje;
  worksheet.getCell("W13").value = datos.capacidad;
  worksheet.getCell("W19").value = datos.carroceria;
  worksheet.getCell("AE17").value = datos.motor;
  worksheet.getCell("AE19").value = datos.chasis;
  worksheet.getCell("AE22").value = datos.serie;

  worksheet.getCell("A17").value = datos.clase.automovil;
  worksheet.getCell("D17").value = datos.clase.bus;
  worksheet.getCell("H17").value = datos.clase.buseta;
  worksheet.getCell("L17").value = datos.clase.camion;
  worksheet.getCell("O17").value = datos.clase.camioneta;
  worksheet.getCell("P17").value = datos.clase.campero;
  worksheet.getCell("S17").value = datos.clase.microbus;
  worksheet.getCell("A19").value = datos.clase.tractocamion;
  worksheet.getCell("D19").value = datos.clase.motocicleta;
  worksheet.getCell("H19").value = datos.clase.motocarro;
  worksheet.getCell("L19").value = datos.clase.mototriciclo;
  worksheet.getCell("O19").value = datos.clase.cuatrimoto;
  worksheet.getCell("P19").value = datos.clase.volqueta;
  worksheet.getCell("S19").value = datos.clase.otro;

  worksheet.getCell("AE24").value = datos.vin;
  worksheet.getCell("W27").value = datos.noDocumentoImportacion;
  worksheet.getCell("Z28").value = datos.diaImportacion;
  worksheet.getCell("AA28").value = datos.mesImportacion;
  worksheet.getCell("AB28").value = datos.anoImportacion;

  worksheet.getCell("AE29").value = datos.servicio.particular;
  worksheet.getCell("AF29").value = datos.servicio.publico;
  worksheet.getCell("AG29").value = datos.servicio.diplomatico;
  worksheet.getCell("AH29").value = datos.servicio.oficial;
  worksheet.getCell("AI29").value = datos.servicio.especial;
  worksheet.getCell("AJ29").value = datos.servicio.otros;

  worksheet.getCell("A26").value = datos.tipoIdentificacion.cc;
  worksheet.getCell("C26").value = datos.tipoIdentificacion.nit;
  worksheet.getCell("D26").value = datos.tipoIdentificacion.nn;
  worksheet.getCell("G26").value = datos.tipoIdentificacion.pasaporte;
  worksheet.getCell("J26").value = datos.tipoIdentificacion.ce;
  worksheet.getCell("L26").value = datos.tipoIdentificacion.ti;
  worksheet.getCell("O26").value = datos.tipoIdentificacion.nuip;
  worksheet.getCell("P26").value = datos.tipoIdentificacion.cd;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=trámites.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.funtVenta = async (req, res) => {
  const datos = req.body;

  let templatePath;

  if (datos.tipoIdentificacion === "NIT." && datos.tipoIdentificacionC === "NIT.") {
    templatePath = "./plantillas/FUNT-JURIDICA-VENTA.xlsx";
  } else if (datos.tipoIdentificacion === "C.C." && datos.tipoIdentificacionC === "C.C.") {
    templatePath = "./plantillas/FUNT-NATURAL.xlsx";
  } else if (datos.tipoIdentificacion === "C.C." && datos.tipoIdentificacionC === "C.E.") {
    templatePath = "./plantillas/FUNT-NATURAL.xlsx";
  } else if (datos.tipoIdentificacion === "C.E." && datos.tipoIdentificacionC === "C.C.") {
    templatePath = "./plantillas/FUNT-NATURAL.xlsx";
  } else if (datos.tipoIdentificacion === "NIT." && datos.tipoIdentificacionC === "C.C.") {
    templatePath = "./plantillas/FUNT-JURIDICA-NATURAL.xlsx";
  } else if (datos.tipoIdentificacion === "NIT." && datos.tipoIdentificacionC === "C.E.") {
    templatePath = "./plantillas/FUNT-JURIDICA-NATURAL.xlsx";
  } else if (datos.tipoIdentificacion === "C.C." && datos.tipoIdentificacionC === "NIT.") {
    templatePath = "./plantillas/FUNT-NATURAL-JURIDICA.xlsx";
  } else if (datos.tipoIdentificacion === "C.E." && datos.tipoIdentificacionC === "NIT.") {
    templatePath = "./plantillas/FUNT-NATURAL-JURIDICA.xlsx";
  }

  if (datos.servicio) {
    datos.servicio = marcarServicioValue(datos.servicio);
  }

  if (datos.tipoIdentificacion) {
    datos.tipoIdentificacion = marcarTipoDocuValue(datos.tipoIdentificacion);
  }

  if (datos.tipoIdentificacionC) {
    datos.tipoIdentificacionC = marcarTipoDocuValue(datos.tipoIdentificacionC);
  }

  if (datos.clase) {
    datos.clase = marcarClaseValue(datos.clase);
  }

  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  if (datos.tipoIdentificacion.nit === "X") {
    worksheet.getCell("A24").value = "";
    worksheet.getCell("I24").value = "";
    worksheet.getCell("P24").value = "";
    const digitoVerificacion =
      datos.numeroIdentificacion + "-" + datos.digitoVerificacion;
    worksheet.getCell("S26").value = digitoVerificacion;
    const concaten =
      datos.primerNombre +
      " " +
      datos.segundoNombre +
      " " +
      datos.primerApellido +
      " " +
      datos.segundoApellido;
    worksheet.getCell("A24").value = concaten;
  } else {
    const concaten = datos.primerNombre + " " + datos.segundoNombre;
    worksheet.getCell("P24").value = concaten;
    worksheet.getCell("A24").value = datos.primerApellido;
    worksheet.getCell("I24").value = datos.segundoApellido;
    worksheet.getCell("S26").value = datos.numeroIdentificacion;
  }

  if (datos.tipoIdentificacionC.nit === "X") {
    worksheet.getCell("A37").value = "";
    worksheet.getCell("I37").value = "";
    worksheet.getCell("P37").value = "";
    const digitoVerificacion =
      datos.numeroIdentificacionC + "-" + datos.digitoVerificacionC;
    worksheet.getCell("S41").value = digitoVerificacion;
    const concaten =
      datos.primerNombreC +
      " " +
      datos.segundoNombreC +
      " " +
      datos.primerApellidoC +
      " " +
      datos.segundoApellidoC;
    worksheet.getCell("P37").value = concaten;
  } else {
    const concaten = datos.primerNombreC + " " + datos.segundoNombreC;
    worksheet.getCell("P37").value = concaten;
    worksheet.getCell("A37").value = datos.primerApellidoC;
    worksheet.getCell("I37").value = datos.segundoApellidoC;
    worksheet.getCell("S41").value = datos.numeroIdentificacionC;
  }

  worksheet.getCell("A29").value = datos.direccionResidencia;
  worksheet.getCell("M29").value = datos.ciudadResidencia;
  worksheet.getCell("S29").value = datos.celularOne;

  worksheet.getCell("A44").value = datos.direccionResidenciaC;
  worksheet.getCell("M44").value = datos.ciudadResidenciaC;
  worksheet.getCell("S44").value = datos.celularOneC;

  worksheet.getCell("W7").value = datos.marca;
  worksheet.getCell("Z7").value = datos.linea;
  worksheet.getCell("W10").value = datos.color;
  worksheet.getCell("AJ3").value = datos.placaLetras;
  worksheet.getCell("AK3").value = datos.placaNumeros;
  worksheet.getCell("AG10").value = datos.modelo;
  worksheet.getCell("AI10").value = datos.cilindraje;
  worksheet.getCell("W13").value = datos.capacidad;
  worksheet.getCell("W19").value = datos.carroceria;
  worksheet.getCell("AE17").value = datos.motor;
  worksheet.getCell("AE19").value = datos.chasis;
  worksheet.getCell("AE22").value = datos.serie;

  worksheet.getCell("A17").value = datos.clase.automovil;
  worksheet.getCell("D17").value = datos.clase.bus;
  worksheet.getCell("H17").value = datos.clase.buseta;
  worksheet.getCell("L17").value = datos.clase.camion;
  worksheet.getCell("O17").value = datos.clase.camioneta;
  worksheet.getCell("P17").value = datos.clase.campero;
  worksheet.getCell("S17").value = datos.clase.microbus;
  worksheet.getCell("A19").value = datos.clase.tractocamion;
  worksheet.getCell("D19").value = datos.clase.motocicleta;
  worksheet.getCell("H19").value = datos.clase.motocarro;
  worksheet.getCell("L19").value = datos.clase.mototriciclo;
  worksheet.getCell("O19").value = datos.clase.cuatrimoto;
  worksheet.getCell("P19").value = datos.clase.volqueta;
  worksheet.getCell("S19").value = datos.clase.otro;

  worksheet.getCell("AE24").value = datos.vin;
  worksheet.getCell("W27").value = datos.noDocumentoImportacion;
  worksheet.getCell("Z28").value = datos.diaImportacion;
  worksheet.getCell("AA28").value = datos.mesImportacion;
  worksheet.getCell("AB28").value = datos.anoImportacion;

  worksheet.getCell("AE29").value = datos.servicio.particular;
  worksheet.getCell("AF29").value = datos.servicio.publico;
  worksheet.getCell("AG29").value = datos.servicio.diplomatico;
  worksheet.getCell("AH29").value = datos.servicio.oficial;
  worksheet.getCell("AI29").value = datos.servicio.especial;
  worksheet.getCell("AJ29").value = datos.servicio.otros;

  worksheet.getCell("A26").value = datos.tipoIdentificacion.cc;
  worksheet.getCell("C26").value = datos.tipoIdentificacion.nit;
  worksheet.getCell("D26").value = datos.tipoIdentificacion.nn;
  worksheet.getCell("G26").value = datos.tipoIdentificacion.pasaporte;
  worksheet.getCell("J26").value = datos.tipoIdentificacion.ce;
  worksheet.getCell("L26").value = datos.tipoIdentificacion.ti;
  worksheet.getCell("O26").value = datos.tipoIdentificacion.nuip;
  worksheet.getCell("P26").value = datos.tipoIdentificacion.cd;


  worksheet.getCell("A41").value = datos.tipoIdentificacionC.cc;
  worksheet.getCell("C41").value = datos.tipoIdentificacionC.nit;
  worksheet.getCell("D41").value = datos.tipoIdentificacionC.nn;
  worksheet.getCell("G41").value = datos.tipoIdentificacionC.pasaporte;
  worksheet.getCell("J41").value = datos.tipoIdentificacionC.ce;
  worksheet.getCell("L41").value = datos.tipoIdentificacionC.ti;
  worksheet.getCell("O41").value = datos.tipoIdentificacionC.nuip;
  worksheet.getCell("P41").value = datos.tipoIdentificacionC.cd;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=trámites.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.liquidacionCompra = async (req, res) => {
  const datos = req.body;

  limpiarValoresNulosEnObjeto(datos);

  const workbook = new ExcelJS.Workbook();
  const templatePath = "./plantillas/PLANTILLA LIQUIDACION COMPRA.xlsx";

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  worksheet.getCell("G2").value = datos.numeroInventario;
  worksheet.getCell("B6").value = datos.fecha;

  worksheet.getCell("C9").value = datos.placa;
  worksheet.getCell("C10").value = datos.ciudadPlaca;
  worksheet.getCell("C11").value = datos.marcaLinea;
  const celdaModelo = worksheet.getCell("C12");
  celdaModelo.value = Number(datos.modelo);
  celdaModelo.numFmt = "0";

  worksheet.getCell("C13").value = datos.valorPactado;

  worksheet.getCell("C16").value = datos.entidadDeudaFinan;
  worksheet.getCell("C17").value = datos.numeroObligacionFinan;
  if (datos.fechaPagoDeudaFinan === "1970-01-01") {
    datos.fechaPagoDeudaFinan = "";
  }
  worksheet.getCell("C18").value = datos.fechaPagoDeudaFinan;
  worksheet.getCell("C19").value = datos.valorDeudaFinanciera;

  worksheet.getCell("F9").value = datos.traspaso;
  worksheet.getCell("F10").value = datos.retencion;
  worksheet.getCell("F11").value = datos.otrosImpuestos;
  worksheet.getCell("F12").value = datos.levantamientoPrenda;
  worksheet.getCell("F13").value = datos.comparendos;
  worksheet.getCell("F14").value = datos.proporcionalImpAnoCurso;
  worksheet.getCell("F15").value = datos.devolucionSoat;
  datos.tramites.slice(0, 6).forEach((tramite, index) => {
    const descripcionCell = worksheet.getCell(`E${16 + index}`);
    descripcionCell.value = tramite.descripcion;

    const valorCell = worksheet.getCell(`F${16 + index}`);
    valorCell.value =
      typeof tramite.valor === "number"
        ? tramite.valor
        : parseFloat(tramite.valor.replace(/[^0-9-]+/g, ""));

    valorCell.numFmt =
      tramite.valor < 0 ? '"-$"#,##0;[Red]"-$"#,##0' : '"$"#,##0;[Red]"$"#,##0';
  });

  worksheet.getCell("F22").value = datos.honorariosAutomagno;
  worksheet.getCell("E28").value = datos.observacionesLiquidacionCompra;

  worksheet.getCell("I9").value = datos.nombreCompleto;
  worksheet.getCell("I10").value = datos.numeroIdentificacion;
  const celdacelularOne = worksheet.getCell("I11");
  celdacelularOne.value = Number(datos.celularOne);
  celdacelularOne.numFmt = "0";
  worksheet.getCell("I12").value = datos.direccionResidencia;
  worksheet.getCell("I13").value = datos.correoElectronico;

  worksheet.getCell("I16").value = datos.asesorComercial;
  const celdaTelefonoAsesor = worksheet.getCell("I17");
  celdaTelefonoAsesor.value = Number(datos.telefonoAsesor);
  celdaTelefonoAsesor.numFmt = "0";
  worksheet.getCell("I18").value = datos.correoAsesor;
  worksheet.getCell("I21").value = datos.gestorDocumental;
  const celdaTelefonoGestor = worksheet.getCell("I22");
  celdaTelefonoGestor.value = Number(datos.telefonoGestor);
  celdaTelefonoGestor.numFmt = "0";
  worksheet.getCell("I23").value = datos.correoGestor;

  worksheet.getCell("E33").value = datos.formaDePago.descripcionPago1;
  worksheet.getCell("E34").value = datos.formaDePago.formaPagoPago1;
  worksheet.getCell("E35").value = datos.formaDePago.entidadDepositarPago1;
  worksheet.getCell("E36").value = datos.formaDePago.numeroCuentaObligaPago1;
  worksheet.getCell("E37").value = datos.formaDePago.tipoCuentaPago1;
  worksheet.getCell("E38").value = datos.formaDePago.beneficiarioPago1;

  // Actualización para beneficiarioPago1
  if (datos.formaDePago.beneficiarioPago1) {
    const beneficiarioLower = datos.formaDePago.beneficiarioPago1.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("E38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("E39").value = datos.formaDePago.idBeneficiarioPago1;
  if (datos.formaDePago.fechaPago1 === "1970-01-01") {
    datos.formaDePago.fechaPago1 = "";
  }
  worksheet.getCell("E40").value = datos.formaDePago.fechaPago1;
  worksheet.getCell("E41").value = datos.formaDePago.valorPago1;

  worksheet.getCell("F33").value = datos.formaDePago.descripcionPago2;
  worksheet.getCell("F34").value = datos.formaDePago.formaPagoPago2;
  worksheet.getCell("F35").value = datos.formaDePago.entidadDepositarPago2;
  worksheet.getCell("F36").value = datos.formaDePago.numeroCuentaObligaPago2;
  worksheet.getCell("F37").value = datos.formaDePago.tipoCuentaPago2;
  worksheet.getCell("F38").value = datos.formaDePago.beneficiarioPago2;

  // Actualización para beneficiarioPago2
  if (datos.formaDePago.beneficiarioPago2) {
    const beneficiarioLower = datos.formaDePago.beneficiarioPago2.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("F38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("F39").value = datos.formaDePago.idBeneficiarioPago2;
  if (datos.formaDePago.fechaPago2 === "1970-01-01") {
    datos.formaDePago.fechaPago2 = "";
  }
  worksheet.getCell("F40").value = datos.formaDePago.fechaPago2;
  worksheet.getCell("F41").value = datos.formaDePago.valorPago2;

  worksheet.getCell("G33").value = datos.formaDePago.descripcionPago3;
  worksheet.getCell("G34").value = datos.formaDePago.formaPagoPago3;
  worksheet.getCell("G35").value = datos.formaDePago.entidadDepositarPago3;
  worksheet.getCell("G36").value = datos.formaDePago.numeroCuentaObligaPago3;
  worksheet.getCell("G37").value = datos.formaDePago.tipoCuentaPago3;
  worksheet.getCell("G38").value = datos.formaDePago.beneficiarioPago3;

  // Actualización para beneficiarioPago3
  if (datos.formaDePago.beneficiarioPago3) {
    const beneficiarioLower = datos.formaDePago.beneficiarioPago3.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("G38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("G39").value = datos.formaDePago.idBeneficiarioPago3;
  if (datos.formaDePago.fechaPago3 === "1970-01-01") {
    datos.formaDePago.fechaPago3 = "";
  }
  worksheet.getCell("G40").value = datos.formaDePago.fechaPago3;
  worksheet.getCell("G41").value = datos.formaDePago.valorPago3;

  worksheet.getCell("H33").value = datos.formaDePago.descripcionPago4;
  worksheet.getCell("H34").value = datos.formaDePago.formaPagoPago4;
  worksheet.getCell("H35").value = datos.formaDePago.entidadDepositarPago4;
  worksheet.getCell("H36").value = datos.formaDePago.numeroCuentaObligaPago4;
  worksheet.getCell("H37").value = datos.formaDePago.tipoCuentaPago4;
  worksheet.getCell("H38").value = datos.formaDePago.beneficiarioPago4;

  if (datos.formaDePago.beneficiarioPago4) {
    const beneficiarioLower = datos.formaDePago.beneficiarioPago4.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("H38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("H39").value = datos.formaDePago.idBeneficiarioPago4;
  if (datos.formaDePago.fechaPago4 === "1970-01-01") {
    datos.formaDePago.fechaPago4 = "";
  }
  worksheet.getCell("H40").value = datos.formaDePago.fechaPago4;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=trámites.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.transitoAdquisicion = async (req, res) => {
  const datos = req.body;

  limpiarValoresNulosEnObjeto(datos);

  const workbook = new ExcelJS.Workbook();
  const templatePath = "./plantillas/PROV TRANSITO ADQUISICION.xlsx";

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  worksheet.getCell("G2").value = datos.numeroInventario;
  worksheet.getCell("B7").value = datos.fecha;

  worksheet.getCell("C10").value = datos.placa;
  worksheet.getCell("C11").value = datos.ciudadPlaca;
  worksheet.getCell("C12").value = datos.marcaLinea;
  const celdaModelo = worksheet.getCell("C13");
  celdaModelo.value = Number(datos.modelo);
  celdaModelo.numFmt = "0";

  worksheet.getCell("C14").value = datos.valorPactado;

  worksheet.getCell("C17").value = datos.entidadDeudaFinan;
  worksheet.getCell("C18").value = datos.numeroObligacionFinan;
  if (datos.fechaLimitePagoDeudaFinan === "1970-01-01") {
    datos.fechaLimitePagoDeudaFinan = "";
  }
  worksheet.getCell("C19").value = datos.fechaLimitePagoDeudaFinan;
  worksheet.getCell("C20").value = datos.valorDeudaFinanciera;

  const format = '"$"#,##0;[Red]"-$"#,##0';
  worksheet.getCell("F10").value = datos.retencionFuente;
  worksheet.getCell("F10").numFmt = format;
  worksheet.getCell("F11").value = datos.traspasoNeto;
  worksheet.getCell("F11").numFmt = format;
  worksheet.getCell("F12").value = datos.soat;
  worksheet.getCell("F13").value = datos.impuestoAnoCurso;
  worksheet.getCell("F13").numFmt = format;
  worksheet.getCell("F14").value = datos.otrosImpuestosProv;
  worksheet.getCell("F14").numFmt = format;
  worksheet.getCell("F15").value = datos.levantamientoPrenda2;
  worksheet.getCell("F15").numFmt = format;
  worksheet.getCell("F16").value = datos.comparendos2;
  worksheet.getCell("F16").numFmt = format;
  worksheet.getCell("F17").value = datos.deudaFinanciera;
  worksheet.getCell("F17").numFmt = format;
  worksheet.getCell("F18").value = datos.honorariosTramitador;
  worksheet.getCell("F18").numFmt = format;
  datos.provicionTramites.slice(0, 5).forEach((provicionTramite, index) => {
    const descripcionCell = worksheet.getCell(`E${19 + index}`);
    descripcionCell.value = provicionTramite.descripcion2;

    const valorCell = worksheet.getCell(`F${19 + index}`);
    valorCell.value =
      typeof provicionTramite.valor2 === "number"
        ? provicionTramite.valor2
        : parseFloat(provicionTramite.valor2.replace(/[^0-9-]+/g, ""));

    valorCell.numFmt =
      provicionTramite.valor2 < 0
        ? '"$"#,##0;[Red]"-$"#,##0'
        : '"$"#,##0;[Red]"$"#,##0';
  });

  worksheet.getCell("I10").value = datos.nombreCompleto;
  worksheet.getCell("I11").value = datos.numeroIdentificacion;
  const celdacelularOne = worksheet.getCell("I12");
  celdacelularOne.value = Number(datos.celularOne);
  celdacelularOne.numFmt = "0";
  worksheet.getCell("I13").value = datos.direccionResidencia;
  worksheet.getCell("I14").value = datos.correoElectronico;

  worksheet.getCell("I17").value = datos.asesorComercial;
  const celdaTelefonoAsesor = worksheet.getCell("I18");
  celdaTelefonoAsesor.value = Number(datos.telefonoAsesor);
  celdaTelefonoAsesor.numFmt = "0";
  worksheet.getCell("I19").value = datos.correoAsesor;
  worksheet.getCell("I22").value = datos.gestorDocumental;
  const celdaTelefonoGestor = worksheet.getCell("I23");
  celdaTelefonoGestor.value = Number(datos.telefonoGestor);
  celdaTelefonoGestor.numFmt = "0";
  worksheet.getCell("I24").value = datos.correoGestor;

  if (datos.tramitador && Object.keys(datos.tramitador).length !== 0) {
    worksheet.getCell("I27").value = datos.tramitador.ciudad;
    worksheet.getCell("I28").value = datos.tramitador.proveedor;
    worksheet.getCell("I29").value = datos.tramitador.responsable;
    worksheet.getCell("I30").value = datos.tramitador.telefono;
    worksheet.getCell("I31").value = datos.tramitador.correoElectronico;
    worksheet.getCell("I32").value = datos.tramitador.direccion;
  } else {
    worksheet.getCell("I27").value = "";
    worksheet.getCell("I28").value = "";
    worksheet.getCell("I29").value = "";
    worksheet.getCell("I30").value = "";
    worksheet.getCell("I31").value = "";
    worksheet.getCell("I32").value = "";
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=descarga.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.contratoCompraVenta = async (req, res) => {
  const datos = req.body;
  const templatePath = path.resolve(
    __dirname,
    "../plantillas",
    "PLANTILLA CONTRATO COMPRAVENTA TRANSITO.docx"
  );
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    doc.render(datos);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contrato_compra.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

exports.contratoMandatoNatural = async (req, res) => {
  const datos = req.body;
  const templatePath = path.resolve(
    __dirname,
    "../plantillas",
    "PLANTILLA CONTRATO DE MANDATO PERSONA NATURAL.docx"
  );
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    doc.render(datos);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contrato_compra.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

exports.contratoMandatoJuridica = async (req, res) => {
  const datos = req.body;
  const templatePath = path.resolve(
    __dirname,
    "../plantillas",
    "PLANTILLA CONTRATO DE MANDATO PERSONA JURIDICA.docx"
  );
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  try {
    doc.render(datos);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=contrato_compra.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};
/* actaRecepcion Prueba */
exports.actaRecepcion = async (req, res) => {
  const datos = req.body;
  datos.linkInventario = datos.linkInventario ? datos.linkInventario : "13l7EX8L2iMgf6ZLq6XzKFzR73m4Q3BPV";
  datos.numeroInventario = datos.numeroInventario ? datos.numeroInventario : " ";
  datos.user = datos.user ? datos.user : " ";
  datos.estadoValorTotalSoat = formatStateValue(datos.estadoValorTotalSoat);
  datos.estadoTecnicoMecanica = formatStateValue(datos.estadoTecnicoMecanica);
  datos.copiaLlave = formatStateValue(datos.copiaLlave);
  datos.manual = formatStateValue(datos.manual);
  datos.copaSeguridad = formatStateValue(datos.copaSeguridad);
  datos.llantaRepuesto = formatStateValue(datos.llantaRepuesto);
  datos.llavePernos = formatStateValue(datos.llavePernos);
  datos.gato = formatStateValue(datos.gato);
  datos.kitCarretera = formatStateValue(datos.kitCarretera);
  datos.antena = formatStateValue(datos.antena);
  datos.palomera = formatStateValue(datos.palomera);
  datos.tapetes = formatStateValue(datos.tapetes);
  datos.tiroArrastre = formatStateValue(datos.tiroArrastre);

  const templatePath = path.resolve(
    __dirname,
    "../plantillas",
    "PLANTILLA ACTA DE RECEPCION ACS GC-AR02.docx"
  );

  const imageOptions = {
    getImage(tagValue, tagName) {
      console.log({ tagValue, tagName });
      return fs.readFileSync(tagValue);
    },
    getSize(img) {
      // it also is possible to return a size in centimeters, like this : return [ "2cm", "3cm" ];
      return [150, 78];
    },
  };
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
    parser: function(tag) {
      return {
        get: function(scope) {
          if (tag === '.') return scope;
          return tag.split('.').reduce(function(obj, key) { return (obj != null) ? obj[key] : ''; }, scope) || '';
        }
      };
    },
  });
  var NIT = "";
  var image = "";
  var soporte = "";
  if (datos.organizacion === "AUTOMAGNO S.A.S") {
    NIT = "900.187.453-0";
  } else if (datos.organizacion === "GRUPO EMPRESARIAL SABAOTH S.A.S") {
    NIT = "900.048.800-8";
    image = path.join(__dirname, '../plantillas/Firmas/firma v3-03.png');
    soporte = "Gabriel Felipe\nCastiblanco Perdomo\nCC. 1013260381\n\nRepresentante Legal\nGrupo Empresarial Sabaoth S.A.S";
  } else {
    NIT = "000000000-0";
  }
  const dataDocument = {
    ...datos,
    NIT: NIT,
    image: image,
    soporte: soporte,
  };
  try {
    doc.render(dataDocument);
    const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });
    //__
    //const pdfBuffer = await convertirDocxAPdf(docxBuffer);
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=acta_recepcion.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const outputPath = path.resolve(__dirname, 'documento_modificado.docx');
    fs.writeFileSync(outputPath, buf);


    //Guardar el documento en drive
    try {
      //uploadFile(buffer, datos.linkInventario, "In", "Acta de Recepción.pdf");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al guardar el documento en Drive: " + error.message);
    }

    // Imprimir el documento
    const printerName = 'RICOH MP C2003 PCL 6';
    try {
      //printDocument(printerName, outputPath);  
      // Elimina el archivo
      setTimeout(() => {
        fs.unlink(outputPath, (err) => {
          if (err) {
            console.error('Error al eliminar el archivo:', err);
          } else {
            console.log('Archivo eliminado correctamente:', outputPath);
          }
        });
        res.send(docxBuffer);
      }, 5000);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error al imprimir el documento: " + error.message);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

/*
async function convertirDocxAPdf(docxBuffer) {
  // Guardar el archivo .docx en un archivo temporal (necesario para puppeteer)
  const tempDocxPath = path.resolve(__dirname, "temp.docx");
  fs.writeFileSync(tempDocxPath, docxBuffer);

  // Iniciar un navegador headless con Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Cargar el archivo .docx en el navegador
  await page.goto(`file://${tempDocxPath}`, {
    waitUntil: "networkidle0",
  });

  // Generar el PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
  });

  // Cerrar el navegador
  await browser.close();

  // Eliminar el archivo temporal
  fs.unlinkSync(tempDocxPath);

  return pdfBuffer;
}
*/

// Función para imprimir un documento
function printDocument(printerName, outputPath) {
  let command;
  switch (process.platform) {
    case 'win32': // Windows
      command = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --pt "${printerName}" "${outputPath}"`;
      break;
    case 'darwin': // macOS
      command = `/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --pt "${printerName}" "${outputPath}"`;
      break;
    case 'linux': // Linux
      command = `libreoffice --headless --pt "${printerName}" "${outputPath}"`;
      break;
    default:
      console.error('Sistema operativo no compatible para imprimir.');
      return;
  }

  // Ejecutar el comando para imprimir
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error al imprimir:', error.message);
      return;
    }
    if (stderr) {
      console.error('Error en el comando de impresión:', stderr);
      return;
    }
    console.log('Documento enviado a la impresora correctamente.');
  });
};

// VENTAS

exports.liquidacionVenta = async (req, res) => {
  const datos = req.body;

  limpiarValoresNulosEnObjeto(datos);

  const workbook = new ExcelJS.Workbook();
  let templatePath;

  if (datos.correoElectronicoTwo !== undefined) {
    templatePath = "./plantillas/PLANTILLA LIQUIDACION VENTA V2.xlsx";
  } else {
    templatePath = "./plantillas/PLANTILLA LIQUIDACION VENTA.xlsx";
  }

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  worksheet.getCell("G2").value = datos.numeroInventario;
  worksheet.getCell("B6").value = datos.fecha;

  worksheet.getCell("C9").value = datos.placa;
  worksheet.getCell("C10").value = datos.ciudadPlaca;
  worksheet.getCell("C11").value = datos.marcaLinea;
  const celdaModelo = worksheet.getCell("C12");
  celdaModelo.value = Number(datos.modelo);
  celdaModelo.numFmt = "0";

  worksheet.getCell("C13").value = datos.valorPactado;

  worksheet.getCell("C16").value = datos.entidadBancaria;
  worksheet.getCell("C17").value = datos.monto;

  const format = '"$"#,##0;[Red]"-$"#,##0';

  worksheet.getCell("F9").value = datos.traspaso;
  worksheet.getCell("F9").numFmt = format;
  worksheet.getCell("F10").value = datos.inscripcionPrenda;
  worksheet.getCell("F10").numFmt = format;
  worksheet.getCell("F11").value = datos.trasladoCuenta;
  worksheet.getCell("F11").numFmt = format;
  worksheet.getCell("F12").value = datos.radicacionCuenta;
  worksheet.getCell("F12").numFmt = format;
  worksheet.getCell("F13").value = datos.comparendos;
  worksheet.getCell("F13").numFmt = format;
  worksheet.getCell("F14").value = datos.proporcionalImpAnoCurso;
  worksheet.getCell("F14").numFmt = format;
  worksheet.getCell("F15").value = datos.devolucionSoat;
  worksheet.getCell("F15").numFmt = format;
  datos.tramites.slice(0, 6).forEach((tramite, index) => {
    const descripcionCell = worksheet.getCell(`E${16 + index}`);
    descripcionCell.value = tramite.descripcion;

    const valorCell = worksheet.getCell(`F${16 + index}`);
    valorCell.value =
      typeof tramite.valor === "number"
        ? tramite.valor
        : parseFloat(tramite.valor.replace(/[^0-9-]+/g, ""));

    valorCell.numFmt =
      tramite.valor < 0 ? '"-$"#,##0;[Red]"-$"#,##0' : '"$"#,##0;[Red]"$"#,##0';
  });

  worksheet.getCell("F22").value = datos.honorariosIvaIncluido;
  worksheet.getCell("F22").numFmt = format;

  worksheet.getCell("E29").value = datos.obsFase3Venta;

  worksheet.getCell("I9").value = datos.nombreCompleto;
  worksheet.getCell("I10").value = datos.numeroIdentificacion;
  const celdacelularOne = worksheet.getCell("I11");
  celdacelularOne.value = Number(datos.celularOne);
  celdacelularOne.numFmt = "0";
  worksheet.getCell("I12").value = datos.direccionResidencia;
  worksheet.getCell("I13").value = datos.correoElectronico;

  if (datos.correoElectronicoTwo !== undefined) {
    worksheet.getCell("I16").value = datos.nombreCompletoTwo;
    worksheet.getCell("I17").value = datos.numeroIdentificacionTwo;
    const celdacelularOne = worksheet.getCell("I18");
    celdacelularOne.value = Number(datos.celularOneTwo);
    celdacelularOne.numFmt = "0";
    worksheet.getCell("I19").value = datos.direccionResidenciaTwo;
    worksheet.getCell("I20").value = datos.correoElectronicoTwo;

    worksheet.getCell("I23").value = datos.asesorComercial;
    const celdaTelefonoAsesor = worksheet.getCell("I24");
    celdaTelefonoAsesor.value = Number(datos.telefonoAsesor);
    celdaTelefonoAsesor.numFmt = "0";
    worksheet.getCell("I25").value = datos.correoAsesor;
    worksheet.getCell("I28").value = datos.gestorDocumental;
    const celdaTelefonoGestor = worksheet.getCell("I29");
    celdaTelefonoGestor.value = Number(datos.telefonoGestor);
    celdaTelefonoGestor.numFmt = "0";
    worksheet.getCell("I30").value = datos.correoGestor;
  } else {
    worksheet.getCell("I16").value = datos.asesorComercial;
    const celdaTelefonoAsesor = worksheet.getCell("I17");
    celdaTelefonoAsesor.value = Number(datos.telefonoAsesor);
    celdaTelefonoAsesor.numFmt = "0";
    worksheet.getCell("I18").value = datos.correoAsesor;
    worksheet.getCell("I21").value = datos.gestorDocumental;
    const celdaTelefonoGestor = worksheet.getCell("I22");
    celdaTelefonoGestor.value = Number(datos.telefonoGestor);
    celdaTelefonoGestor.numFmt = "0";
    worksheet.getCell("I23").value = datos.correoGestor;
  }

  worksheet.getCell("B21").value = datos.provisional;

  worksheet.getCell("E33").value = datos.formaDePago.descripcionPago12;
  worksheet.getCell("E34").value = datos.formaDePago.formaPagoPago12;
  worksheet.getCell("E35").value = datos.formaDePago.entidadDepositarPago12;
  worksheet.getCell("E36").value = datos.formaDePago.numeroCuentaObligaPago12;
  worksheet.getCell("E37").value = datos.formaDePago.tipoCuentaPago12;
  worksheet.getCell("E38").value = datos.formaDePago.beneficiarioPago12;

  // Actualización para beneficiarioPago1
  if (datos.formaDePago.beneficiarioPago12) {
    const beneficiarioLower =
      datos.formaDePago.beneficiarioPago12.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("E38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("E39").value = datos.formaDePago.idBeneficiarioPago12;
  if (datos.formaDePago.fechaPago12 === "1970-01-01") {
    datos.formaDePago.fechaPago12 = "";
  }
  worksheet.getCell("E40").value = datos.formaDePago.fechaPago12;
  worksheet.getCell("E41").value = datos.formaDePago.valorPago12;

  worksheet.getCell("F33").value = datos.formaDePago.descripcionPago22;
  worksheet.getCell("F34").value = datos.formaDePago.formaPagoPago22;
  worksheet.getCell("F35").value = datos.formaDePago.entidadDepositarPago22;
  worksheet.getCell("F36").value = datos.formaDePago.numeroCuentaObligaPago22;
  worksheet.getCell("F37").value = datos.formaDePago.tipoCuentaPago22;
  worksheet.getCell("F38").value = datos.formaDePago.beneficiarioPago22;

  // Actualización para beneficiarioPago2
  if (datos.formaDePago.beneficiarioPago22) {
    const beneficiarioLower =
      datos.formaDePago.beneficiarioPago22.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("F38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("F39").value = datos.formaDePago.idBeneficiarioPago22;
  if (datos.formaDePago.fechaPago22 === "1970-01-01") {
    datos.formaDePago.fechaPago22 = "";
  }
  worksheet.getCell("F40").value = datos.formaDePago.fechaPago22;
  worksheet.getCell("F41").value = datos.formaDePago.valorPago22;

  worksheet.getCell("G33").value = datos.formaDePago.descripcionPago32;
  worksheet.getCell("G34").value = datos.formaDePago.formaPagoPago32;
  worksheet.getCell("G35").value = datos.formaDePago.entidadDepositarPago32;
  worksheet.getCell("G36").value = datos.formaDePago.numeroCuentaObligaPago32;
  worksheet.getCell("G37").value = datos.formaDePago.tipoCuentaPago32;
  worksheet.getCell("G38").value = datos.formaDePago.beneficiarioPago32;

  // Actualización para beneficiarioPago3
  if (datos.formaDePago.beneficiarioPago32) {
    const beneficiarioLower =
      datos.formaDePago.beneficiarioPago32.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("G38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("G39").value = datos.formaDePago.idBeneficiarioPago32;
  if (datos.formaDePago.fechaPago32 === "1970-01-01") {
    datos.formaDePago.fechaPago32 = "";
  }
  worksheet.getCell("G40").value = datos.formaDePago.fechaPago32;
  worksheet.getCell("G41").value = datos.formaDePago.valorPago32;

  worksheet.getCell("H33").value = datos.formaDePago.descripcionPago42;
  worksheet.getCell("H34").value = datos.formaDePago.formaPagoPago42;
  worksheet.getCell("H35").value = datos.formaDePago.entidadDepositarPago42;
  worksheet.getCell("H36").value = datos.formaDePago.numeroCuentaObligaPago42;
  worksheet.getCell("H37").value = datos.formaDePago.tipoCuentaPago42;
  worksheet.getCell("H38").value = datos.formaDePago.beneficiarioPago42;

  // Actualización para beneficiarioPago4
  if (datos.formaDePago.beneficiarioPago42) {
    const beneficiarioLower =
      datos.formaDePago.beneficiarioPago42.toLowerCase();
    if (
      beneficiarioLower === "automagno sas bcol" ||
      beneficiarioLower === "automagno sas davi"
    ) {
      worksheet.getCell("H38").value = "AUTOMAGNO SAS";
    }
  }

  worksheet.getCell("H39").value = datos.formaDePago.idBeneficiarioPago42;
  if (datos.formaDePago.fechaPago42 === "1970-01-01") {
    datos.formaDePago.fechaPago42 = "";
  }
  worksheet.getCell("H40").value = datos.formaDePago.fechaPago42;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=trámites.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.tramitesSalida = async (req, res) => {
  const datos = req.body;
  limpiarValoresNulosEnObjeto(datos);

  const workbook = new ExcelJS.Workbook();

  let templatePath;

  if (datos.correoElectronicoTwo !== undefined) {
    templatePath = "./plantillas/TRAMITES DE SALIDA V2.xlsx";
  } else {
    templatePath = "./plantillas/TRAMITES DE SALIDA.xlsx";
  }

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  // Asignación de valores a las celdas
  worksheet.getCell("G2").value = datos.numeroInventario;
  worksheet.getCell("B7").value = datos.fecha;

  worksheet.getCell("C10").value = datos.placa;
  worksheet.getCell("C11").value = datos.ciudadPlaca;
  worksheet.getCell("C12").value = datos.marcaLinea;
  const celdaModelo = worksheet.getCell("C13");
  celdaModelo.value = Number(datos.modelo);
  celdaModelo.numFmt = "0";

  worksheet.getCell("C14").value = datos.valorPactado;

  worksheet.getCell("C17").value = datos.entidadDeudaFinan;
  worksheet.getCell("C18").value = datos.numeroObligacionFinan;
  if (datos.fechaLimitePagoDeudaFinan === "1970-01-01") {
    datos.fechaLimitePagoDeudaFinan = "";
  }
  worksheet.getCell("C19").value = datos.fechaLimitePagoDeudaFinan;
  worksheet.getCell("C20").value = datos.valorDeudaFinanciera;

  const format = '"$"#,##0;[Red]"-$"#,##0';

  // Aplicar formato de moneda para campos F10 a F19
  worksheet.getCell("F10").value = datos.retencionFuente;
  worksheet.getCell("F10").numFmt = format;
  worksheet.getCell("F11").value = datos.traspasoNeto;
  worksheet.getCell("F11").numFmt = format;
  worksheet.getCell("F12").value = datos.soat;
  worksheet.getCell("F13").value = datos.impuestoAnoCurso;
  worksheet.getCell("F13").numFmt = format;
  worksheet.getCell("F14").value = datos.inscripcionPrenda2;
  worksheet.getCell("F14").numFmt = format;
  worksheet.getCell("F15").value = datos.otrosImpuestosProv;
  worksheet.getCell("F15").numFmt = format;
  worksheet.getCell("F16").value = datos.comparendos2;
  worksheet.getCell("F16").numFmt = format;
  worksheet.getCell("F17").value = datos.tomaImprontas;
  worksheet.getCell("F17").numFmt = format;
  worksheet.getCell("F18").value = datos.manejoEnvioAutomango;
  worksheet.getCell("F18").numFmt = format;
  worksheet.getCell("F19").value = datos.honorariosProveedor;
  worksheet.getCell("F19").numFmt = format;

  // Otros campos I
  worksheet.getCell("I10").value = datos.nombreCompleto;
  worksheet.getCell("I11").value = datos.numeroIdentificacion;
  const celdaCelularOne = worksheet.getCell("I12");
  celdaCelularOne.value = Number(datos.celularOne);
  celdaCelularOne.numFmt = "0";
  worksheet.getCell("I13").value = datos.direccionResidencia;
  worksheet.getCell("I14").value = datos.correoElectronico;

  if (datos.correoElectronicoTwo !== undefined) {
    worksheet.getCell("I17").value = datos.nombreCompletoTwo;
    worksheet.getCell("I18").value = datos.numeroIdentificacionTwo;
    const celdaCelularOne = worksheet.getCell("I19");
    celdaCelularOne.value = Number(datos.celularOneTwo);
    celdaCelularOne.numFmt = "0";
    worksheet.getCell("I20").value = datos.direccionResidenciaTwo;
    worksheet.getCell("I21").value = datos.correoElectronicoTwo;

    worksheet.getCell("I24").value = datos.asesorComercial;
    const celdaTelefonoAsesor = worksheet.getCell("I25");
    celdaTelefonoAsesor.value = Number(datos.telefonoAsesor);
    celdaTelefonoAsesor.numFmt = "0";
    worksheet.getCell("I26").value = datos.correoAsesor;

    worksheet.getCell("I29").value = datos.gestorDocumental;
    const celdaTelefonoGestor = worksheet.getCell("I30");
    celdaTelefonoGestor.value = Number(datos.telefonoGestor);
    celdaTelefonoGestor.numFmt = "0";
    worksheet.getCell("I31").value = datos.correoGestor;

    // Datos del tramitador si existe
    if (datos.tramitador && Object.keys(datos.tramitador).length !== 0) {
      worksheet.getCell("I34").value = datos.tramitador.ciudad;
      worksheet.getCell("I35").value = datos.tramitador.proveedor;
      worksheet.getCell("I36").value = datos.tramitador.responsable;
      worksheet.getCell("I37").value = datos.tramitador.telefono;
      worksheet.getCell("I38").value = datos.tramitador.correoElectronico;
      worksheet.getCell("I39").value = datos.tramitador.direccion;
    } else {
      worksheet.getCell("I34").value = "";
      worksheet.getCell("I35").value = "";
      worksheet.getCell("I36").value = "";
      worksheet.getCell("I37").value = "";
      worksheet.getCell("I38").value = "";
      worksheet.getCell("I39").value = "";
    }
  } else {
    worksheet.getCell("I17").value = datos.asesorComercial;
    const celdaTelefonoAsesor = worksheet.getCell("I18");
    celdaTelefonoAsesor.value = Number(datos.telefonoAsesor);
    celdaTelefonoAsesor.numFmt = "0";
    worksheet.getCell("I19").value = datos.correoAsesor;

    worksheet.getCell("I22").value = datos.gestorDocumental;
    const celdaTelefonoGestor = worksheet.getCell("I23");
    celdaTelefonoGestor.value = Number(datos.telefonoGestor);
    celdaTelefonoGestor.numFmt = "0";
    worksheet.getCell("I24").value = datos.correoGestor;

    // Datos del tramitador si existe
    if (datos.tramitador && Object.keys(datos.tramitador).length !== 0) {
      worksheet.getCell("I27").value = datos.tramitador.ciudad;
      worksheet.getCell("I28").value = datos.tramitador.proveedor;
      worksheet.getCell("I29").value = datos.tramitador.responsable;
      worksheet.getCell("I30").value = datos.tramitador.telefono;
      worksheet.getCell("I31").value = datos.tramitador.correoElectronico;
      worksheet.getCell("I32").value = datos.tramitador.direccion;
    } else {
      worksheet.getCell("I27").value = "";
      worksheet.getCell("I28").value = "";
      worksheet.getCell("I29").value = "";
      worksheet.getCell("I30").value = "";
      worksheet.getCell("I31").value = "";
      worksheet.getCell("I32").value = "";
    }
  }

  // Aplicar formato para las primeras 5 filas de provicionTramites
  datos.provicionTramites.slice(0, 5).forEach((provicionTramite, index) => {
    const descripcionCell = worksheet.getCell(`E${20 + index}`);
    descripcionCell.value = provicionTramite.descripcion2;

    const valorCell = worksheet.getCell(`F${20 + index}`);
    valorCell.value =
      typeof provicionTramite.valor2 === "number"
        ? provicionTramite.valor2
        : parseFloat(provicionTramite.valor2.replace(/[^0-9-]+/g, ""));

    valorCell.numFmt =
      provicionTramite.valor2 < 0
        ? '"$"#,##0;[Red]"-$"#,##0'
        : '"$"#,##0;[Red]"$"#,##0';
  });

  // Generar el archivo Excel
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=trámites.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

exports.DocCruceDocumental = async (req, res) => {
  const datos = req.body;

  limpiarValoresNulosEnObjeto(datos);

  const workbook = new ExcelJS.Workbook();
  const templatePath = "./plantillas/CRUCE DOCUMENTAL VENTA.xlsx";

  try {
    await workbook.xlsx.readFile(templatePath);
  } catch (error) {
    console.error("Error al leer la plantilla:", error);
    return res.status(500).send("Error al leer la plantilla");
  }

  const worksheet = workbook.getWorksheet("Hoja1");

  worksheet.getCell("H2").value = datos.numeroInventario;

  worksheet.getCell("D8").value = datos.cruceDocumental.numInventario;
  worksheet.getCell("D9").value = datos.cruceDocumental.placa;
  worksheet.getCell("D10").value = datos.cruceDocumental.ciudad;

  worksheet.getCell("H8").value = datos.cruceDocumental.placaActual;
  worksheet.getCell("H9").value = datos.cruceDocumental.ciudadActual;

  const format = '"$"#,##0;[Red]"-$"#,##0';
  worksheet.getCell("D11").value = datos.cruceDocumental.traspaso;
  worksheet.getCell("D11").numFmt = format;
  worksheet.getCell("D12").value = datos.cruceDocumental.retencion;
  worksheet.getCell("D12").numFmt = format;
  worksheet.getCell("D13").value = datos.cruceDocumental.otrosImpuestos;
  worksheet.getCell("D13").numFmt = format;
  worksheet.getCell("D14").value = datos.cruceDocumental.levantamientoPrenda;
  worksheet.getCell("D14").numFmt = format;
  worksheet.getCell("D15").value = datos.cruceDocumental.comparendos;
  worksheet.getCell("D15").numFmt = format;
  worksheet.getCell("D16").value = datos.cruceDocumental.propImpAnoEnCurso;
  worksheet.getCell("D16").numFmt = format;
  worksheet.getCell("D17").value = datos.cruceDocumental.devolucionSoat;
  worksheet.getCell("D17").numFmt = format;

  datos.tramitesRetoma.slice(0, 5).forEach((tramiteRetoma, index) => {
    const descripcionCell = worksheet.getCell(`C${18 + index}`);
    descripcionCell.value = tramiteRetoma.descripcion;

    const valorCell = worksheet.getCell(`D${18 + index}`);

    let valorLimpio = tramiteRetoma.valor.replace(/[^0-9-]+/g, "");
    let valorNumerico = parseFloat(valorLimpio);
    if (valorLimpio.includes("(") && valorLimpio.includes(")")) {
      valorNumerico = -valorNumerico;
    }
    valorCell.value = valorNumerico;

    valorCell.numFmt =
      valorNumerico < 0 ? '"$"#,##0;[Red]"-$"#,##0' : '"$"#,##0';
  });

  worksheet.getCell("H10").value = datos.cruceDocumental.traspasoActual;
  worksheet.getCell("H10").numFmt = format;
  worksheet.getCell("H11").value =
    datos.cruceDocumental.inscripcionPrendaActual;
  worksheet.getCell("H11").numFmt = format;
  worksheet.getCell("H12").value = datos.cruceDocumental.trasladoCuentaActual;
  worksheet.getCell("H12").numFmt = format;
  worksheet.getCell("H13").value = datos.cruceDocumental.radicacionCuentaActual;
  worksheet.getCell("H13").numFmt = format;
  worksheet.getCell("H14").value = datos.cruceDocumental.comparendosComprador;
  worksheet.getCell("H14").numFmt = format;
  worksheet.getCell("H15").value =
    datos.cruceDocumental.propImpAnoEnCursoActual;
  worksheet.getCell("H15").numFmt = format;
  worksheet.getCell("H16").value = datos.cruceDocumental.propSoat;
  worksheet.getCell("H16").numFmt = format;
  worksheet.getCell("H17").value = datos.cruceDocumental.honorariosIvaIncluido;
  worksheet.getCell("H17").numFmt = format;

  datos.tramitesVenta.slice(0, 5).forEach((tramiteVenta, index) => {
    const descripcionCell = worksheet.getCell(`G${18 + index}`);
    descripcionCell.value = tramiteVenta.descripcion;

    const valorCell = worksheet.getCell(`H${18 + index}`);

    let valorLimpio = tramiteVenta.valor.replace(/[^0-9-]+/g, "");
    let valorNumerico = parseFloat(valorLimpio);
    if (valorLimpio.includes("(") && valorLimpio.includes(")")) {
      valorNumerico = -valorNumerico;
    }

    valorCell.value = valorNumerico;

    valorCell.numFmt =
      valorNumerico < 0 ? '"$"#,##0;[Red]"-$"#,##0' : '"$"#,##0';
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=trámites.xlsx");

  await workbook.xlsx.write(res);
  res.end();
};

// COTIZACIÓN

exports.cotizacion = async (req, res) => {
  const datos = req.body;
  let templatePath;

  if (datos.provisional === true) {
    templatePath = path.resolve(__dirname, "../plantillas", "PLANTILLA COTIZACION ACS GC-CV 02 Provisional.docx");
  } else {
    templatePath = path.resolve(__dirname, "../plantillas", "PLANTILLA COTIZACION ACS GC-CV 02.docx");
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);

  const imageUrl = datos.vehiculo.imagenVehiculo;

  const imageBase64 = await downloadImageAsBase64(imageUrl);

  const imageModule = new ImageModule({
    centered: false,
    getImage: function (tagValue, tagName) {
      return Buffer.from(tagValue, "base64");
    },
    getSize: function (img, tagValue, tagName) {
      return [290, 220];
    },
  });

  const doc = new Docxtemplater(zip, {
    modules: [imageModule],
    paragraphLoop: true,
    linebreaks: true,
  });

  datos.imagen = imageBase64;

  try {
    doc.render(datos);
    const buffer = doc.getZip().generate({ type: "nodebuffer" });
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=cotizacion.docx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al generar el documento: " + error.message);
  }
};

function formatStateValue(value) {
  const marks = {
    na: "",
    si: "",
    no: "",
  };

  if (
    value === "VIGENTE" ||
    value === "OK EN CARPETA" ||
    value === "OK EN VEHICULO"
  ) {
    marks.si = "X";
  } else if (value === "NO APLICA" || value === "N/A") {
    marks.na = "X";
  } else {
    marks.no = "X";
  }

  return marks;
}

function marcarServicioValue(value) {
  const marks = {
    particular: "1",
    publico: "2",
    diplomatico: "3",
    oficial: "4",
    especial: "5",
    otros: "6",
  };

  if (value === "PARTICULAR") {
    marks.particular = "X";
  } else if (value === "PUBLICO") {
    marks.publico = "X";
  } else if (value === "DIPLOMATICO") {
    marks.diplomatico = "X";
  } else if (value === "OFICIAL") {
    marks.oficial = "X";
  } else if (value === "ESPECIAL") {
    marks.especial = "X";
  } else if (value === "OTROS") {
    marks.otros = "X";
  }

  return marks;
}

function marcarClaseValue(value) {
  const marks = {
    automovil: "",
    bus: "",
    buseta: "",
    camion: "",
    camioneta: "",
    campero: "",
    microbus: "",
    tractocamion: "",
    motocicleta: "",
    motocarro: "",
    mototriciclo: "",
    cuatrimoto: "",
    volqueta: "",
    otro: "",
  };

  if (value === "AUTOMOVIL") {
    marks.automovil = "X";
  } else if (value === "BUS") {
    marks.bus = "X";
  } else if (value === "BUSETA") {
    marks.buseta = "X";
  } else if (value === "CAMIÓN") {
    marks.camion = "X";
  } else if (value === "CAMIONETA") {
    marks.camioneta = "X";
  } else if (value === "CAMPERO") {
    marks.campero = "X";
  } else if (value === "MICROBUS") {
    marks.microbus = "X";
  } else if (value === "TRACTOCAMIÓN") {
    marks.tractocamion = "X";
  } else if (value === "MOTOCICLETA") {
    marks.motocicleta = "X";
  } else if (value === "MOTOCARRO") {
    marks.motocarro = "X";
  } else if (value === "MOTOTRICICLO") {
    marks.mototriciclo = "X";
  } else if (value === "CUATRIMOTO") {
    marks.cuatrimoto = "X";
  } else if (value === "VOLQUETA") {
    marks.volqueta = "X";
  } else if (value === "OTRO") {
    marks.otro = "X";
  }

  return marks;
}

function marcarTipoDocuValue(value) {
  const marks = {
    cc: "C",
    nit: "N",
    nn: "NN",
    pasaporte: "P",
    ce: "E",
    ti: "T",
    nuip: "U",
    cd: "D",
  };

  if (value === "C.C.") {
    marks.cc = "X";
  } else if (value === "NIT.") {
    marks.nit = "X";
  } else if (value === "N.N.") {
    marks.nn = "X";
  } else if (value === "PASAPORTE") {
    marks.pasaporte = "X";
  } else if (value === "C.E.") {
    marks.ce = "X";
  } else if (value === "T.I.") {
    marks.ti = "X";
  } else if (value === "NUIP.") {
    marks.nuip = "X";
  } else if (value === "C.D.") {
    marks.cd = "X";
  }

  return marks;
}

function limpiarValoresNulosEnObjeto(objeto) {
  Object.keys(objeto).forEach((clave) => {
    if (objeto[clave] === null) {
      objeto[clave] = "";
    } else if (typeof objeto[clave] === "object") {
      limpiarValoresNulosEnObjeto(objeto[clave]);
    }
  });
}
