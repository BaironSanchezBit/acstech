// Test rendering ORDEN DE COMPRA template with sample data
const fs = require('fs');
const path = require('path');
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const ImageModule = require('docxtemplater-image-module-free');

const templatePath = '/app/plantillas/2026/ORDEN DE COMPRA.docx';
const content = fs.readFileSync(templatePath, 'binary');
const zip = new PizZip(content);

const imageOptions = {
  getImage(tagValue) { return Buffer.alloc(1); },
  getSize() { return [150, 78]; },
};

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

const testData = {
  organizacion: 'AUTOMAGNO S.A.S',
  NIT: '900.187.453-0',
  fecha: '28 de marzo del 2026',
  fechaEntrega: '30 de marzo del 2026',
  vehiculo: {
    placa: 'TEST123',
    marca: 'BMW',
    linea: '320i',
    version: 'Sport',
    modelo: '2022',
    color: 'Negro',
    clase: 'AUTOMOVIL',
    carroceria: 'SEDAN',
    pasajeros: '5',
    servicio: 'PARTICULAR',
    numeroMotor: 'MOT-12345',
    chasis: 'CHA-67890',
    vin: 'VIN-ABCDE',
    serie: 'SER-11111',
    kilometraje: '45000',
  },
  cliente: {
    primerNombre: 'JUAN',
    segundoNombre: 'CARLOS',
    primerApellido: 'PEREZ',
    segundoApellido: 'GARCIA',
    tipoIdentificacion: 'C.C.',
    numeroIdentificacion: '123456789',
    ciudadIdentificacion: 'Bogota',
    direccionResidencia: 'Calle 123',
    ciudadResidencia: 'Bogota',
    celularOne: '3001234567',
    correoElectronico: 'test@test.com',
    idFormated: '123.456.789',
  },
  generadorContratos: {
    organizacion: 'AUTOMAGNO S.A.S',
    NIT: '900.187.453-0',
    asesorComercial: 'Erwin',
    telefonoAsesor: '3009876543',
    garantia: '30 dias',
    tiempo: '30',
  },
  idFormated: '123.456.789',
  valorCompraNumero: '$ 45.000.000',
  separacion5porciento: '$ 2.250.000',
  kilometraje: '45000',
  estadoValorTotalSoat: 'VIGENTE',
  estadoTecnicoMecanica: 'VIGENTE',
  copiaLlave: 'OK EN VEHICULO',
  manual: 'OK EN VEHICULO',
  copaSeguridad: 'N/A',
  gato: 'OK EN VEHICULO',
  palomera: 'N/A',
  tapetes: 'OK EN VEHICULO',
  tiroArrastre: 'N/A',
  llantaRepuesto: 'OK EN VEHICULO',
  llavePernos: 'OK EN VEHICULO',
  kitCarretera: 'OK EN VEHICULO',
  antena: 'OK EN VEHICULO',
  image: '',
  soporte: '',
  observacionesContrato: 'Test',
};

// Apply formatStateValue like the controller does
function formatStateValue(value) {
  const marks = { na: "", si: "", no: "" };
  if (value === "VIGENTE" || value === "OK EN CARPETA" || value === "OK EN VEHICULO") marks.si = "X";
  else if (value === "NO APLICA" || value === "N/A") marks.na = "X";
  else marks.no = "X";
  return marks;
}

testData.estadoValorTotalSoat = formatStateValue(testData.estadoValorTotalSoat);
testData.estadoTecnicoMecanica = formatStateValue(testData.estadoTecnicoMecanica);
testData.copiaLlave = formatStateValue(testData.copiaLlave);
testData.manual = formatStateValue(testData.manual);
testData.copaSeguridad = formatStateValue(testData.copaSeguridad);
testData.gato = formatStateValue(testData.gato);
testData.palomera = formatStateValue(testData.palomera);
testData.tapetes = formatStateValue(testData.tapetes);
testData.tiroArrastre = formatStateValue(testData.tiroArrastre);
testData.llantaRepuesto = formatStateValue(testData.llantaRepuesto);
testData.llavePernos = formatStateValue(testData.llavePernos);
testData.kitCarretera = formatStateValue(testData.kitCarretera);
testData.antena = formatStateValue(testData.antena);

try {
  doc.render(testData);
  const buffer = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync('/tmp/test-orden-compra-output.docx', buffer);

  // Read the output and check if vehicle fields were filled
  const outZip = new PizZip(buffer);
  const outXml = outZip.file('word/document.xml').asText();
  const outPlain = outXml.replace(/<[^>]+>/g, '');

  // Check for test values
  const checks = {
    'placa TEST123': outPlain.includes('TEST123'),
    'marca BMW': outPlain.includes('BMW'),
    'linea 320i': outPlain.includes('320i'),
    'modelo 2022': outPlain.includes('2022'),
    'color Negro': outPlain.includes('Negro'),
    'cliente JUAN': outPlain.includes('JUAN'),
    'NIT 900.187.453-0': outPlain.includes('900.187.453-0'),
    'asesor Erwin': outPlain.includes('Erwin'),
  };

  console.log('=== Test Results ===');
  let allOk = true;
  for (const [desc, ok] of Object.entries(checks)) {
    console.log(`  ${ok ? 'OK' : 'FAIL'}: ${desc}`);
    if (!ok) allOk = false;
  }

  if (allOk) {
    console.log('\nAll vehicle data rendered correctly!');
    console.log('Issue is likely in the FRONTEND (this.vehiculo empty at call time)');
  } else {
    console.log('\nSome data MISSING - template or controller issue');
    // Show any remaining template tags
    const remaining = outPlain.match(/\{[^}]+\}/g);
    if (remaining) {
      console.log('Unreplaced tags:', [...new Set(remaining)]);
    }
  }
} catch (err) {
  console.error('RENDER ERROR:', err.message);
  if (err.properties && err.properties.errors) {
    err.properties.errors.forEach(e => console.error('  -', e.message));
  }
}
