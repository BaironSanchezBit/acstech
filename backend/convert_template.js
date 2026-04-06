// ============================================================
// Convierte el contrato Word nuevo a plantilla docxtemplater
// - Reemplaza <<variable>> → {variable} con nombres correctos
// - Agrega variables en celdas vacías del vehículo
// - Agrega variables de ficha de negocio
// - Mantiene formato original del .docx
// ============================================================

const PizZip = require('pizzip');
const fs = require('fs');

const inputPath = '/app/plantillas/2026/contrato_nuevo_original.docx';
const outputPath = '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx';

// Backup del template actual
const currentTemplate = outputPath;
if (fs.existsSync(currentTemplate)) {
  fs.copyFileSync(currentTemplate, currentTemplate + '.bak.20260324');
  console.log('Backup del template actual creado');
}

const content = fs.readFileSync(inputPath, 'binary');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

let fixes = 0;

// ============================================================
// PASO 1: Limpiar runs divididos en <<>> y {}
// Word a veces divide "<<variable>>" en múltiples runs como:
// <w:r><w:t>&lt;&lt;</w:t></w:r><w:r><w:t>variable</w:t></w:r><w:r><w:t>&gt;&gt;</w:t></w:r>
// Necesitamos unirlos primero
// ============================================================

// En XML, < es &lt; y > es &gt;
// Pero a veces << y >> se guardan como texto directo en el XML

// PASO 2: Reemplazar variables <<>> con {docxtemplater}
const replacements = [
  // HEADER
  ['ciudadyfechacontrato', 'fecha'],

  // MANDANTE
  ['nombremandante', 'nombreCompletoMandante'],
  ['tipoidMandante', 'cliente.tipoDocumento'],
  ['ciudadidmandante', 'cliente.ciudadExpedicion'],
  ['ciudadresidenciamandante', 'cliente.ciudadResidencia'],
  ['telefonocontactoempresa', 'generadorContratos.telefonoAsesor'],
  ['tipoidmandatario', 'tipoIdMandatario'],

  // FOOTER/FIRMAS
  ['NOMBRE COMPLETO', 'nombreCompletoMandante'],
  ['NOMBRE EMPRESA', 'organizacion'],
];

// Primero, manejo las variables que ya están en {} pero con nombres incorrectos
const curlyReplacements = [
  ['idMandante', 'idFormated'],
  ['direccionMandante', 'cliente.direccion'],
  ['celularMandante', 'cliente.celularOne'],
  ['correoMandante', 'cliente.correoElectronico'],
  ['razonSocialMandatario', 'organizacion'],
  ['nitMandatario', 'NIT'],
  ['direccionMandatario', 'direccionEmpresa'],
  ['nombreAsesor', 'generadorContratos.asesorComercial'],
];

// Reemplazar variables con <<>> (en XML son caracteres especiales)
// Los << >> pueden aparecer como texto literal o como &lt;&lt; &gt;&gt;
for (const [oldVar, newVar] of replacements) {
  // Variantes de cómo puede aparecer en el XML
  const patterns = [
    // Texto directo con << >>
    new RegExp(`&lt;&lt;${oldVar}\\s*&gt;&gt;?`, 'gi'),
    new RegExp(`&lt;&lt;${oldVar}\\s*&gt;`, 'gi'),
    new RegExp(`<<${oldVar}\\s*>>?`, 'gi'),
    new RegExp(`<<${oldVar}\\s*>`, 'gi'),
    // Con espacios internos
    new RegExp(`&lt;&lt;\\s*${oldVar}\\s*&gt;&gt;`, 'gi'),
  ];

  for (const pattern of patterns) {
    if (pattern.test(xml)) {
      xml = xml.replace(pattern, `{${newVar}}`);
      fixes++;
      console.log(`FIX: <<${oldVar}>> → {${newVar}}`);
      break;
    }
  }
}

// Reemplazar {curly} variables con nombres correctos
for (const [oldVar, newVar] of curlyReplacements) {
  // En XML las {} pueden ser literales
  const patterns = [
    new RegExp(`\\{${oldVar}\\}`, 'g'),
    new RegExp(`\\{${oldVar}\\}`, 'g'),
  ];

  for (const pattern of patterns) {
    if (pattern.test(xml)) {
      xml = xml.replace(pattern, `{${newVar}}`);
      fixes++;
      console.log(`FIX: {${oldVar}} → {${newVar}}`);
      break;
    }
  }
}

// Reemplazar <<ID>> y <<NIT.>> en footer
xml = xml.replace(/&lt;&lt;ID&gt;&gt;/g, '{idFormated}');
xml = xml.replace(/<<ID>>/g, '{idFormated}');
xml = xml.replace(/&lt;&lt;NIT\.?&gt;&gt;/g, '{NIT}');
xml = xml.replace(/<<NIT\.?>>/g, '{NIT}');

// ============================================================
// PASO 3: Variables de FICHA DE NEGOCIO
// Reemplazar los 5 "Números y letras" con variables específicas
// ============================================================

// Los "Números y letras" aparecen en orden:
// 1. VALOR OFERTA → valorCompraNumero + valorCompraLetras
// 2. LIQUIDACIÓN DEUDA FINANCIERA → fichaNegocio.liquidacionDeudaFinanciera
// 3. ENTIDAD DEUDA FINANCIERA → fichaNegocio.entidadDeudaFinanciera
// 4. VALOR ANTICIPO NEGOCIO → fichaNegocio.valorAnticipo
// 5. VALOR SUGERIDO VENTA → fichaNegocio.valorSugeridoVenta

