// ============================================================
// Fix: Inject vehicle variables into empty table cells
// The empty cells have <w:r> with <w:rPr> but NO <w:t> element
// We need to add <w:t>{variable}</w:t> inside the existing <w:r>
// ============================================================

const PizZip = require('pizzip');
const fs = require('fs');

const templatePath = '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx';

const content = fs.readFileSync(templatePath, 'binary');
const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

let fixes = 0;

const vehicleFieldMap = {
  'PLACA:': '{vehiculo.placa}',
  'CLASE:': '{vehiculo.clase}',
  'MARCA:': '{vehiculo.marca}',
  'MODELO:': '{vehiculo.modelo}',
  'COLOR:': '{vehiculo.color}',
  'PASAJEROS:': '{vehiculo.pasajeros}',
  'SERVICIO:': '{vehiculo.servicio}',
  'MOTOR NO:': '{vehiculo.numeroMotor}',
  'CHASIS:': '{vehiculo.chasis}',
  'VIN:': '{vehiculo.vin}',
  'SERIE:': '{vehiculo.serie}',
  'KILOMETRAJE:': '{kilometraje}',
};

// These have accented chars that may vary in encoding
const accentedFields = [
  { labels: ['LÍNEA:', 'L\u00cdNEA:'], variable: '{vehiculo.linea}' },
  { labels: ['VERSIÓN:', 'VERSI\u00d3N:'], variable: '{vehiculo.version}' },
  { labels: ['CARROCERÍA:', 'CARROCER\u00cdA:'], variable: '{vehiculo.carroceria}' },
];

// Strategy: For each label, find it in XML, then find the NEXT <w:tc>...</w:tc> cell
// and inject the variable into any <w:r> that has <w:rPr> but no <w:t>

function injectVariable(xml, labelText, variable) {
  // Find the label in the XML
  const labelIdx = xml.indexOf(labelText);
  if (labelIdx === -1) return { xml, found: false };

  // Find the closing </w:tc> of the label's cell
  const closeTcAfterLabel = xml.indexOf('</w:tc>', labelIdx);
  if (closeTcAfterLabel === -1) return { xml, found: false };

  // Find the next <w:tc> (the value cell)
  const nextTcStart = xml.indexOf('<w:tc>', closeTcAfterLabel);
  const nextTcAlt = xml.indexOf('<w:tc ', closeTcAfterLabel);
  let valueCellStart;
  if (nextTcStart === -1 && nextTcAlt === -1) return { xml, found: false };
  if (nextTcStart === -1) valueCellStart = nextTcAlt;
  else if (nextTcAlt === -1) valueCellStart = nextTcStart;
  else valueCellStart = Math.min(nextTcStart, nextTcAlt);

  // Find end of this value cell
  const valueCellEnd = xml.indexOf('</w:tc>', valueCellStart);
  if (valueCellEnd === -1) return { xml, found: false };

  const cellContent = xml.substring(valueCellStart, valueCellEnd + 7);

  // Check if cell already has a {variable} (already injected)
  if (cellContent.includes('{vehiculo.') || cellContent.includes('{kilometraje}')) {
    console.log(`  SKIP ${labelText} - ya tiene variable`);
    return { xml, found: true };
  }

  // Strategy 1: Find <w:r> with </w:rPr></w:r> (run with rPr but no text)
  const emptyRunPattern = /(<w:r[^>]*>(?:<w:rPr>.*?<\/w:rPr>)?)(<\/w:r>)/s;
  const emptyRunMatch = cellContent.match(emptyRunPattern);

  if (emptyRunMatch) {
    const newCellContent = cellContent.replace(
      emptyRunPattern,
      `$1<w:t>${variable}</w:t>$2`
    );
    return {
      xml: xml.substring(0, valueCellStart) + newCellContent + xml.substring(valueCellEnd + 7),
      found: true
    };
  }

  // Strategy 2: Find empty paragraph (no <w:r> at all) and add a run
  const emptyParaPattern = /(<w:p[^>]*>(?:<w:pPr>.*?<\/w:pPr>)?)\s*(<\/w:p>)/s;
  const emptyParaMatch = cellContent.match(emptyParaPattern);

  if (emptyParaMatch) {
    const newCellContent = cellContent.replace(
      emptyParaPattern,
      `$1<w:r><w:t>${variable}</w:t></w:r>$2`
    );
    return {
      xml: xml.substring(0, valueCellStart) + newCellContent + xml.substring(valueCellEnd + 7),
      found: true
    };
  }

  console.log(`  WARNING: ${labelText} - celda de valor no tiene patrón esperado`);
  // Show snippet for debugging
  console.log(`  Cell content (first 300 chars): ${cellContent.substring(0, 300)}`);
  return { xml, found: false };
}

// Process regular fields
for (const [label, variable] of Object.entries(vehicleFieldMap)) {
  const result = injectVariable(xml, label, variable);
  if (result.found) {
    xml = result.xml;
    fixes++;
    console.log(`FIX: ${label} → ${variable}`);
  } else {
    console.log(`NOT FOUND: ${label}`);
  }
}

// Process accented fields (try multiple label variants)
for (const { labels, variable } of accentedFields) {
  let found = false;
  for (const label of labels) {
    const result = injectVariable(xml, label, variable);
    if (result.found) {
      xml = result.xml;
      fixes++;
      console.log(`FIX: ${label} → ${variable}`);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log(`NOT FOUND: ${labels.join(' / ')}`);
  }
}

// Save
zip.file('word/document.xml', xml);
const output = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync(templatePath, output);

console.log(`\n=== Vehicle fix: ${fixes} variables injected ===`);

// Verify: check all vehicle variables are present
const finalXml = zip.file('word/document.xml').asText();
const expectedVars = [
  'vehiculo.placa', 'vehiculo.clase', 'vehiculo.marca', 'vehiculo.linea',
  'vehiculo.version', 'vehiculo.modelo', 'vehiculo.color', 'vehiculo.carroceria',
  'vehiculo.pasajeros', 'vehiculo.servicio', 'vehiculo.numeroMotor',
  'vehiculo.chasis', 'vehiculo.vin', 'vehiculo.serie', 'kilometraje'
];
console.log('\nVerificación:');
for (const v of expectedVars) {
  const present = finalXml.includes(`{${v}}`);
  console.log(`  ${present ? 'OK' : 'MISSING'}: {${v}}`);
}
