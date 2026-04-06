var fs = require("fs");
var PizZip = require("pizzip");

var filepath = "/app/plantillas/2026/CONTRATO DE MANDATO CON REPRESENTACIÓN.docx";
var content = fs.readFileSync(filepath, "binary");
var zip = new PizZip(content);

// === FIX 1: Header - Replace <<Nro. inventario>> with {numeroInventario} ===
var header1 = zip.file("word/header1.xml").asText();
var oldHeader = 'INVENTARIO &lt;&lt;Nro. inventario&gt;&gt;';
var newHeader = 'INVENTARIO {numeroInventario}';
if (header1.indexOf(oldHeader) >= 0) {
  header1 = header1.replace(oldHeader, newHeader);
  zip.file("word/header1.xml", header1);
  console.log("FIX 1: Header - Nro inventario tag replaced OK");
} else {
  console.log("FIX 1: WARN - <<Nro. inventario>> not found in header");
}

// === FIX 2: Move {observacionesContrato} from TELEFONO CONTACTO to OBSERVACIONES ===
var xml = zip.file("word/document.xml").asText();

// The {observacionesContrato} tag is incorrectly in the TELEFONO CONTACTO cell
// It should be removed from there (the phone number {generadorContratos.telefonoAsesor} is already in the next cell)
var wrongTag = '<w:t>{observacionesContrato}</w:t>';
if (xml.indexOf(wrongTag) >= 0) {
  // Remove it from TELEFONO CONTACTO cell - replace with empty
  xml = xml.replace(wrongTag, '<w:t></w:t>');
  console.log("FIX 2a: Removed {observacionesContrato} from TELEFONO CONTACTO cell");
} else {
  console.log("FIX 2a: WARN - {observacionesContrato} tag not found");
}

// Now add {observacionesContrato} to the OBSERVACIONES cell
// The OBSERVACIONES cell has: "OBSERVACIONES: " followed by an empty run
var obsLabel = 'OBSERVACIONES: </w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr></w:r></w:p></w:tc>';
if (xml.indexOf(obsLabel) >= 0) {
  var newObs = 'OBSERVACIONES: </w:t></w:r><w:r w:rsidDel="00000000" w:rsidR="00000000" w:rsidRPr="00000000"><w:rPr><w:rtl w:val="0"/></w:rPr><w:t>{observacionesContrato}</w:t></w:r></w:p></w:tc>';
  xml = xml.replace(obsLabel, newObs);
  console.log("FIX 2b: Added {observacionesContrato} to OBSERVACIONES cell");
} else {
  console.log("FIX 2b: WARN - OBSERVACIONES cell pattern not found");
}

// Save
zip.file("word/document.xml", xml);
var output = zip.generate({ type: "nodebuffer" });
fs.writeFileSync(filepath, output);
console.log("\nTemplate guardado");

// Verify
var Docxtemplater = require("docxtemplater");
var zip2 = new PizZip(fs.readFileSync(filepath, "binary"));
var d = new Docxtemplater(zip2, {paragraphLoop: true, linebreaks: true});
var t = d.getFullText();

// Show around TELEFONO and OBSERVACIONES
var tIdx = t.indexOf("TELÉFONO");
console.log("\nVerificacion TELEFONO area:");
console.log(t.substring(tIdx - 150, tIdx + 200));

// Check header too
var h1 = new PizZip(fs.readFileSync(filepath, "binary")).file("word/header1.xml").asText();
var hMatches = h1.match(/<w:t[^>]*>[^<]+<\/w:t>/g);
console.log("\nHeader texts:");
hMatches.forEach(function(m) { console.log(m); });