const fichaValues = [
  '{valorCompraNumero} ({valorCompraLetras})',
  '{fichaNegocio.liquidacionDeudaFinanciera}',
  '{fichaNegocio.entidadDeudaFinanciera}',
  '{fichaNegocio.valorAnticipo}',
  '{fichaNegocio.valorSugeridoVenta}',
];

// Buscar y reemplazar "Números y letras" uno por uno
let fichaIdx = 0;
const nlPattern = /(&lt;&lt;N.meros y letras&gt;&gt;|&lt;&lt;Números y letras&gt;&gt;|<<N.meros y letras>>|<<Números y letras>>|N\u00fameros y letras)/g;

xml = xml.replace(nlPattern, function(match) {
  if (fichaIdx < fichaValues.length) {
    const replacement = fichaValues[fichaIdx];
    fichaIdx++;
    fixes++;
    console.log(`FIX: "Números y letras" #${fichaIdx} → ${replacement}`);
    return replacement;
  }
  return match;
});

// Reemplazar XXX% con porcentaje comisión
xml = xml.replace(/XXX%/g, '{fichaNegocio.porcentajeComision}');
fixes++;
console.log('FIX: XXX% → {fichaNegocio.porcentajeComision}');

// ============================================================
// PASO 4: Variables del VEHÍCULO en celdas vacías
// Buscar patrones: label en una celda, celda vacía siguiente
// ============================================================

// En docx XML, las tablas tienen estructura:
// <w:tc>...<w:t>PLACA:</w:t>...</w:tc><w:tc>...(empty or value)...</w:tc>
// Necesitamos encontrar las celdas de valor vacías después de cada label

const vehicleFieldMap = {
  'PLACA:': '{vehiculo.placa}',
  'CLASE:': '{vehiculo.clase}',
  'MARCA:': '{vehiculo.marca}',
  'LÍNEA:': '{vehiculo.linea}',
  'L\u00cdNEA:': '{vehiculo.linea}',
  'VERSIÓN:': '{vehiculo.version}',
  'VERSI\u00d3N:': '{vehiculo.version}',
  'MODELO:': '{vehiculo.modelo}',
  'COLOR:': '{vehiculo.color}',
  'CARROCERÍA:': '{vehiculo.carroceria}',
  'CARROCER\u00cdA:': '{vehiculo.carroceria}',
  'PASAJEROS:': '{vehiculo.pasajeros}',
  'SERVICIO:': '{vehiculo.servicio}',
  'MOTOR NO:': '{vehiculo.numeroMotor}',
  'CHASIS:': '{vehiculo.chasis}',
  'VIN:': '{vehiculo.vin}',
  'SERIE:': '{vehiculo.serie}',
  'KILOMETRAJE:': '{kilometraje}',
};

// For each vehicle field, find the label and inject variable in the next empty cell
for (const [label, variable] of Object.entries(vehicleFieldMap)) {
  // Find the label in the XML
  const labelEscaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Pattern: find the label text, then find the next <w:tc> that's essentially empty
  // Look for: </w:t></w:r></w:p></w:tc><w:tc> ... empty content ... </w:tc>
  // The cell after the label cell
  const labelRegex = new RegExp(
    `(${labelEscaped}</w:t></w:r></w:p></w:tc>\\s*<w:tc>(?:<w:tcPr>.*?</w:tcPr>)?\\s*<w:p[^>]*>)(<w:pPr>.*?</w:pPr>)?\\s*(</w:p>)`,
    's'
  );

  if (labelRegex.test(xml)) {
    xml = xml.replace(labelRegex, function(match, before, pPr, after) {
      fixes++;
      console.log(`FIX VEHICULO: ${label} → ${variable}`);
      const pprPart = pPr || '';
      return `${before}${pprPart}<w:r><w:t>${variable}</w:t></w:r>${after}`;
    });
  }
}

// ============================================================
// PASO 5: Observaciones de ficha de negocio (celda vacía)
// ============================================================
// "OBSERVACIONES DE LA FICHA DE NEGOCIO:" followed by empty area
const obsPattern = /(OBSERVACIONES DE LA FICHA DE NEGOCIO:<\/w:t><\/w:r><\/w:p><\/w:tc>\s*<w:tc>(?:<w:tcPr>.*?<\/w:tcPr>)?\s*<w:p[^>]*>)(<w:pPr>.*?<\/w:pPr>)?\s*(<\/w:p>)/s;
if (obsPattern.test(xml)) {
  xml = xml.replace(obsPattern, function(match, before, pPr, after) {
    fixes++;
    console.log('FIX: Observaciones ficha → {observacionesContrato}');
    const pprPart = pPr || '';
    return `${before}${pprPart}<w:r><w:t>{observacionesContrato}</w:t></w:r>${after}`;
  });
}

// ============================================================
// GUARDAR
// ============================================================
zip.file('word/document.xml', xml);
const output = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync(outputPath, output);

console.log(`\n=== Template convertido: ${fixes} fixes aplicados ===`);
console.log(`Guardado en: ${outputPath}`);

// Verificar variables restantes sin convertir
const remainingAngle = xml.match(/&lt;&lt;[^&]+&gt;&gt;/g) || [];
const remainingAngle2 = xml.match(/<<[^<>]+>>/g) || [];
if (remainingAngle.length > 0 || remainingAngle2.length > 0) {
  console.log('\nWARNING: Variables <<>> sin convertir:');
  [...remainingAngle, ...remainingAngle2].forEach(v => console.log('  ' + v));
}
