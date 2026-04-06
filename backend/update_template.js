const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');

const templatePath = '/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx';
const backupPath = templatePath + '.bak.20260323';

// Read template
const content = fs.readFileSync(templatePath, 'binary');
fs.writeFileSync(backupPath, content, 'binary');
console.log('Backup creado:', backupPath);

const zip = new PizZip(content);
let xml = zip.file('word/document.xml').asText();

// Helper: replace text that might be split across runs
// We need to find the text in the XML considering Word might split it
function replaceInXml(xml, searchText, replaceText) {
  // First try direct replacement
  if (xml.includes(searchText)) {
    return { xml: xml.replace(searchText, replaceText), found: true };
  }

  // Try with XML tags in between characters (Word splits text across runs)
  // Build a regex that allows XML tags between each character
  let regexStr = '';
  for (let i = 0; i < searchText.length; i++) {
    const ch = searchText[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regexStr += ch;
    if (i < searchText.length - 1) {
      regexStr += '(?:</w:t></w:r><w:r(?:[^>]*)><w:rPr>(?:[^<]*(?:<[^/][^>]*>[^<]*)*)</w:rPr><w:t(?:[^>]*)>)?';
    }
  }

  const regex = new RegExp(regexStr);
  if (regex.test(xml)) {
    // Found split text - replace keeping the first run's formatting
    return { xml: xml.replace(regex, replaceText), found: true };
  }

  return { xml, found: false };
}

let changes = 0;

// === 1. Replace "Números y letras" occurrences ===
// They appear in order:
// 1st: VALOR OFERTA FINAL DESPUES DE INICIALES -> valorOfertaFinal
// 2nd: VALOR CREDITO (PRENDA) -> valorCreditoPrenda
// 3rd: ENTIDAD CRÉDITO (PRENDA) -> entidadCreditoPrenda
// 4th: VALOR ANTICIPO NEGOCIO -> valorAnticipoNegocio
// 5th: VALOR SUGERIDO VENTA CLIENTE FINAL -> valorSugeridoVenta

// Check for exact text variants
const searchVariants = [
  'Números y letras',
  'N\u00FAmeros y letras',  // with ú
  'Numeros y letras'          // without accent
];

let searchText = null;
for (const variant of searchVariants) {
  // Count occurrences
  const count = (xml.match(new RegExp(variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    searchText = variant;
    console.log(`Encontrado "${variant}" ${count} veces`);
    break;
  }
}

// Also check for split text
if (!searchText) {
  // Check in the full text (without XML tags)
  const textOnly = xml.replace(/<[^>]+>/g, '');
  if (textOnly.includes('Números y letras')) {
    console.log('Texto encontrado pero dividido en XML runs');
    searchText = 'Números y letras';
  } else if (textOnly.includes('Numeros y letras')) {
    searchText = 'Numeros y letras';
  }
}

// Check for <<Números y letras>>
const searchVariants2 = [
  '<<Números y letras>>',
  '<<Numeros y letras>>',
  '&lt;&lt;Números y letras&gt;&gt;',
  '&lt;&lt;Numeros y letras&gt;&gt;'
];

for (const v of searchVariants2) {
  const c = (xml.match(new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (c > 0) {
    console.log(`Encontrado "${v}" ${c} veces`);
    searchText = v;
    break;
  }
}

// Replace each occurrence in order
const fichaVars = [
  '{fichaNegocio.valorOfertaFinal}',
  '{fichaNegocio.valorCreditoPrenda}',
  '{fichaNegocio.entidadCreditoPrenda}',
  '{fichaNegocio.valorAnticipoNegocio}',
  '{fichaNegocio.valorSugeridoVenta}'
];

if (searchText) {
  const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (let i = 0; i < fichaVars.length; i++) {
    if (xml.includes(searchText)) {
      xml = xml.replace(searchText, fichaVars[i]);
      changes++;
      console.log(`Reemplazo ${i+1}: "${searchText}" -> "${fichaVars[i]}"`);
    } else {
      console.log(`Reemplazo ${i+1}: SKIP - no se encontró más "${searchText}"`);
    }
  }
} else {
  console.log('WARNING: "Números y letras" no encontrado en el XML');
  // Let's search for what's actually there
  const textOnly = xml.replace(/<[^>]+>/g, '');
  const fichaIdx = textOnly.indexOf('FICHA DE NEGOCIO');
  if (fichaIdx >= 0) {
    console.log('Texto cercano a FICHA:', textOnly.substring(fichaIdx, fichaIdx + 500));
  }
}

// === 2. Replace XXX% with porcentajeComision ===
if (xml.includes('XXX%')) {
  xml = xml.replace('XXX%', '{fichaNegocio.porcentajeComision}');
  changes++;
  console.log('Reemplazo: "XXX%" -> "{fichaNegocio.porcentajeComision}"');
} else {
  console.log('WARNING: "XXX%" no encontrado');
}

// === 3. Add observacionesContrato ===
// Find "OBSERVACIONES DE LA FICHA DE NEGOCIO:" and add variable after it
// The observations area is an empty cell after this label
const obsLabel = 'OBSERVACIONES DE LA FICHA DE NEGOCIO:';
if (xml.includes(obsLabel)) {
  // Find the next empty paragraph after the obs label - that's where to put the variable
  const obsIdx = xml.indexOf(obsLabel);
  // Look for the next <w:tc> (table cell) after the label's cell
  const afterObs = xml.substring(obsIdx);
  const nextTcStart = afterObs.indexOf('</w:tc>');
  if (nextTcStart > 0) {
    const nextTcContent = afterObs.substring(nextTcStart);
    // Find the next cell's paragraph content
    const nextParagraph = nextTcContent.indexOf('</w:p>');
    if (nextParagraph > 0) {
      // Insert the variable text before </w:p> in the observation cell
      const insertPoint = obsIdx + nextTcStart + nextParagraph;
      // Add a run with the variable
      const varRun = '<w:r><w:rPr><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr><w:t>{fichaNegocio.observacionesFicha}</w:t></w:r>';
      xml = xml.substring(0, insertPoint) + varRun + xml.substring(insertPoint);
      changes++;
      console.log('Reemplazo: Observaciones de ficha -> {fichaNegocio.observacionesFicha}');
    }
  }
} else {
  console.log('WARNING: "OBSERVACIONES DE LA FICHA DE NEGOCIO:" no encontrado');
}

// === 4. Add observacionesContrato in the contract observations area ===
const obsContrato = 'OBSERVACIONES:';
// Find it BEFORE the FICHA section (it's in the header area)
const fichaPos = xml.indexOf('FICHA DE NEGOCIO');
const obsContratoIdx = xml.lastIndexOf(obsContrato, fichaPos);
if (obsContratoIdx > 0) {
  // Find the cell after "OBSERVACIONES:" label
  const afterObsC = xml.substring(obsContratoIdx);
  const nextTc = afterObsC.indexOf('</w:tc>');
  if (nextTc > 0) {
    const afterCell = afterObsC.substring(nextTc);
    const nextP = afterCell.indexOf('</w:p>');
    if (nextP > 0) {
      const insertPt = obsContratoIdx + nextTc + nextP;
      const varR = '<w:r><w:rPr><w:sz w:val="14"/><w:szCs w:val="14"/></w:rPr><w:t>{observacionesContrato}</w:t></w:r>';
      xml = xml.substring(0, insertPt) + varR + xml.substring(insertPt);
      changes++;
      console.log('Reemplazo: Observaciones contrato -> {observacionesContrato}');
    }
  }
}

// === 5. Replace vehicle retoma placeholders ===
// The retoma section has PLACA, MARCA, etc as headers and empty cells below
// We need to find the empty cells in the retoma row and add variables

// Save the modified template
zip.file('word/document.xml', xml);
const output = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync(templatePath, output);

console.log(`\n=== Template actualizado con ${changes} cambios ===`);
