var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/ACTA DE ENTREGA Y PAZ Y SALVO.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);
var xml = zip.file("word/document.xml").asText();

// Simple approach: swap the tag values directly
// Currently:
//   NOMBRE COMPLETO {#cliente}{primerNombre} {segundoNombre}... (under VENDEDOR)
//   NOMBRE EMPRESA {#generadorContratos}{organizacion}{/}       (under COMPRADOR)
//   ID {idFormated}                                              (under VENDEDOR)
//   NIT {NIT}                                                    (under COMPRADOR)
//
// Should be:
//   NOMBRE EMPRESA {#generadorContratos}{organizacion}{/}        (under VENDEDOR)
//   NOMBRE COMPLETO {#cliente}{primerNombre} {segundoNombre}...  (under COMPRADOR)
//   NIT {NIT}                                                    (under VENDEDOR)
//   ID {idFormated}                                              (under COMPRADOR)

// Swap 1: Replace "NOMBRE COMPLETO " text with "NOMBRE EMPRESA " and vice versa
// But also swap the tags after them

// Find the <w:t> elements containing the labels and tags
// NOMBRE COMPLETO line
var nc = 'NOMBRE COMPLETO </w:t></w:r>';
var ncTag = '{#cliente}{primerNombre} {segundoNombre} {primerApellido} {segundoApellido}{/}</w:t>';

// NOMBRE EMPRESA line
var ne = 'NOMBRE EMPRESA </w:t></w:r>';
var neTag = '{#generadorContratos}{organizacion}{/}</w:t>';

// Step 1: Swap label + tag for NOMBRE COMPLETO <-> NOMBRE EMPRESA
// Replace NOMBRE COMPLETO label with a placeholder first
var PLACEHOLDER_NC = '###NC_PLACEHOLDER###</w:t></w:r>';
var PLACEHOLDER_NE = '###NE_PLACEHOLDER###</w:t></w:r>';
var PLACEHOLDER_NCTAG = '###NCTAG_PLACEHOLDER###</w:t>';
var PLACEHOLDER_NETAG = '###NETAG_PLACEHOLDER###</w:t>';

// Replace in order using placeholders to avoid double-replacement
xml = xml.replace(nc, PLACEHOLDER_NC);
xml = xml.replace(ne, PLACEHOLDER_NE);
xml = xml.replace(ncTag, PLACEHOLDER_NCTAG);
xml = xml.replace(neTag, PLACEHOLDER_NETAG);

// Now swap: NC label gets NE content and vice versa
xml = xml.replace(PLACEHOLDER_NC, ne);     // VENDEDOR gets "NOMBRE EMPRESA"
xml = xml.replace(PLACEHOLDER_NE, nc);     // COMPRADOR gets "NOMBRE COMPLETO"
xml = xml.replace(PLACEHOLDER_NCTAG, neTag);  // VENDEDOR gets org tag
xml = xml.replace(PLACEHOLDER_NETAG, ncTag);  // COMPRADOR gets cliente tag

console.log("Labels and name tags swapped");

// Step 2: Swap ID <-> NIT
var idLabel = 'ID </w:t></w:r>';
var idTag = '{idFormated}</w:t>';
var nitLabel = 'NIT </w:t></w:r>';
var nitTag = '{NIT}</w:t>';

var PH_ID = '###ID_PH###</w:t></w:r>';
var PH_NIT = '###NIT_PH###</w:t></w:r>';
var PH_IDTAG = '###IDTAG_PH###</w:t>';
var PH_NITTAG = '###NITTAG_PH###</w:t>';

// Use lastIndexOf approach - find the signature area ones
var idLabelIdx = xml.lastIndexOf(idLabel);
var nitLabelIdx = xml.lastIndexOf(nitLabel);

if (idLabelIdx >= 0 && nitLabelIdx >= 0) {
  // Replace from end first to preserve positions
  if (nitLabelIdx > idLabelIdx) {
    // NIT comes after ID
    xml = xml.substring(0, nitLabelIdx) + PH_NIT + xml.substring(nitLabelIdx + nitLabel.length);
    xml = xml.substring(0, idLabelIdx) + PH_ID + xml.substring(idLabelIdx + idLabel.length);
  } else {
    xml = xml.substring(0, idLabelIdx) + PH_ID + xml.substring(idLabelIdx + idLabel.length);
    xml = xml.substring(0, nitLabelIdx) + PH_NIT + xml.substring(nitLabelIdx + nitLabel.length);
  }

  // Also swap the tags
  var idTagIdx = xml.lastIndexOf(idTag);
  var nitTagIdx = xml.lastIndexOf(nitTag);

  if (nitTagIdx > idTagIdx) {
    xml = xml.substring(0, nitTagIdx) + PH_NITTAG + xml.substring(nitTagIdx + nitTag.length);
    xml = xml.substring(0, idTagIdx) + PH_IDTAG + xml.substring(idTagIdx + idTag.length);
  } else {
    xml = xml.substring(0, idTagIdx) + PH_IDTAG + xml.substring(idTagIdx + idTag.length);
    xml = xml.substring(0, nitTagIdx) + PH_NITTAG + xml.substring(nitTagIdx + nitTag.length);
  }

  // Now swap
  xml = xml.replace(PH_ID, nitLabel);     // VENDEDOR gets "NIT"
  xml = xml.replace(PH_NIT, idLabel);     // COMPRADOR gets "ID"
  xml = xml.replace(PH_IDTAG, nitTag);    // VENDEDOR gets NIT value
  xml = xml.replace(PH_NITTAG, idTag);    // COMPRADOR gets ID value

  console.log("ID/NIT labels and tags swapped");
}

// Save
zip.file("word/document.xml", xml);
var output = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(filepath, output);
console.log("Template guardado");

// Verify
var Docxtemplater = require("docxtemplater");
var zip2 = new PizZip(fs.readFileSync(filepath, "binary"));
var d = new Docxtemplater(zip2, {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();
var lastV = t.lastIndexOf("VENDEDOR");
console.log("\nVerificacion:");
console.log(t.substring(lastV));
